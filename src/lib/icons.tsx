// Inline SVG icons. No webfont — these render wherever the app runs.
// Each is a tiny stateless component used by module manifests + the shell.

const base = {
  width: 16, height: 16, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

export const IconOverview = () => (
  <svg {...base}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);

export const IconLedger = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

export const IconTasks = () => (
  <svg {...base}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
);

export const IconHabits = () => (
  <svg {...base}><path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 1.5-1 2-1 2 0-3-1-5-1-7z" /></svg>
);

export const IconJournal = () => (
  <svg {...base}><path d="M4 20c0-6 3-10 9-13l3 1 1 3c-3 6-7 9-13 9z" /><path d="M4 20l5-5" /></svg>
);

export const IconAssistant = () => (
  <svg {...base}><path d="M12 3l1.8 4.7L18 9l-4.2 1.3L12 15l-1.8-4.7L6 9l4.2-1.3z" /><path d="M18 16l.9 2.3L21 19l-2.1.7L18 22l-.9-2.3L15 19l2.1-.7z" /></svg>
);
