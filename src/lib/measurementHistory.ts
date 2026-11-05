import type { MeasurementKey, MeasurementSnapshot, Measurements, WeightEntry } from "../types";

// ─── Measurement history ──────────────────────────────────────────────────────
// "measurement-history" holds one snapshot per day, oldest first. The weight-only
// "weight-history" (used by the Home and Body weight charts) is derived from it.

export interface HistoryMetric {
  k: Exclude<MeasurementKey, "height">;
  label: string;
  unit: string;
}

/** Metrics tracked over time, in display order. Height is not tracked. */
export const HISTORY_METRICS: HistoryMetric[] = [
  { k: "weight", label: "Weight", unit: "kg" },
  { k: "waist", label: "Waist", unit: "cm" },
  { k: "hips", label: "Hips", unit: "cm" },
  { k: "bust", label: "Bust", unit: "cm" },
  { k: "glutes", label: "Glutes", unit: "cm" },
  { k: "thighs", label: "Thighs", unit: "cm" },
  { k: "arms", label: "Arms", unit: "cm" },
];

const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);
const hasValues = (s: MeasurementSnapshot) => HISTORY_METRICS.some(m => s[m.k] !== undefined);

/** A snapshot of the tracked metrics in `measurements` (raw input strings) for `date`. */
export function snapshotFrom(measurements: Measurements, date: string): MeasurementSnapshot {
  const snap: MeasurementSnapshot = { date };
  for (const { k } of HISTORY_METRICS) {
    const v = parseFloat(String(measurements[k] ?? ""));
    if (Number.isFinite(v) && v > 0) snap[k] = v;
  }
  return snap;
}

/** Adds `snap`, replacing any snapshot for the same day; an empty snapshot just clears that day. */
export function upsertSnapshot(history: MeasurementSnapshot[], snap: MeasurementSnapshot): MeasurementSnapshot[] {
  const rest = history.filter(s => s.date !== snap.date);
  return (hasValues(snap) ? [...rest, snap] : rest).sort(byDate);
}

/** Removes one metric's value from the snapshot on `date`, dropping the snapshot when it is left empty. */
export function deleteValue(history: MeasurementSnapshot[], date: string, key: MeasurementKey): MeasurementSnapshot[] {
  return history.flatMap(s => {
    if (s.date !== date) return [s];
    const next = { ...s };
    delete next[key];
    return hasValues(next) ? [next] : [];
  });
}

/**
 * A starting history for users who logged data before the history existed: each
 * weigh-in as a weight-only snapshot, plus the current measurements. Those are put on
 * the last weigh-in's day when its weight matches (both were saved together), else on `today`.
 */
export function seedHistory(measurements: Measurements, weightHistory: WeightEntry[], today: string): MeasurementSnapshot[] {
  let history: MeasurementSnapshot[] = [];
  for (const w of weightHistory) {
    if (Number.isFinite(w.weight) && w.weight > 0) history = upsertSnapshot(history, { date: w.date, weight: w.weight });
  }
  const current = snapshotFrom(measurements, today);
  const last = history[history.length - 1];
  if (last && current.weight === last.weight) {
    history = upsertSnapshot(history, { ...last, ...current, date: last.date });
  } else if (hasValues(current)) {
    const sameDay = history.find(s => s.date === today);
    history = upsertSnapshot(history, { ...sameDay, ...current });
  }
  return history;
}

/** The weight-only history the weight charts use, oldest first. */
export function weightHistoryFrom(history: MeasurementSnapshot[]): WeightEntry[] {
  return history.flatMap(s => (s.weight !== undefined ? [{ date: s.date, weight: s.weight }] : []));
}

/** One metric's values over time, oldest first. */
export function metricSeries(history: MeasurementSnapshot[], key: MeasurementKey): { date: string; value: number }[] {
  return [...history].sort(byDate).flatMap(s => {
    const value = s[key];
    return value !== undefined ? [{ date: s.date, value }] : [];
  });
}

/** One metric's entries newest first, each with its change since the previous entry (null for the first). */
export function metricEntries(history: MeasurementSnapshot[], key: MeasurementKey): { date: string; value: number; delta: number | null }[] {
  const series = metricSeries(history, key);
  return series.map((p, i) => ({ ...p, delta: i > 0 ? Math.round((p.value - series[i - 1].value) * 10) / 10 : null })).reverse();
}

/** Metrics with at least one value in the history. */
export function metricsWithData(history: MeasurementSnapshot[]): HistoryMetric[] {
  return HISTORY_METRICS.filter(m => history.some(s => s[m.k] !== undefined));
}
