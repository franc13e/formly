import { describe, expect, it } from "vitest";
import { EXERCISE_IMAGE_INDEX } from "../data/exerciseImageIndex";
import { exerciseTokens, findExerciseImage } from "./exerciseImages";

const title = (name: string) => findExerciseImage(name)?.title ?? null;

describe("exercise image index", () => {
  it("only holds lean, credited https entries", () => {
    expect(EXERCISE_IMAGE_INDEX.length).toBeGreaterThan(200);
    for (const e of EXERCISE_IMAGE_INDEX) {
      expect(Object.keys(e).sort()).toEqual(["author", "license", "name", "source_url", "url"]);
      expect(e.url.startsWith("https://")).toBe(true);
      expect(e.source_url.startsWith("https://wger.de/")).toBe(true);
      expect(e.author && e.license && e.name).toBeTruthy();
    }
  });
});

describe("exerciseTokens", () => {
  it("normalises punctuation, plurals and synonyms", () => {
    expect(exerciseTokens("Push-Ups (Wide Grip)")).toEqual(["pushup", "wide", "grip"]);
    expect(exerciseTokens("press up")).toEqual(["pushup"]);
    expect(exerciseTokens("DB RDL")).toEqual(["dumbbell", "romanian", "deadlift"]);
    expect(exerciseTokens("OHP")).toEqual(["overhead", "press"]);
    expect(exerciseTokens("BB lunges")).toEqual(["barbell", "lunge"]);
    expect(exerciseTokens("Pullups")).toEqual(["pullup"]);
    expect(exerciseTokens("Split squats")).toEqual(["bulgarian", "split", "squat"]);
    expect(exerciseTokens("Smith machine split squat")).toEqual(["smith", "machine", "split", "squat"]);
    expect(exerciseTokens("Glute Bridge Circuit")).toEqual(["glute", "bridge"]);
  });
});

describe("findExerciseImage", () => {
  it("matches common names to the right wger exercise", () => {
    const expected: Record<string, string> = {
      "Push-Up Progression": "Push-Up",
      "pushups": "Push-Up",
      "Pull up": "Pull-ups",
      "Barbell Squat": "Barbell Full Squat",
      "Glute Bridge Circuit": "Glute Bridge",
      "Romanian Deadlift": "Romanian Deadlift",
      "rdl": "Romanian Deadlift",
      "Hip Thrust": "Dumbbell Hip Thrust",
      "Bulgarian Split Squat": "Bulgarian split squats left",
      "split squat": "Bulgarian split squats left",
      "Goblet Squat": "Dumbbell Goblet Squat",
      "Walking Lunges": "Dumbbell Lunges Walking",
      "Leg Press": "Leg Press",
      "Seated Cable Row": "Seated Cable Row",
      "DB row": "Bent Over Dumbbell Rows (Single Arm)",
      "Barbell row": "Bent Over Rowing",
      "Back extension": "Lower Back Extensions",
      "Dumbbell Bench Press": "Benchpress Dumbbells",
      "OHP": "Overhead Barbell Press",
      "Lateral Raise": "Lateral Raises",
      "Tricep Pushdown": "Triceps Pushdown",
      "Tricep Dip": "Dips",
      "Hammer Curl": "Hammer Curls",
      "Russian Twist": "Russian Twist",
      "Kettlebell swing": "Kettlebell Swing",
      "plank": "Plank",
    };
    for (const [name, want] of Object.entries(expected)) expect([name, title(name)]).toEqual([name, want]);
  });

  it("returns null for vague or unrelated names", () => {
    for (const name of ["Zone 2 Run", "Yoga Flow", "HIIT Cardio Blast", "Pull Day", "Shoulder Sculpt", "Leg day", "Chest", "Press",
      "Rowing Machine", "Jump Rope", "Incline Walk", "Gentle Walk", "Stretch & Breathe", "Arnold Press", "Dead Bug",
      "Tricep kickback", "Swimming", "", "   "]) {
      expect([name, title(name)]).toEqual([name, null]);
    }
  });

  it("keeps named muscles apart", () => {
    expect(title("Leg extension")).toBe("Leg Extension");
    expect(title("Leg curl")).toBe("Leg Curl");
    expect(title("Bicep curl")).not.toBe("Leg Curl");
  });

  it("returns a full, https WorkoutImage", () => {
    const img = findExerciseImage("Hammer curl")!;
    expect(img.url.startsWith("https://")).toBe(true);
    expect(img.source_url.startsWith("https://wger.de/")).toBe(true);
    expect(img.author && img.license).toBeTruthy();
    expect(findExerciseImage(" HAMMER CURL ")).toEqual(img);
  });
});
