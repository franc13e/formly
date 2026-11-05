import { describe, expect, it } from "vitest";
import { ALL_WORKOUTS } from "../data/workouts";
import type { Difficulty, PhaseId, Workout } from "../types";
import { effortOf, phaseStripTitle, suggestForPhase } from "./phaseSuggest";

let nextId = 1;
const w = (name: string, muscle: string, difficulty: Difficulty, tags: string[] = []): Workout =>
  ({ id: nextId++, name, emoji: "🏋️", muscle, difficulty, duration: "30 min", tags, achieve: "" });

const LIB: Workout[] = [
  w("Heavy Deadlift", "Back", "Advanced"),
  w("Goblet Squat", "Legs", "Beginner"),
  w("Barbell Squat", "Legs", "Intermediate"),
  w("Hip Thrust", "Glutes", "Intermediate"),
  w("Glute Bridge", "Glutes", "Beginner"),
  w("HIIT Blast", "Cardio", "Intermediate", ["cardio"]),
  w("Sprint Intervals", "Cardio", "Advanced"),
  w("Zone 2 Run", "Cardio", "Beginner"),
  w("Easy Walk", "Cardio", "Beginner"),
  w("Yoga Flow", "Recovery", "Beginner"),
  w("Pilates Core", "Core", "Beginner"),
  w("Mobility Stretch", "Recovery", "Beginner"),
  w("Push-Up", "Chest", "Beginner"),
  w("Shoulder Press", "Shoulders", "Intermediate"),
];
const names = (phase: PhaseId, extra: { dayOfCycle?: number; cycleLength?: number } = {}, count = 5) =>
  suggestForPhase(LIB, { phase: { id: phase }, ...extra }, count).map(s => s.workout.name);

describe("effortOf", () => {
  it("splits HIIT / intervals from steady cardio", () => {
    expect(effortOf(LIB[5])).toBe("hiit");
    expect(effortOf(LIB[6])).toBe("hiit");
    expect(effortOf(LIB[7])).toBe("steady");
    expect(effortOf(LIB[9])).toBe("recovery");
    expect(effortOf(LIB[0])).toBe("strength");
  });
});

describe("suggestForPhase", () => {
  it("leads with recovery in the menstrual phase and keeps hard intervals out", () => {
    const picks = names("menstrual");
    const first = LIB.find(x => x.name === picks[0]);
    expect(first && effortOf(first)).toBe("recovery");
    expect(picks).toContain("Pilates Core");
    expect(picks).not.toContain("Sprint Intervals");
    expect(picks).not.toContain("HIIT Blast");
    expect(picks).not.toContain("Heavy Deadlift");
  });

  it("favours progressing strength and intervals in the follicular phase", () => {
    const picks = names("follicular");
    expect(picks).toContain("HIIT Blast");
    expect(picks).toContain("Barbell Squat");
    expect(picks).not.toContain("Yoga Flow");
  });

  it("goes high intensity around ovulation", () => {
    const picks = names("ovulation");
    expect(picks.slice(0, 2)).toEqual(expect.arrayContaining(["Heavy Deadlift", "HIIT Blast"]));
    expect(picks).not.toContain("Mobility Stretch");
  });

  it("is moderate in early luteal and winds down late in the phase", () => {
    const early = names("luteal", { dayOfCycle: 18, cycleLength: 28 });
    expect(early).not.toContain("Sprint Intervals");
    expect(early).not.toContain("Heavy Deadlift");
    const late = names("luteal", { dayOfCycle: 26, cycleLength: 28 });
    expect(late[0]).toBe("Pilates Core");
    expect(late).toContain("Yoga Flow");
    expect(late).not.toContain("HIIT Blast");
  });

  it("varies muscle groups instead of stacking one", () => {
    const muscles = suggestForPhase(LIB, { phase: { id: "follicular" } }, 5).map(s => s.workout.muscle);
    expect(new Set(muscles).size).toBeGreaterThanOrEqual(4);
  });

  it("gives a short reason for each pick and respects the count", () => {
    const picks = suggestForPhase(LIB, { phase: { id: "menstrual" } }, 6);
    expect(picks).toHaveLength(6);
    for (const p of picks) expect(p.reason.length).toBeGreaterThan(0);
    expect(suggestForPhase(LIB.slice(0, 2), { phase: { id: "luteal" } }, 5)).toHaveLength(2);
    expect(suggestForPhase([], { phase: { id: "luteal" } })).toEqual([]);
  });

  it("works on the real library: unique picks for every phase", () => {
    for (const id of ["menstrual", "follicular", "ovulation", "luteal"] as PhaseId[]) {
      const picks = suggestForPhase(ALL_WORKOUTS, { phase: { id } }, 5);
      expect(picks).toHaveLength(Math.min(5, ALL_WORKOUTS.length));
      expect(new Set(picks.map(p => p.workout.id)).size).toBe(picks.length);
    }
  });
});

describe("phaseStripTitle", () => {
  it("names the phase, calling out late luteal", () => {
    expect(phaseStripTitle({ phase: { id: "follicular" } })).toBe("Suits your follicular phase");
    expect(phaseStripTitle({ phase: { id: "luteal" }, dayOfCycle: 26, cycleLength: 28 })).toBe("Suits your late luteal phase");
    expect(phaseStripTitle({ phase: { id: "luteal" }, dayOfCycle: 18, cycleLength: 28 })).toBe("Suits your luteal phase");
  });
});
