import { describe, expect, it } from "vitest";
import type { Schedule, WorkoutLogEntry } from "../types";
import { addDays, groupLogByDate, logStreak, monthStats, moveInSchedule, suggestWorkoutEmoji, weekOf } from "./workouts";

const run = { name: "Run", emoji: "🏃" };
const squat = { name: "Squat", emoji: "🦵", detail: "Legs · 30 min" };
const yoga = { name: "Yoga", emoji: "🧘" };

const entry = (date: string, id: number): WorkoutLogEntry => ({
  workoutId: id, name: `W${id}`, emoji: "🏋️", muscle: "", date, time: "08:00", sets: "", reps: "", weight: "", duration: "", notes: "", id,
});

describe("addDays / weekOf", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
  it("returns the Monday-first week containing a date", () => {
    // 2026-11-05 is a Thursday
    expect(weekOf("2026-11-05")).toEqual(["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]);
    expect(weekOf("2026-11-08")[0]).toBe("2026-11-02"); // Sunday belongs to the previous Monday
  });
});

describe("moveInSchedule", () => {
  it("removes from the source and appends to the target", () => {
    const s: Schedule = { "2026-11-02": [run, squat], "2026-11-04": [yoga] };
    expect(moveInSchedule(s, "2026-11-02", 0, "2026-11-04")).toEqual({ "2026-11-02": [squat], "2026-11-04": [yoga, run] });
  });
  it("turns a rest target into a list", () => {
    const s: Schedule = { "2026-11-02": [run], "2026-11-03": "rest" };
    expect(moveInSchedule(s, "2026-11-02", 0, "2026-11-03")).toEqual({ "2026-11-03": [run] });
  });
  it("creates an empty target day and drops an emptied source day", () => {
    const s: Schedule = { "2026-11-02": [squat] };
    const next = moveInSchedule(s, "2026-11-02", 0, "2026-12-25");
    expect(next).toEqual({ "2026-12-25": [squat] });
    expect("2026-11-02" in next).toBe(false);
  });
  it("does not mutate the input", () => {
    const s: Schedule = { "2026-11-02": [run, squat] };
    moveInSchedule(s, "2026-11-02", 1, "2026-11-03");
    expect(s).toEqual({ "2026-11-02": [run, squat] });
  });
  it("is a no-op for the same day, a bad index or a non-list source", () => {
    const s: Schedule = { "2026-11-02": [run], "2026-11-03": "rest" };
    expect(moveInSchedule(s, "2026-11-02", 0, "2026-11-02")).toBe(s);
    expect(moveInSchedule(s, "2026-11-02", 3, "2026-11-04")).toBe(s);
    expect(moveInSchedule(s, "2026-11-03", 0, "2026-11-04")).toBe(s);
    expect(moveInSchedule(s, "2026-11-09", 0, "2026-11-04")).toBe(s);
  });
});

describe("logStreak", () => {
  const today = "2026-11-05";
  it("counts consecutive days ending today", () => {
    expect(logStreak(["2026-11-05", "2026-11-04", "2026-11-03", "2026-11-01"], today)).toBe(3);
  });
  it("still counts a streak that ended yesterday", () => {
    expect(logStreak(["2026-11-04", "2026-11-03"], today)).toBe(2);
  });
  it("is zero when the last log is older than yesterday", () => {
    expect(logStreak(["2026-11-03", "2026-11-02"], today)).toBe(0);
    expect(logStreak([], today)).toBe(0);
  });
  it("ignores duplicate dates and crosses month boundaries", () => {
    expect(logStreak(["2026-11-01", "2026-11-01", "2026-10-31", "2026-10-30"], "2026-11-01")).toBe(3);
  });
});

describe("monthStats / groupLogByDate", () => {
  const log = [entry("2026-11-05", 1), entry("2026-11-05", 2), entry("2026-11-02", 3), entry("2026-10-31", 4)];
  it("counts workouts and active days in the current month only", () => {
    expect(monthStats(log, "2026-11-05")).toEqual({ workouts: 3, activeDays: 2 });
    expect(monthStats([], "2026-11-05")).toEqual({ workouts: 0, activeDays: 0 });
  });
  it("groups entries by date, preserving order", () => {
    const g = groupLogByDate(log);
    expect(Object.keys(g).sort()).toEqual(["2026-10-31", "2026-11-02", "2026-11-05"]);
    expect(g["2026-11-05"].map(e => e.id)).toEqual([1, 2]);
  });
});

describe("suggestWorkoutEmoji", () => {
  it("matches name keywords first", () => {
    expect(suggestWorkoutEmoji("Morning Run", "Legs")).toBe("🏃");
    expect(suggestWorkoutEmoji("Evening stretch", "Full body")).toBe("🧘");
    expect(suggestWorkoutEmoji("Spin class", "Cardio")).toBe("🚴");
    expect(suggestWorkoutEmoji("Bike commute", "Cardio")).toBe("🚴");
    expect(suggestWorkoutEmoji("Lap swim", "Cardio")).toBe("🏊");
    expect(suggestWorkoutEmoji("Abs burner", "Full body")).toBe("⚡");
  });
  it("falls back to the muscle group, then a dumbbell", () => {
    expect(suggestWorkoutEmoji("Lower day", "Legs")).toBe("🦵");
    expect(suggestWorkoutEmoji("Booty day", "Full body")).toBe("🍑");
    expect(suggestWorkoutEmoji("Session A", "Glutes")).toBe("🍑");
    expect(suggestWorkoutEmoji("Session B", "Core")).toBe("⚡");
    expect(suggestWorkoutEmoji("Upper", "Arms")).toBe("💪");
    expect(suggestWorkoutEmoji("Session C", "Back")).toBe("🏋️");
    expect(suggestWorkoutEmoji("", "Full body")).toBe("🏋️");
  });
  it("doesn't match keywords inside other words", () => {
    expect(suggestWorkoutEmoji("Abstract flow", "Back")).toBe("🏋️");
  });
});
