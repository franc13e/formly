import type { Difficulty, PhaseId, Workout } from "../types";
import { workoutKind } from "./workoutKind";

// ─── "For your phase": library workouts ranked for the current cycle phase ──

/** What the ranking needs to know about the cycle; `CycleInfo` fits. */
export interface PhaseContext {
  phase: { id: PhaseId };
  /** 1-based day within the cycle; with `cycleLength`, tells early from late luteal. */
  dayOfCycle?: number;
  cycleLength?: number;
}

export interface PhaseSuggestion {
  workout: Workout;
  /** One short line on why it suits the phase. */
  reason: string;
}

/** The kinds the ranking tells apart: HIIT / interval work is split from steady cardio. */
type Effort = "strength" | "hiit" | "steady" | "recovery";

const HIIT = /\b(hiit|intervals?|tabata|sprints?|plyo(metrics?)?|burpees?|jump(s|ing)?|circuit blast|bootcamp)\b/i;

/** Splits a workout into the four effort types used for ranking. */
export function effortOf(w: Pick<Workout, "name" | "muscle" | "tags">): Effort {
  const kind = workoutKind(w);
  if (kind === "recovery") return "recovery";
  if (HIIT.test(`${w.name} ${w.tags.join(" ")}`)) return "hiit";
  return kind === "cardio" ? "steady" : "strength";
}

/** The last days before the next period count as late luteal. */
export const LATE_LUTEAL_DAYS = 5;

type Stage = PhaseId | "late-luteal";

/** Score per effort type and difficulty (Beginner, Intermediate, Advanced); higher ranks first. */
const SCORES: Record<Stage, Record<Effort, [number, number, number]>> = {
  // Rest first, then light strength and gentle cardio. Hard intervals sink.
  menstrual:     { recovery:[10,9,7], strength:[7,3,1], steady:[6,4,2], hiit:[1,0,0] },
  // Strength and intervals while recovery is quick; progress past beginner.
  follicular:    { strength:[6,9,8],  hiit:[7,9,8],    steady:[5,5,4], recovery:[2,2,2] },
  // Peak energy: heavier strength and high-intensity work.
  ovulation:     { strength:[4,8,10], hiit:[6,10,10],  steady:[5,5,5], recovery:[2,2,2] },
  // Moderate strength and steady cardio; recovery is welcome.
  luteal:        { strength:[7,8,3],  steady:[7,6,4],  recovery:[6,6,5], hiit:[2,1,0] },
  // Wind down: pilates, yoga and walks lead, light strength still fits.
  "late-luteal": { recovery:[10,9,8], strength:[6,4,1], steady:[6,4,2], hiit:[0,0,0] },
};

const LEVEL: Record<Difficulty, 0 | 1 | 2> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

/** Pilates gets a nudge in late luteal: calm, controlled core work. */
const PILATES = /\bpilates\b/i;

const REASONS: Record<Stage, Record<Effort, string>> = {
  menstrual: {
    recovery: "Gentle movement can ease cramps",
    strength: "Light strength, let energy set the pace",
    steady: "Easy cardio can lift your mood",
    hiit: "Only if you feel up to it",
  },
  follicular: {
    strength: "Rising energy: a good week to progress",
    hiit: "You recover faster now, push the pace",
    steady: "Build your base while energy climbs",
    recovery: "Mobility to balance harder days",
  },
  ovulation: {
    strength: "Strength tends to peak, go a little heavier",
    hiit: "High energy suits a fast, hard session",
    steady: "Enjoy a longer effort while you feel strong",
    recovery: "Balance hard training with a stretch",
  },
  luteal: {
    strength: "Steady, moderate strength fits now",
    steady: "Steady cardio, hydrate well",
    recovery: "Calm movement eases tension",
    hiit: "Keep intervals short and easy",
  },
  "late-luteal": {
    recovery: "Calm, low-intensity work before your period",
    strength: "Keep it light and maintain",
    steady: "Easy cardio can help with bloating",
    hiit: "Ease off the hard efforts now",
  },
};

function stageOf(ctx: PhaseContext): Stage {
  const { dayOfCycle, cycleLength } = ctx;
  if (ctx.phase.id === "luteal" && dayOfCycle && cycleLength && cycleLength - dayOfCycle < LATE_LUTEAL_DAYS) return "late-luteal";
  return ctx.phase.id;
}

/** Score of one workout for a phase stage (exported for tests). */
export function phaseScore(w: Workout, stage: Stage): number {
  const effort = effortOf(w);
  const base = SCORES[stage][effort][LEVEL[w.difficulty] ?? 0];
  return base + (stage === "late-luteal" && PILATES.test(w.name) ? 1 : 0);
}

/** Lower score for each pick already sharing this muscle group, so the strip stays varied. */
const REPEAT_PENALTY = 3;

/**
 * Up to `count` workouts that suit the phase, best first, with a short reason each.
 * Ranks by effort type and difficulty, prefers variety across muscle groups,
 * and keeps the library order on ties.
 */
export function suggestForPhase(workouts: Workout[], ctx: PhaseContext, count = 5): PhaseSuggestion[] {
  const stage = stageOf(ctx);
  const pool = workouts.map((workout, order) => ({ workout, order, score: phaseScore(workout, stage) }));
  const picked: typeof pool = [];
  const muscleCount = new Map<string, number>();
  while (picked.length < count && pool.length) {
    let best = 0;
    let bestValue = -Infinity;
    pool.forEach((c, i) => {
      const value = c.score - REPEAT_PENALTY * (muscleCount.get(c.workout.muscle) ?? 0);
      if (value > bestValue || (value === bestValue && c.order < pool[best].order)) { best = i; bestValue = value; }
    });
    const [chosen] = pool.splice(best, 1);
    picked.push(chosen);
    muscleCount.set(chosen.workout.muscle, (muscleCount.get(chosen.workout.muscle) ?? 0) + 1);
  }
  return picked.map(({ workout }) => ({ workout, reason: REASONS[stage][effortOf(workout)] }));
}

const STAGE_LABEL: Record<Stage, string> = {
  menstrual: "menstrual phase", follicular: "follicular phase", ovulation: "ovulation phase",
  luteal: "luteal phase", "late-luteal": "late luteal phase",
};

/** "Suits your follicular phase" */
export function phaseStripTitle(ctx: PhaseContext): string {
  return `Suits your ${STAGE_LABEL[stageOf(ctx)]}`;
}
