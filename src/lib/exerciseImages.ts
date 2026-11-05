import { EXERCISE_IMAGE_INDEX, type IndexedExercise } from "../data/exerciseImageIndex";
import type { WorkoutImage } from "../types";

// ─── Matching any exercise name to a wger demonstration image ───────────────
// Names are normalised the same way on both sides (lowercase, synonyms, simple plurals),
// then scored by token overlap. Every "required" word of the name must appear in the
// candidate; muscle and equipment words are optional. Unrelated or vague names get null.

// Phrase-level synonyms, applied in order to the space-separated, lower-case name.
const PHRASES: [RegExp, string][] = [
  [/\b(push ?ups?|press ?ups?)\b/g, "pushup"],
  [/\bpull ?ups?\b/g, "pullup"],
  [/\bchin ?ups?\b/g, "chinup"],
  [/\bsit ?ups?\b/g, "situp"],
  [/\bstep ?ups?\b/g, "stepup"],
  [/\bpull ?downs?\b/g, "pulldown"],
  [/\bpush ?downs?\b/g, "pushdown"],
  [/\bdead ?lifts?\b/g, "deadlift"],
  [/\bbenchpress(es)?\b/g, "bench press"],
  [/\bhammercurls?\b/g, "hammer curl"],
  [/\brdls?\b/g, "romanian deadlift"],
  [/\bohp\b/g, "overhead press"],
  [/\bdb\b/g, "dumbbell"],
  [/\bbb\b/g, "barbell"],
  [/\bkb\b/g, "kettlebell"],
  [/\bfoam roll(ing|er|ers)?\b/g, "foam roller"],
  [/\bfl(ies|yes)\b/g, "fly"],
  [/\bcalves\b/g, "calf"],
  // wger names barbell rows as "Bent Over Rowing"; keep "rowing" for the cardio machine.
  [/\bbent over rowing\b/g, "bent over row"],
  [/\browing seated\b/g, "seated row"],
  [/\browing t bar\b/g, "t bar row"],
  // wger's "Kneeling kickbacks" is the glute version.
  [/\bkneeling kickbacks?\b/g, "kneeling glute kickback"],
];

const STOP = new Set(["with", "on", "the", "a", "an", "of", "and", "or", "to", "for", "in", "using", "left", "right", "mit", "nb", "w"]);
// Words that describe a session rather than a movement.
const FILLER = new Set(["progression", "day", "circuit", "sculpt", "blast", "destroyer", "workout", "session", "routine", "finisher", "variation", "exercise", "class"]);
// Optional in the name: matching them helps, missing them is fine ("Tricep Dip" → "Dips").
const MUSCLE = new Set(["glute", "leg", "back", "chest", "shoulder", "arm", "core", "ab", "bicep", "tricep", "calf", "hamstring", "quad"]);
const EQUIPMENT = new Set(["dumbbell", "barbell", "kettlebell", "cable", "machine", "band", "bar", "sz", "smith", "trx", "ez", "weighted", "bodyweight", "resistance", "rubber", "ring"]);
// Movement words too broad to match on their own.
const GENERIC = new Set(["press", "curl", "raise", "row", "fly", "extension", "pull", "push", "lift", "kick"]);
// Extra candidate words that don't change the movement much (posture, grip, equipment).
const CHEAP = new Set([...EQUIPMENT, "single", "one", "arm", "bent", "over", "seated", "standing", "lying", "laying", "sitting",
  "kneeling", "close", "wide", "narrow", "grip", "alternating", "full", "lower"]);

function singular(w: string): string {
  if (w.length <= 3) return w;
  if (/(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s") && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}

/** "Push-Ups (Wide Grip)" → ["pushup", "wide", "grip"]; also used for the index names. */
export function exerciseTokens(name: string): string[] {
  let s = ` ${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim()} `;
  for (const [re, to] of PHRASES) s = s.replace(re, to);
  let tokens = s.split(" ").filter(Boolean).map(singular).filter(t => !STOP.has(t) && !FILLER.has(t));
  // "Split squat" usually means the Bulgarian (rear foot elevated) version.
  const i = tokens.findIndex((t, k) => t === "split" && tokens[k + 1] === "squat");
  if (i >= 0 && !tokens.includes("bulgarian") && !tokens.includes("smith")) tokens = [...tokens.slice(0, i), "bulgarian", ...tokens.slice(i)];
  return tokens;
}

const contains = (hay: string[], needle: string[]) =>
  needle.length > 0 && hay.some((_, i) => needle.every((t, k) => hay[i + k] === t));

/** Match score of a candidate for a query, or null when it shouldn't match. */
function score(query: string[], cand: string[]): number | null {
  if (query.length === cand.length && query.every((t, i) => t === cand[i])) return 1000;
  const required = query.filter(t => !MUSCLE.has(t) && !EQUIPMENT.has(t));
  if (!required.length) return null; // "Chest", "Leg day": too vague to pick one exercise
  if (query.length === 1 && GENERIC.has(query[0])) return null; // "Press", "Pull day": which one?
  const have = new Set(cand);
  if (!required.every(t => have.has(t))) return null;
  // Named muscles must agree: "Back extension" is not "Leg extension", "Tricep kickback" not a glute kickback.
  const qMuscles = query.filter(t => MUSCLE.has(t));
  const cMuscles = cand.filter(t => MUSCLE.has(t));
  if (qMuscles.length && cMuscles.length && !cMuscles.some(t => qMuscles.includes(t))) return null;
  const q = new Set(query);
  const extras = cand.filter(t => !q.has(t));
  // An extra muscle word only narrows the movement when the name named no muscle ("Kickback" → "Glute kickback").
  const isCheap = (t: string) => CHEAP.has(t) || (MUSCLE.has(t) && !qMuscles.length);
  const costly = extras.filter(t => !isCheap(t)).length;
  if (costly > (required.length === 1 ? 0 : 2)) return null;
  const optional = query.filter(t => !required.includes(t));
  // Different named equipment ("Barbell row" vs "TRX rows") is a weaker match.
  const qEquip = query.filter(t => EQUIPMENT.has(t));
  const cEquip = cand.filter(t => EQUIPMENT.has(t));
  const equipClash = qEquip.length > 0 && cEquip.length > 0 && !cEquip.some(t => qEquip.includes(t));
  return required.length * 10
    + optional.reduce((n, t) => n + (have.has(t) ? 3 : -1), 0)
    - costly * 1.5
    - extras.filter(t => isCheap(t)).reduce((n, t) => n + (MUSCLE.has(t) ? 1 : 0.5), 0)
    - (equipClash ? 4 : 0)
    + (contains(cand, query) ? 4 : 0);
}

let indexed: { entry: IndexedExercise; tokens: string[] }[] | null = null;
const memo = new Map<string, WorkoutImage | null>();

/** Best wger demonstration image for any exercise name (built-in, custom or typed), or null. */
export function findExerciseImage(name: string): WorkoutImage | null {
  const key = name.trim().toLowerCase();
  if (memo.has(key)) return memo.get(key)!;
  const query = exerciseTokens(name);
  indexed ??= EXERCISE_IMAGE_INDEX.map(entry => ({ entry, tokens: exerciseTokens(entry.name) }));
  let best: { entry: IndexedExercise; score: number } | null = null;
  if (query.length) {
    for (const { entry, tokens } of indexed) {
      const s = score(query, tokens);
      if (s === null || !entry.url.startsWith("https://")) continue;
      // Ties go to the plainer (shorter) name, then alphabetical, so results are stable.
      if (!best || s > best.score || (s === best.score && (entry.name.length < best.entry.name.length
        || (entry.name.length === best.entry.name.length && entry.name < best.entry.name)))) best = { entry, score: s };
    }
  }
  const out = best ? { url: best.entry.url, title: best.entry.name, author: best.entry.author, license: best.entry.license, source_url: best.entry.source_url } : null;
  if (memo.size > 500) memo.clear();
  memo.set(key, out);
  return out;
}
