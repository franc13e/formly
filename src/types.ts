import type { Dispatch, SetStateAction } from "react";

/** A React state setter, as returned by `useState`. */
export type Setter<T> = Dispatch<SetStateAction<T>>;

/** Shows a short toast message (see `useToast`). */
export type ShowToast = (message: string) => void;

// ─── Nutrition ────────────────────────────────────────────────────────────────

/** A free-text food diary entry, persisted under "food-diary". */
export interface FoodLogEntry {
  text: string;
  time: string;
  /** YYYY-MM-DD */
  date: string;
  id: number;
}

export interface CycleFoodItem {
  emoji: string;
  food: string;
  why: string;
}

export interface CycleFoodAvoidItem {
  food: string;
  why: string;
}

export interface CycleFoodGuide {
  eat: CycleFoodItem[];
  ease: CycleFoodAvoidItem[];
}

export interface GoalFoodGuide {
  focus: string[];
  examples: string[];
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export type MeasurementKey = "weight" | "height" | "waist" | "hips" | "bust" | "glutes" | "thighs" | "arms";

/**
 * Body measurements, persisted under "measurements".
 * Values are the raw strings typed into `<input type="number">` fields.
 */
export type Measurements = Partial<Record<MeasurementKey, string>>;

/** One weigh-in, persisted in "weight-history" (sorted by date ascending). */
export interface WeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weight: number;
}

/** One logged period start, persisted in "period-history" (sorted newest first). */
export interface PeriodEntry {
  /** YYYY-MM-DD */
  date: string;
}

// ─── Cycle ────────────────────────────────────────────────────────────────────

export type PhaseId = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface Phase {
  id: PhaseId;
  label: string;
  emoji: string;
  days: string;
  color: string;
  bg: string;
  textColor: string;
  tagline: string;
  body: string;
  workouts: string[];
  foods: string[];
  avoid: string[];
  weight: string;
  energy: string;
  moodNote: string;
}

/** Result of `getCycleInfo`. */
export interface CycleInfo {
  phase: Phase;
  /** 1-based day within the current cycle. */
  dayOfCycle: number;
  cycleLength: number;
  daysUntilNext: number;
  /** YYYY-MM-DD (UTC) */
  nextPeriodDate: string;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** A workout from the built-in library (`ALL_WORKOUTS`); also the shape of "workout-plan" items. */
export interface Workout {
  id: number;
  name: string;
  emoji: string;
  muscle: string;
  difficulty: Difficulty;
  duration: string;
  tags: string[];
  achieve: string;
}

/** A workout placed on a day in the schedule (from the plan or typed in by hand). */
export interface ScheduledWorkout {
  name: string;
  emoji: string;
  /** e.g. "Glutes · 25 min"; absent for custom entries. */
  detail?: string;
}

/** A day in the schedule: a list of workouts, or the literal "rest". */
export type ScheduleDay = ScheduledWorkout[] | "rest";

/** Persisted under "schedule": YYYY-MM-DD → day. Days with nothing planned are absent. */
export type Schedule = Partial<Record<string, ScheduleDay>>;

/** Anything that can be opened in the "log workout" modal: a library `Workout` or a `ScheduledWorkout`. */
export interface LoggableWorkout {
  id?: number;
  name: string;
  emoji?: string;
  muscle?: string;
  duration?: string;
  detail?: string;
}

/** One logged workout, persisted in "workout-log" (newest first). */
export interface WorkoutLogEntry {
  /** Library id, or the workout name for scheduled/custom workouts. */
  workoutId: number | string;
  name: string;
  emoji: string;
  muscle: string;
  /** YYYY-MM-DD */
  date: string;
  time: string;
  sets: string;
  reps: string;
  weight: string;
  duration: string;
  notes: string;
  id: number;
}

export interface WorkoutLogForm {
  sets: string;
  reps: string;
  weight: string;
  notes: string;
  duration: string;
}

// ─── AI coach ─────────────────────────────────────────────────────────────────

/** A selectable card (goal / activity level) in the AI coach form. */
export interface OptionCard {
  id: string;
  emoji: string;
  label: string;
  sub: string;
}

export interface FocusArea {
  id: string;
  emoji: string;
  label: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type TabId = "home" | "nutrition" | "body" | "workouts" | "settings";
