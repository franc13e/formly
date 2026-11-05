import { ALL_WORKOUTS } from "../data/workouts";
import { WORKOUT_GUIDES } from "../data/workoutGuides";
import { WORKOUT_IMAGES } from "../data/workoutImages";
import type { FormTips, Workout, WorkoutGuide, WorkoutImage } from "../types";
import { load, save } from "./storage";

// ─── Workout guides: built-in content, AI form tips and their cache ─────────

/** localStorage key for AI form tips: normalised workout name → tips. */
export const FORM_TIPS_KEY = "form-tips";
export const MAX_CACHED_TIPS = 50;

/** "  Kettlebell   Swing " → "kettlebell swing" */
export const tipsKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

/** The library workout with this id, or else this name (scheduled items only carry a name). */
export function findLibraryWorkout(w: { id?: number; name: string }): Workout | undefined {
  return ALL_WORKOUTS.find(x => x.id === w.id) ?? ALL_WORKOUTS.find(x => tipsKey(x.name) === tipsKey(w.name));
}

/** Built-in guide and image for a library workout. */
export function builtInGuide(w: Workout | undefined): { guide?: WorkoutGuide; image?: WorkoutImage } {
  if (!w) return {};
  const image = WORKOUT_IMAGES[String(w.id)];
  return { guide: WORKOUT_GUIDES[w.id], image: image?.url.startsWith("https://") ? image : undefined };
}

/** YouTube search for a workout's form videos. */
export function formVideoUrl(name: string, videoQuery?: string): string {
  const q = videoQuery?.trim() || `${name.trim()} proper form`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

const HEADER = /^(CUES|AVOID|MISTAKE|HELPS)\s*:\s*(.*)$/i;
const BULLET = /^(?:\d+[.)]|[-•*])\s+/;

/**
 * Parses the /api/form-tips reply ("CUES:" with numbered lines, "AVOID: …", "HELPS: …") into tips.
 * Tolerates bullets, lower-case headers and wrapped lines. Returns null unless it finds at least one cue, a mistake and `helps`.
 */
export function parseFormTips(text: string): FormTips | null {
  const cues: string[] = [];
  const parts = { mistake: "", helps: "" };
  let section: "cues" | "mistake" | "helps" | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\*\*/g, "").trim();
    if (!line) continue;
    const header = HEADER.exec(line);
    if (header) {
      const name = header[1].toUpperCase();
      section = name === "CUES" ? "cues" : name === "HELPS" ? "helps" : "mistake";
      const rest = header[2].trim();
      if (rest) {
        if (section === "cues") cues.push(rest.replace(BULLET, ""));
        else parts[section] = rest;
      }
      continue;
    }
    if (section === "cues") {
      if (BULLET.test(line) || cues.length === 0) cues.push(line.replace(BULLET, ""));
      else cues[cues.length - 1] += ` ${line}`;
    } else if (section) {
      parts[section] = parts[section] ? `${parts[section]} ${line}` : line;
    }
  }
  const clean = cues.map(c => c.trim()).filter(Boolean).slice(0, 3);
  if (!clean.length || !parts.mistake || !parts.helps) return null;
  return { cues: clean, mistake: parts.mistake, helps: parts.helps };
}

const isTips = (v: unknown): v is FormTips =>
  typeof v === "object" && v !== null && Array.isArray((v as FormTips).cues) && (v as FormTips).cues.every(c => typeof c === "string")
  && typeof (v as FormTips).mistake === "string" && typeof (v as FormTips).helps === "string";

/** Cached AI tips for a workout name, if any. */
export function cachedFormTips(name: string): FormTips | null {
  const all = load<Record<string, unknown>>(FORM_TIPS_KEY, {});
  const hit = typeof all === "object" && all !== null ? all[tipsKey(name)] : undefined;
  return isTips(hit) ? hit : null;
}

/** Caches AI tips for a workout name, keeping the newest MAX_CACHED_TIPS. */
export function rememberFormTips(name: string, tips: FormTips): void {
  const all = load<Record<string, unknown>>(FORM_TIPS_KEY, {});
  const key = tipsKey(name);
  const rest = Object.entries(typeof all === "object" && all !== null ? all : {}).filter(([k]) => k !== key);
  save(FORM_TIPS_KEY, Object.fromEntries([...rest.slice(-(MAX_CACHED_TIPS - 1)), [key, tips]]));
}
