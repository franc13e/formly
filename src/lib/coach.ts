import type { ScheduledWorkout, Workout, WorkoutLogEntry } from "../types";
import { addDays, weekOf } from "./workouts";
import { suggestForPhase, type PhaseContext } from "./phaseSuggest";
import { lastTrained, RECOVERY_DAYS, trainNext } from "./bodyInsights";
import { entryGroup, muscleGroup } from "./workoutInsights";
import { workoutKind, type WorkoutKind } from "./workoutKind";

// ─── The Coach tab: daily check-in, "Plan my week" and the weekly recap ──────

export type Energy = "low" | "okay" | "high";
export const ENERGY: { id: Energy; label: string }[] = [
  { id: "low", label: "Drained" },
  { id: "okay", label: "Okay" },
  { id: "high", label: "Great" },
];
export const FEELINGS = ["Cramps", "Sore", "Tired", "Stressed", "Bloated"] as const;

export interface CheckIn { energy: Energy; feelings: string[] }

export interface Advice {
  tone: "gentle" | "steady" | "go";
  title: string;
  text: string;
  /** Gentler options to swap today's plan for (gentle days). */
  swaps: Workout[];
  /** Something to add when nothing is planned. */
  suggest: Workout | null;
}

const kindOf = (w: Pick<Workout, "name" | "muscle" | "tags">): WorkoutKind => workoutKind(w);
const groupOf = (w: Workout) => muscleGroup(w.muscle) ?? (kindOf(w) === "cardio" ? "Cardio" : kindOf(w) === "recovery" ? "Recovery" : w.muscle);
const isLatePhase = (ctx: PhaseContext | null) =>
  !!ctx && (ctx.phase.id === "menstrual" || (ctx.phase.id === "luteal" && !!ctx.dayOfCycle && !!ctx.cycleLength && ctx.cycleLength - ctx.dayOfCycle < 5));

function gentleOptions(library: Workout[], ctx: PhaseContext | null, count: number): Workout[] {
  const recovery = library.filter(w => kindOf(w) === "recovery");
  return suggestForPhase(recovery, ctx ?? { phase: { id: "menstrual" } }, count).map(s => s.workout);
}

/** What the coach says after today's check-in, and what it offers to change. */
export function checkInAdvice(c: CheckIn, ctx: PhaseContext | null, planned: ScheduledWorkout[], library: Workout[], log: WorkoutLogEntry[], today: string): Advice {
  const has = (f: string) => c.feelings.includes(f);
  const extras: string[] = [];
  if (has("Sore")) extras.push("Give sore muscles a break and train something else, or stretch them out.");
  if (has("Bloated")) extras.push("A walk or steady cardio can ease bloating.");
  if (has("Stressed")) extras.push("Yoga or a walk outside can take the edge off.");
  const plannedHard = planned.filter(p => workoutKind({ name: p.name, muscle: p.detail ?? "" }) !== "recovery");
  const next = trainNext(log, library, ctx, today, 1)[0]?.workout ?? null;

  if (c.energy === "low" || ((has("Cramps") || has("Tired")) && c.energy !== "high")) {
    const why = has("Cramps") ? "Gentle movement can ease cramps, and rest counts too." : "Low-energy days happen, especially around your period.";
    return {
      tone: "gentle",
      title: "Go gentle today",
      text: [plannedHard.length ? `You had ${plannedHard.map(p => p.name).join(" and ")} planned. Swapping for something gentler is still a win.` : why,
        plannedHard.length ? why : "", ...extras].filter(Boolean).join(" "),
      swaps: gentleOptions(library, ctx, 2),
      suggest: plannedHard.length ? null : gentleOptions(library, ctx, 1)[0] ?? null,
    };
  }
  if (c.energy === "high") {
    const careful = isLatePhase(ctx) ? " Your energy is great, but listen to your body this close to your period." : "";
    return {
      tone: "go",
      title: "Make the most of it",
      text: (planned.length
        ? `Go for it: add a set or a little more weight to ${planned[0].name}.`
        : `Nothing planned yet. ${next ? `${next.name} would be a great one today.` : "A harder session would suit today."}`) + careful + (extras.length ? " " + extras.join(" ") : ""),
      swaps: [],
      suggest: planned.length ? null : next,
    };
  }
  return {
    tone: "steady",
    title: planned.length ? "Stick with the plan" : "A steady day",
    text: (planned.length
      ? `${planned.length} planned today. Warm up well and go at your own pace.`
      : `Nothing planned yet. ${next ? `${next.name} fits nicely, or take a walk.` : "A short session or a walk would fit nicely."}`) + (extras.length ? " " + extras.join(" ") : ""),
    swaps: [],
    suggest: planned.length ? null : next,
  };
}

// ── Plan my week ──

export interface PlanDay {
  date: string;
  ctx: PhaseContext | null;
  workouts: Workout[];
  note: string;
}

/** Which of `len` days to train on, spread out: 3 → days 0, 2, 5. */
export function sessionDays(n: number, len = 7): number[] {
  const count = Math.max(1, Math.min(len, Math.round(n)));
  return [...new Set(Array.from({ length: count }, (_, i) => Math.round((i * len) / count)))];
}

export interface PlanOptions {
  start: string;
  sessions: number;
  ctxOn: (date: string) => PhaseContext | null;
  library: Workout[];
  log: WorkoutLogEntry[];
  energy: Energy | null;
}

/** A sensible week without AI: phase-fit picks, rested muscle groups first, a gentle start on a drained day. */
export function planWeek(o: PlanOptions): PlanDay[] {
  const days = sessionDays(o.sessions);
  const trained = lastTrained(o.log, o.start);
  const usedOn = new Map<string, string>(trained);
  const usedIds = new Set<number>();
  const recentlyUsed = (group: string, date: string) => {
    // Trained within the last RECOVERY_DAYS (or already today) → let it rest.
    const d = usedOn.get(group);
    return !!d && addDays(d, RECOVERY_DAYS) > date;
  };
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(o.start, i);
    const ctx = o.ctxOn(date);
    if (!days.includes(i)) return { date, ctx, workouts: [], note: "Rest day. A walk or a stretch if you feel like it." };
    const gentle = i === 0 && o.energy === "low";
    // Fresh exercises and rested muscle groups first.
    let pool = o.library.filter(w => !usedIds.has(w.id) && !recentlyUsed(groupOf(w), date));
    if (gentle) pool = pool.filter(w => kindOf(w) === "recovery");
    if (!pool.length) pool = o.library;
    const ranked = ctx ? suggestForPhase(pool, ctx, 8) : pool.map(w => ({ workout: w, reason: "A balanced session" }));
    // Never-trained groups first, then the phase ranking.
    ranked.sort((a, b) => Number(trained.has(groupOf(a.workout))) - Number(trained.has(groupOf(b.workout))));
    const first = ranked[0];
    const second = ranked.find(r => groupOf(r.workout) !== groupOf(first.workout) && kindOf(r.workout) !== "cardio");
    const workouts = [first.workout, ...(second && !gentle ? [second.workout] : [])];
    workouts.forEach(w => { usedOn.set(groupOf(w), date); usedIds.add(w.id); });
    return { date, ctx, workouts, note: gentle ? "You felt drained today, so it starts gently." : first.reason + "." };
  });
}

/** What /api/plan-week needs: the days with their phase, and the library as candidates. */
export function planRequest(o: PlanOptions, context: string) {
  const weekday = (d: string) => new Date(d + "T12:00").toLocaleDateString("en-US", { weekday: "short" });
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(o.start, i);
    const ctx = o.ctxOn(date);
    const late = isLatePhase(ctx) && ctx?.phase.id === "luteal";
    return { date, weekday: weekday(date), phase: ctx ? (late ? "late luteal" : ctx.phase.id) : null };
  });
  const candidates = o.library.map(w => ({ id: w.id, name: w.name.slice(0, 60), muscle: w.muscle.slice(0, 40), kind: kindOf(w) }));
  return { days, candidates, sessions: Math.max(1, Math.min(7, Math.round(o.sessions))), context: context.slice(0, 500) || undefined };
}

export interface AiPlan { summary: string; days: { date: string; ids: number[]; note: string }[] }

/** Turns the AI's ids back into workouts (unknown ids are dropped). */
export function planFromAi(ai: AiPlan, o: PlanOptions): PlanDay[] {
  const byId = new Map(o.library.map(w => [w.id, w]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(o.start, i);
    const day = ai.days.find(d => d.date === date);
    const workouts = (day?.ids ?? []).map(id => byId.get(id)).filter((w): w is Workout => !!w).slice(0, 2);
    return { date, ctx: o.ctxOn(date), workouts, note: day?.note || (workouts.length ? "" : "Rest day.") };
  });
}

/** A short line for the AI about recent training and today's check-in. */
export function coachContext(log: WorkoutLogEntry[], today: string, checkIn: CheckIn | null, ctx: PhaseContext | null): string {
  const parts: string[] = [];
  if (ctx) parts.push(`Today: ${ctx.phase.id} phase${ctx.dayOfCycle ? `, cycle day ${ctx.dayOfCycle}` : ""}.`);
  if (checkIn) parts.push(`Energy today: ${ENERGY.find(e => e.id === checkIn.energy)?.label}${checkIn.feelings.length ? ` (${checkIn.feelings.join(", ").toLowerCase()})` : ""}.`);
  const last = lastTrained(log, today);
  const recent = [...last].filter(([, d]) => d >= addDays(today, -6)).map(([g]) => g);
  if (recent.length) parts.push(`Trained this past week: ${recent.join(", ")}.`);
  const rested = ["Legs", "Glutes", "Back", "Chest", "Shoulders", "Arms", "Core"].filter(g => !recent.includes(g));
  if (rested.length) parts.push(`Not trained this past week: ${rested.join(", ")}.`);
  return parts.join(" ");
}

// ── Weekly recap ──

export interface Recap { thisWeek: number; lastWeek: number; groups: string[]; line: string }

export function weekRecap(log: WorkoutLogEntry[], today: string): Recap {
  const week = weekOf(today);
  const prev = weekOf(addDays(week[0], -1));
  const inRange = (from: string, to: string) => log.filter(e => e.date >= from && e.date <= to);
  const now = inRange(week[0], today);
  const before = inRange(prev[0], prev[6]);
  const groups = [...new Set(now.map(e => entryGroup(e)).filter((g): g is string => !!g))];
  let line: string;
  if (!now.length) line = before.length ? `No workouts yet this week. You did ${before.length} last week, so you know you can.` : "No workouts yet this week. One short session is a great start.";
  else {
    const vs = now.length > before.length ? ", more than last week" : now.length === before.length && before.length ? ", same as last week" : "";
    line = `${now.length} workout${now.length === 1 ? "" : "s"} this week${vs}.` + (groups.length ? ` You've trained ${listJoin(groups)}.` : "");
  }
  return { thisWeek: now.length, lastWeek: before.length, groups, line };
}

const listJoin = (xs: string[]) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
