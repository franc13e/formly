import { useState } from "react";
import { C } from "../theme";
import { SwipeToDelete } from "./SwipeToDelete";
import { metricEntries, metricSeries, metricsWithData, type HistoryMetric } from "../lib/measurementHistory";
import type { MeasurementKey, MeasurementSnapshot } from "../types";

interface MeasurementHistoryCardProps {
  history: MeasurementSnapshot[];
  /** Removes one metric's value from the snapshot on the given day. */
  onDelete: (date: string, key: MeasurementKey) => void;
}

const DAY_MS = 86400000;
const dayNum = (key: string) => new Date(key + "T12:00").getTime() / DAY_MS;
const fmt = (key: string, year = false) => new Date(key + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });
const num = (v: number) => String(Math.round(v * 10) / 10);

/** Line chart of one metric, x spaced by real dates. */
function MetricChart({ points, unit }: { points: { date: string; value: number }[]; unit: string }) {
  const [rawHover, setHover] = useState<number | null>(null);
  if (points.length < 2) {
    return <div style={{ textAlign: "center", padding: "18px 0", color: C.textSoft, fontSize: 12, fontWeight: 600 }}>Log this again on another day to see a trend</div>;
  }
  const vals = points.map(p => p.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.25, 0.5);
  const minV = lo - pad, maxV = hi + pad;
  const W = 320, H = 130, PL = 34, PR = 14, PT = 18, PB = 22;
  const t0 = dayNum(points[0].date), t1 = dayNum(points[points.length - 1].date);
  const xOf = (d: string) => PL + ((dayNum(d) - t0) / Math.max(1, t1 - t0)) * (W - PL - PR);
  const yOf = (v: number) => PT + (H - PT - PB) * (1 - (v - minV) / (maxV - minV));
  const line = points.map((p, i) => `${i ? "L" : "M"} ${xOf(p.date).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(" ");
  const last = points.length - 1;
  // The hovered point may be gone after a delete.
  const hover = rawHover !== null && rawHover <= last ? rawHover : null;
  const shown = hover ?? last;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, minHeight: 18 }}>
        {fmt(points[shown].date, true)} · <span style={{ color: C.text, fontWeight:700 }}>{num(points[shown].value)} {unit}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`From ${num(points[0].value)} ${unit} on ${fmt(points[0].date)} to ${num(points[last].value)} ${unit} on ${fmt(points[last].date)}`} onMouseLeave={() => setHover(null)}>
        {[lo, hi].map((v, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={yOf(v)} y2={yOf(v)} stroke={C.border} strokeWidth={1} strokeDasharray="3 3" />
            <text x={PL - 5} y={yOf(v) + 3} textAnchor="end" fontSize={8.5} fill={C.textSoft} fontWeight={600}>{num(v)}</text>
          </g>
        ))}
        <path d={line} fill="none" stroke={C.accentInk} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {hover !== null && <line x1={xOf(points[hover].date)} x2={xOf(points[hover].date)} y1={PT - 6} y2={H - PB} stroke={C.textSoft} strokeWidth={1} opacity={0.4} />}
        {points.map((p, i) => {
          const x = xOf(p.date), y = yOf(p.value), edge = i === 0 || i === last;
          return (
            <g key={p.date} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={12} fill="transparent" />
              <circle cx={x} cy={y} r={hover === i || i === last ? 4.5 : 3.5} fill={i === last ? C.accentInk : C.white} stroke={C.accentInk} strokeWidth={2} />
              {edge && <text x={x} y={y - 9} textAnchor={i === 0 ? "start" : "end"} fontSize={9} fill={C.text} fontWeight={600}>{num(p.value)}</text>}
              {edge && <text x={x} y={H - 6} textAnchor={i === 0 ? "start" : "end"} fontSize={8.5} fill={C.textSoft} fontWeight={600}>{fmt(p.date)}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const LIST_STEP = 8;

/** Chips per metric, a trend chart and the dated entries (newest first) with changes. */
export function MeasurementHistoryCard({ history, onDelete }: MeasurementHistoryCardProps) {
  const metrics = metricsWithData(history);
  const [picked, setPicked] = useState<HistoryMetric["k"]>("weight");
  const [showAll, setShowAll] = useState(false);
  const metric = metrics.find(m => m.k === picked) ?? metrics[0];
  if (!metric) {
    return <div className="card" style={{ marginBottom: 14 }}><div className="sec-title">History</div><div style={{ fontSize: 12, color: C.textSoft, fontWeight: 600 }}>Save your measurements and each update shows up here over time.</div></div>;
  }
  const entries = metricEntries(history, metric.k);
  const visible = showAll ? entries : entries.slice(0, LIST_STEP);
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="sec-title">History</div>
      <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {metrics.map(m => (
          <button key={m.k} className="chip" aria-pressed={m.k === metric.k} onClick={() => { setPicked(m.k); setShowAll(false); }}
            style={m.k === metric.k ? { background: C.lavender, borderColor: C.lavenderDeep, color: C.accentInk } : undefined}>{m.label}</button>
        ))}
      </div>
      <MetricChart key={metric.k} points={metricSeries(history, metric.k)} unit={metric.unit} />
      <div style={{ marginTop: 10 }}>
        {visible.map((e, i) => (
          <div key={e.date} className="row-between" style={{ padding: "7px 0", borderTop: i ? `1px solid ${C.border}` : "none", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid, flex: 1 }}>{fmt(e.date, true)}</span>
            <span style={{ fontSize: 13, fontWeight:600, color: C.text }}>{num(e.value)} {metric.unit}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textSoft, width: 74, textAlign: "right" }}>
              {e.delta === null ? "first" : e.delta === 0 ? "no change" : `${e.delta > 0 ? "↑" : "↓"} ${num(Math.abs(e.delta))} ${metric.unit}`}
            </span>
            <SwipeToDelete key={`${metric.k}-${e.date}`} onDelete={() => onDelete(e.date, metric.k)} />
          </div>
        ))}
        {entries.length > LIST_STEP && (
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={() => setShowAll(v => !v)}>
            {showAll ? "Show fewer" : `Show all ${entries.length}`}
          </button>
        )}
      </div>
    </div>
  );
}
