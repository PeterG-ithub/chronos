// Parses quick-add text like:
//   "bitstream the FSM tomorrow 5pm #fpga !1"
// into structured task fields. Handles dates, #tags, !1-3 priority.

export interface ParsedTask {
  text: string;
  due: number | null;
  pri: number;       // 0 = none, 1 = high, 2 = mid, 3 = low
  tags: string[];
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseDate(s: string): { ts: number; match: string } | null {
  const low = s.toLowerCase();
  const now = new Date();
  let h = 9, mi = 0;

  const tm = low.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (tm) {
    h = Number(tm[1]) % 12;
    if (tm[3] === 'pm') h += 12;
    mi = tm[2] ? Number(tm[2]) : 0;
  }
  const at = (d: Date) => { d.setHours(h, mi, 0, 0); return d.getTime(); };

  let m;
  if ((m = low.match(/\btomorrow\b/))) {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    return { ts: at(d), match: m[0] };
  }
  if ((m = low.match(/\btoday\b/))) return { ts: at(new Date(now)), match: m[0] };
  if ((m = low.match(/\bin (\d+) days?\b/))) {
    const d = new Date(now); d.setDate(d.getDate() + Number(m[1]));
    return { ts: at(d), match: m[0] };
  }
  if ((m = low.match(/\bnext week\b/))) {
    const d = new Date(now); d.setDate(d.getDate() + 7);
    return { ts: at(d), match: m[0] };
  }
  const dm = low.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/);
  if (dm) {
    const target = DAYS.indexOf(dm[1]);
    const d = new Date(now);
    let diff = (target - d.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    d.setDate(d.getDate() + diff);
    return { ts: at(d), match: dm[0] };
  }
  return null;
}

export function parseTask(raw: string): ParsedTask {
  let s = raw;
  let pri = 0;
  const tags: string[] = [];
  let due: number | null = null;

  const p = s.match(/!([1-3])/);
  if (p) { pri = Number(p[1]); s = s.replace(p[0], ''); }

  const tagMatches = s.match(/#(\w+)/g);
  if (tagMatches) { tagMatches.forEach((t) => tags.push(t.slice(1))); s = s.replace(/#\w+/g, ''); }

  const d = parseDate(s);
  if (d) { due = d.ts; s = s.replace(d.match, ''); }

  return { text: s.replace(/\s+/g, ' ').trim(), due, pri, tags };
}
