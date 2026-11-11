import type { Workout, WorkoutLogEntry } from "../types";
import { localDateKey } from "./date";
import { builtInGuide, findLibraryWorkout } from "./formTips";
import { suggestForPhase, type PhaseContext } from "./phaseSuggest";
import { entryGroup, STANDARD_GROUPS } from "./workoutInsights";

// ─── What your training did for your body, and what to train next ───────────

export { entryGroup };

/** What training each group does for you, in plain words. */
export const GROUP_BENEFITS: Record<string, string> = {
  Glutes: "Supports your hips, knees and lower back",
  Legs: "Makes stairs, lifting and standing up easier",
  Back: "Better posture and safer lifting",
  Chest: "Pushing strength for everyday tasks",
  Shoulders: "Stable, healthy shoulders for reaching overhead",
  Arms: "Carrying, gripping and lifting strength",
  Core: "A steadier spine when you move and lift",
  Cardio: "A stronger heart and more stamina",
  Recovery: "Mobility, looser muscles and a calmer mind",
  "Full body": "Whole-body strength and coordination",
};

export interface BodyBenefit {
  group: string;
  benefit: string;
  sessions: number;
  /** Up to three distinct workout names, most logged first. */
  workouts: string[];
}

/** One line per group trained in `entries`, most sessions first. */
export function bodyBenefits(entries: WorkoutLogEntry[]): BodyBenefit[] {
  const byGroup = new Map<string, Map<string, number>>();
  for (const e of entries) {
    const g = entryGroup(e);
    if (!g || !GROUP_BENEFITS[g]) continue;
    const names = byGroup.get(g) ?? new Map<string, number>();
    names.set(e.name, (names.get(e.name) ?? 0) + 1);
    byGroup.set(g, names);
  }
  return [...byGroup].map(([group, names]) => ({
    group,
    benefit: GROUP_BENEFITS[group],
    sessions: [...names.values()].reduce((a, b) => a + b, 0),
    workouts: [...names].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([n]) => n),
  })).sort((a, b) => b.sessions - a.sessions || a.group.localeCompare(b.group));
}

/** The first sentence of a text. */
export const firstSentence = (text: string) => (/^.*?[.!?](\s|$)/.exec(text)?.[0] ?? text).trim();

export interface TopWorkout {
  name: string;
  count: number;
  /** What it does for you, from its built-in guide (first sentence); null for workouts without one. */
  helps: string | null;
  workout?: Workout;
}

/** The workout logged most often in `entries` (latest wins a tie). */
export function topWorkout(entries: WorkoutLogEntry[]): TopWorkout | null {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
  let best: [string, number] | null = null;
  for (const c of counts) if (!best || c[1] > best[1]) best = c;
  if (!best) return null;
  const workout = findLibraryWorkout({ name: best[0] });
  const helps = builtInGuide(workout).guide?.helps;
  return { name: best[0], count: best[1], helps: helps ? firstSentence(helps) : null, workout };
}

const daysBetween = (from: string, to: string) => Math.round((new Date(to + "T12:00").getTime() - new Date(from + "T12:00").getTime()) / 86_400_000);

/** Muscles need about two days to recover before training them hard again. */
export const RECOVERY_DAYS = 2;

export interface TrainNextPick {
  group: string;
  /** Days since it was last trained, or null when never. */
  daysAgo: number | null;
  workout: Workout;
  /** Why this exercise suits today (phase reason when the cycle is known). */
  reason: string;
}

/** Most recent date each standard group was trained (a full-body session counts for all). */
export function lastTrained(log: WorkoutLogEntry[], today: string = localDateKey()): Map<string, string> {
  const last = new Map<string, string>();
  const mark = (g: string, d: string) => { const cur = last.get(g); if (!cur || d > cur) last.set(g, d); };
  for (const e of log) {
    if (e.date > today) continue;
    const g = entryGroup(e);
    if (!g) continue;
    if (g === "Full body") STANDARD_GROUPS.forEach(s => mark(s, e.date));
    else mark(g, e.date);
  }
  return last;
}

/**
 * Up to `count` muscle groups to train next with one exercise each: never-trained groups first,
 * then the longest rested. Groups trained in the last two days are left to recover.
 * Exercises are picked to suit the cycle phase when it's known.
 */
export function trainNext(log: WorkoutLogEntry[], library: Workout[], ctx: PhaseContext | null, today: string = localDateKey(), count = 3): TrainNextPick[] {
  const last = lastTrained(log, today);
  const candidates = STANDARD_GROUPS
    .map((group, order) => {
      const d = last.get(group);
      return { group, order, daysAgo: d ? daysBetween(d, today) : null };
    })
    .filter(c => c.daysAgo === null || c.daysAgo >= RECOVERY_DAYS)
    .sort((a, b) => (a.daysAgo === null ? -1 : 0) - (b.daysAgo === null ? -1 : 0) || (b.daysAgo ?? 0) - (a.daysAgo ?? 0) || a.order - b.order);
  const picks: TrainNextPick[] = [];
  for (const c of candidates) {
    if (picks.length >= count) break;
    const inGroup = library.filter(w => w.muscle === c.group);
    if (!inGroup.length) continue;
    const best = ctx ? suggestForPhase(inGroup, ctx, 1)[0] : null;
    const workout = best?.workout ?? inGroup.find(w => w.difficulty === "Beginner") ?? inGroup[0];
    picks.push({ group: c.group, daysAgo: c.daysAgo, workout, reason: best?.reason ?? "A good one to start with" });
  }
  return picks;
}

/** "Not trained yet", "Last trained yesterday", "Last trained 9 days ago" */
export function lastTrainedLabel(daysAgo: number | null): string {
  if (daysAgo === null) return "Not trained yet";
  if (daysAgo === 1) return "Last trained yesterday";
  return `Last trained ${daysAgo} days ago`;
}
