# Chronos

A local-first personal time intelligence app. One place where your time lives —
where it went, where it should go, how it felt, what repeats — plus an assistant
that reads across all of it.

Built as a small shared core ("lobby") with self-contained feature modules ("rooms")
that plug in without touching the core. See `CLAUDE.md` for the architecture.

## Status

- **Core** (event store, module registry, event bus, app shell) — working
- **Tasks** module — working: natural-language quick-add, priority, tags, smart filters
- Habits, Journal, Ledger (passive tracking), Assistant — planned

## Run it

```bash
npm install
npm run dev
```

Data is stored locally in your browser (IndexedDB). The passive time-tracking module
(Ledger) will require wrapping the app in Tauri for desktop, since browsers can't read
ActivityWatch — that's a planned step, not a rewrite.

## Stack

React + TypeScript + Vite. Storage behind a swappable seam (IndexedDB now, SQLite later).
