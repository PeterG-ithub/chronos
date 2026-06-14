import { useEffect, useState } from 'react';
import { modules } from '../registry/registry';
import type { Digest } from '../registry/types';

export function Overview({ onJump }: { onJump: (id: string) => void }) {
  const [digests, setDigests] = useState<Digest[]>([]);

  useEffect(() => {
    Promise.all(
      modules.filter((m) => m.digest).map((m) => m.digest!())
    ).then(setDigests);
  }, []);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="overview">
      <h1 className="ov-h1">Today</h1>
      <p className="ov-date">{today}</p>

      {digests.length === 0 && <p className="ov-empty">No modules are reporting anything yet.</p>}

      {digests.map((d) => (
        <section key={d.link} className="ov-sec-wrap">
          <div className="ov-sec">
            <span>{d.title}</span>
            <button className="ov-jump" onClick={() => onJump(d.link)}>open →</button>
          </div>
          {d.items.length === 0
            ? <p className="ov-none">Nothing here.</p>
            : d.items.map((it, i) => (
                <div key={i} className="ov-row">
                  <span className="ov-row-text">{it.text}</span>
                  {it.meta && <span className="ov-row-meta">{it.meta}</span>}
                </div>
              ))}
        </section>
      ))}
    </div>
  );
}
