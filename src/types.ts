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

/** One message in the food chat, persisted under "food-chat". */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type RecipeKind = "meal" | "drink";

/** A curated recipe from `RECIPES` (src/data/recipes.ts). */
export interface Recipe {
  id: string;
  name: string;
  /** Short (2-3 word) photo search for the dish as it'd be photographed, e.g. "overnight oats". Falls back to `name`. */
  photoQuery?: string;
  kind: RecipeKind;
  /** An emoji from the glyph set (rendered with `<Glyph>`). */
  emoji: string;
  /** e.g. "15 min" */
  time: string;
  /** One sentence on why it helps this phase. */
  why: string;
  ingredients: string[];
  steps: string[];
}

/** A recipe written by the AI ("Make me a recipe"), parsed from its plain-text reply. */
export interface AIRecipe {
  title: string;
  /** e.g. "15 min"; empty when the reply didn't include one. */
  time: string;
  why: string;
  ingredients: string[];
  steps: string[];
}

/** An AI recipe the user saved, persisted in "saved-recipes" (newest first). */
export interface SavedRecipe extends AIRecipe {
  id: number;
  kind: RecipeKind;
  phase?: PhaseId;
  /** YYYY-MM-DD */
  savedAt: string;
}

/** Body of POST /api/recipe. */
export interface RecipeRequest {
  kind: RecipeKind;
  ingredients?: string;
  phase?: PhaseId;
  context?: string;
}

/** A Pexels food photo from GET /api/recipe-photo; `null` when there is none. */
/** A food photo from GET /api/recipe-photo, with the credit it must be shown with. */
export interface RecipePhoto {
  /** https image url. */
  url: string;
  /** "" when the creator is unknown. */
  photographer: string;
  /** https profile url, or "". */
  photographer_url: string;
  /** https page of the photo (Pexels page / Openverse foreign landing page), or "". */
  source_url: string;
  source: "Pexels" | "Openverse";
  /** Human label, e.g. "CC BY 2.0", "CC0", "Public domain", "Pexels License". */
  license: string;
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export type MeasurementKey = "weight" | "height" | "waist" | "hips" | "bust" | "glutes" | "thighs" | "arms";

/**
 * Body measurements, persisted under "measurements".
 * Values are the raw strings typed into `<input type="number">` fields.
 */
export type Measurements = Partial<Record<MeasurementKey, string>>;

/**
 * One dated set of measurements, persisted in "measurement-history" (sorted by date
 * ascending, at most one per day). Only metrics that had a value that day are present.
 */
export type MeasurementSnapshot = { date: string } & Partial<Record<MeasurementKey, number>>;

/** One weigh-in, persisted in "weight-history" (sorted by date ascending). */
export interface WeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weight: number;
}

/** One logged period, persisted in "period-history" (sorted newest first). */
export interface PeriodEntry {
  /** First day, YYYY-MM-DD */
  date: string;
  /** Last bleeding day, YYYY-MM-DD, once logged. */
  end?: string;
  /** Flow level recorded per day (YYYY-MM-DD), for days the user marked. */
  flow?: Record<string, FlowLevel>;
}

export type FlowLevel = "light" | "medium" | "heavy";

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
  /** Bleeding days the phases are based on. */
  periodLength: number;
  daysUntilNext: number;
  /** YYYY-MM-DD (UTC) */
  nextPeriodDate: string;
  /** Days past the expected start with no new period logged (0 when not late). */
  daysLate: number;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/**
 * A workout from the built-in library (`ALL_WORKOUTS`) or one the user created
 * (persisted under "custom-workouts"); also the shape of "workout-plan" items.
 */
export interface Workout {
  /** Library workouts use small ids (1, 2, ...); custom workouts use `Date.now()`-based ids, so they never collide. */
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

// ─── Workout guides ───────────────────────────────────────────────────────────

/** Form tips for a workout: built-in (`WORKOUT_GUIDES`) or from /api/form-tips (cached under "form-tips"). */
export interface FormTips {
  /** Three short form cues. */
  cues: string[];
  /** One common mistake and its fix. */
  mistake: string;
  /** What it builds and why it's worth doing. */
  helps: string;
}

/** Built-in guide content for a library workout. */
export interface WorkoutGuide extends FormTips {
  /** YouTube search terms, e.g. "barbell back squat proper form". */
  videoQuery: string;
}

/** A wger demonstration image for a library workout (see scripts/fetch_workout_images.py). */
export interface WorkoutImage {
  /** https image url */
  url: string;
  /** The wger exercise shown, e.g. "Push-Up". */
  title: string;
  author: string;
  /** e.g. "CC BY-SA 4" */
  license: string;
  /** The exercise's page on wger. */
  source_url: string;
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
