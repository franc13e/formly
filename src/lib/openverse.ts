import type { RecipePhoto } from "../types";

// ─── Openverse, straight from the browser ────────────────────────────────────
// Openverse allows anonymous, cross-origin searches. Calling it from the user's own
// browser gives each person their own rate limit; from the server, every Formly user
// shares Vercel's, which runs out fast. Mirrors openverse_queries / _photo_from_openverse
// in main.py.

const API = "https://api.openverse.org/v1/images/";
const STOP = new Set(["with", "and", "a", "an", "the", "of", "on", "in", "my", "easy", "quick", "simple", "for", "to", "style"]);
const LICENSES = new Set(["by", "by-sa", "cc0", "pdm"]);
const IMAGE_TYPES = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_QUERIES = 4;

/** Queries to try, most specific first: the name, without filler words, then its last two, first two and last word. */
export function openverseQueries(name: string): string[] {
  const words = name.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const core = words.filter(w => !STOP.has(w));
  const base = core.length ? core : words;
  const out: string[] = [];
  for (const c of [words, base, base.slice(-2), base.slice(0, 2), base.slice(-1)]) {
    const q = c.join(" ");
    if (q && !out.includes(q)) out.push(q);
  }
  return out.slice(0, MAX_QUERIES);
}

const https = (v: unknown) => (typeof v === "string" && v.startsWith("https://") ? v : "");

export function licenseLabel(code: string, version: unknown): string {
  if (code === "cc0") return "CC0";
  if (code === "pdm") return "Public domain";
  const v = typeof version === "string" && version ? ` ${version}` : "";
  return `CC ${code.toUpperCase()}${v}`;
}

/** The first usable result: an https image, an accepted licence and (when given) an image file type. */
export function photoFromOpenverse(data: unknown): RecipePhoto | null {
  const results = typeof data === "object" && data !== null && Array.isArray((data as { results?: unknown }).results) ? (data as { results: unknown[] }).results : [];
  for (const item of results) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    const url = https(r.url);
    const code = String(r.license ?? "").toLowerCase();
    const type = r.filetype ? String(r.filetype).toLowerCase() : "";
    if (!url || !LICENSES.has(code) || (type && !IMAGE_TYPES.has(type))) continue;
    return {
      url,
      photographer: String(r.creator ?? "").trim(),
      photographer_url: https(r.creator_url),
      source_url: https(r.foreign_landing_url),
      source: "Openverse",
      license: licenseLabel(code, r.license_version),
    };
  }
  return null;
}

/** Searches Openverse for a food photo; null when nothing usable is found or Openverse is unreachable. */
export async function searchOpenverse(name: string, fetchFn: typeof fetch = fetch): Promise<RecipePhoto | null> {
  for (const q of openverseQueries(name)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const params = new URLSearchParams({ q, page_size: "5", mature: "false", license: "by,by-sa,cc0,pdm" });
      const res = await fetchFn(`${API}?${params}`, { signal: controller.signal });
      if (!res.ok) return null; // throttled or down: let the caller try elsewhere
      const photo = photoFromOpenverse(await res.json());
      if (photo) return photo;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
