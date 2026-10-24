import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCycleInfo, PHASES } from "./cycle";

// "Today" is pinned to mid-July so that no test range crosses a DST change
// (getCycleInfo works in local time and floors whole-day differences).
const TODAY = new Date(2026, 6, 15, 9, 30); // 2026-07-15 09:30 local

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Period start date (YYYY-MM-DD) such that today is day `day` (1-based) counted from it. */
const startForDay = (day: number) => ymd(new Date(2026, 6, 15 - (day - 1)));

describe("getCycleInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when there is no period start", () => {
    expect(getCycleInfo("")).toBeNull();
    expect(getCycleInfo("", 30)).toBeNull();
  });

  it("returns null when the period start is in the future", () => {
    expect(getCycleInfo(ymd(new Date(2026, 6, 16)))).toBeNull();
  });

  it("returns null when the period start is more than two cycles ago", () => {
    expect(getCycleInfo(startForDay(56))).not.toBeNull();
    expect(getCycleInfo(startForDay(57))).toBeNull();
    expect(getCycleInfo(startForDay(61), 30)).toBeNull();
    expect(getCycleInfo(startForDay(60), 30)).not.toBeNull();
  });

  it("treats the start date itself as day 1", () => {
    const info = getCycleInfo(ymd(TODAY));
    expect(info).not.toBeNull();
    expect(info?.dayOfCycle).toBe(1);
    expect(info?.cycleLength).toBe(28);
  });

  it.each([
    [1, "menstrual"],
    [5, "menstrual"],
    [6, "follicular"],
    [13, "follicular"],
    [14, "ovulation"],
    [16, "ovulation"],
    [17, "luteal"],
    [28, "luteal"],
  ] as const)("day %i of a 28-day cycle is %s", (day, phaseId) => {
    const info = getCycleInfo(startForDay(day), 28);
    expect(info?.dayOfCycle).toBe(day);
    expect(info?.phase).toBe(PHASES[phaseId]);
  });

  it("wraps into the next cycle after cycleLength days", () => {
    const info = getCycleInfo(startForDay(29), 28);
    expect(info?.dayOfCycle).toBe(1);
    expect(info?.phase.id).toBe("menstrual");
    expect(getCycleInfo(startForDay(45), 28)?.dayOfCycle).toBe(17);
  });

  it("uses fixed day boundaries regardless of cycle length", () => {
    const info = getCycleInfo(startForDay(30), 35);
    expect(info?.dayOfCycle).toBe(30);
    expect(info?.cycleLength).toBe(35);
    expect(info?.phase.id).toBe("luteal");
    expect(info?.daysUntilNext).toBe(6);
  });

  it("counts days until the next period from the logged start in the first cycle", () => {
    expect(getCycleInfo(startForDay(1))?.daysUntilNext).toBe(28);
    expect(getCycleInfo(startForDay(10))?.daysUntilNext).toBe(19);
    expect(getCycleInfo(startForDay(28))?.daysUntilNext).toBe(1);
  });

  it("rolls the next period forward in the second cycle", () => {
    // Once a cycle has passed without logging a new period, the countdown restarts from
    // the start of the current (second) cycle instead of hitting 0 and going negative.
    expect(getCycleInfo(startForDay(29))?.daysUntilNext).toBe(28);
    expect(getCycleInfo(startForDay(40))?.daysUntilNext).toBe(17);
    expect(getCycleInfo(startForDay(56))?.daysUntilNext).toBe(1);
    expect(getCycleInfo(startForDay(31), 30)?.daysUntilNext).toBe(30);
    expect(getCycleInfo(startForDay(60), 30)?.daysUntilNext).toBe(1);
  });

  it("never reports a non-positive countdown while a cycle is shown", () => {
    for (let day = 1; day <= 56; day++) {
      expect(getCycleInfo(startForDay(day), 28)?.daysUntilNext).toBe(28 - ((day - 1) % 28));
    }
  });

  it("reports the next period date as start + cycleLength (via toISOString)", () => {
    const start = startForDay(10);
    const [y, m, d] = start.split("-").map(Number);
    const expected = new Date(y, m - 1, d + 28, 12).toISOString().slice(0, 10);
    expect(getCycleInfo(start)?.nextPeriodDate).toBe(expected);
  });

  it("reports the next period date as start + 2 * cycleLength in the second cycle", () => {
    const start = startForDay(40);
    const [y, m, d] = start.split("-").map(Number);
    const expected = new Date(y, m - 1, d + 56, 12).toISOString().slice(0, 10);
    expect(getCycleInfo(start)?.nextPeriodDate).toBe(expected);
  });

  it("returns null for an unparseable date string instead of crashing", () => {
    expect(getCycleInfo("not-a-date")).toBeNull();
  });
});
