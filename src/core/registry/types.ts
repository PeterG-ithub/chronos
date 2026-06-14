// ─────────────────────────────────────────────────────────────
// THE SIGN-IN SHEET (module registry)
//
// Each room hands the lobby one of these cards. The lobby builds the
// nav menu and the Overview dashboard purely from these cards — it
// never imports a room directly. Add a room = add it to the list in
// registry.ts. Nothing in the core changes.
// ─────────────────────────────────────────────────────────────

import type { ComponentType } from 'react';

/** One headline a room wants shown on the Overview screen. */
export interface Digest {
  title: string;
  items: { text: string; meta?: string }[];
  /** which module's nav id to jump to when the user clicks through */
  link: string;
}

export interface ModuleManifest {
  id: string;                       // unique key, e.g. "tasks"
  label: string;                    // nav label, e.g. "Tasks"
  icon: ComponentType;             // the rail icon (inline SVG component)
  view: ComponentType;             // the full room screen
  /** optional: top slice for the Overview. Omit if the room has no digest. */
  digest?: () => Promise<Digest>;
}
