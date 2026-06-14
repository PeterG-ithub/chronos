import { useEffect, useState, useCallback } from 'react';
import { store, type ChronosEvent } from '../../core/store/store';
import { bus } from '../../core/bus/bus';
import { parseTask } from './parse';
import './tasks.css';

const MODULE = 'tasks';

interface TaskPayload {
  text: string;
  due: number | null;
  pri: number;
  tags: string[];
  done: boolean;
}
type TaskEvent = ChronosEvent<TaskPayload>;

type Filter = 'today' | 'upcoming' | 'all' | 'done';

function isToday(ts: number | null) {
  if (!ts) return false;
  return new Date(ts).toDateString() === new Date().toDateString();
}
function isOverdue(ts: number | null) {
  return !!ts && ts < Date.now() && !isToday(ts);
}
function fmtDue(ts: number) {
  const d = new Date(ts);
  const tomorrow = new Date(Date.now() + 864e5);
  const day = isToday(ts) ? 'today'
    : d.toDateString() === tomorrow.toDateString() ? 'tomorrow'
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const hasTime = d.getHours() || d.getMinutes();
  const hm = hasTime
    ? ` ${(d.getHours() % 12) || 12}${d.getMinutes() ? ':' + String(d.getMinutes()).padStart(2, '0') : ''}${d.getHours() >= 12 ? 'pm' : 'am'}`
    : '';
  return day + hm;
}

export function TasksView() {
  const [tasks, setTasks] = useState<TaskEvent[]>([]);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('today');

  const load = useCallback(async () => {
    const evs = (await store.forModule(MODULE)) as TaskEvent[];
    setTasks(evs.filter((e) => e.type === 'task'));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    const v = draft.trim();
    if (!v) return;
    const parsed = parseTask(v);
    const ev = await store.record(MODULE, 'task', { ...parsed, done: false });
    bus.emit('task.created', ev);
    setDraft('');
    load();
  }

  async function toggle(t: TaskEvent) {
    const updated = { ...t, payload: { ...t.payload, done: !t.payload.done } };
    await store.update(updated);
    bus.emit(updated.payload.done ? 'task.completed' : 'task.reopened', updated);
    load();
  }

  async function del(t: TaskEvent) {
    await store.remove(t.id);
    bus.emit('task.deleted', { id: t.id });
    load();
  }

  const visible = tasks.filter((t) => {
    const { done, due } = t.payload;
    if (filter === 'done') return done;
    if (done) return false;
    if (filter === 'today') return isToday(due) || isOverdue(due);
    if (filter === 'upcoming') return due && !isToday(due) && !isOverdue(due);
    return true; // all
  }).sort((a, b) => {
    const pa = a.payload.pri || 9, pb = b.payload.pri || 9;
    if (pa !== pb) return pa - pb;
    return (a.payload.due || 9e15) - (b.payload.due || 9e15);
  });

  const count = (f: Filter) => tasks.filter((t) => {
    const { done, due } = t.payload;
    if (f === 'done') return done;
    if (done) return false;
    if (f === 'today') return isToday(due) || isOverdue(due);
    if (f === 'upcoming') return due && !isToday(due) && !isOverdue(due);
    return true;
  }).length;

  const titles: Record<Filter, string> = { today: 'Today', upcoming: 'Upcoming', all: 'All tasks', done: 'Done' };

  return (
    <div className="tasks">
      <div className="tasks-filters">
        {(['today', 'upcoming', 'all', 'done'] as Filter[]).map((f) => (
          <button key={f} className={'tf' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
            {titles[f]}<span className="tf-ct">{count(f) || ''}</span>
          </button>
        ))}
      </div>

      <div className="tasks-body">
        <h1 className="tasks-h1">{titles[filter]}</h1>
        <p className="tasks-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>

        <div className="tasks-add">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            placeholder="bitstream the FSM tomorrow 5pm #fpga !1"
          />
          <button onClick={add}>Add</button>
        </div>
        <p className="tasks-hint">type a date (tomorrow, friday, in 4 days), #tags, and !1–3 for priority</p>

        <ul className="tasks-list">
          {visible.length === 0 && <li className="tasks-empty">Nothing here yet.</li>}
          {visible.map((t) => (
            <li key={t.id} className={`task pri-${t.payload.pri}${t.payload.done ? ' done' : ''}`}>
              <button className="task-chk" onClick={() => toggle(t)} aria-label="toggle done">{t.payload.done ? '✓' : ''}</button>
              <div className="task-body">
                <div className="task-text">{t.payload.text}</div>
                {(t.payload.due || t.payload.tags.length > 0) && (
                  <div className="task-meta">
                    {t.payload.due && <span className={'pill due' + (isOverdue(t.payload.due) ? ' overdue' : '')}>{fmtDue(t.payload.due)}</span>}
                    {t.payload.tags.map((g) => <span key={g} className="pill tag">#{g}</span>)}
                  </div>
                )}
              </div>
              <button className="task-del" onClick={() => del(t)} aria-label="delete">×</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// The digest the Overview asks for — top 3 of today's open tasks.
export async function tasksDigest() {
  const evs = (await store.forModule(MODULE)) as TaskEvent[];
  const open = evs
    .filter((e) => e.type === 'task' && !e.payload.done && (isToday(e.payload.due) || isOverdue(e.payload.due)))
    .sort((a, b) => (a.payload.pri || 9) - (b.payload.pri || 9))
    .slice(0, 3);
  return {
    title: 'Tasks · today',
    items: open.map((t) => ({
      text: t.payload.text,
      meta: t.payload.due ? (isOverdue(t.payload.due) ? 'overdue' : fmtDue(t.payload.due)) : undefined,
    })),
    link: 'tasks',
  };
}
