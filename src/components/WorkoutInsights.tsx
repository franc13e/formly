import { useMemo, useState } from "react";
import { C } from "../theme";
import { PHASES } from "../lib/cycle";
import { workoutInsights, type InsightWindow } from "../lib/workoutInsights";
import type { WorkoutKind } from "../lib/workoutKind";
import { Glyph } from "./Glyph";
import type { PhaseId, WorkoutLogEntry } from "../types";

interface WorkoutInsightsProps {
  workoutLog: WorkoutLogEntry[];
  /** Cycle phase on a YYYY-MM-DD date, or null when unknown (no cycle tracking). */
  phaseOn?: (date: string) => PhaseId | null;
}

// Soft rose-to-neutral shades for the balance bar; the accent stays on text.
const KIND_STYLE: Record<WorkoutKind, { label: string; fill: string }> = {
  strength: { label: "Strength", fill: "#EBB3C3" },
  cardio: { label: "Cardio", fill: C.roseDeep },
  recovery: { label: "Recovery", fill: "#EFE6E9" },
};
const KIND_ORDER: WorkoutKind[] = ["strength", "cardio", "recovery"];

const sectionLabel = { fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8 } as const;

/** Insights card for the History tab: muscle groups, strength/cardio/recovery balance, training by phase, one suggestion. */
export function WorkoutInsights({ workoutLog, phaseOn }: WorkoutInsightsProps) {
  const [period, setPeriod] = useState<InsightWindow>("week");
  const ins = useMemo(() => workoutInsights(workoutLog, period, phaseOn), [workoutLog, period, phaseOn]);
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

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: C.rose, borderRadius: 16, padding: "12px 14px" }}>
        <Glyph emoji="✨" size={14}/>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.55 }}>{ins.suggestion}</div>
      </div>
    </div>
  );
}
