import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { C } from "../theme";
import { PHASES } from "../lib/cycle";
import { entriesInWindow, workoutInsights, type InsightWindow } from "../lib/workoutInsights";
import { bodyBenefits, lastTrainedLabel, topWorkout, trainNext, GROUP_BENEFITS } from "../lib/bodyInsights";
import type { PhaseContext } from "../lib/phaseSuggest";
import { WorkoutThumb } from "./WorkoutThumb";
import type { WorkoutKind } from "../lib/workoutKind";
import { Glyph } from "./Glyph";
import type { PhaseId, Workout, WorkoutLogEntry } from "../types";

interface WorkoutInsightsProps {
  workoutLog: WorkoutLogEntry[];
  /** Cycle phase on a YYYY-MM-DD date, or null when unknown (no cycle tracking). */
  phaseOn?: (date: string) => PhaseId | null;
  /** Library workouts to suggest from for "Train next". */
  library: Workout[];
  /** Today's cycle position, so suggestions suit the phase; null without cycle tracking. */
  phaseCtx: PhaseContext | null;
  /** Names already planned for today (shown as added). */
  plannedToday: Set<string>;
  onAddToday: (w: Workout) => void;
  onGuide: (w: Workout) => void;
}

// Soft rose-to-neutral shades for the balance bar; the accent stays on text.
const KIND_STYLE: Record<WorkoutKind, { label: string; fill: string }> = {
  strength: { label: "Strength", fill: "#EBB3C3" },
  cardio: { label: "Cardio", fill: C.roseDeep },
  recovery: { label: "Recovery", fill: "#EFE6E9" },
};
const KIND_ORDER: WorkoutKind[] = ["strength", "cardio", "recovery"];

const sectionLabel = { fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8 } as const;

/** Insights card for the History tab: muscle groups, what that training did for you, balance, training by phase, what to train next and one suggestion. */
export function WorkoutInsights({ workoutLog, phaseOn, library, phaseCtx, plannedToday, onAddToday, onGuide }: WorkoutInsightsProps) {
  const [period, setPeriod] = useState<InsightWindow>("week");
  const ins = useMemo(() => workoutInsights(workoutLog, period, phaseOn), [workoutLog, period, phaseOn]);
  const windowEntries = useMemo(() => entriesInWindow(workoutLog, period), [workoutLog, period]);
  const benefits = useMemo(() => bodyBenefits(windowEntries), [windowEntries]);
  const top = useMemo(() => topWorkout(windowEntries), [windowEntries]);
  const next = useMemo(() => trainNext(workoutLog, library, phaseCtx), [workoutLog, library, phaseCtx]);
  if (!workoutLog.length) return null;

  const phase = ins.byPhase ? PHASES[ins.byPhase.phase] : null;

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="row-between" style={{ marginBottom: 14, gap: 10 }}>
        <div className="h-display" style={{ fontSize: 22, color: C.text }}>Insights</div>
        <div role="group" aria-label="Insights period" style={{ display: "flex", background: C.bgDeep, borderRadius: 50, padding: 3 }}>
          {([["week", "This week"], ["month", "This month"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)} aria-pressed={period === v} style={{ border: "none", cursor: "pointer", borderRadius: 50, padding: "6px 12px", fontFamily: "DM Sans", fontSize: 12, fontWeight: 700, background: period === v ? C.card : "transparent", color: period === v ? C.accentInk : C.textSoft, boxShadow: period === v ? `0 2px 6px ${C.shadow}` : "none" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
        <div className="h-display" style={{ fontSize: 34, color: C.text, lineHeight: 1 }}>{ins.total}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textSoft }}>session{ins.total === 1 ? "" : "s"} {period === "week" ? "this week" : "this month"}</div>
      </div>

      {ins.total > 0 && <>
        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>Muscle groups</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ins.groups.map(g => (
              <span key={g.group} style={{ padding: "5px 11px", borderRadius: 50, fontSize: 12, fontWeight: 700, background: C.rose, color: C.text }}>
                {g.group} <span style={{ color: C.accentInk }}>×{g.count}</span>
              </span>
            ))}
          </div>
          {ins.notYet.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textSoft }}>Not yet:</span>
              {ins.notYet.map(g => (
                <span key={g} style={{ padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600, border: `1.5px dashed ${C.border}`, color: C.textSoft }}>{g}</span>
              ))}
            </div>
          )}
        </div>

        {benefits.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={sectionLabel}>What it did for your body</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}>
              {benefits.map(b => (
                <li key={b.group} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ marginTop: 6, width: 7, height: 7, borderRadius: "50%", background: C.accentInk, flexShrink: 0 }}/>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{b.benefit}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: C.textSoft, lineHeight: 1.45 }}>{b.group} · {b.sessions} session{b.sessions === 1 ? "" : "s"} · {b.workouts.join(", ")}</div>
                  </div>
                </li>
              ))}
            </ul>
            {top && top.helps && (
              <div style={{ marginTop: 12, background: C.bgDeep, borderRadius: 14, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                {top.workout && <WorkoutThumb workout={top.workout} size={40} radius={10} decorative/>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Most done: {top.name} <span style={{ color: C.accentInk }}>×{top.count}</span></div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.textMid, lineHeight: 1.5, marginTop: 2 }}>{top.helps}</div>
                </div>
                {top.workout && <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, padding: "6px 10px", fontSize: 11 }} onClick={() => top.workout && onGuide(top.workout)} aria-label={`Open guide for ${top.name}`}>Guide</button>}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>Balance</div>
          <div role="img" aria-label={KIND_ORDER.map(k => `${ins.kinds[k]} ${k}`).join(", ")} style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: C.bgDeep, gap: 2 }}>
            {KIND_ORDER.filter(k => ins.kinds[k] > 0).map(k => (
              <div key={k} style={{ flex: ins.kinds[k], background: KIND_STYLE[k].fill }}/>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
            {KIND_ORDER.map(k => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.textMid }}>
                <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: KIND_STYLE[k].fill, border: `1px solid ${C.roseDeep}` }}/>
                {KIND_STYLE[k].label} <span style={{ color: C.text, fontWeight: 700 }}>{ins.kinds[k]}</span>
              </span>
            ))}
          </div>
        </div>

        {ins.byPhase && phase && (
          <div style={{ marginBottom: 16 }}>
            <div style={sectionLabel}>By phase</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flexShrink: 0, padding: "3px 9px", borderRadius: 50, fontSize: 11, fontWeight: 700, background: phase.bg, color: phase.textColor, border: `1px solid ${phase.color}` }}>{phase.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.5 }}>{ins.byPhase.text}</span>
            </div>
          </div>
        )}
      </>}

      {next.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...sectionLabel, marginBottom: 2 }}>Train next</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: C.textSoft, marginBottom: 8 }}>
            Muscles you've rested longest{phaseCtx ? `, with exercises picked for your ${PHASES[phaseCtx.phase.id].label.toLowerCase()} phase` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {next.map(p => {
              const added = plannedToday.has(p.workout.name);
              return (
                <div key={p.group} style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "8px 10px" }}>
                  <button onClick={() => onGuide(p.workout)} aria-label={`Open guide for ${p.workout.name}`} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", borderRadius: 10, flexShrink: 0 }}>
                    <WorkoutThumb workout={p.workout} size={42} radius={10} decorative/>
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accentInk }}>{p.group} <span style={{ color: C.textSoft, fontWeight: 600 }}>· {lastTrainedLabel(p.daysAgo)}</span></div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{p.workout.name}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: C.textSoft, lineHeight: 1.4 }}>{GROUP_BENEFITS[p.group] ?? p.reason}</div>
                  </div>
                  <button className="btn btn-sm" disabled={added} onClick={() => onAddToday(p.workout)} aria-label={added ? `${p.workout.name} is planned for today` : `Add ${p.workout.name} to today`}
                    style={{ flexShrink: 0, border: "none", padding: "7px 11px", fontSize: 11, background: added ? C.rose : C.petal, color: added ? C.accentInk : C.text, display: "inline-flex", alignItems: "center", gap: 4, opacity: 1 }}>
                    {added ? <Check size={13} aria-hidden="true"/> : <Plus size={13} aria-hidden="true"/>}Today
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.rose, borderRadius: 16, padding: "12px 14px" }}>
        <Glyph emoji="✨" size={14}/>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.55 }}>{ins.suggestion}</div>
      </div>
    </div>
  );
}
