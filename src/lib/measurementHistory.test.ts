import { describe, expect, it } from "vitest";
import { deleteValue, metricEntries, metricSeries, metricsWithData, seedHistory, snapshotFrom, upsertSnapshot, weightHistoryFrom } from "./measurementHistory";

describe("snapshotFrom", () => {
  it("parses tracked values and skips blanks, zeros, junk and height", () => {
    expect(snapshotFrom({ weight: "62.4", waist: "", hips: "0", bust: "abc", arms: "28", height: "168" }, "2026-07-01"))
      .toEqual({ date: "2026-07-01", weight: 62.4, arms: 28 });
  });
});

describe("upsertSnapshot", () => {
  it("appends and keeps the history oldest first", () => {
    const h = upsertSnapshot([{ date: "2026-07-03", weight: 62 }], { date: "2026-07-01", weight: 63 });
    expect(h.map(s => s.date)).toEqual(["2026-07-01", "2026-07-03"]);
  });
  it("replaces the same day's snapshot", () => {
    const h = upsertSnapshot([{ date: "2026-07-01", weight: 63, waist: 70 }], { date: "2026-07-01", weight: 62 });
    expect(h).toEqual([{ date: "2026-07-01", weight: 62 }]);
  });
  it("clears the day for an empty snapshot", () => {
    expect(upsertSnapshot([{ date: "2026-07-01", weight: 63 }], { date: "2026-07-01" })).toEqual([]);
  });
});

describe("deleteValue", () => {
  it("removes one metric and keeps the rest of the snapshot", () => {
    expect(deleteValue([{ date: "2026-07-01", weight: 63, waist: 70 }], "2026-07-01", "weight")).toEqual([{ date: "2026-07-01", waist: 70 }]);
  });
  it("drops the snapshot when nothing is left", () => {
    expect(deleteValue([{ date: "2026-07-01", weight: 63 }, { date: "2026-07-02", weight: 62 }], "2026-07-01", "weight")).toEqual([{ date: "2026-07-02", weight: 62 }]);
  });
});

describe("metricEntries", () => {
  const h = [
    { date: "2026-07-01", weight: 63, waist: 70 },
    { date: "2026-07-05", waist: 69.5 },
    { date: "2026-07-08", weight: 62.3 },
    { date: "2026-07-10", weight: 62.8, waist: 69.5 },
  ];
  it("lists newest first with the change since the previous value of that metric", () => {
    expect(metricEntries(h, "weight")).toEqual([
      { date: "2026-07-10", value: 62.8, delta: 0.5 },
      { date: "2026-07-08", value: 62.3, delta: -0.7 },
      { date: "2026-07-01", value: 63, delta: null },
    ]);
    expect(metricEntries(h, "waist").map(e => e.delta)).toEqual([0, -0.5, null]);
  });
  it("series skip days without that metric", () => {
    expect(metricSeries(h, "waist").map(p => p.date)).toEqual(["2026-07-01", "2026-07-05", "2026-07-10"]);
  });
  it("only offers metrics with data", () => {
    expect(metricsWithData(h).map(m => m.k)).toEqual(["weight", "waist"]);
    expect(metricsWithData([])).toEqual([]);
  });
});

describe("seedHistory", () => {
  it("turns weigh-ins into weight-only snapshots and attaches measurements to the matching last weigh-in", () => {
    const h = seedHistory({ weight: "62", waist: "70", height: "168" }, [{ date: "2026-06-01", weight: 63 }, { date: "2026-06-20", weight: 62 }], "2026-07-15");
    expect(h).toEqual([{ date: "2026-06-01", weight: 63 }, { date: "2026-06-20", weight: 62, waist: 70 }]);
  });
  it("puts measurements on today when they don't match the last weigh-in", () => {
    const h = seedHistory({ waist: "70" }, [{ date: "2026-06-01", weight: 63 }], "2026-07-15");
    expect(h).toEqual([{ date: "2026-06-01", weight: 63 }, { date: "2026-07-15", waist: 70 }]);
  });
  it("merges with a weigh-in on today", () => {
    expect(seedHistory({ waist: "70" }, [{ date: "2026-07-15", weight: 63 }], "2026-07-15")).toEqual([{ date: "2026-07-15", weight: 63, waist: 70 }]);
  });
  it("is empty without data, and weight history round-trips", () => {
    expect(seedHistory({}, [], "2026-07-15")).toEqual([]);
    const weights = [{ date: "2026-06-01", weight: 63 }, { date: "2026-06-20", weight: 62 }];
    expect(weightHistoryFrom(seedHistory({}, weights, "2026-07-15"))).toEqual(weights);
  });
});
