import { describe, expect, it } from "vitest";
import { ALL_WORKOUTS } from "../data/workouts";
import type { PhaseId } from "../types";
import { phaseFit, workoutFood, workoutKind, type WorkoutKind } from "./workoutKind";

const PHASE_IDS: (PhaseId | null)[] = ["menstrual", "follicular", "ovulation", "luteal", null];
const KINDS: WorkoutKind[] = ["strength", "cardio", "recovery"];

describe("workoutKind", () => {
  it("classifies every built-in workout", () => {
    const expected: Record<string, WorkoutKind> = {
      "Push-Up Progression": "strength",
      "Barbell Squat": "strength",
      "Glute Bridge Circuit": "strength",
      "HIIT Cardio Blast": "cardio",
      "Pull Day": "strength",
      "Yoga Flow": "recovery",
      "Shoulder Sculpt": "strength",
      "Core Destroyer": "strength",
      "Zone 2 Run": "cardio",
      "Hip Thrust": "strength",
      "Romanian Deadlift": "strength",
      // Low-intensity, controlled work: treated as recovery.
      "Pilates Core": "recovery",
    };
    expect(ALL_WORKOUTS).toHaveLength(12);
    for (const w of ALL_WORKOUTS) expect([w.name, workoutKind(w)]).toEqual([w.name, expected[w.name]]);
  });

  it("classifies custom and scheduled workouts", () => {
    expect(workoutKind({ name: "Morning jog", muscle: "Full body" })).toBe("cardio");
    expect(workoutKind({ name: "Spin class" })).toBe("cardio");
    expect(workoutKind({ name: "Swimming laps" })).toBe("cardio");
    expect(workoutKind({ name: "Cycling" })).toBe("cardio");
    expect(workoutKind({ name: "Evening walk" })).toBe("recovery");
    expect(workoutKind({ name: "Hip mobility" })).toBe("recovery");
    expect(workoutKind({ name: "Full body stretch" })).toBe("recovery");
    expect(workoutKind({ name: "Leg day", muscle: "Legs" })).toBe("strength");
    expect(workoutKind({ name: "Barbell row", muscle: "Back" })).toBe("strength");
    expect(workoutKind({ name: "Crunches", muscle: "Core" })).toBe("strength");
  });

  it("falls back to the muscle group, then the tags", () => {
    expect(workoutKind({ name: "Saturday session", muscle: "Cardio" })).toBe("cardio");
    expect(workoutKind({ name: "Sunday session", muscle: "Recovery" })).toBe("recovery");
    expect(workoutKind({ name: "Class", tags: ["cardio"] })).toBe("cardio");
    expect(workoutKind({ name: "Class", tags: ["mobility"] })).toBe("recovery");
    expect(workoutKind({ name: "Something new" })).toBe("strength");
  });
});

describe("phaseFit / workoutFood", () => {
  it("returns text and foods for every kind and phase, including no phase", () => {
    for (const kind of KINDS) for (const phase of PHASE_IDS) {
      expect(phaseFit(kind, phase).length).toBeGreaterThan(20);
      const { before, after } = workoutFood(kind, phase);
      for (const tip of [before, after]) {
        expect(tip.when).not.toBe("");
        expect(tip.why).not.toBe("");
        expect(tip.foods.length).toBeGreaterThanOrEqual(3);
        expect(tip.foods.length).toBeLessThanOrEqual(4);
        for (const f of tip.foods) expect(f.trim()).not.toBe("");
      }
    }
  });

  it("gives different lines for different phases", () => {
    for (const kind of KINDS) expect(new Set(PHASE_IDS.map(p => phaseFit(kind, p))).size).toBe(5);
  });

  it("adjusts food to the phase", () => {
    expect(workoutFood("strength", "menstrual").after.why).toMatch(/iron/i);
    expect(workoutFood("cardio", "luteal").after.why).toMatch(/hydrate/i);
    expect(phaseFit("strength", "follicular")).toMatch(/oestrogen/i);
  });
});
