export type Status = 'To do' | 'In progress' | 'Done';
export type Importance = 'Low' | 'Medium' | 'High';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const rank = (l: Level) => LEVELS.indexOf(l) + 1;
export type MemberSkill = { name: string; level: Level };
export type Task = { id: string; title: string; description: string; skill: string; difficulty: Level; deadline: string; effort: number; importance: Importance; status: Status; assignee: string; parentId?: string };
export type Member = { id: string; name: string; role: string; skills: MemberSkill[]; available: boolean; capacity: number };
export type Weights = { urgency: number; importance: number; effort: number };
export type Data = { tasks: Task[]; members: Member[]; weights: Weights };
export const SKILLS = ['Frontend', 'Backend', 'UI/UX', 'Data Analysis', 'Testing', 'Documentation'];
export const DEFAULT_WEIGHTS: Weights = { urgency: 40, importance: 35, effort: 25 };
export const hours = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0);
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

export function priority(task: Task, weights = DEFAULT_WEIGHTS, today = localDate()) {
  const parsed = Date.parse(task.deadline);
  const days = Number.isFinite(parsed) ? Math.round((parsed - Date.parse(today)) / 86400000) : 0;
  const urgency = days < 0 ? 100 : days <= 1 ? 90 : days <= 3 ? 75 : days <= 7 ? 50 : 25;
  const importance = { High: 100, Medium: 60, Low: 30 }[task.importance] ?? 60;
  const e = hours(task.effort);
  const effort = e > 8 ? 100 : e > 4 ? 70 : e > 2 ? 45 : 25;
  const score = (urgency * weights.urgency + importance * weights.importance + effort * weights.effort) / 100;
  return { score, level: score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low', urgency, importance, effort, days };
}

export const skillLevel = (m: Member, skill: string) => m.skills.find(s => s.name.toLowerCase() === skill.toLowerCase())?.level;
export const isQualified = (m: Member, skill: string, difficulty: Level) => { const l = skillLevel(m, skill); return !!l && rank(l) >= rank(difficulty); };
export const subtasksOf = (id: string, tasks: Task[]) => tasks.filter(t => t.parentId === id);
/** A parent with subtasks is tracked through its subtasks, so it never counts twice. */
export const countsToward = (t: Task, tasks: Task[]) => t.status !== 'Done' && !tasks.some(x => x.parentId === t.id);
export function workload(memberId: string, tasks: Task[], excludeId?: string) {
  return tasks.filter(t => t.assignee === memberId && t.id !== excludeId && countsToward(t, tasks)).reduce((n, t) => n + hours(t.effort), 0);
}
export const activeCount = (memberId: string, tasks: Task[]) => tasks.filter(t => t.assignee === memberId && countsToward(t, tasks)).length;

export type Candidate = { member: Member; level: Level | undefined; load: number; remaining: number; projected: number; fits: boolean };
export function candidate(m: Member, task: Task, tasks: Task[]): Candidate {
  const load = workload(m.id, tasks, task.id);
  const add = task.status === 'Done' || subtasksOf(task.id, tasks).length ? 0 : hours(task.effort);
  const projected = load + add;
  return { member: m, level: skillLevel(m, task.skill), load, remaining: m.capacity - load, projected, fits: m.capacity > 0 && projected <= m.capacity };
}
export type Move = { task: Task; score: number; days: number; to: Member; toRemainingAfter: number; risk: string };
export function redistribute(task: Task, owner: Member, members: Member[], tasks: Task[], weights = DEFAULT_WEIGHTS): Move[] {
  const p = priority(task, weights).score;
  const moves: Move[] = [];
  for (const t of tasks) {
    if (t.id === task.id || t.assignee !== owner.id || !countsToward(t, tasks)) continue;
    const tp = priority(t, weights);
    if (tp.score >= p) continue;
    const target = members.filter(m => m.id !== owner.id && m.available && isQualified(m, t.skill, t.difficulty))
      .map(m => ({ m, remaining: m.capacity - workload(m.id, tasks) }))
      .filter(x => x.remaining >= hours(t.effort)).sort((a, b) => b.remaining - a.remaining)[0];
    if (!target) continue;
    moves.push({ task: t, score: tp.score, days: tp.days, to: target.m, toRemainingAfter: target.remaining - hours(t.effort),
      risk: tp.days < 0 ? 'Already overdue — a handover may delay it further.' : tp.days <= 3 ? `Due in ${tp.days} day${tp.days === 1 ? '' : 's'} — tight handover, confirm with both people.` : 'Deadline leaves room for a handover.' });
  }
  return moves.sort((a, b) => a.score - b.score);
}
export function analyse(task: Task, members: Member[], tasks: Task[], weights = DEFAULT_WEIGHTS) {
  const qualified = members.filter(m => m.available && isQualified(m, task.skill, task.difficulty)).map(m => candidate(m, task, tasks))
    .sort((a, b) => rank(b.level!) - rank(a.level!) || (b.member.capacity - b.projected) - (a.member.capacity - a.projected) || a.member.name.localeCompare(b.member.name));
  const best = qualified[0];
  const overloaded = !!best && !best.fits;
  const alternative = overloaded ? qualified.find(c => c !== best && c.fits) : undefined;
  const suggested = best?.fits ? best : alternative;
  const learners = members.filter(m => m.available && skillLevel(m, task.skill) && !isQualified(m, task.skill, task.difficulty)).map(m => candidate(m, task, tasks)).filter(c => c.fits);
  const redistribution = overloaded ? redistribute(task, best.member, members, tasks, weights) : [];
  const unavailableQualified = members.filter(m => !m.available && isQualified(m, task.skill, task.difficulty));
  const p = priority(task, weights);
  let explanation: string;
  if (!best) explanation = `No available member is ${task.difficulty} or above in ${task.skill}.${unavailableQualified.length ? ` ${unavailableQualified.map(m => m.name).join(', ')} qualifies but is unavailable.` : ''}`;
  else if (best.fits) explanation = `Recommended: ${best.member.name} — ${best.level} in ${task.skill}, ${best.member.capacity - best.projected}h capacity left after this task.${qualified.length > 1 ? ` Strongest of ${qualified.length} qualified members.` : ''}`;
  else if (alternative) explanation = `Recommended: ${alternative.member.name} — ${alternative.level} in ${task.skill}, ${alternative.member.capacity - alternative.projected}h left after this task. ${best.member.name} (${best.level}) is the strongest match but currently overloaded.`;
  else explanation = `${best.member.name} — ${best.level} in ${task.skill}, but currently overloaded (${best.projected}h of ${best.member.capacity}h). Consider an alternative allocation.`;
  if (suggested && p.level === 'High' && p.days <= 3) explanation += ' High priority with a close deadline — confirm availability this week.';
  return { qualified, best, overloaded, alternative, suggested, learners, redistribution, explanation, priority: p };
}
export type Analysis = ReturnType<typeof analyse>;

/** Starting point for Option B; the user edits everything before confirming. */
export function draftSubtasks(task: Task, members: Member[], tasks: Task[]): Task[] {
  const total = hours(task.effort) || 1;
  const round = (n: number) => Math.max(0.5, Math.round(n * 2) / 2);
  const lower = LEVELS[Math.max(0, rank(task.difficulty) - 2)];
  const pick = (difficulty: Level, effort: number, exclude: string[] = []) => members
    .filter(m => m.available && !exclude.includes(m.id) && isQualified(m, task.skill, difficulty))
    .map(m => ({ m, left: m.capacity - workload(m.id, tasks, task.id) - effort })).filter(x => x.left >= 0)
    .sort((a, b) => b.left - a.left)[0]?.m.id ?? '';
  const core = round(total * 0.5), support = round(total * 0.35), review = round(Math.max(0.5, total - core - support));
  const base = { skill: task.skill, deadline: task.deadline, importance: task.importance, status: 'To do' as Status, parentId: task.id };
  const coreOwner = pick(task.difficulty, core);
  const supportOwner = pick(lower, support, coreOwner ? [coreOwner] : []);
  const reviewer = pick(task.difficulty, review) || coreOwner;
  return [
    { ...base, id: crypto.randomUUID(), title: `Core work: ${task.title}`, description: 'The part that needs full proficiency.', difficulty: task.difficulty, effort: core, assignee: coreOwner },
    { ...base, id: crypto.randomUUID(), title: `Supporting work: ${task.title}`, description: 'Preparation and routine pieces suitable for a less-experienced member.', difficulty: lower, effort: support, assignee: supportOwner },
    { ...base, id: crypto.randomUUID(), title: `Review: ${task.title}`, description: 'Review and mentoring by a qualified member.', difficulty: task.difficulty, effort: review, assignee: reviewer },
  ];
}

const isLevel = (v: unknown): v is Level => LEVELS.includes(v as Level);
/** Upgrades saved workspaces from earlier versions without losing data. */
export function normalize(raw: any): Data {
  if (!raw || !Array.isArray(raw.tasks) || !Array.isArray(raw.members) || !raw.weights) throw new Error('Invalid saved workspace');
  return {
    weights: { ...DEFAULT_WEIGHTS, ...raw.weights },
    members: raw.members.map((m: any) => ({ ...m, capacity: hours(Number(m.capacity)), available: m.available !== false,
      skills: (Array.isArray(m.skills) ? m.skills : []).map((s: any) => typeof s === 'string' ? { name: s, level: 'Intermediate' } : { name: String(s?.name ?? ''), level: isLevel(s?.level) ? s.level : 'Intermediate' }).filter((s: MemberSkill) => s.name) })),
    tasks: raw.tasks.map((t: any) => ({ ...t, difficulty: isLevel(t.difficulty) ? t.difficulty : 'Intermediate', effort: hours(Number(t.effort)), assignee: t.assignee ?? '' })),
  };
}

export function demoData(): Data {
  const date = (offset: number) => { const d = new Date(); d.setDate(d.getDate()+offset); return localDate(d); };
  const s = (...pairs: [string, Level][]) => pairs.map(([name, level]) => ({ name, level }));
  const members: Member[] = [
    { id:'m1',name:'Olivia Chen',role:'Product designer',skills:s(['UI/UX','Expert'],['Frontend','Intermediate']),available:true,capacity:24 },
    { id:'m2',name:'Marcus Williams',role:'Backend engineer',skills:s(['Backend','Expert'],['Documentation','Advanced']),available:true,capacity:20 },
    { id:'m3',name:'Priya Sharma',role:'Data analyst',skills:s(['Data Analysis','Expert'],['Backend','Advanced'],['Testing','Intermediate']),available:true,capacity:24 },
    { id:'m4',name:'Alex Morgan',role:'Frontend engineer',skills:s(['Frontend','Expert'],['Testing','Advanced'],['Backend','Beginner']),available:true,capacity:20 },
    { id:'m5',name:'Sophie Laurent',role:'Quality engineer',skills:s(['Testing','Expert'],['Documentation','Intermediate']),available:false,capacity:16 },
  ];
  const rows: [string,string,Level,number,number,Importance,Status,string][] = [
    ['Build onboarding flow','Frontend','Advanced',1,8,'High','In progress','m4'],
    ['Design analytics dashboard','UI/UX','Advanced',3,6,'High','In progress','m1'],
    ['Optimise API response times','Backend','Expert',-1,10,'High','In progress','m2'],
    ['Migrate payment service','Backend','Expert',4,8,'High','To do',''],
    ['Refactor logging module','Backend','Intermediate',12,6,'Low','To do','m2'],
    ['Analyse customer retention','Data Analysis','Advanced',2,6,'High','To do','m3'],
    ['Write integration tests','Testing','Intermediate',5,8,'Medium','To do','m4'],
    ['Update API documentation','Documentation','Intermediate',8,4,'Medium','To do',''],
    ['Audit accessibility','Frontend','Intermediate',6,6,'Medium','To do','m4'],
    ['Clean up survey dataset','Data Analysis','Beginner',10,3,'Low','To do','m3'],
    ['Refresh component library','UI/UX','Intermediate',-2,4,'Medium','Done','m1'],
    ['Review release checklist','Testing','Beginner',7,2,'Low','Done','m5'],
  ];
  return { members, weights:{...DEFAULT_WEIGHTS},tasks: rows.map((r,i) => ({id:`t${i+1}`,title:r[0],description:`Fictional demo task: ${r[0].toLowerCase()}. Review the deliverable before marking it complete.`,skill:r[1],difficulty:r[2],deadline:date(r[3]),effort:r[4],importance:r[5],status:r[6],assignee:r[7]})) };
}
