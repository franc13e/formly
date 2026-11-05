import { describe, expect, it } from "vitest";
import type { Schedule, Workout, WorkoutSession } from "../types";
import {
  addItemsToDay, addSessionToSchedule, durationMinutes, filterWorkouts, focusFrom, formatMinutes, groupDayItems, moveBy,
  sanitizeSessions, sessionTotals, sessionWorkouts, toScheduled, defaultMuscleFor, findByName, quickExercise,
} from "./sessions";

const w = (id: number, name: string, muscle: string, duration: string, tags: string[] = []): Workout =>
  ({ id, name, emoji: "🏋️", muscle, difficulty: "Beginner", duration, tags, achieve: "" });
const thrust = w(1, "Hip Thrust", "Glutes", "30 min", ["glutes"]);
const rdl = w(2, "Romanian Deadlift", "Legs", "25 min", ["hamstrings"]);
const plank = w(3, "Plank", "Core", "");
const POOL = [thrust, rdl, plank];
const glute: WorkoutSession = { id: "p-glute", name: "Glute day", emoji: "🍑", focus: "Glutes", workoutIds: [1, 99, 2] };

describe("durations", () => {
  it("reads minutes and hours", () => {
    expect(durationMinutes("35 min")).toBe(35);
    expect(durationMinutes("1 h 15 min")).toBe(75);
    expect(durationMinutes("1.5 hours")).toBe(90);
    expect(durationMinutes("20-30 min")).toBe(30);
    expect(durationMinutes("40")).toBe(40);
    expect(durationMinutes("")).toBe(0);
  });
  it("formats totals", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(95)).toBe("1 h 35 min");
    expect(formatMinutes(0)).toBe("");
  });
});

describe("sessionWorkouts / sessionTotals", () => {
  it("resolves ids in order and skips missing ones", () => {
    expect(sessionWorkouts(glute, POOL).map(x => x.id)).toEqual([1, 2]);
  });
  it("totals count and minutes", () => {
    // Each exercise counts for at most SESSION_MINUTES_PER_EXERCISE (12) inside a session.
    expect(sessionTotals(sessionWorkouts(glute, POOL))).toEqual({ count: 2, minutes: 24 });
    expect(sessionTotals([])).toEqual({ count: 0, minutes: 0 });
  });
});

describe("adding to the schedule", () => {
  it("makes schedule items with detail and optional group", () => {
    expect(toScheduled(thrust)).toEqual({ name: "Hip Thrust", emoji: "🏋️", detail: "Glutes · 30 min" });
    expect(toScheduled(plank, "Core")).toEqual({ name: "Plank", emoji: "🏋️", detail: "Core", group: "Core" });
  });
  it("adds every exercise of a session under its name, after what is there", () => {
    const schedule: Schedule = { "2026-11-05": [{ name: "Run", emoji: "🏃" }] };
    const next = addSessionToSchedule(schedule, "2026-11-05", glute, POOL);
    expect(next["2026-11-05"]).toEqual([
      { name: "Run", emoji: "🏃" },
      { name: "Hip Thrust", emoji: "🏋️", detail: "Glutes · 30 min", group: "Glute day" },
      { name: "Romanian Deadlift", emoji: "🏋️", detail: "Legs · 25 min", group: "Glute day" },
    ]);
    expect(schedule["2026-11-05"]).toHaveLength(1);
  });
  it("turns a rest day into a list and ignores empty adds", () => {
    const schedule: Schedule = { "2026-11-06": "rest" };
    expect(addItemsToDay(schedule, "2026-11-06", [toScheduled(plank)])["2026-11-06"]).toEqual([toScheduled(plank)]);
    expect(addItemsToDay(schedule, "2026-11-06", [])).toBe(schedule);
    expect(addSessionToSchedule(schedule, "2026-11-06", { ...glute, workoutIds: [42] }, POOL)).toBe(schedule);
  });
});

describe("groupDayItems", () => {
  it("gathers a group's items and keeps ungrouped items in order, with original indices", () => {
    const items = [
      { name: "Run", emoji: "🏃" },
      { name: "A", emoji: "🍑", group: "Glute day" },
      { name: "Walk", emoji: "🚶" },
      { name: "B", emoji: "🍑", group: "Glute day" },
      { name: "Stretch", emoji: "🧘" },
      { name: "C", emoji: "⚡", group: " " },
    ];
    expect(groupDayItems(items).map(b => [b.group, b.entries.map(e => e.index)])).toEqual([
      [undefined, [0]],
      ["Glute day", [1, 3]],
      [undefined, [2, 4, 5]],
    ]);
  });
  it("handles an empty day", () => {
    expect(groupDayItems([])).toEqual([]);
  });
});

describe("moveBy", () => {
  it("moves up and down within bounds", () => {
    expect(moveBy([1, 2, 3], 1, -1)).toEqual([2, 1, 3]);
    expect(moveBy([1, 2, 3], 1, 1)).toEqual([1, 3, 2]);
    const list = [1, 2, 3];
    expect(moveBy(list, 0, -1)).toBe(list);
    expect(moveBy(list, 2, 1)).toBe(list);
  });
});

describe("focusFrom / filterWorkouts / sanitizeSessions", () => {
  it("builds a focus line from muscles", () => {
    expect(focusFrom([thrust])).toBe("Glutes");
    expect(focusFrom([thrust, rdl, thrust])).toBe("Glutes and Legs");
    expect(focusFrom([thrust, rdl, plank])).toBe("Glutes, Legs and Core");
    expect(focusFrom([])).toBe("");
  });
  it("filters by muscle and search text", () => {
    expect(filterWorkouts(POOL, "All").map(x => x.id)).toEqual([1, 2, 3]);
    expect(filterWorkouts(POOL, "Glutes").map(x => x.id)).toEqual([1]);
    expect(filterWorkouts(POOL, "All", " hamstr ").map(x => x.id)).toEqual([2]);
    expect(filterWorkouts(POOL, "Core", "thrust")).toEqual([]);
  });
  it("keeps only well-formed stored sessions", () => {
    expect(sanitizeSessions(null)).toEqual([]);
    expect(sanitizeSessions([glute, { id: 1 }, { id: "s-1", name: "X", workoutIds: ["a"] }, { id: "s-2", name: "Y", workoutIds: [1] }]))
      .toEqual([glute, { id: "s-2", name: "Y", workoutIds: [1], emoji: "🏋️", focus: "" }]);
  });
});

describe("your own exercises in the session builder", () => {
  const pool = [w(1, "Hip Thrust", "Glutes", "15 min"), w(2, "Plank", "Core", "5 min")];

  it("finds an existing exercise by name regardless of case and spacing", () => {
    expect(findByName(pool, "  hip   thrust ")?.id).toBe(1);
    expect(findByName(pool, "Cable kickback")).toBeUndefined();
    expect(findByName(pool, "   ")).toBeUndefined();
  });

  it("makes a tidy custom exercise from a typed name", () => {
    const x = quickExercise("  cable   kickback ", "Glutes", 1700000000000);
    expect(x).toMatchObject({ id: 1700000000000, name: "Cable kickback", muscle: "Glutes", difficulty: "Beginner", duration: "", tags: ["glutes"] });
    expect(x.emoji).toBeTruthy();
  });

  it("defaults the group to the chip you were browsing", () => {
    expect(defaultMuscleFor("Back")).toBe("Back");
    expect(defaultMuscleFor("All")).toBe("Full body");
    expect(defaultMuscleFor("Yours")).toBe("Full body");
  });
});
