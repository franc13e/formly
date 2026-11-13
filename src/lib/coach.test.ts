import { describe, expect, it } from "vitest";
import { ALL_WORKOUTS } from "../data/workouts";
import { checkInAdvice, coachContext, planFromAi, planRequest, planWeek, sessionDays, weekRecap, type PlanOptions } from "./coach";
import { workoutKind } from "./workoutKind";
import { muscleGroup } from "./workoutInsights";
import { addDays } from "./workouts";
import type { PhaseContext } from "./phaseSuggest";
import type { WorkoutLogEntry } from "../types";

const entry = (id: number, date: string, name: string, muscle = ""): WorkoutLogEntry => ({
  workoutId: name, name, emoji: "x", muscle, date, time: "08:00", sets: "", reps: "", weight: "", duration: "", notes: "", id,
});
const follicular: PhaseContext = { phase: { id: "follicular" }, dayOfCycle: 9, cycleLength: 28 };
const menstrual: PhaseContext = { phase: { id: "menstrual" }, dayOfCycle: 2, cycleLength: 28 };
const TODAY = "2026-11-14";

describe("checkInAdvice", () => {
  const planned = [{ name: "Barbell Squat", emoji: "x", detail: "Legs · 30 min" }];

  it("suggests gentler swaps on a drained day with a hard plan", () => {
    const a = checkInAdvice({ energy: "low", feelings: ["Cramps"] }, menstrual, planned, ALL_WORKOUTS, [], TODAY);
    expect(a.tone).toBe("gentle");
    expect(a.text).toContain("Barbell Squat");
    expect(a.swaps.length).toBe(2);
    expect(a.swaps.every(w => workoutKind(w) === "recovery")).toBe(true);
  });

  it("encourages progress on a great day and offers a pick when nothing is planned", () => {
    expect(checkInAdvice({ energy: "high", feelings: [] }, follicular, planned, ALL_WORKOUTS, [], TODAY).text).toContain("Barbell Squat");
    const free = checkInAdvice({ energy: "high", feelings: [] }, follicular, [], ALL_WORKOUTS, [], TODAY);
    expect(free.tone).toBe("go");
    expect(free.suggest).not.toBeNull();
  });

  it("adds a caution near the period and tips for how you feel", () => {
    const a = checkInAdvice({ energy: "high", feelings: ["Bloated"] }, menstrual, planned, ALL_WORKOUTS, [], TODAY);
    expect(a.text).toContain("listen to your body");
    expect(a.text).toContain("bloating");
  });
});

describe("planWeek", () => {
  const opts = (over: Partial<PlanOptions> = {}): PlanOptions => ({
    start: TODAY, sessions: 3, ctxOn: () => follicular, library: ALL_WORKOUTS, log: [], energy: null, ...over,
  });

  it("spreads sessions across the week", () => {
    expect(sessionDays(3)).toEqual([0, 2, 5]);
    expect(sessionDays(4)).toEqual([0, 2, 4, 5]);
    expect(sessionDays(7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    const plan = planWeek(opts());
    expect(plan.map(d => d.date)).toEqual(Array.from({ length: 7 }, (_, i) => addDays(TODAY, i)));
    expect(plan.filter(d => d.workouts.length).length).toBe(3);
  });

  it("doesn't train the same muscle group within two days", () => {
    const plan = planWeek(opts({ sessions: 7 }));
    const seen = new Map<string, string>();
    for (const day of plan) for (const w of day.workouts) {
      const g = muscleGroup(w.muscle) ?? w.muscle;
      const prev = seen.get(g);
      if (prev) expect(addDays(prev, 2) <= day.date).toBe(true);
      seen.set(g, day.date);
    }
  });

  it("doesn't repeat an exercise in the same week", () => {
    const ids = planWeek(opts({ sessions: 5 })).flatMap(d => d.workouts.map(w => w.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("starts gently after a drained check-in and rests groups trained yesterday", () => {
    const log = [entry(1, addDays(TODAY, -1), "Barbell Squat", "Legs")];
    const plan = planWeek(opts({ energy: "low", log }));
    expect(plan[0].workouts.every(w => workoutKind(w) === "recovery")).toBe(true);
    expect(plan[0].workouts.some(w => muscleGroup(w.muscle) === "Legs")).toBe(false);
  });

  it("maps the AI's ids back to workouts and keeps rest days", () => {
    const o = opts();
    const [a, b] = ALL_WORKOUTS;
    const plan = planFromAi({ summary: "", days: [{ date: TODAY, ids: [a.id, 9999, b.id], note: "Go" }] }, o);
    expect(plan[0].workouts.map(w => w.id)).toEqual([a.id, b.id]);
    expect(plan[1].workouts).toEqual([]);
    expect(plan[1].note).toBe("Rest day.");
  });

  it("builds a request with phases and every library workout", () => {
    const req = planRequest(opts({ ctxOn: d => (d === TODAY ? { phase: { id: "luteal" }, dayOfCycle: 26, cycleLength: 28 } : null) }), "ctx");
    expect(req.days[0].phase).toBe("late luteal");
    expect(req.days[1].phase).toBeNull();
    expect(req.candidates.length).toBe(ALL_WORKOUTS.length);
  });
});

describe("weekRecap and coachContext", () => {
  const log = [entry(1, "2026-11-13", "Barbell Squat", "Legs"), entry(2, "2026-11-10", "Hip Thrust", "Glutes"), entry(3, "2026-11-04", "Yoga Flow")];

  it("compares this week with last week", () => {
    const r = weekRecap(log, TODAY);
    expect(r.thisWeek).toBe(2);
    expect(r.lastWeek).toBe(1);
    expect(r.line).toBe("2 workouts this week, more than last week. You've trained Legs and Glutes.");
    expect(weekRecap([], TODAY).line).toContain("No workouts yet");
  });

  it("describes recent training for the AI", () => {
    const c = coachContext(log, TODAY, { energy: "low", feelings: ["Cramps"] }, menstrual);
    expect(c).toContain("menstrual phase");
    expect(c).toContain("Energy today: Drained (cramps)");
    expect(c).toContain("Trained this past week: ");
    expect(c).toContain("Not trained this past week:");
  });
});
