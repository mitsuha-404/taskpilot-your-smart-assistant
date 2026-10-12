import { describe, expect, it } from 'vitest';
import { analyse, priority, workload, type Task, type Member } from '@/lib/taskpilot';
const task: Task = { id: 't', title: 'Critical work', description: '', skill: 'Backend', difficulty: 'Advanced', deadline: '2026-10-13', effort: 9, importance: 'High', status: 'To do', assignee: '' };
const m = (id: string, level: Member['skills'][number]['level'], capacity: number, available = true): Member => ({ id, name: id, role: '', skills: [{ name: 'Backend', level }], available, capacity });
describe('TaskPilot rules', () => {
  it('calculates the documented priority score', () => expect(priority(task, undefined, '2026-10-12').score).toBe(96));
  it('excludes completed tasks and split parents from workload', () => {
    const tasks: Task[] = [{ ...task, assignee: 'a' }, { ...task, id: 'd', status: 'Done', assignee: 'a' }, { ...task, id: 's', parentId: 't', effort: 3, assignee: 'a' }];
    expect(workload('a', tasks)).toBe(3);
  });
  it('picks a qualified member with capacity', () => expect(analyse(task, [m('a', 'Expert', 40)], []).suggested?.member.id).toBe('a'));
  it('falls back to another qualified member when the best is overloaded', () => {
    const r = analyse(task, [m('a', 'Expert', 5), m('b', 'Advanced', 20)], []);
    expect(r.overloaded).toBe(true); expect(r.suggested?.member.id).toBe('b');
  });
  it('never suggests an under-qualified or unavailable member', () => {
    const r = analyse(task, [m('a', 'Beginner', 100), m('c', 'Expert', 100, false)], []);
    expect(r.suggested).toBeUndefined(); expect(r.learners[0]?.member.id).toBe('a');
  });
});
