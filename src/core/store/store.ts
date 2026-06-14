// ─────────────────────────────────────────────────────────────
// THE SHARED NOTEBOOK (event store)
//
// Every module writes its happenings here as timestamped events.
// One stream, one shape. Modules keep their own typed views on top,
// but underneath it's all one timeline — which is what lets the
// assistant (later) read "everything that happened" in one place.
//
// This file is also THE STORAGE SEAM. Right now it's backed by the
// browser's local database (IndexedDB). To move to a desktop DB
// (Tauri/SQLite) later, you swap ONLY the `backend` object below.
// Nothing else in the app changes.
// ─────────────────────────────────────────────────────────────

import { openDB, type IDBPDatabase } from 'idb';

export interface ChronosEvent<T = unknown> {
  id: string;
  module: string;       // which room created it, e.g. "tasks"
  type: string;         // what happened, e.g. "task.created"
  timestamp: number;    // when (ms since epoch)
  payload: T;           // the actual data
}

// ── The backend (the seam) ────────────────────────────────────
// Swap this object to change where data lives. The interface is
// what the rest of the app depends on, never the implementation.

interface StorageBackend {
  put(ev: ChronosEvent): Promise<void>;
  delete(id: string): Promise<void>;
  all(): Promise<ChronosEvent[]>;
  byModule(module: string): Promise<ChronosEvent[]>;
}

const DB_NAME = 'chronos';
const STORE = 'events';

let dbPromise: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        const s = d.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('module', 'module');
        s.createIndex('timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

const indexedDbBackend: StorageBackend = {
  async put(ev) { (await db()).put(STORE, ev); },
  async delete(id) { (await db()).delete(STORE, id); },
  async all() {
    const items = (await db()).getAllFromIndex(STORE, 'timestamp');
    return items;
  },
  async byModule(module) {
    return (await db()).getAllFromIndex(STORE, 'module', module);
  },
};

const backend: StorageBackend = indexedDbBackend;

// ── The public store API (what modules actually call) ─────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const store = {
  /** Write a new event. Returns the full event with id + timestamp filled in. */
  async record<T>(module: string, type: string, payload: T): Promise<ChronosEvent<T>> {
    const ev: ChronosEvent<T> = { id: uid(), module, type, timestamp: Date.now(), payload };
    await backend.put(ev);
    return ev;
  },

  /** Overwrite an existing event (e.g. marking a task done). */
  async update(ev: ChronosEvent): Promise<void> {
    await backend.put(ev);
  },

  async remove(id: string): Promise<void> {
    await backend.delete(id);
  },

  /** Everything, oldest first. */
  async all(): Promise<ChronosEvent[]> {
    return backend.all();
  },

  /** Everything one module created. */
  async forModule(module: string): Promise<ChronosEvent[]> {
    return backend.byModule(module);
  },
};
