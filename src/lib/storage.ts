// ─── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Reads and JSON-parses `localStorage[key]`.
 * Returns `fallback` when the key is missing/empty, the JSON is invalid, or storage is unavailable.
 *
 * Note: the parsed value is not validated; it is trusted to have the same shape as
 * `fallback` (it was written by `save` with that shape).
 */
export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

type SaveListener = (key: string) => void;
const saveListeners = new Set<SaveListener>();

/** Subscribe to successful `save` calls (used for cloud sync). Returns an unsubscribe function. */
export function onSave(listener: SaveListener): () => void {
  saveListeners.add(listener);
  return () => {
    saveListeners.delete(listener);
  };
}

/** JSON-serialises `value` into `localStorage[key]`; silently ignores storage errors (quota, private mode). */
export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
  saveListeners.forEach((listener) => listener(key));
}
