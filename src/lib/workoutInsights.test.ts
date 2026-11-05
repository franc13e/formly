import { describe, expect, it } from "vitest";
import type { PhaseId, WorkoutLogEntry } from "../types";
import { entriesInWindow, muscleGroup, phaseLine, suggestion, workoutInsights } from "./workoutInsights";

// 2026-11-05 is a Thursday; its week runs 2026-11-02 to 2026-11-08.
const TODAY = "2026-11-05";
let nextId = 1;
const e = (date: string, name: string, muscle: string): WorkoutLogEntry => ({
  workoutId: name, name, emoji: "🏋️", muscle, date, time: "08:00", sets: "", reps: "", weight: "", duration: "", notes: "", id: nextId++,
});

describe("muscleGroup", () => {
  it("folds free-typed values into the standard groups", () => {
    expect(muscleGroup("Legs")).toBe("Legs");
    expect(muscleGroup("quads")).toBe("Legs");
    expect(muscleGroup("Hamstrings")).toBe("Legs");
    expect(muscleGroup("Biceps")).toBe("Arms");
    expect(muscleGroup("abs")).toBe("Core");
    expect(muscleGroup("Full Body")).toBe("Full body");
    expect(muscleGroup("Lats")).toBe("Back");
    expect(muscleGroup("Glutes")).toBe("Glutes");
    expect(muscleGroup("  ")).toBeNull();
    expect(muscleGroup("neck")).toBe("Neck");
  });
});

describe("entriesInWindow", () => {
  const log = [e("2026-11-02", "A", "Legs"), e("2026-11-01", "B", "Legs"), e("2026-10-31", "C", "Legs"), e("2026-11-20", "D", "Legs")];
  it("uses the Monday-first calendar week", () => {
    expect(entriesInWindow(log, "week", TODAY).map(x => x.name)).toEqual(["A"]);
  });
  it("uses the calendar month", () => {
    expect(entriesInWindow(log, "month", TODAY).map(x => x.name)).toEqual(["A", "B", "D"]);
  });
});

describe("workoutInsights", () => {
  it("counts sessions, groups and kinds in the window", () => {
    const log = [
      e("2026-11-02", "Barbell Squat", "Legs"),
      e("2026-11-03", "Romanian Deadlift", "Legs"),
      e("2026-11-03", "Zone 2 Run", "Cardio"),
      e("2026-11-04", "Yoga Flow", "Recovery"),
      e("2026-10-20", "Pull Day", "Back"),
    ];
    const ins = workoutInsights(log, "week", undefined, TODAY);
    expect(ins.total).toBe(4);
    expect(ins.groups).toEqual([{ group: "Legs", count: 2 }, { group: "Cardio", count: 1 }, { group: "Recovery", count: 1 }]);
    expect(ins.notYet).toEqual(["Glutes", "Back", "Chest", "Shoulders", "Arms", "Core"]);
    expect(ins.kinds).toEqual({ strength: 2, cardio: 1, recovery: 1 });
    expect(ins.byPhase).toBeNull();
  });

  it("treats a full-body session as covering every group", () => {
    expect(workoutInsights([e(TODAY, "Circuit", "Full body")], "week", undefined, TODAY).notYet).toEqual([]);
  });

  it("adds a by-phase line when phaseOn is given", () => {
    const log = [e("2026-11-02", "Barbell Squat", "Legs"), e("2026-11-03", "Hip Thrust", "Glutes"), e("2026-11-04", "Yoga Flow", "Recovery")];
    const ins = workoutInsights(log, "week", () => "follicular", TODAY);
    expect(ins.byPhase).toMatchObject({ phase: "follicular", kind: "strength", count: 2 });
    expect(ins.byPhase?.text).toBe("2 strength sessions in your follicular phase, nice timing");
  });
});

describe("phaseLine", () => {
  it("skips dates without a known phase", () => {
    expect(phaseLine([e(TODAY, "Run", "Cardio")], () => null)).toBeNull();
  });
  it("uses singular wording and a gentle tail for less ideal timing", () => {
    const phaseOn = (): PhaseId => "luteal";
    expect(phaseLine([e(TODAY, "Run", "Cardio")], phaseOn)?.text).toBe("1 cardio session in your luteal phase, keep the effort steady and hydrate well");
  });
});

describe("suggestion", () => {
  const sugg = (log: WorkoutLogEntry[], window: "week" | "month" = "week") => suggestion(log, entriesInWindow(log, window, TODAY), window, TODAY);

  it("nudges when there are no sessions in the window", () => {
    expect(sugg([e("2026-10-01", "Barbell Squat", "Legs")])).toMatch(/No sessions yet this week/);
  });
  it("suggests legs after 10+ days without them", () => {
    const log = [e("2026-10-20", "Barbell Squat", "Legs"), e("2026-11-03", "Pull Day", "Back")];
    expect(sugg(log)).toMatch(/leg session/);
  });
  it("doesn't ask for legs from someone who just started", () => {
    expect(sugg([e("2026-11-03", "Pull Day", "Back")])).not.toMatch(/leg session/);
  });
  it("suggests rest after 4+ sessions in 7 days without recovery", () => {
    const log = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"].map(d => e(d, "Barbell Squat", "Legs"));
    expect(sugg(log)).toMatch(/rest day/);
  });
  it("suggests balance when one kind dominates", () => {
    const log = [
      e("2026-11-02", "Barbell Squat", "Legs"), e("2026-11-03", "Pull Day", "Back"), e("2026-11-04", "Hip Thrust", "Glutes"),
      e("2026-11-05", "Push-Up Progression", "Chest"), e("2026-10-30", "Yoga Flow", "Recovery"),
    ];
    expect(sugg(log)).toMatch(/Mostly strength/);
  });
  it("is encouraging when nothing needs changing", () => {
    const log = [e("2026-11-02", "Barbell Squat", "Legs"), e("2026-11-03", "Zone 2 Run", "Cardio"), e("2026-11-04", "Yoga Flow", "Recovery")];
    expect(sugg(log)).toMatch(/Nice balance/);
  });
});
