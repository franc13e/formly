import { describe, expect, it } from "vitest";
import type { PeriodEntry } from "../types";
import { bleedEnds, flowOn, lastBleedDay, markNoFlow, periodSlot, setFlow, setPeriodEnd, withCurrentStart } from "./periodFlow";
import { periodLengthFrom } from "./cycle";

const LEN = 5;
const older: PeriodEntry = { date: "2026-06-03", end: "2026-06-07" };
const open: PeriodEntry = { date: "2026-07-01" };

describe("withCurrentStart", () => {
  it("adds the current start when missing and sorts newest first", () => {
    expect(withCurrentStart([older], "2026-07-01").map(p => p.date)).toEqual(["2026-07-01", "2026-06-03"]);
  });
  it("leaves the history alone when the start is already there or empty", () => {
    expect(withCurrentStart([open, older], "2026-07-01")).toEqual([open, older]);
    expect(withCurrentStart([older], "")).toEqual([older]);
  });
});

describe("periodSlot", () => {
  it("treats the typical length as the span of an open period", () => {
    expect(periodSlot([open], "", "2026-07-01", LEN).kind).toBe("inside");
    expect(periodSlot([open], "", "2026-07-05", LEN).kind).toBe("inside");
    expect(periodSlot([open], "", "2026-07-06", LEN).kind).toBe("after");
    expect(periodSlot([open], "", "2026-07-07", LEN).kind).toBe("after");
    expect(periodSlot([open], "", "2026-07-08", LEN).kind).toBe("outside");
  });
  it("uses the logged end of a closed period", () => {
    expect(periodSlot([older], "", "2026-06-07", LEN).kind).toBe("inside");
    expect(periodSlot([older], "", "2026-06-08", LEN).kind).toBe("after");
    expect(periodSlot([older], "", "2026-06-10", LEN).kind).toBe("outside");
  });
  it("follows flow recorded past the typical length", () => {
    const h: PeriodEntry[] = [{ date: "2026-07-01", flow: { "2026-07-07": "light" } }];
    expect(periodSlot(h, "", "2026-07-07", LEN).kind).toBe("inside");
    expect(periodSlot(h, "", "2026-07-08", LEN).kind).toBe("after");
  });
  it("never treats days 14+ after the start as the same period", () => {
    const h: PeriodEntry[] = [{ date: "2026-07-01", flow: { "2026-07-13": "light" } }];
    expect(periodSlot(h, "", "2026-07-14", LEN).kind).toBe("after");
    expect(periodSlot(h, "", "2026-07-15", LEN).kind).toBe("outside");
    expect(periodSlot([{ date: "2026-07-01", end: "2026-07-20" }], "", "2026-07-20", LEN).kind).toBe("outside");
  });
  it("is outside before the first period", () => {
    expect(periodSlot([older], "", "2026-05-01", LEN).kind).toBe("outside");
  });
  it("sees the current start even when it is not in the history", () => {
    const slot = periodSlot([older], "2026-07-01", "2026-07-02", LEN);
    expect(slot.kind).toBe("inside");
    expect(slot.kind !== "outside" && slot.entry.date).toBe("2026-07-01");
  });
});

describe("setFlow", () => {
  it("records a level inside an open period without closing it", () => {
    const h = setFlow([open, older], "", "2026-07-02", "heavy", LEN);
    expect(h[0]).toEqual({ date: "2026-07-01", flow: { "2026-07-02": "heavy" } });
    expect(flowOn(h, "2026-07-02")).toBe("heavy");
    expect(flowOn(h, "2026-07-03")).toBeUndefined();
  });
  it("extends a closed period's end to a day just after it", () => {
    const h = setFlow([older], "", "2026-06-09", "light", LEN);
    expect(h[0]).toEqual({ date: "2026-06-03", end: "2026-06-09", flow: { "2026-06-09": "light" } });
  });
  it("lets an open period walk past its typical length day by day", () => {
    let h = setFlow([open], "", "2026-07-06", "medium", LEN);
    expect(lastBleedDay(h[0], LEN)).toBe("2026-07-06");
    h = setFlow(h, "", "2026-07-07", "light", LEN);
    expect(periodSlot(h, "", "2026-07-08", LEN).kind).toBe("after");
    expect(h[0].end).toBeUndefined();
  });
  it("ignores days outside any period", () => {
    const h = [older];
    expect(setFlow(h, "", "2026-06-20", "light", LEN)).toBe(h);
  });
  it("adds the current start to the history when editing it", () => {
    const h = setFlow([older], "2026-07-01", "2026-07-01", "medium", LEN);
    expect(h.map(p => p.date)).toEqual(["2026-07-01", "2026-06-03"]);
    expect(h[0].flow).toEqual({ "2026-07-01": "medium" });
  });
  it("keeps entries newest first", () => {
    const h = setFlow([open, older], "", "2026-06-04", "light", LEN);
    expect(h.map(p => p.date)).toEqual(["2026-07-01", "2026-06-03"]);
  });
});

describe("markNoFlow", () => {
  it("removes the period when marked on its start day", () => {
    const r = markNoFlow([open, older], "2026-07-01", "2026-07-01", LEN);
    expect(r.removed).toBe("2026-07-01");
    expect(r.history).toEqual([older]);
  });
  it("removes a current start that only exists as period-start", () => {
    const r = markNoFlow([older], "2026-07-01", "2026-07-01", LEN);
    expect(r.removed).toBe("2026-07-01");
    expect(r.history).toEqual([older]);
  });
  it("ends the period the day before and drops later flow", () => {
    const h: PeriodEntry[] = [{ date: "2026-07-01", flow: { "2026-07-01": "heavy", "2026-07-03": "medium", "2026-07-04": "light" } }];
    const r = markNoFlow(h, "", "2026-07-03", LEN);
    expect(r.removed).toBeNull();
    expect(r.history[0]).toEqual({ date: "2026-07-01", end: "2026-07-02", flow: { "2026-07-01": "heavy" } });
  });
  it("drops the flow map when no records remain", () => {
    const h: PeriodEntry[] = [{ date: "2026-07-01", flow: { "2026-07-04": "light" } }];
    expect(markNoFlow(h, "", "2026-07-03", LEN).history[0]).toEqual({ date: "2026-07-01", end: "2026-07-02" });
  });
  it("truncates a closed period", () => {
    expect(markNoFlow([older], "", "2026-06-05", LEN).history[0]).toEqual({ date: "2026-06-03", end: "2026-06-04" });
  });
  it("closes an open period at its last bleeding day when marked just after it", () => {
    const h: PeriodEntry[] = [{ date: "2026-07-01", flow: { "2026-07-06": "light" } }];
    expect(markNoFlow(h, "", "2026-07-07", LEN).history[0].end).toBe("2026-07-06");
  });
  it("changes nothing just after a closed period or outside one", () => {
    const h = [older];
    expect(markNoFlow(h, "", "2026-06-08", LEN).history).toBe(h);
    expect(markNoFlow(h, "", "2026-06-25", LEN).history).toBe(h);
  });
  it("feeds period-length learning through the end", () => {
    const r = markNoFlow([open, older], "", "2026-07-04", LEN);
    expect(periodLengthFrom(r.history, 5)).toEqual({ length: 4, logged: 2 });
  });
});

describe("setPeriodEnd", () => {
  it("handles the current start like logPeriodEnd did", () => {
    const h = setPeriodEnd([older], "2026-07-01", "2026-07-04");
    expect(h).toEqual([{ date: "2026-07-01", end: "2026-07-04" }, older]);
  });
  it("drops flow after the new end", () => {
    const h = setPeriodEnd([{ date: "2026-07-01", flow: { "2026-07-02": "heavy", "2026-07-05": "light" } }], "", "2026-07-03");
    expect(h[0]).toEqual({ date: "2026-07-01", end: "2026-07-03", flow: { "2026-07-02": "heavy" } });
  });
  it("is unchanged before the first period", () => {
    const h = [older];
    expect(setPeriodEnd(h, "", "2026-01-01")).toBe(h);
  });
});

describe("bleedEnds", () => {
  it("lists logged ends and open periods that ran past the typical length", () => {
    const h: PeriodEntry[] = [{ date: "2026-08-01", flow: { "2026-08-02": "light" } }, { date: "2026-07-01", flow: { "2026-07-07": "light" } }, older];
    expect(bleedEnds(h, LEN)).toEqual({ "2026-07-01": "2026-07-07", "2026-06-03": "2026-06-07" });
  });
});
