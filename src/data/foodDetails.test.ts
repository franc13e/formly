import { describe, expect, it } from "vitest";
import { CYCLE_FOODS } from "./nutrition";
import { EASE_DETAILS, FOCUS_DETAILS } from "./foodDetails";
import type { PhaseId } from "../types";

const PHASES = Object.keys(CYCLE_FOODS) as PhaseId[];

describe("food details", () => {
  it("has more on every food to focus on", () => {
    for (const phase of PHASES) {
      for (const item of CYCLE_FOODS[phase].eat) {
        const d = FOCUS_DETAILS[phase][item.food];
        expect(d, `${phase}: ${item.food}`).toBeDefined();
        expect(d.reasons.length).toBeGreaterThanOrEqual(2);
        expect(d.examples.length).toBeGreaterThanOrEqual(4);
        expect(d.ideas.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("has more on every food to ease off on", () => {
    for (const phase of PHASES) {
      for (const item of CYCLE_FOODS[phase].ease) {
        const d = EASE_DETAILS[phase][item.food];
        expect(d, `${phase}: ${item.food}`).toBeDefined();
        expect(d.reasons.length).toBeGreaterThanOrEqual(2);
        expect(d.swaps.length).toBeGreaterThanOrEqual(3);
        expect(d.note).toBeTruthy();
      }
    }
  });

  it("has no details for foods that aren't listed", () => {
    for (const phase of PHASES) {
      const eat = CYCLE_FOODS[phase].eat.map(i => i.food).sort();
      const ease = CYCLE_FOODS[phase].ease.map(i => i.food).sort();
      expect(Object.keys(FOCUS_DETAILS[phase]).sort()).toEqual(eat);
      expect(Object.keys(EASE_DETAILS[phase]).sort()).toEqual(ease);
    }
  });
});
