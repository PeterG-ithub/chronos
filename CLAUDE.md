# Chronos

Local-first personal time intelligence. One place where your time lives, in three
tenses: where it **went** (passive tracking), where it **should go** (tasks), how it
**felt** (journal), and what **repeats** (habits) — plus an assistant that can read
across all of it.

This file is the standing context for the project. Read it before making changes.

## Architecture: the lobby and the rooms

The app is a small shared **core** (the "lobby") plus self-contained feature **modules**
(the "rooms"). The whole point is that a room can be added or removed without touching
the core. Three pieces make up the core:

1. **The shared notebook** — `src/core/store/store.ts`. ONE event store every module
   reads and writes through. All happenings (a task created, a journal entry, a habit
   tick) are timestamped events in one stream: `{ id, module, type, timestamp, payload }`.
   Modules keep their own typed views on top. This is also **the storage seam** — see below.

2. **The sign-in sheet** — `src/core/registry/`. Each module exports a `ModuleManifest`
   (`types.ts`) with its id, label, icon, view component, and an optional `digest()` for
   the Overview. Modules are listed in `registry.ts`. The shell builds the nav and the
   Overview from this list alone — it never imports a module directly.

3. **The bulletin board** — `src/core/bus/bus.ts`. Modules NEVER call each other directly.
   They `emit` events and `on`-subscribe to ones they care about. Subscribe to `"*"` for
   all (the future assistant does this). This is the rule that keeps the app from becoming
   spaghetti: removing a room can't break another room.

## The storage seam (important)

`store.ts` is backed by IndexedDB (browser-local DB) today. The `backend` object inside
that file is the ONLY thing that changes to move to a desktop database (Tauri + SQLite)
later. Everything above the store API is storage-agnostic. **Do not** let modules talk to
IndexedDB or any storage directly — always go through the `store` API.

## Folder map

```
src/
  core/
    store/      shared notebook (event store) + the storage seam
    registry/   module manifest type + the list of modules
    bus/        pub/sub bulletin board
    shell/      nav rail, routing, Overview host
  modules/
    tasks/      ✅ BUILT — quick-add w/ date parsing, priority, tags, smart filters
  lib/
    theme.css   the cream/serif design tokens (all colors live here as CSS vars)
    icons.tsx   inline SVG icons (NO webfont — never reintroduce a font-icon dependency)
```

## How to add a room (the only choreography you need)

1. Make `src/modules/<name>/` with a view component and (optionally) a `digest()`.
2. Read/write all data via the `store` API. Emit bus events for anything other rooms
   might care about (e.g. `habit.completed`).
3. Export a `ModuleManifest` from the module's `index.ts`.
4. Add it to the array in `src/core/registry/registry.ts`.
That's it. The core does not change.

## Conventions

- TypeScript, React function components, no class components.
- Colors come from CSS variables in `theme.css`. Never hardcode hex in components.
- Icons are inline SVG components in `lib/icons.tsx`. Do not add a webfont.
- Sentence case in UI copy. Plain product names (Tasks, Habits, Journal, Assistant) —
  NOT the earlier fancy names (Ledger/Obligations/Rites/Oracle). The serif theme carries
  the character; the vocabulary stays plain.
- Round any number shown to the user.
- Keep rooms responsive (they should reflow to one narrow column) — phone support later
  depends on this, and the shell already collapses the rail to a top bar under 560px.

## State of play (keep this current)

- ✅ Core: store + registry + bus + shell all built and working.
- ✅ Overview: dumb host, renders each module's digest, jump-links into rooms.
- ✅ Tasks module: quick-add natural-language parsing (`tomorrow`, `friday`, `in N days`,
  `next week`, times like `5pm`), `#tags`, `!1-3` priority, smart filters
  (Today/Upcoming/All/Done), persists via IndexedDB. Seeds examples on first run.
- ⬜ Habits, Journal, Ledger, Assistant modules — not built yet.
- ⬜ Ledger needs ActivityWatch, which the browser can't reach. That module is the
  trigger to wrap the app in **Tauri** (desktop) and add a SQLite backend behind the
  storage seam. Until then, stay a plain web app.
- ⬜ Assistant will need an API key — put it in `.env` (gitignored), never commit it.

## Commands

- `npm run dev` — run as a web app in the browser (fast, no extra toolchain)
- `npm run build` — typecheck + production build
- (later) `tauri dev` — run wrapped as a desktop app with filesystem + DB access
