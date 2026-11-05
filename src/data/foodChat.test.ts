import { describe, expect, it } from "vitest";
import { buildFoodContext, MAX_USER_CHARS, recentForSend, stripEmphasis, trimHistory } from "./foodChat";
import { PHASES } from "../lib/cycle";
import type { ChatMessage, CycleInfo } from "../types";

const msg = (role: ChatMessage["role"], content: string): ChatMessage => ({ role, content });
const convo = (n: number): ChatMessage[] => Array.from({ length: n }, (_, i) => msg(i % 2 === 0 ? "user" : "assistant", `m${i}`));

describe("trimHistory", () => {
  it("keeps the newest messages", () => {
    expect(trimHistory(convo(45))).toHaveLength(40);
    expect(trimHistory(convo(45))[0].content).toBe("m5");
    const short = convo(3);
    expect(trimHistory(short)).toBe(short);
  });
});

describe("recentForSend", () => {
  it("sends the last 12 messages, starting with a user message", () => {
    const sent = recentForSend(convo(21)); // last 12 = m9 (assistant) .. m20 (user)
    expect(sent[0]).toEqual(msg("user", "m10"));
    expect(sent).toHaveLength(11);
    expect(sent[sent.length - 1].content).toBe("m20");
  });

  it("clips long messages and drops extra fields", () => {
    const long = { role: "user", content: "x".repeat(MAX_USER_CHARS + 10), extra: 1 } as ChatMessage;
    const [sent] = recentForSend([long]);
    expect(sent).toEqual({ role: "user", content: "x".repeat(MAX_USER_CHARS) });
  });

  it("returns nothing when there is no user message", () => {
    expect(recentForSend([msg("assistant", "hi")])).toEqual([]);
  });
});

describe("buildFoodContext", () => {
  const info = { phase: PHASES.luteal, dayOfCycle: 22, cycleLength: 28, daysUntilNext: 7, nextPeriodDate: "2026-11-12", daysLate: 0 } as CycleInfo;

  it("combines cycle phase/day and goal", () => {
    expect(buildFoodContext(info, " Build muscle and strength ")).toBe(
      "Currently in the luteal phase, day 22 of a 28-day cycle. Main goal: Build muscle and strength.",
    );
  });

  it("handles missing parts", () => {
    expect(buildFoodContext(null, "")).toBe("");
    expect(buildFoodContext(null, "Tone up")).toBe("Main goal: Tone up.");
    expect(buildFoodContext(info, "")).toMatch(/^Currently in the luteal phase/);
  });

  it("caps the length", () => {
    expect(buildFoodContext(null, "g".repeat(600)).length).toBe(500);
  });
});

describe("stripEmphasis", () => {
  it("removes bold/italic and headings but keeps bullets and maths", () => {
    expect(stripEmphasis("**Oats** are *great*")).toBe("Oats are great");
    expect(stripEmphasis("## Tips\n* eggs\n* tofu")).toBe("Tips\n- eggs\n- tofu");
    expect(stripEmphasis("2 * 3 eggs")).toBe("2 * 3 eggs");
  });
});
