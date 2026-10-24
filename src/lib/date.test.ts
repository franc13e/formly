import { afterEach, describe, expect, it, vi } from "vitest";
import { localDateKey } from "./date";

describe("localDateKey", () => {
  afterEach(() => vi.useRealTimers());

  it("formats a date with zero padding", () => {
    expect(localDateKey(new Date(2026, 0, 5, 9, 30))).toBe("2026-01-05");
  });

  it("uses the local calendar day, not the UTC one", () => {
    // 00:30 local time: in any zone ahead of UTC the UTC date is still the previous day.
    const earlyMorning = new Date(2026, 9, 24, 0, 30);
    expect(localDateKey(earlyMorning)).toBe("2026-10-24");
  });

  it("defaults to now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59));
    expect(localDateKey()).toBe("2026-12-31");
  });
});
