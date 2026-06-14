import { useState } from 'react';
import { modules } from '../registry/registry';
import { Overview } from './Overview';
import { IconOverview } from '../../lib/icons';
import './shell.css';

const HOME = '__overview__';

export function Shell() {
  const [active, setActive] = useState<string>(HOME);

  const current = modules.find((m) => m.id === active);
  const ActiveView = current?.view;

  return (
    <div className="shell">
      <nav className="rail">
        <div className="brand">Chronos<small>your time, in one place</small></div>

        <ul className="rail-nav">
          <li className={active === HOME ? 'on' : ''} onClick={() => setActive(HOME)}>
            <IconOverview />Overview
          </li>
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.id} className={active === m.id ? 'on' : ''} onClick={() => setActive(m.id)}>
                <Icon />{m.label}
              </li>
            );
          })}
        </ul>

        <div className="rail-live"><span className="live-dot" />local · saved on this device</div>
      </nav>

      <main className="stage">
        {active === HOME
          ? <Overview onJump={setActive} />
          : ActiveView ? <ActiveView /> : null}
      </main>
    </div>
  );
}
