import { describe, expect, it } from "vitest";
import { Dumbbell } from "lucide-react";
import { parseRecipe, RECIPES, recipesFor } from "./recipes";
import { glyphFor } from "../components/glyphs";
import { PHASES } from "../lib/cycle";
import type { PhaseId } from "../types";

const phaseIds = Object.keys(PHASES) as PhaseId[];

describe("RECIPES", () => {
  it.each(phaseIds)("%s has 3 meals and 2 complete drinks", (phase) => {
    const list = RECIPES[phase];
    expect(list.filter((r) => r.kind === "meal")).toHaveLength(3);
    expect(list.filter((r) => r.kind === "drink")).toHaveLength(2);
    for (const r of list) {
      expect(r.name && r.time && r.why).toBeTruthy();
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.steps.length).toBeGreaterThan(0);
      // Every emoji maps to a real glyph (unknown ones fall back to a dumbbell).
      expect(glyphFor(r.emoji)[0]).not.toBe(Dumbbell);
    }
  });

  it("gives every recipe a short photo search", () => {
    for (const r of phaseIds.flatMap((p) => RECIPES[p])) {
      expect(r.photoQuery?.trim(), r.id).toBeTruthy();
      expect(r.photoQuery!.length, r.id).toBeLessThanOrEqual(40);
    }
  });

  it("uses unique ids", () => {
    const ids = phaseIds.flatMap((p) => RECIPES[p].map((r) => r.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("recipesFor filters by kind", () => {
    expect(recipesFor("luteal")).toHaveLength(5);
    expect(recipesFor("luteal", "meal").every((r) => r.kind === "meal")).toBe(true);
    expect(recipesFor("luteal", "drink")).toHaveLength(2);
  });
});

describe("parseRecipe", () => {
  it("parses the structured format", () => {
    const text = [
      "TITLE: Golden oat bowl",
      "TIME: 10 min",
      "WHY: Oats give steady energy",
      "and magnesium.",
      "",
      "INGREDIENTS:",
      "- 1/2 cup oats",
      "* 250 ml milk",
      "• 1 banana",
      "STEPS:",
      "1. Simmer the oats in the milk.",
      "2) Top with banana.",
    ].join("\n");
    expect(parseRecipe(text)).toEqual({
      title: "Golden oat bowl",
      time: "10 min",
      why: "Oats give steady energy and magnesium.",
      ingredients: ["1/2 cup oats", "250 ml milk", "1 banana"],
      steps: ["Simmer the oats in the milk.", "Top with banana."],
    });
  });

  it("is lenient about case, bold markers, a missing title and 'Method'", () => {
    const r = parseRecipe("**Ingredients:**\n- eggs\nMethod:\n1. Scramble them.");
    expect(r).toEqual({ title: "Your recipe", time: "", why: "", ingredients: ["eggs"], steps: ["Scramble them."] });
  });

  it("uses a leading untitled line as the title", () => {
    expect(parseRecipe("Quick tea\nINGREDIENTS:\n- tea\nSTEPS:\n1. Brew.")?.title).toBe("Quick tea");
  });

  it("returns null without ingredients or steps", () => {
    expect(parseRecipe("Sorry, I can only help with food.")).toBeNull();
    expect(parseRecipe("TITLE: X\nINGREDIENTS:\n- a")).toBeNull();
  });
});

describe("curated recipe photos", () => {
  it("ships a stored https photo for every curated recipe", async () => {
    const { CURATED_PHOTOS } = await import("./recipePhotos");
    const ids = (Object.keys(PHASES) as PhaseId[]).flatMap(p => RECIPES[p].map(r => r.id));
    for (const id of ids) expect(CURATED_PHOTOS[id]?.url.startsWith("https://"), id).toBe(true);
  });
});
