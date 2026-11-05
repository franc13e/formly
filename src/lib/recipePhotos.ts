import type { RecipePhoto } from "../types";

// ─── Recipe photo cache ───────────────────────────────────────────────────────
// Photos come from GET /api/recipe-photo (Pexels when configured, else keyless Openverse). Found photos are
// kept in memory and in localStorage under STORAGE_KEY (query → photo, oldest first, capped) so repeat views
// don't refetch. "No photo" and failed lookups are only remembered for the session, so they get retried later.
// Stored entries that don't match the current RecipePhoto shape (e.g. the older Pexels-only one) are ignored.

// "formly:" keeps this cache out of cloud sync (see isAppKey in sync.ts).
export const STORAGE_KEY = "formly:recipe-photos";
export const MAX_STORED_PHOTOS = 60;

type PhotoStorage = Pick<Storage, "getItem" | "setItem">;
type PhotoFetcher = (name: string) => Promise<RecipePhoto | null>;

/** The cache key for a recipe name: trimmed, lower-cased, single-spaced. */
export function photoQueryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const isHttpsUrl = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

const PHOTO_SOURCES: readonly RecipePhoto["source"][] = ["Pexels", "Openverse"];

/**
 * Validates an /api/recipe-photo body (or a stored entry). Returns null unless it has an https photo url,
 * a known source and a license label; optional credit links that aren't https become "".
 */
export function parseRecipePhoto(value: unknown): RecipePhoto | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (!isHttpsUrl(v.url)) return null;
  const source = PHOTO_SOURCES.find((s) => s === v.source);
  if (!source || typeof v.license !== "string" || !v.license.trim()) return null;
  return {
    url: v.url,
    photographer: typeof v.photographer === "string" ? v.photographer.trim() : "",
    photographer_url: isHttpsUrl(v.photographer_url) ? v.photographer_url : "",
    source_url: isHttpsUrl(v.source_url) ? v.source_url : "",
    source,
    license: v.license.trim(),
  };
}

/** Adds `photo` under `key` as the newest entry, dropping the oldest entries beyond `cap`. Returns a new map. */
export function rememberPhoto(map: Record<string, RecipePhoto>, key: string, photo: RecipePhoto, cap = MAX_STORED_PHOTOS): Record<string, RecipePhoto> {
  const entries = Object.entries(map).filter(([k]) => k !== key);
  entries.push([key, photo]);
  return Object.fromEntries(entries.slice(-cap));
}

function readStored(storage: PhotoStorage | null): Record<string, RecipePhoto> {
  try {
    const raw: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) || "{}");
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
    const out: Record<string, RecipePhoto> = {};
    for (const [k, v] of Object.entries(raw)) {
      const photo = parseRecipePhoto(v);
      if (photo) out[k] = photo;
    }
    return out;
  } catch {
    return {};
  }
}

export interface PhotoStore {
  /** The cached photo (or null for "none") for `name`; undefined when it hasn't been looked up yet. */
  peek(name: string): RecipePhoto | null | undefined;
  /** Looks `name` up once (concurrent calls share the request) and caches the result. Never rejects. */
  load(name: string): Promise<RecipePhoto | null>;
}

export function createPhotoStore(fetcher: PhotoFetcher, storage: PhotoStorage | null, cap = MAX_STORED_PHOTOS): PhotoStore {
  let stored: Record<string, RecipePhoto> | null = null;
  const memory = new Map<string, RecipePhoto | null>();
  const pending = new Map<string, Promise<RecipePhoto | null>>();

  const persisted = () => (stored ??= readStored(storage));

  const peek = (name: string) => {
    const key = photoQueryKey(name);
    if (memory.has(key)) return memory.get(key);
    const hit = persisted()[key];
    if (hit) memory.set(key, hit);
    return hit;
  };

  const load = (name: string) => {
    const key = photoQueryKey(name);
    const known = peek(name);
    if (known !== undefined) return Promise.resolve(known);
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;
    const request = fetcher(name)
      .catch(() => null)
      .then((photo) => {
        memory.set(key, photo);
        pending.delete(key);
        if (photo) {
          stored = rememberPhoto(persisted(), key, photo, cap);
          try {
            // Written directly (not via storage.save) so a cache update doesn't trigger a cloud sync.
            storage?.setItem(STORAGE_KEY, JSON.stringify(stored));
          } catch {
            // Quota / private mode: the in-memory cache still works.
          }
        }
        return photo;
      });
    pending.set(key, request);
    return request;
  };

  return { peek, load };
}
