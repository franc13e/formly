import { describe, expect, it } from "vitest";
import { ALL_WORKOUTS } from "../data/workouts";
import type { WorkoutLogEntry } from "../types";
import { bodyBenefits, entryGroup, firstSentence, lastTrained, lastTrainedLabel, topWorkout, trainNext, GROUP_BENEFITS } from "./bodyInsights";
import { STANDARD_GROUPS } from "./workoutInsights";

let nextId = 1;
const log = (date: string, name: string, muscle = ""): WorkoutLogEntry => ({
  workoutId: name, name, emoji: "🏋️", muscle, date, time: "08:00", sets: "", reps: "", weight: "", duration: "", notes: "", id: nextId++,
});
const today = "2026-11-11";

describe("entryGroup", () => {
  it("uses the entry's own muscle, then the library, then the kind", () => {
    expect(entryGroup({ name: "Anything", muscle: "glutes" })).toBe("Glutes");
    expect(entryGroup({ name: "Hip Thrust", muscle: "" })).toBe("Glutes");
    expect(entryGroup({ name: "Morning run", muscle: "" })).toBe("Cardio");
    expect(entryGroup({ name: "Evening stretch", muscle: "" })).toBe("Recovery");
    expect(entryGroup({ name: "Mystery thing", muscle: "" })).toBeNull();
  });
});

describe("bodyBenefits", () => {
  it("groups sessions with a plain-words benefit and the workouts behind it", () => {
    const b = bodyBenefits([
      log(today, "Hip Thrust"), log(today, "Hip Thrust"), log(today, "Glute Bridge", "Glutes"), log(today, "Plank", "Core"),
    ]);
    expect(b[0]).toEqual({ group: "Glutes", benefit: GROUP_BENEFITS.Glutes, sessions: 3, workouts: ["Hip Thrust", "Glute Bridge"] });
    expect(b[1].group).toBe("Core");
  });
  it("skips entries it can't place", () => {
    expect(bodyBenefits([log(today, "Mystery thing")])).toEqual([]);
  });
});

describe("topWorkout", () => {
  it("finds the most logged workout and what it does from its guide", () => {
    const t = topWorkout([log(today, "Hip Thrust"), log(today, "Hip Thrust"), log(today, "Plank")]);
    expect(t?.name).toBe("Hip Thrust");
    expect(t?.count).toBe(2);
    expect(t?.helps).toMatch(/glutes/i);
    expect(t?.helps?.endsWith(".")).toBe(true);
  });
  it("has no helps line for your own workouts and is null for an empty log", () => {
    expect(topWorkout([log(today, "Mystery thing")])?.helps).toBeNull();
    expect(topWorkout([])).toBeNull();
  });
});

describe("firstSentence", () => {
  it("keeps the first sentence only", () => {
    expect(firstSentence("One thing. Another thing.")).toBe("One thing.");
    expect(firstSentence("No full stop")).toBe("No full stop");
  });
});

describe("lastTrained / trainNext", () => {
  it("lets a full-body session count for every group and ignores future logs", () => {
    const last = lastTrained([log("2026-11-01", "Circuit", "Full body"), log("2026-11-20", "Plank", "Core")], today);
    for (const g of STANDARD_GROUPS) expect(last.get(g)).toBe("2026-11-01");
  });

  it("suggests never-trained groups first, then the longest rested, skipping ones still recovering", () => {
    const history = [
      log("2026-11-10", "Hip Thrust"),             // Glutes, 1 day ago: recovering
      log("2026-11-01", "Barbell Squat", "Legs"),  // Legs, 10 days ago
      log("2026-11-07", "Plank", "Core"),          // Core, 4 days ago
      log("2026-11-05", "Pull Day", "Back"),       // Back, 6 days ago
    ];
    const picks = trainNext(history, ALL_WORKOUTS, null, today, 5);
    const groups = picks.map(p => p.group);
    expect(groups.slice(0, 3)).toEqual(["Chest", "Shoulders", "Arms"]); // never trained, in standard order
    expect(groups[3]).toBe("Legs");
    expect(groups).not.toContain("Glutes");
    expect(picks[0].daysAgo).toBeNull();
    expect(picks[3].daysAgo).toBe(10);
    for (const p of picks) expect(p.workout.muscle).toBe(p.group);
  });

  it("picks exercises that suit the phase when the cycle is known", () => {
    const all = (phase: "menstrual" | "ovulation") => trainNext([], ALL_WORKOUTS, { phase: { id: phase } }, today, 7);
    const level = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
    const avg = (ps: ReturnType<typeof all>) => ps.reduce((s, p) => s + level[p.workout.difficulty], 0) / ps.length;
    expect(avg(all("menstrual"))).toBeLessThan(avg(all("ovulation")));
    expect(all("ovulation")[0].reason).toBeTruthy();
  });

  it("returns nothing when every group was trained in the last two days", () => {
    expect(trainNext([log("2026-11-10", "Circuit", "Full body")], ALL_WORKOUTS, null, today)).toEqual([]);
  });
});

describe("lastTrainedLabel", () => {
  it("reads naturally", () => {
    expect(lastTrainedLabel(null)).toBe("Not trained yet");
    expect(lastTrainedLabel(1)).toBe("Last trained yesterday");
    expect(lastTrainedLabel(9)).toBe("Last trained 9 days ago");
  });
});
