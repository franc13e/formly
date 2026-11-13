import type { MeasurementSnapshot, PeriodEntry, WorkoutLogEntry } from "../types";
import { cycleStats, periodLengthFrom, periodStarts } from "./cycle";
import { addDays } from "./workouts";
import { entryGroup } from "./workoutInsights";
import { workoutKind, type WorkoutKind } from "./workoutKind";
import { logSummary } from "./logFields";
import { HISTORY_METRICS, metricSeries } from "./measurementHistory";

// ─── "Your Formly report": the numbers behind the PDF, kept pure so they can be tested ──

export interface ReportInput {
  userName: string;
  periodHistory: PeriodEntry[];
  periodStart: string;
  cycleLengthSetting: number;
  periodLengthSetting: number;
  workoutLog: WorkoutLogEntry[];
  measurementHistory: MeasurementSnapshot[];
}

export interface ReportPeriod { start: string; end: string | null; days: number | null; cycleDays: number | null }

export interface Report {
  name: string;
  generated: string;
  cycle: {
    tracked: boolean;
    averageCycle: number;
    cyclesLogged: number;
    averagePeriod: number;
    periodsLogged: number;
    shortest: number | null;
    longest: number | null;
    nextPeriod: string | null;
    /** Newest first, at most 12. */
    periods: ReportPeriod[];
  };
  workouts: {
    total: number;
    last30: number;
    activeDays30: number;
    perWeek90: number;
    kinds: Record<WorkoutKind, number>;
    /** Muscle groups trained in the last 90 days, most first. */
    groups: { group: string; count: number }[];
    /** Newest first, at most 25. */
    recent: { date: string; name: string; detail: string }[];
  };
  body: { label: string; unit: string; first: number; latest: number; change: number; since: string; entries: number }[];
}

const dayDiff = (a: string, b: string) => Math.round((new Date(b + "T12:00").getTime() - new Date(a + "T12:00").getTime()) / 86400000);

export function buildReport(input: ReportInput, today: string): Report {
  // ── Cycle ──
  const starts = periodStarts(input.periodHistory, input.periodStart);
  const stats = cycleStats(starts, input.cycleLengthSetting);
  const plen = periodLengthFrom(input.periodHistory, input.periodLengthSetting);
  const endFor = new Map(input.periodHistory.map(p => [p.date, p.end ?? null]));
  const periods: ReportPeriod[] = starts.map((start, i) => {
    const end = endFor.get(start) ?? null;
    const next = starts[i + 1];
    const cycleDays = next ? dayDiff(start, next) : null;
    return { start, end, days: end && end >= start ? dayDiff(start, end) + 1 : null, cycleDays: cycleDays && cycleDays <= 50 ? cycleDays : null };
  }).reverse();
  const lengths = periods.map(p => p.cycleDays).filter((n): n is number => n !== null);
  const latest = starts[starts.length - 1];
  let nextPeriod: string | null = null;
  if (latest) {
    nextPeriod = addDays(latest, stats.length);
    // Roll forward past today if a period or two went unlogged.
    for (let i = 0; nextPeriod < today && i < 3; i++) nextPeriod = addDays(nextPeriod, stats.length);
    if (nextPeriod < today) nextPeriod = null;
  }

  // ── Workouts ──
  const log = [...input.workoutLog].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const from30 = addDays(today, -29), from90 = addDays(today, -89);
  const in30 = log.filter(e => e.date >= from30 && e.date <= today);
  const in90 = log.filter(e => e.date >= from90 && e.date <= today);
  const kinds: Record<WorkoutKind, number> = { strength: 0, cardio: 0, recovery: 0 };
  const groups = new Map<string, number>();
  for (const e of in90) {
    kinds[e.kind ?? workoutKind({ name: e.name, muscle: e.muscle })] += 1;
    const g = entryGroup(e);
    if (g) groups.set(g, (groups.get(g) ?? 0) + 1);
  }

  // ── Body ──
  const body = HISTORY_METRICS.flatMap(m => {
    const s = metricSeries(input.measurementHistory, m.k);
    if (!s.length) return [];
    const first = s[0], last = s[s.length - 1];
    return [{ label: m.label, unit: m.unit, first: first.value, latest: last.value, change: Math.round((last.value - first.value) * 10) / 10, since: first.date, entries: s.length }];
  });

  return {
    name: input.userName.trim(),
    generated: today,
    cycle: {
      tracked: starts.length > 0,
      averageCycle: stats.length,
      cyclesLogged: stats.cyclesLogged,
      averagePeriod: plen.length,
      periodsLogged: plen.logged,
      shortest: lengths.length ? Math.min(...lengths) : null,
      longest: lengths.length ? Math.max(...lengths) : null,
      nextPeriod,
      periods: periods.slice(0, 12),
    },
    workouts: {
      total: log.length,
      last30: in30.length,
      activeDays30: new Set(in30.map(e => e.date)).size,
      perWeek90: Math.round((in90.length / (90 / 7)) * 10) / 10,
      kinds,
      groups: [...groups].map(([group, count]) => ({ group, count })).sort((a, b) => b.count - a.count || a.group.localeCompare(b.group)),
      recent: log.slice(0, 25).map(e => ({ date: e.date, name: e.name, detail: logSummary(e) })),
    },
    body,
  };
}

/** "2026-11-14" → "14 Nov 2026". */
export function reportDate(key: string): string {
  return new Date(key + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
