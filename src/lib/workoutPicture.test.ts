import { describe, expect, it, vi } from "vitest";
import type { WorkoutImage } from "../types";
import { builtInGuide, findLibraryWorkout, workoutPicture } from "./formTips";
import { ALL_WORKOUTS } from "../data/workouts";

const found: WorkoutImage = { url: "https://wger.de/media/x.png", title: "Plank", author: "A", license: "CC BY-SA 4", source_url: "https://wger.de/en/exercise/1/view-base" };
vi.mock("./exerciseImages", () => ({
  findExerciseImage: (name: string) => name === "Front Plank Zzz" ? found : name === "Insecure Zzz" ? { ...found, url: "http://insecure" } : null,
}));

describe("workoutPicture", () => {
  it("prefers the library workout's built-in image", () => {
    const w = ALL_WORKOUTS.find(x => builtInGuide(x).image);
    expect(w).toBeDefined();
    if (!w) return;
    expect(workoutPicture(w)).toBe(builtInGuide(findLibraryWorkout(w)).image);
    expect(workoutPicture({ name: w.name.toUpperCase() })).toBe(builtInGuide(w).image);
  });
  it("falls back to the best wger match by name, https only", () => {
    expect(workoutPicture({ name: "Front Plank Zzz" })).toBe(found);
    expect(workoutPicture({ name: "Insecure Zzz" })).toBeNull();
    expect(workoutPicture({ name: "Something unknown" })).toBeNull();
  });
});
