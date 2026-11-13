import { describe, expect, it } from "vitest";
import { buildReport, type ReportInput } from "./report";
import type { WorkoutLogEntry } from "../types";

const entry = (id: number, date: string, name: string, extra: Partial<WorkoutLogEntry> = {}): WorkoutLogEntry => ({
  workoutId: name, name, emoji: "🏋️", muscle: "", date, time: "08:00", sets: "", reps: "", weight: "", duration: "", notes: "", id, ...extra,
});

const base: ReportInput = {
  userName: " Sam ",
  periodHistory: [
    { date: "2026-08-08", end: "2026-08-12" },
    { date: "2026-09-05", end: "2026-09-09" },
    { date: "2026-10-04", end: "2026-10-09" },
    { date: "2026-11-02", end: "2026-11-06" },
  ],
  periodStart: "2026-11-02",
  cycleLengthSetting: 28,
  periodLengthSetting: 5,
  workoutLog: [
    entry(1, "2026-11-13", "Easy Run", { kind: "cardio", duration: "30 min", distance: "5" }),
    entry(2, "2026-11-12", "Barbell Squat", { muscle: "Legs", sets: "3", reps: "10", weight: "40" }),
    entry(3, "2026-11-01", "Morning Yoga", { kind: "recovery", duration: "20 min" }),
    entry(4, "2026-07-01", "Hip Thrust", { muscle: "Glutes" }),
  ],
  measurementHistory: [
    { date: "2026-09-01", weight: 64, waist: 72 },
    { date: "2026-11-01", weight: 63.2 },
  ],
};

describe("buildReport", () => {
  const r = buildReport(base, "2026-11-14");

  it("summarises the cycle from logged periods", () => {
    expect(r.name).toBe("Sam");
    expect(r.cycle.tracked).toBe(true);
    expect(r.cycle.cyclesLogged).toBe(3);
    expect(r.cycle.shortest).toBe(28);
    expect(r.cycle.longest).toBe(29);
    expect(r.cycle.periods[0]).toEqual({ start: "2026-11-02", end: "2026-11-06", days: 5, cycleDays: null });
    expect(r.cycle.periods[1]).toEqual({ start: "2026-10-04", end: "2026-10-09", days: 6, cycleDays: 29 });
    expect(r.cycle.nextPeriod! > "2026-11-14").toBe(true);
  });

  it("counts workouts by window, kind and muscle group", () => {
    expect(r.workouts.total).toBe(4);
    expect(r.workouts.last30).toBe(3);
    expect(r.workouts.activeDays30).toBe(3);
    expect(r.workouts.kinds).toEqual({ strength: 1, cardio: 1, recovery: 1 });
    expect(r.workouts.groups.map(g => g.group)).toEqual(expect.arrayContaining(["Legs", "Cardio", "Recovery"]));
    expect(r.workouts.groups.some(g => g.group === "Glutes")).toBe(false); // older than 90 days
    expect(r.workouts.recent[0]).toEqual({ date: "2026-11-13", name: "Easy Run", detail: "30 min · 5 km · 6:00 /km" });
  });

  it("shows each body measurement's first, latest and change", () => {
    expect(r.body).toEqual([
      { label: "Weight", unit: "kg", first: 64, latest: 63.2, change: -0.8, since: "2026-09-01", entries: 2 },
      { label: "Waist", unit: "cm", first: 72, latest: 72, change: 0, since: "2026-09-01", entries: 1 },
    ]);
  });

  it("handles an empty account", () => {
    const empty = buildReport({ ...base, periodHistory: [], periodStart: "", workoutLog: [], measurementHistory: [] }, "2026-11-14");
    expect(empty.cycle.tracked).toBe(false);
    expect(empty.cycle.nextPeriod).toBeNull();
    expect(empty.workouts.total).toBe(0);
    expect(empty.workouts.groups).toEqual([]);
    expect(empty.body).toEqual([]);
  });
});
