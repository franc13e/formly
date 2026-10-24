import type { SupabaseClient } from "@supabase/supabase-js";
import { onSave } from "./storage";

/** App data as stored in the `user_state.data` column: localStorage key → raw JSON string. */
export type Snapshot = Record<string, string>;

/** localStorage keys that belong to the app shell, not the user's data. */
const INTERNAL_PREFIXES = ["sb-", "formly:"];

export function isAppKey(key: string): boolean {
  return !INTERNAL_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/** Copies every app key out of `storage`. */
export function takeSnapshot(storage: Storage): Snapshot {
  const snapshot: Snapshot = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key === null || !isAppKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

/** Removes every app key from `storage`, leaving auth/session keys in place. */
export function clearAppData(storage: Storage): void {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key !== null && isAppKey(key)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
}

/** Replaces the app keys in `storage` with `snapshot`. */
export function applySnapshot(storage: Storage, snapshot: Snapshot): void {
  clearAppData(storage);
  for (const [key, value] of Object.entries(snapshot)) {
    if (isAppKey(key)) storage.setItem(key, value);
  }
}

export function isSnapshot(value: unknown): value is Snapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string")
  );
}

/**
 * Brings this browser in line with the signed-in user's cloud data.
 * - Cloud data exists → it replaces the local copy (cloud is the source of truth).
 * - No cloud data yet → the local copy is uploaded, so guest progress carries over.
 */
export async function pullOrSeed(client: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await client
    .from("user_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;

  const remote: unknown = data?.data;
  if (isSnapshot(remote) && Object.keys(remote).length > 0) {
    applySnapshot(localStorage, remote);
  } else {
    await pushSnapshot(client, userId);
  }
}

export async function pushSnapshot(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client
    .from("user_state")
    .upsert({ user_id: userId, data: takeSnapshot(localStorage), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function deleteRemoteState(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client.from("user_state").delete().eq("user_id", userId);
  if (error) throw error;
}

/**
 * Uploads the local copy shortly after each save (debounced), and once more when
 * the tab is hidden so the last change isn't lost. Returns a stop function.
 */
export function startAutoSync(
  client: SupabaseClient,
  userId: string,
  onError: (error: unknown) => void,
  delayMs = 1500,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;

  const flush = () => {
    if (!dirty) return;
    dirty = false;
    pushSnapshot(client, userId).catch(onError);
  };
  const schedule = (key: string) => {
    if (!isAppKey(key)) return;
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(flush, delayMs);
  };
  const onHidden = () => {
    if (document.visibilityState === "hidden") {
      clearTimeout(timer);
      flush();
    }
  };

  const unsubscribe = onSave(schedule);
  document.addEventListener("visibilitychange", onHidden);
  return () => {
    unsubscribe();
    document.removeEventListener("visibilitychange", onHidden);
    clearTimeout(timer);
    flush();
  };
}
