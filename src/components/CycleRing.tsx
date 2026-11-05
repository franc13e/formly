import { phaseRanges } from "../lib/cycle";
import { C, RING } from "../theme";
import type { CycleInfo } from "../types";
import { Mascot } from "./Mascot";

interface CycleRingProps {
  cycleInfo: CycleInfo;
  size?: number;
}

/** The Home hero: the cycle as a ring of phases, today's marker, the day number and the mascot. */
export function CycleRing({ cycleInfo, size = 260 }: CycleRingProps) {
  const c = size / 2, r = size * 0.42, stroke = size * 0.05;
  const L = cycleInfo.cycleLength;
  const circ = 2 * Math.PI * r, perDay = circ / L, gap = Math.min(8, perDay * 0.6);
  const day = Math.min(cycleInfo.dayOfCycle, L);
  const angle = ((day - 0.5) / L) * 2 * Math.PI - Math.PI / 2;
  const late = cycleInfo.daysLate > 0;
  const label = late ? `${cycleInfo.daysLate} day${cycleInfo.daysLate > 1 ? "s" : ""} late` : `${cycleInfo.phase.label} phase`;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Day ${cycleInfo.dayOfCycle} of about ${L}, ${label}`}>
        <circle cx={c} cy={c} r={r - stroke * 1.1} fill="#FFFFFF" />
        {phaseRanges(L, cycleInfo.periodLength).filter(p => p.end > p.start).map(p => (
          <circle key={p.id} cx={c} cy={c} r={r} fill="none" stroke={RING[p.id].arc} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${Math.max(1, (p.end - p.start) * perDay - gap)} ${circ}`} strokeDashoffset={-(p.start * perDay + gap / 2)}
            transform={`rotate(-90 ${c} ${c})`} />
        ))}
        <circle cx={c + r * Math.cos(angle)} cy={c + r * Math.sin(angle)} r={stroke * 0.85} fill="#FFFFFF" stroke={RING[cycleInfo.phase.id].mark} strokeWidth={stroke * 0.38} />
      </svg>
      <div style={{ position: "absolute", top: size * 0.2, left: 0, right: 0, textAlign: "center" }}>
        <div className="h-display" style={{ fontSize: size * 0.17, lineHeight: 1, color: C.text }}>Day {cycleInfo.dayOfCycle}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: cycleInfo.phase.textColor, marginTop: 4 }}>{label}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: size * 0.52, display: "flex", justifyContent: "center" }}>
        <Mascot phase={cycleInfo.phase.id} size={size * 0.42} />
      </div>
    </div>
  );
}
