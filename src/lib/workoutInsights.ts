import type { PhaseId, WorkoutLogEntry } from "../types";
import { PHASES } from "./cycle";
import { localDateKey } from "./date";
import { addDays, weekOf } from "./workouts";
import { workoutKind, type WorkoutKind } from "./workoutKind";

// ─── Pure logic for the workout Insights card ─────────────────────────────────

export type InsightWindow = "week" | "month";

/** Muscle groups we expect a balanced plan to touch; missing ones show as "Not yet". */
export const STANDARD_GROUPS = ["Legs", "Glutes", "Back", "Chest", "Shoulders", "Arms", "Core"] as const;

const KINDS: WorkoutKind[] = ["strength", "cardio", "recovery"];

// Free-typed or older muscle values folded into the groups the app offers.
const GROUP_ALIASES: [RegExp, string][] = [
  [/full ?body|total body/i, "Full body"],
  [/glute|booty/i, "Glutes"],
  [/\blegs?\b|quad|hamstring|\bcalf|\bcalves/i, "Legs"],
  [/\bback\b|\blats?\b|\btraps?\b/i, "Back"],
  [/chest|\bpecs?\b/i, "Chest"],
  [/shoulder|\bdelts?\b/i, "Shoulders"],
  [/\barms?\b|\bbiceps?\b|\btriceps?\b/i, "Arms"],
  [/\bcore\b|\babs\b|oblique/i, "Core"],
  [/cardio/i, "Cardio"],
  [/recovery|mobility|stretch/i, "Recovery"],
];

/** Folds a log entry's muscle value into a display group, or null when empty. */
export function muscleGroup(muscle: string): string | null {
  const m = muscle.trim();
  if (!m) return null;
  for (const [re, group] of GROUP_ALIASES) if (re.test(m)) return group;
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/** Log entries inside this calendar week (Mon to Sun) or month of `today`. */
export function entriesInWindow(log: WorkoutLogEntry[], window: InsightWindow, today: string = localDateKey()): WorkoutLogEntry[] {
  if (window === "month") {
    const prefix = today.slice(0, 7);
    return log.filter(e => e.date.startsWith(prefix));
  }
  const days = new Set(weekOf(today));
  return log.filter(e => days.has(e.date));
}

const entryKind = (e: WorkoutLogEntry) => workoutKind({ name: e.name, muscle: e.muscle });
const coversLegs = (e: WorkoutLogEntry) => { const g = muscleGroup(e.muscle); return g === "Legs" || g === "Full body"; };

export interface PhaseLine {
  phase: PhaseId;
  kind: WorkoutKind;
  count: number;
  text: string;
}

export interface Insights {
  total: number;
  /** Trained groups, most sessions first. */
  groups: { group: string; count: number }[];
  /** Standard groups with no session in the window (a full-body session covers them all). */
  notYet: string[];
  kinds: Record<WorkoutKind, number>;
  byPhase: PhaseLine | null;
  suggestion: string;
}

// When this kind of session suits the phase especially well.
const GOOD_TIMING: Record<WorkoutKind, PhaseId[]> = {
  strength: ["follicular", "ovulation"],
  cardio: ["follicular", "ovulation"],
  recovery: ["menstrual", "luteal"],
};

const plural = (n: number, word: string) => `${n} ${word} session${n === 1 ? "" : "s"}`;

/** The most common kind × phase combination in the window, as one friendly line. */
export function phaseLine(entries: WorkoutLogEntry[], phaseOn: (date: string) => PhaseId | null): PhaseLine | null {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const phase = phaseOn(e.date);
    if (!phase) continue;
    const key = `${entryKind(e)}|${phase}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: [string, number] | null = null;
  for (const c of counts) if (!best || c[1] > best[1]) best = c;
  if (!best) return null;
  const [kind, phase] = best[0].split("|") as [WorkoutKind, PhaseId];
  const count = best[1];
  const label = PHASES[phase].label.toLowerCase();
  const good = GOOD_TIMING[kind].includes(phase);
  const tail = good ? "nice timing" : kind === "recovery" ? "a kind way to train" : phase === "menstrual" ? "great that you kept moving, go easy when you need to" : phase === "luteal" ? "keep the effort steady and hydrate well" : "nicely done";
  return { phase, kind, count, text: `${plural(count, kind)} in your ${label} phase, ${tail}` };
}

const daysSince = (from: string, today: string) => Math.round((new Date(today + "T12:00").getTime() - new Date(from + "T12:00").getTime()) / 86_400_000);

/** One gentle suggestion from the whole log, checked in priority order. */
export function suggestion(log: WorkoutLogEntry[], windowEntries: WorkoutLogEntry[], window: InsightWindow, today: string = localDateKey()): string {
  const past = log.filter(e => e.date <= today);
  if (!windowEntries.length) {
    return window === "week" ? "No sessions yet this week. Even a short walk or a 10-minute stretch counts." : "No sessions yet this month. A gentle start is still a start, try something short today.";
  }
  const first = past.reduce((min, e) => (e.date < min ? e.date : min), today);
  const lastLegs = past.filter(coversLegs).reduce<string | null>((max, e) => (!max || e.date > max ? e.date : max), null);
  if (daysSince(lastLegs ?? first, today) >= 10) return "It's been a while since a leg session. A squat or deadlift day would round out your week.";
  const lastWeek = past.filter(e => e.date > addDays(today, -7));
  const lastRecovery = past.filter(e => entryKind(e) === "recovery").reduce<string | null>((max, e) => (!max || e.date > max ? e.date : max), null);
  if (lastWeek.length >= 4 && (!lastRecovery || daysSince(lastRecovery, today) >= 7)) return "You've trained a lot this week. A rest day or an easy mobility session will help you come back stronger.";
  if (windowEntries.length >= 4) {
    const counts = KINDS.map(k => windowEntries.filter(e => entryKind(e) === k).length);
    const top = Math.max(...counts);
    if (top / windowEntries.length >= 0.8) {
      const kind = KINDS[counts.indexOf(top)];
      const other = kind === "strength" ? "a cardio or yoga session" : kind === "cardio" ? "a strength session" : "a strength or cardio session";
      return `Mostly ${kind} lately. Adding ${other} would give you a nice balance.`;
    }
  }
  return "Nice balance. Keep listening to your body and enjoy your training.";
}

/** Everything the Insights card shows for one window. */
export function workoutInsights(log: WorkoutLogEntry[], window: InsightWindow, phaseOn?: (date: string) => PhaseId | null, today: string = localDateKey()): Insights {
  const entries = entriesInWindow(log, window, today);
  const groupCounts = new Map<string, number>();
  for (const e of entries) {
    const g = muscleGroup(e.muscle);
    if (g) groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);
  }
  const groups = [...groupCounts].map(([group, count]) => ({ group, count })).sort((a, b) => b.count - a.count || a.group.localeCompare(b.group));
  const notYet = groupCounts.has("Full body") ? [] : STANDARD_GROUPS.filter(g => !groupCounts.has(g));
  const kinds: Record<WorkoutKind, number> = { strength: 0, cardio: 0, recovery: 0 };
  for (const e of entries) kinds[entryKind(e)]++;
  return {
    total: entries.length,
    groups,
    notYet,
    kinds,
    byPhase: phaseOn ? phaseLine(entries, phaseOn) : null,
    suggestion: suggestion(log, entries, window, today),
  };
}
