export type Status = 'To do' | 'In progress' | 'Done';
export type Importance = 'Low' | 'Medium' | 'High';
export type Task = { id: string; title: string; description: string; skill: string; deadline: string; effort: number; importance: Importance; status: Status; assignee: string };
export type Member = { id: string; name: string; role: string; skills: string[]; available: boolean; capacity: number };
export type Weights = { urgency: number; importance: number; effort: number };
export type Data = { tasks: Task[]; members: Member[]; weights: Weights };
export const SKILLS = ['Frontend', 'Backend', 'UI/UX', 'Data Analysis', 'Testing', 'Documentation'];
export const DEFAULT_WEIGHTS: Weights = { urgency: 40, importance: 35, effort: 25 };
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function priority(task: Task, weights = DEFAULT_WEIGHTS, today = localDate()) {
  const days = Math.round((Date.parse(task.deadline) - Date.parse(today)) / 86400000);
  const urgency = days < 0 ? 100 : days <= 1 ? 90 : days <= 3 ? 75 : days <= 7 ? 50 : 25;
  const importance = { High: 100, Medium: 60, Low: 30 }[task.importance];
  const effort = task.effort > 8 ? 100 : task.effort > 4 ? 70 : task.effort > 2 ? 45 : 25;
  const score = (urgency * weights.urgency + importance * weights.importance + effort * weights.effort) / 100;
  return { score, level: score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low', urgency, importance, effort, days };
}
export function workload(memberId: string, tasks: Task[], excludeId?: string) { return tasks.filter(t => t.assignee === memberId && t.status !== 'Done' && t.id !== excludeId).reduce((n,t) => n+t.effort,0); }
export function recommend(task: Task, members: Member[], tasks: Task[]) {
  return members.filter(m => m.available && m.skills.some(s => s.toLowerCase() === task.skill.toLowerCase())).map(member => {
    const load = workload(member.id, tasks, task.id);
    const remaining = member.capacity-load;
    const projected = load + (task.status === 'Done' ? 0 : task.effort);
    const balance = member.capacity > 0 ? 30 * Math.max(0, Math.min(1, (member.capacity-projected)/member.capacity)) : 0;
    return { member, load, remaining, projected, score: 70+balance, balance, over: projected > member.capacity };
  }).sort((a,b) => b.score-a.score || a.projected-b.projected || a.member.name.localeCompare(b.member.name));
}
export function demoData(): Data {
  const date = (offset: number) => { const d = new Date(); d.setDate(d.getDate()+offset); return localDate(d); };
  const members: Member[] = [
    { id:'m1',name:'Olivia Chen',role:'Product designer',skills:['UI/UX','Frontend'],available:true,capacity:24 },
    { id:'m2',name:'Marcus Williams',role:'Backend engineer',skills:['Backend','Documentation'],available:true,capacity:32 },
    { id:'m3',name:'Priya Sharma',role:'Data analyst',skills:['Data Analysis','Testing'],available:true,capacity:24 },
    { id:'m4',name:'Alex Morgan',role:'Frontend engineer',skills:['Frontend','Testing'],available:true,capacity:20 },
    { id:'m5',name:'Sophie Laurent',role:'Quality engineer',skills:['Testing','Documentation'],available:false,capacity:16 },
  ];
  const rows: [string,string,number,number,Importance,Status,string][] = [
    ['Build onboarding flow','Frontend',1,8,'High','In progress','m4'],
    ['Design analytics dashboard','UI/UX',3,6,'High','In progress','m1'],
    ['Optimise API response times','Backend',-1,10,'High','In progress','m2'],
    ['Analyse customer retention','Data Analysis',2,6,'High','To do','m3'],
    ['Write integration tests','Testing',5,8,'Medium','To do','m4'],
    ['Update API documentation','Documentation',8,4,'Medium','To do',''],
    ['Audit accessibility','Frontend',6,6,'Medium','To do','m4'],
    ['Clean up survey dataset','Data Analysis',10,3,'Low','To do','m3'],
    ['Refresh component library','UI/UX',-2,4,'Medium','Done','m1'],
    ['Review release checklist','Testing',7,2,'Low','Done','m5'],
  ];
  return { members, weights:{...DEFAULT_WEIGHTS},tasks: rows.map((r,i) => ({id:`t${i+1}`,title:r[0],description:`Coordinate with the team to ${r[0].toLowerCase()}. Review the deliverable before marking it complete.`,skill:r[1],deadline:date(r[2]),effort:r[3],importance:r[4],status:r[5],assignee:r[6]})) };
}