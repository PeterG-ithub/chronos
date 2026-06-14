// ─────────────────────────────────────────────────────────────
// THE BULLETIN BOARD (event bus)
//
// Rooms never call each other directly. They pin notes here and
// listen for notes they care about. This is the single thing that
// stops the app turning to spaghetti as it grows: removing a room
// can't break another room, because nobody holds a reference to
// anyone else.
//
// e.g. the habits room could subscribe to "task.completed" to tick
// a habit, without tasks knowing habits exist. The assistant (later)
// subscribes to "*" — everything.
// ─────────────────────────────────────────────────────────────

type Handler = (type: string, payload: unknown) => void;

const handlers = new Map<string, Set<Handler>>();

export const bus = {
  /** Listen for an event type, or "*" for all. Returns an unsubscribe fn. */
  on(type: string, fn: Handler): () => void {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type)!.add(fn);
    return () => handlers.get(type)?.delete(fn);
  },

  /** Pin a note to the board. */
  emit(type: string, payload?: unknown): void {
    handlers.get(type)?.forEach((fn) => fn(type, payload));
    handlers.get('*')?.forEach((fn) => fn(type, payload));
  },
};
