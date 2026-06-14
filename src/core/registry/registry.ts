// ─────────────────────────────────────────────────────────────
// THE REGISTRY — the one list you edit to add a room.
//
// To add a module: build its folder under src/modules/<name>/,
// export a ModuleManifest from its index.ts, and add it to this
// array. The shell builds the nav + Overview from this list alone.
// Nothing else in the core changes.
// ─────────────────────────────────────────────────────────────

import type { ModuleManifest } from './types';
import { tasksModule } from '../../modules/tasks';

export const modules: ModuleManifest[] = [
  tasksModule,
  // habitsModule,    ← drop new rooms here
  // journalModule,
  // ledgerModule,
  // assistantModule,
];
