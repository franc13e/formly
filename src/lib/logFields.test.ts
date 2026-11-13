import { describe, expect, it } from "vitest";
import { formForKind, logFields, logSummary, normalizeDuration, pace, tracksDistance } from "./logFields";

const keys = (kind: Parameters<typeof logFields>[0], name: string) => logFields(kind, name).map(f => f.key);

describe("logFields", () => {
  it("asks for sets, reps and weight only for strength", () => {
    expect(keys("strength", "Barbell Squat")).toEqual(["sets", "reps", "weight", "duration"]);
    expect(keys("recovery", "Morning yoga")).toEqual(["duration"]);
  });

  it("asks for distance on runs, rides and swims, not dance or HIIT", () => {
    expect(keys("cardio", "Easy run")).toEqual(["duration", "distance"]);
    expect(keys("cardio", "Cycling")).toEqual(["duration", "distance"]);
    expect(keys("cardio", "Dance cardio")).toEqual(["duration"]);
    expect(tracksDistance("HIIT circuit")).toBe(false);
  });
});

describe("normalizeDuration", () => {
  it("adds minutes to a bare number and keeps worded times", () => {
    expect(normalizeDuration(" 30 ")).toBe("30 min");
    expect(normalizeDuration("1 hr")).toBe("1 hr");
    expect(normalizeDuration("")).toBe("");
  });
});

describe("pace", () => {
  it("works out minutes per km", () => {
    expect(pace("30 min", "5")).toBe("6:00 /km");
    expect(pace("27 min", "5")).toBe("5:24 /km");
    expect(pace("1 hr", "10")).toBe("6:00 /km");
  });
  it("is null without both numbers", () => {
    expect(pace("", "5")).toBeNull();
    expect(pace("30 min", "")).toBeNull();
  });
});

describe("logSummary", () => {
  it("shows strength numbers", () => {
    expect(logSummary({ duration: "40 min", sets: "3", reps: "12", weight: "40" })).toBe("40 min · 3 sets × 12 reps · 40 kg");
  });
  it("shows a run with distance and pace", () => {
    expect(logSummary({ duration: "30 min", sets: "", reps: "", weight: "", distance: "5", intensity: "Easy" })).toBe("30 min · 5 km · 6:00 /km · Easy");
  });
  it("shows yoga with just time and feel", () => {
    expect(logSummary({ duration: "20 min", sets: "", reps: "", weight: "", intensity: "Gentle" })).toBe("20 min · Gentle");
  });
});

describe("formForKind", () => {
  it("drops fields that don't belong to the new kind", () => {
    const form = { sets: "3", reps: "10", weight: "20", duration: "30", distance: "5", intensity: "Hard", notes: "ok" };
    expect(formForKind(form, "recovery", "Yoga")).toEqual({ sets: "", reps: "", weight: "", distance: "", duration: "30", intensity: "", notes: "ok" });
    expect(formForKind(form, "cardio", "Run")).toMatchObject({ sets: "", distance: "5", intensity: "Hard" });
  });
});
