import type { Schedule, WorkoutLogEntry } from "../types";
import { localDateKey } from "./date";

// ─── Pure helpers for the Workouts tab ────────────────────────────────────────

/** Shifts a YYYY-MM-DD key by `n` days (noon-anchored so DST changes can't skip a day). */
export function addDays(date: string, n: number): string {
  const d = new Date(date + "T12:00");
  d.setDate(d.getDate() + n);
  return localDateKey(d);
}

/** The seven YYYY-MM-DD keys (Mon to Sun) of the week containing `date`. */
export function weekOf(date: string): string[] {
  const dow = (new Date(date + "T12:00").getDay() + 6) % 7; // 0 = Monday
  return Array.from({ length: 7 }, (_, i) => addDays(date, i - dow));
}

/**
 * Moves the workout at `index` on day `from` to the end of day `to`.
 * A "rest" target becomes a list; an emptied source day is removed.
 * Returns `schedule` unchanged when the move is a no-op or the item doesn't exist.
 */
export function moveInSchedule(schedule: Schedule, from: string, index: number, to: string): Schedule {
  const source = schedule[from];
  if (from === to || !Array.isArray(source) || index < 0 || index >= source.length) return schedule;
  const target = schedule[to];
  const rest = source.filter((_, i) => i !== index);
  const next: Schedule = { ...schedule, [to]: [...(Array.isArray(target) ? target : []), source[index]] };
  if (rest.length) next[from] = rest;
  else delete next[from];
  return next;
}

/** Number of weeks in a row (Mon to Sun) with at least one log, ending this week (or last week, if this week has none yet). */
export function weekStreak(dates: Iterable<string>, today: string = localDateKey()): number {
  const weeks = new Set([...dates].filter(d => d <= today).map(d => weekOf(d)[0]));
  const thisWeek = weekOf(today)[0];
  let week = weeks.has(thisWeek) ? thisWeek : addDays(thisWeek, -7);
  let streak = 0;
  while (weeks.has(week)) {
    streak++;
    week = addDays(week, -7);
  }
  return streak;
}

/** Workouts logged and distinct active days within the month of `today`. */
export function monthStats(log: WorkoutLogEntry[], today: string = localDateKey()): { workouts: number; activeDays: number } {
  const prefix = today.slice(0, 7);
  const inMonth = log.filter(e => e.date.startsWith(prefix));
  return { workouts: inMonth.length, activeDays: new Set(inMonth.map(e => e.date)).size };
}

/** Log entries grouped by YYYY-MM-DD, keeping their original order within a day. */
export function groupLogByDate(log: WorkoutLogEntry[]): Record<string, WorkoutLogEntry[]> {
  return log.reduce<Record<string, WorkoutLogEntry[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});
}

const NAME_HINTS: [RegExp, string][] = [
  [/\b(run|jog|sprint|treadmill)/, "🏃"],
  [/\b(yoga|stretch|mobility|pilates|flexib)/, "🧘"],
  [/\b(cycl|bike|biking|spin)/, "🚴"],
  [/\bswim/, "🏊"],
  [/\b(box|kickbox|punch|martial)/, "🥊"],
  [/\b(hike|hiking|climb|trail)/, "⛰️"],
  [/\b(dance|gymnast|cartwheel|acro)/, "🤸"],
  [/\bwalk/, "🚶"],
  [/\b(hiit|tabata|interval|burpee)/, "🔥"],
  [/\b(glute|booty|hip thrust|bridge)/, "🍑"],
  [/\b(leg|squat|lunge|quad|hamstring|calf|calves)/, "🦵"],
  [/\b(core|abs?\b|plank|crunch)/, "⚡"],
  [/\b(arm|bicep|tricep|chest|push|bench)/, "💪"],
  [/\b(shoulder|delt)/, "🎯"],
  [/\b(cardio|heart)/, "❤️"],
];

const MUSCLE_HINTS: Record<string, string> = {
  Legs: "🦵", Glutes: "🍑", Core: "⚡", Arms: "💪", Chest: "💪", Shoulders: "🎯", Cardio: "❤️", Recovery: "🧘",
};

/** Best-guess icon emoji for a workout from its name keywords, then its muscle group; defaults to 🏋️. */
export function suggestWorkoutEmoji(name: string, muscle: string): string {
  const n = name.toLowerCase();
  return NAME_HINTS.find(([re]) => re.test(n))?.[1] ?? MUSCLE_HINTS[muscle] ?? "🏋️";
}
