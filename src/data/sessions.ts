import type { WorkoutSession } from "../types";

// ─── Ready-made sessions: groups of library workouts added to a day in one go ─
export const PRESET_SESSIONS: WorkoutSession[] = [
  {
    id: "p-glute-day",
    name: "Glute day",
    emoji: "🍑",
    focus: "Glutes and hamstrings",
    workoutIds: [10, 13, 11, 14, 3],
    phaseNote: "Great in follicular and ovulation, when strength peaks",
  },
  {
    id: "p-leg-day",
    name: "Leg day",
    emoji: "🦵",
    focus: "Quads, glutes and calves",
    workoutIds: [2, 17, 18, 19, 20],
    phaseNote: "Great in follicular and ovulation; go lighter late in luteal",
  },
  {
    id: "p-upper-body",
    name: "Upper body",
    emoji: "💪",
    focus: "Chest, back, shoulders and arms",
    workoutIds: [25, 21, 29, 22, 36],
    phaseNote: "Suits follicular and ovulation for heavier sets",
  },
  {
    id: "p-back-arms",
    name: "Back & arms",
    emoji: "🏋️",
    focus: "Lats, upper back, biceps and triceps",
    workoutIds: [21, 23, 22, 33, 35, 36],
  },
  {
    id: "p-core",
    name: "Core",
    emoji: "⚡",
    focus: "Deep core, obliques and back stability",
    workoutIds: [38, 41, 40, 39, 12],
    phaseNote: "Fits any phase; keep it gentle on your period",
  },
  {
    id: "p-full-body",
    name: "Full body",
    emoji: "🔥",
    focus: "Squat, push, pull, hinge and core in one session",
    workoutIds: [17, 25, 23, 11, 40],
    phaseNote: "Great in follicular and ovulation",
  },
  {
    id: "p-period-flow",
    name: "Period-friendly flow",
    emoji: "🌸",
    focus: "Gentle movement to ease cramps and tension",
    workoutIds: [48, 46, 6, 47, 49],
    phaseNote: "Made for your period and late luteal days",
  },
  {
    id: "p-cardio-core",
    name: "Cardio + core",
    emoji: "❤️",
    focus: "Intervals, then a core finisher",
    workoutIds: [42, 43, 38, 40, 39],
    phaseNote: "Best in follicular and ovulation, when energy is high",
  },
];
