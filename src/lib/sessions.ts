import type { Schedule, ScheduledWorkout, Workout, WorkoutSession } from "../types";
import { suggestWorkoutEmoji } from "./workouts";

// ─── Workout sessions: totals, adding to the schedule, grouping a day ───────

/** localStorage key for your own sessions. */
export const SESSIONS_KEY = "workout-sessions";

/** "35 min" → 35, "1 h 15 min" → 75, "1.5 hours" → 90; 0 when there's no number. */
export function durationMinutes(duration: string): number {
  const hours = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i.exec(duration);
  const mins = /(\d+)\s*(?:m|min|mins|minutes?)\b/i.exec(duration);
  if (hours || mins) return Math.round((hours ? parseFloat(hours[1]) * 60 : 0) + (mins ? parseInt(mins[1]) : 0));
  const bare = /\d+/.exec(duration);
  return bare ? parseInt(bare[0]) : 0;
}

/** 45 → "45 min", 90 → "1 h 30 min", 0 → "" */
export function formatMinutes(total: number): string {
  if (total <= 0) return "";
  const h = Math.floor(total / 60), m = total % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** The session's workouts in order, skipping ids that no longer exist (e.g. a deleted custom workout). */
export function sessionWorkouts(session: Pick<WorkoutSession, "workoutIds">, pool: Workout[]): Workout[] {
  const byId = new Map(pool.map(w => [w.id, w]));
  return session.workoutIds.flatMap(id => byId.get(id) ?? []);
}

/** In a session each exercise is a few sets, not its full standalone workout, so it counts for at most this long. */
export const SESSION_MINUTES_PER_EXERCISE = 12;

/** Exercise count and estimated minutes of a list of workouts done together as one session. */
export function sessionTotals(workouts: Workout[]): { count: number; minutes: number } {
  return { count: workouts.length, minutes: workouts.reduce((sum, w) => sum + Math.min(durationMinutes(w.duration) || SESSION_MINUTES_PER_EXERCISE, SESSION_MINUTES_PER_EXERCISE), 0) };
}

/** "Glutes · 25 min" */
export const workoutDetail = (w: Pick<Workout, "muscle" | "duration">) => [w.muscle, w.duration].filter(Boolean).join(" · ");

/** A workout as a schedule item, optionally tagged with its session. */
export function toScheduled(w: Workout, group?: string): ScheduledWorkout {
  const item: ScheduledWorkout = { name: w.name, emoji: w.emoji, detail: workoutDetail(w) };
  if (group) item.group = group;
  return item;
}

/** Appends items to a day; a "rest" day becomes a list. Returns `schedule` unchanged when there's nothing to add. */
export function addItemsToDay(schedule: Schedule, date: string, items: ScheduledWorkout[]): Schedule {
  if (!items.length) return schedule;
  const current = schedule[date];
  return { ...schedule, [date]: [...(Array.isArray(current) ? current : []), ...items] };
}

/** Adds every exercise of a session to a day, each grouped under the session's name. */
export function addSessionToSchedule(schedule: Schedule, date: string, session: WorkoutSession, pool: Workout[]): Schedule {
  return addItemsToDay(schedule, date, sessionWorkouts(session, pool).map(w => toScheduled(w, session.name)));
}

/** A block of a day's list: one session group, or a run of ungrouped items. `index` is the item's place in the day. */
export interface DayBlock {
  group?: string;
  entries: { item: ScheduledWorkout; index: number }[];
}

/**
 * Splits a day's items into blocks for display: items sharing a `group` are gathered under
 * the group's first appearance; ungrouped items fill plain blocks in order, joining the
 * latest plain block unless a new group started after it.
 */
export function groupDayItems(items: ScheduledWorkout[]): DayBlock[] {
  const blocks: DayBlock[] = [];
  items.forEach((item, index) => {
    const group = item.group?.trim() || undefined;
    if (group) {
      const existing = blocks.find(b => b.group === group);
      if (existing) existing.entries.push({ item, index });
      else blocks.push({ group, entries: [{ item, index }] });
      return;
    }
    const last = blocks[blocks.length - 1];
    if (last && !last.group) last.entries.push({ item, index });
    else blocks.push({ entries: [{ item, index }] });
  });
  return blocks;
}

/** Moves the element at `index` by `delta` places (e.g. -1 = up). Returns `list` unchanged when it can't move. */
export function moveBy<T>(list: T[], index: number, delta: number): T[] {
  const to = index + delta;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(index, 1);
  next.splice(to, 0, item);
  return next;
}

/** A short focus line from the exercises' muscle groups: "Glutes and Legs", "Back, Arms and Core". */
export function focusFrom(workouts: Workout[]): string {
  const muscles = [...new Set(workouts.map(w => w.muscle).filter(Boolean))].slice(0, 3);
  if (muscles.length <= 1) return muscles[0] ?? "";
  return `${muscles.slice(0, -1).join(", ")} and ${muscles[muscles.length - 1]}`;
}

const isSession = (v: unknown): v is WorkoutSession =>
  typeof v === "object" && v !== null
  && typeof (v as WorkoutSession).id === "string" && typeof (v as WorkoutSession).name === "string"
  && Array.isArray((v as WorkoutSession).workoutIds) && (v as WorkoutSession).workoutIds.every(id => typeof id === "number");

/** Keeps only well-formed sessions from stored data (fills a missing emoji / focus). */
export function sanitizeSessions(raw: unknown): WorkoutSession[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSession).map(s => ({ ...s, emoji: typeof s.emoji === "string" && s.emoji ? s.emoji : "🏋️", focus: typeof s.focus === "string" ? s.focus : "" }));
}

// ─── Browse filters ───────────────────────────────────────────────────────────

/** Muscle-group chips in Browse and the session builder ("All" first). */
export const MUSCLE_FILTERS = ["All", "Glutes", "Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Cardio", "Recovery"] as const;

/** Workouts in a muscle group ("All" keeps everything) whose name, muscle or tags contain `query`. */
export function filterWorkouts(list: Workout[], muscle: string, query = ""): Workout[] {
  const q = query.trim().toLowerCase();
  return list.filter(w =>
    (muscle === "All" || w.muscle === muscle)
    && (!q || `${w.name} ${w.muscle} ${w.tags.join(" ")}`.toLowerCase().includes(q)));
}

/** A muscle-chip value ("All", "Yours", or a group) to use as the default group for a new exercise. */
export function defaultMuscleFor(chip: string): string {
  return chip === "All" || chip === "Yours" ? "Full body" : chip;
}

/** A library entry with the same name (ignoring case and spacing), so typing "squat" doesn't make a duplicate "Squat". */
export function findByName(pool: Workout[], name: string): Workout | undefined {
  const key = name.trim().replace(/\s+/g, " ").toLowerCase();
  return key ? pool.find(w => w.name.trim().replace(/\s+/g, " ").toLowerCase() === key) : undefined;
}

/** A custom exercise made straight from the session builder: just a name and a muscle group. */
export function quickExercise(name: string, muscle: string, id: number): Workout {
  const tidy = name.trim().replace(/\s+/g, " ");
  const clean = tidy.charAt(0).toUpperCase() + tidy.slice(1);
  return { id, name: clean, emoji: suggestWorkoutEmoji(clean, muscle), muscle, difficulty: "Beginner", duration: "", tags: [muscle.toLowerCase()], achieve: "" };
}
