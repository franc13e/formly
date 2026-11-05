import type { FlowLevel, PeriodEntry } from "../types";
import { localDateKey } from "./date";

// ─── Day-by-day period editing ────────────────────────────────────────────────
// Pure helpers behind the "Your month" calendar's flow controls. Every function
// takes the history as stored (newest first) plus the current "period-start", which
// may not be in the history yet (e.g. set during onboarding), and returns a new
// history sorted newest first.

/** A period never spans more than this many days; later days start a new one. */
export const MAX_PERIOD_DAYS = 14;
/** How many days after a period's last bleeding day can still extend it. */
export const EXTEND_GAP_DAYS = 2;

const DAY_MS = 86400000;
const toDate = (key: string) => new Date(key + "T12:00:00");
const daysBetween = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY_MS);
export const addDays = (key: string, n: number) => {
  const d = toDate(key);
  d.setDate(d.getDate() + n);
  return localDateKey(d);
};
const newestFirst = (list: PeriodEntry[]) => [...list].sort((a, b) => b.date.localeCompare(a.date));

/** The history with the current start added when it is missing, newest first. */
export function withCurrentStart(history: PeriodEntry[], periodStart: string): PeriodEntry[] {
  const list = !periodStart || history.some(p => p.date === periodStart) ? history : [...history, { date: periodStart }];
  return newestFirst(list);
}

/** The latest flow day recorded on the entry, if any. */
function lastFlowDay(entry: PeriodEntry): string | undefined {
  return Object.keys(entry.flow ?? {}).sort().pop();
}

/**
 * The last bleeding day of a period: its logged end; for an open period, the typical
 * length or the latest recorded flow day, whichever is later.
 */
export function lastBleedDay(entry: PeriodEntry, periodLength: number): string {
  if (entry.end) return entry.end;
  const typical = addDays(entry.date, Math.max(1, periodLength) - 1);
  const flow = lastFlowDay(entry);
  return flow && flow > typical ? flow : typical;
}

export type PeriodSlot =
  /** The day is a bleeding day of `entry`. */
  | { kind: "inside"; entry: PeriodEntry }
  /** The day is just after `entry`'s last bleeding day, so it can extend it. */
  | { kind: "after"; entry: PeriodEntry }
  | { kind: "outside" };

/** Where `date` sits relative to the logged periods. */
export function periodSlot(history: PeriodEntry[], periodStart: string, date: string, periodLength: number): PeriodSlot {
  const entry = withCurrentStart(history, periodStart).find(p => p.date <= date);
  if (!entry || daysBetween(entry.date, date) >= MAX_PERIOD_DAYS) return { kind: "outside" };
  const last = lastBleedDay(entry, periodLength);
  if (date <= last) return { kind: "inside", entry };
  if (daysBetween(last, date) <= EXTEND_GAP_DAYS) return { kind: "after", entry };
  return { kind: "outside" };
}

/** The flow level recorded for `date`, if any. */
export function flowOn(history: PeriodEntry[], date: string): FlowLevel | undefined {
  return history.find(p => p.date <= date)?.flow?.[date];
}

const replace = (list: PeriodEntry[], entry: PeriodEntry) => newestFirst(list.map(p => (p.date === entry.date ? entry : p)));

/** Drops flow records after `end`. */
function trimFlow(flow: PeriodEntry["flow"], end: string): PeriodEntry["flow"] {
  if (!flow) return undefined;
  const kept = Object.fromEntries(Object.entries(flow).filter(([d]) => d <= end));
  return Object.keys(kept).length ? kept : undefined;
}

/**
 * Records `level` for `date`. The day must be inside a period or just after one;
 * after a closed period, the end moves to `date`. Otherwise the history is returned as is.
 */
export function setFlow(history: PeriodEntry[], periodStart: string, date: string, level: FlowLevel, periodLength: number): PeriodEntry[] {
  const slot = periodSlot(history, periodStart, date, periodLength);
  if (slot.kind === "outside") return history;
  const { entry } = slot;
  const next: PeriodEntry = { ...entry, flow: { ...entry.flow, [date]: level } };
  if (entry.end && date > entry.end) next.end = date;
  return replace(withCurrentStart(history, periodStart), next);
}

/**
 * Marks `date` as a no-flow day.
 * - On a period's first day: the period is removed (`removed` is its start).
 * - Inside a period: it ends the day before, and later flow records are dropped.
 * - Just after an open period: it ends on its last bleeding day.
 */
export function markNoFlow(history: PeriodEntry[], periodStart: string, date: string, periodLength: number): { history: PeriodEntry[]; removed: string | null } {
  const slot = periodSlot(history, periodStart, date, periodLength);
  if (slot.kind === "outside") return { history, removed: null };
  const { entry } = slot;
  const list = withCurrentStart(history, periodStart);
  if (date === entry.date) return { history: list.filter(p => p.date !== entry.date), removed: entry.date };
  if (slot.kind === "after") {
    if (entry.end) return { history, removed: null };
    return { history: replace(list, { ...entry, end: lastBleedDay(entry, periodLength) }), removed: null };
  }
  return { history: replace(list, withEnd(entry, addDays(date, -1))), removed: null };
}

function withEnd(entry: PeriodEntry, end: string): PeriodEntry {
  const next: PeriodEntry = { ...entry, end };
  const flow = trimFlow(entry.flow, end);
  if (flow) next.flow = flow;
  else delete next.flow;
  return next;
}

/**
 * Records `date` as the last bleeding day of the latest period starting on or before
 * it (flow records after it are dropped). Unchanged when no period starts by then.
 */
export function setPeriodEnd(history: PeriodEntry[], periodStart: string, date: string): PeriodEntry[] {
  const list = withCurrentStart(history, periodStart);
  const entry = list.find(p => p.date <= date);
  if (!entry) return history;
  return replace(list, withEnd(entry, date));
}

/**
 * Last bleeding day per period start, for drawing the calendar: the logged end, or the
 * latest flow day when an open period has run past the typical length.
 */
export function bleedEnds(history: PeriodEntry[], periodLength: number): Record<string, string> {
  const ends: Record<string, string> = {};
  for (const p of history) {
    const typical = addDays(p.date, Math.max(1, periodLength) - 1);
    const last = lastBleedDay(p, periodLength);
    if (p.end || last !== typical) ends[p.date] = last;
  }
  return ends;
}
