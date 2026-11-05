import { describe, expect, it } from "vitest";
import { glyphFor } from "../components/glyphs";
import { Dumbbell } from "lucide-react";
import { PRESET_SESSIONS } from "./sessions";
import { ALL_WORKOUTS, MUSCLES, WORKOUT_MUSCLE_GROUPS } from "./workouts";
import { WORKOUT_GUIDES } from "./workoutGuides";

// Unknown emoji fall back to the dumbbell; only the weights emoji should draw it.
const hasGlyph = (emoji: string) => emoji.startsWith("🏋") || glyphFor(emoji)[0] !== Dumbbell;
const GROUPS = ["Glutes", "Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Cardio", "Recovery"];

describe("workout library", () => {
  it("has unique ids, keeps the original 12 and covers every group", () => {
    const ids = ALL_WORKOUTS.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let id = 1; id <= 12; id++) expect(ids).toContain(id);
    for (const g of GROUPS) {
      expect(WORKOUT_MUSCLE_GROUPS).toContain(g);
      expect(MUSCLES).toContain(g);
      expect(ALL_WORKOUTS.filter(w => w.muscle === g).length, g).toBeGreaterThanOrEqual(4);
    }
    for (const w of ALL_WORKOUTS) {
      expect(GROUPS, w.name).toContain(w.muscle);
      expect(w.duration).toMatch(/^\d+ min$/);
      expect(w.tags.length && w.achieve).toBeTruthy();
      expect(hasGlyph(w.emoji), `${w.name} ${w.emoji}`).toBe(true);
      expect(WORKOUT_GUIDES[w.id], w.name).toBeDefined();
    }
  });
});

describe("preset sessions", () => {
  it("uses p- ids and only library workouts", () => {
    const ids = new Set(ALL_WORKOUTS.map(w => w.id));
    expect(PRESET_SESSIONS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PRESET_SESSIONS.map(s => s.id)).size).toBe(PRESET_SESSIONS.length);
    for (const s of PRESET_SESSIONS) {
      expect(s.id).toMatch(/^p-/);
      expect(s.name && s.focus).toBeTruthy();
      expect(s.workoutIds.length).toBeGreaterThanOrEqual(4);
      expect(s.workoutIds.length).toBeLessThanOrEqual(6);
      expect(new Set(s.workoutIds).size).toBe(s.workoutIds.length);
      for (const id of s.workoutIds) expect(ids.has(id), `${s.name}: ${id}`).toBe(true);
      expect(hasGlyph(s.emoji), s.emoji).toBe(true);
    }
  });
});
