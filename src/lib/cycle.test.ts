import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clampCycleLength, cycleDayOn, cycleStats, getCycleInfo, periodStarts, phaseOfDay, PHASES } from "./cycle";

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

  it("reports the period as late for up to 10 days past the expected start", () => {
    const info = getCycleInfo(startForDay(29), 28);
    expect(info?.dayOfCycle).toBe(29);
    expect(info?.phase.id).toBe("luteal");
    expect(info?.daysLate).toBe(1);
    expect(info?.daysUntilNext).toBe(0);
    expect(getCycleInfo(startForDay(38), 28)?.daysLate).toBe(10);
    expect(getCycleInfo(startForDay(28), 28)?.daysLate).toBe(0);
  });

  it("wraps into the next cycle once the late window has passed", () => {
    const info = getCycleInfo(startForDay(39), 28);
    expect(info?.dayOfCycle).toBe(11);
    expect(info?.daysLate).toBe(0);
    expect(getCycleInfo(startForDay(45), 28)?.dayOfCycle).toBe(17);
  });

  it("moves ovulation with cycle length", () => {
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
    // Once the late window has passed without logging a new period, the countdown restarts
    // from the start of the current (second) cycle instead of going negative.
    expect(getCycleInfo(startForDay(40))?.daysUntilNext).toBe(17);
    expect(getCycleInfo(startForDay(56))?.daysUntilNext).toBe(1);
    expect(getCycleInfo(startForDay(41), 30)?.daysUntilNext).toBe(20);
    expect(getCycleInfo(startForDay(60), 30)?.daysUntilNext).toBe(1);
  });

  it("never reports a non-positive countdown outside the late window", () => {
    for (const day of [...Array(28).keys()].map(i => i + 1).concat([...Array(18).keys()].map(i => i + 39))) {
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

describe("phaseOfDay", () => {
  it("keeps the classic 28-day boundaries", () => {
    expect([5, 6, 13, 14, 16, 17].map(d => phaseOfDay(d, 28))).toEqual(["menstrual", "follicular", "follicular", "ovulation", "ovulation", "luteal"]);
  });
  it("puts ovulation ~14 days before the next period", () => {
    expect(phaseOfDay(20, 35)).toBe("follicular");
    expect(phaseOfDay(21, 35)).toBe("ovulation");
    expect(phaseOfDay(24, 35)).toBe("luteal");
    expect(phaseOfDay(7, 21)).toBe("ovulation");
    expect(phaseOfDay(6, 21)).toBe("follicular");
  });
});

describe("cycleStats", () => {
  it("falls back to the setting until a full cycle is logged", () => {
    expect(cycleStats(["2026-07-01"], 30)).toEqual({ length: 30, spread: 3, cyclesLogged: 0 });
  });
  it("learns the average gap between logged starts", () => {
    const s = cycleStats(["2026-04-01", "2026-05-01", "2026-05-31", "2026-07-02"], 28);
    expect(s.length).toBe(31);
    expect(s.cyclesLogged).toBe(3);
    expect(s.spread).toBe(1);
  });
  it("skips gaps that look like a missed log", () => {
    expect(cycleStats(["2026-01-01", "2026-03-30", "2026-04-27"], 30).length).toBe(28);
  });
  it("reports a wider spread for irregular cycles", () => {
    expect(cycleStats(["2026-01-01", "2026-01-24", "2026-03-01", "2026-03-27"], 28).spread).toBeGreaterThanOrEqual(5);
  });
});

describe("periodStarts", () => {
  it("merges the current start into history, unique and oldest first", () => {
    expect(periodStarts([{ date: "2026-06-03" }, { date: "2026-05-05" }], "2026-07-01")).toEqual(["2026-05-05", "2026-06-03", "2026-07-01"]);
    expect(periodStarts([{ date: "2026-07-01" }], "2026-07-01")).toEqual(["2026-07-01"]);
  });
});

describe("cycleDayOn", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
  afterEach(() => { vi.useRealTimers(); });
  const starts = ["2026-06-01", "2026-06-30"];

  it("is null before the first logged period", () => {
    expect(cycleDayOn("2026-05-31", starts, 28)).toBeNull();
  });
  it("uses the real length of past logged cycles", () => {
    expect(cycleDayOn("2026-06-03", starts, 28)).toMatchObject({ dayOfCycle: 3, loggedPeriod: true, future: false });
    expect(cycleDayOn("2026-06-29", starts, 28)).toMatchObject({ dayOfCycle: 29, phase: "luteal", loggedPeriod: false });
  });
  it("projects future cycles and marks predicted period days", () => {
    expect(cycleDayOn("2026-07-28", starts, 28)).toMatchObject({ dayOfCycle: 1, predictedPeriod: true, loggedPeriod: false, future: true });
    expect(cycleDayOn("2026-07-20", starts, 28)).toMatchObject({ dayOfCycle: 21, predictedPeriod: false, future: true });
  });
});

describe("clampCycleLength", () => {
  it("keeps supported lengths and clamps the rest", () => {
    expect(clampCycleLength(28)).toBe(28);
    expect(clampCycleLength(2)).toBe(21);
    expect(clampCycleLength(400)).toBe(40);
    expect(clampCycleLength(Number.NaN)).toBe(28);
  });

  it("is applied by getCycleInfo so bad saved values can't break the cycle maths", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 24, 12));
    const info = getCycleInfo("2026-10-20", 2);
    expect(info?.cycleLength).toBe(21);
    expect(info?.dayOfCycle).toBe(5);
    vi.useRealTimers();
  });
});
