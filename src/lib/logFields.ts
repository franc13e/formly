import type { WorkoutLogEntry, WorkoutLogForm } from "../types";
import type { WorkoutKind } from "./workoutKind";

// ─── Which fields to ask for when logging a workout, and how to show a logged one ──

export const KIND_LABEL: Record<WorkoutKind, string> = {
  strength: "Strength",
  cardio: "Cardio",
  recovery: "Yoga & stretch",
};

/** Effort choices per kind (stored as the label). Strength uses sets/reps/weight instead. */
export const INTENSITY: Record<WorkoutKind, string[]> = {
  strength: [],
  cardio: ["Easy", "Steady", "Hard"],
  recovery: ["Gentle", "Moderate", "Deep"],
};

// Cardio where distance means something (not dance, boxing or HIIT).
const DISTANCE = /\b(run(s|ning)?|jog(s|ging)?|walk(s|ing)?|cycl(e|es|ing)|bike|biking|ride|swim(s|ming)?|row(ing|er)?|erg|hik(e|es|ing)|elliptical|skat(e|ing)|ski(ing)?|treadmill|zone ?2)\b/i;

export const tracksDistance = (name: string) => DISTANCE.test(name);

export interface LogField {
  key: "sets" | "reps" | "weight" | "duration" | "distance";
  label: string;
  inputMode: "numeric" | "decimal";
}

/** The number fields to show for this kind of workout, in order. */
export function logFields(kind: WorkoutKind, name: string): LogField[] {
  const duration: LogField = { key: "duration", label: "Duration (min)", inputMode: "numeric" };
  if (kind === "strength") {
    return [
      { key: "sets", label: "Sets", inputMode: "numeric" },
      { key: "reps", label: "Reps", inputMode: "numeric" },
      { key: "weight", label: "Weight (kg)", inputMode: "decimal" },
      duration,
    ];
  }
  if (kind === "cardio" && tracksDistance(name)) {
    return [duration, { key: "distance", label: "Distance (km)", inputMode: "decimal" }];
  }
  return [duration];
}

/** "30" → "30 min"; anything already worded ("1 hr", "30 min") is kept as typed. */
export function normalizeDuration(text: string): string {
  const t = text.trim();
  return /^\d+(\.\d+)?$/.test(t) ? `${t} min` : t;
}

const minutesIn = (duration: string): number | null => {
  const m = duration.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)?\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] ? n * 60 : n;
};

/** "5:30 /km" from a duration and a distance in km, or null when either is missing. */
export function pace(duration: string, distance: string): string | null {
  const mins = minutesIn(duration);
  const km = parseFloat(distance);
  if (!mins || !km || km <= 0) return null;
  const per = mins / km;
  let whole = Math.floor(per);
  let secs = Math.round((per - whole) * 60);
  if (secs === 60) { whole += 1; secs = 0; }
  return `${whole}:${String(secs).padStart(2, "0")} /km`;
}

/** The detail line for a logged workout: only the parts that were filled in. */
export function logSummary(e: Pick<WorkoutLogEntry, "sets" | "reps" | "weight" | "duration"> & { distance?: string; intensity?: string }): string {
  const parts: string[] = [];
  if (e.duration) parts.push(e.duration);
  if (e.distance) {
    parts.push(`${e.distance} km`);
    const p = e.duration ? pace(e.duration, e.distance) : null;
    if (p) parts.push(p);
  }
  if (e.sets || e.reps) parts.push([e.sets && `${e.sets} sets`, e.reps && `${e.reps} reps`].filter(Boolean).join(" × "));
  if (e.weight) parts.push(`${e.weight} kg`);
  if (e.intensity) parts.push(e.intensity);
  return parts.join(" · ");
}

/** Keeps only the fields that belong to the chosen kind, so switching kind mid-form doesn't save stray numbers. */
export function formForKind(form: WorkoutLogForm, kind: WorkoutKind, name: string): WorkoutLogForm {
  const keep = new Set<string>(logFields(kind, name).map(f => f.key));
  return {
    sets: keep.has("sets") ? form.sets : "",
    reps: keep.has("reps") ? form.reps : "",
    weight: keep.has("weight") ? form.weight : "",
    distance: keep.has("distance") ? form.distance : "",
    duration: form.duration,
    intensity: INTENSITY[kind].includes(form.intensity) ? form.intensity : "",
    notes: form.notes,
  };
}
