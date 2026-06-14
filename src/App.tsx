import { useEffect, useState } from 'react';
import { Shell } from './core/shell/Shell';
import { store } from './core/store/store';
import { parseTask } from './modules/tasks/parse';

const SEED_FLAG = 'chronos.seeded';

async function seedIfFirstRun() {
  if (localStorage.getItem(SEED_FLAG)) return;
  const samples = [
    'submit 3 applications this week friday #jobs !1',
    'bitstream FSM onto Nexys A7 in 4 days #fpga !1',
    'write spoken employment gap answer tomorrow #jobs !2',
    'walk the dog today 6pm',
  ];
  for (const s of samples) {
    const p = parseTask(s);
    await store.record('tasks', 'task', { ...p, done: false });
  }
  localStorage.setItem(SEED_FLAG, '1');
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedIfFirstRun().then(() => setReady(true)); }, []);
  if (!ready) return null;
  return <Shell />;
}
