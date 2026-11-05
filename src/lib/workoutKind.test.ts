import { describe, expect, it } from "vitest";
import { ALL_WORKOUTS } from "../data/workouts";
import type { PhaseId } from "../types";
import { phaseFit, workoutFood, workoutKind, type WorkoutKind } from "./workoutKind";

const PHASE_IDS: (PhaseId | null)[] = ["menstrual", "follicular", "ovulation", "luteal", null];
const KINDS: WorkoutKind[] = ["strength", "cardio", "recovery"];

describe("workoutKind", () => {
  it("classifies every built-in workout", () => {
    // Library id → expected kind.
    const expected: Record<number, WorkoutKind> = {
      1: "strength", // Push-Up Progression
      2: "strength", // Barbell Squat
      3: "strength", // Glute Bridge Circuit
      4: "cardio", // HIIT Cardio Blast
      5: "strength", // Pull Day
      6: "recovery", // Yoga Flow
      7: "strength", // Shoulder Sculpt
      8: "strength", // Core Destroyer
      9: "cardio", // Zone 2 Run
      10: "strength", // Hip Thrust
      11: "strength", // Romanian Deadlift
      12: "recovery", // Pilates Core: low-intensity, controlled work
      13: "strength", // Bulgarian Split Squat
      14: "strength", // Cable Kickback
      15: "strength", // Sumo Squat
      16: "strength", // Step-Ups
      17: "strength", // Goblet Squat
      18: "strength", // Walking Lunges ("walking" alone would read as recovery)
      19: "strength", // Leg Press
      20: "strength", // Calf Raise
      21: "strength", // Lat Pulldown
      22: "strength", // Seated Cable Row
      23: "strength", // Dumbbell Row
      24: "strength", // Back Extension
      25: "strength", // Dumbbell Bench Press
      26: "strength", // Incline Dumbbell Press
      27: "strength", // Chest Fly
      28: "strength", // Dumbbell Floor Press
      29: "strength", // Lateral Raise
      30: "strength", // Arnold Press
      31: "strength", // Face Pull
      32: "strength", // Front Raise
      33: "strength", // Bicep Curl
      34: "strength", // Tricep Dip
      35: "strength", // Hammer Curl
      36: "strength", // Tricep Pushdown
      37: "strength", // Overhead Tricep Extension
      38: "strength", // Dead Bug
      39: "strength", // Russian Twist
      40: "strength", // Side Plank
      41: "strength", // Bird Dog
      42: "cardio", // Cycling Intervals
      43: "cardio", // Jump Rope
      44: "cardio", // Incline Walk ("walk" alone would read as recovery)
      45: "cardio", // Rowing Machine
      46: "recovery", // Mobility Flow
      47: "recovery", // Foam Rolling
      48: "recovery", // Gentle Walk
      49: "recovery", // Stretch & Breathe
    };
    expect(ALL_WORKOUTS.map(w => w.id).sort((a, b) => a - b)).toEqual(Object.keys(expected).map(Number));
    for (const w of ALL_WORKOUTS) expect([w.id, w.name, workoutKind(w)]).toEqual([w.id, w.name, expected[w.id]]);
  });

  it("keeps walking lunges strength and incline walks cardio", () => {
    expect(workoutKind({ name: "Dumbbell walking lunge" })).toBe("strength");
    expect(workoutKind({ name: "Incline treadmill walk" })).toBe("cardio");
    expect(workoutKind({ name: "Walk" })).toBe("recovery");
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
