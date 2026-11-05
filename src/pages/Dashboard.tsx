import { C, ACCENT, PHASE_GROUND, RING } from "../theme";
import { CYCLE_FOODS } from "../data/nutrition";
import { WeightChart } from "../components/WeightChart";
import { Glyph } from "../components/Glyph";
import { CycleRing } from "../components/CycleRing";
import { Mascot } from "../components/Mascot";
import type { CycleInfo, Schedule, WeightEntry, WorkoutLogEntry } from "../types";
import { localDateKey } from "../lib/date";

interface DashboardProps {
  schedule: Schedule;
  weightHistory: WeightEntry[];
  cycleInfo: CycleInfo | null;
  workoutLog: WorkoutLogEntry[];
  userName: string;
  /** Typical +/- days around the next-period prediction. */
  predictionSpread: number;
  /** Logs a period that started today. */
  onPeriodStarted: () => void;
  /** Opens the Body tab (to set up cycle tracking). */
  onOpenBody: () => void;
}

const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const shift = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function Dashboard({ schedule, weightHistory, cycleInfo, workoutLog, userName, predictionSpread, onPeriodStarted, onOpenBody }: DashboardProps) {
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const todayStr = localDateKey();
  const todaySchedule = schedule[todayStr] || [];
  const isRestDay = todaySchedule === "rest";
  const todayScheduledItems = Array.isArray(todaySchedule) ? todaySchedule : [];
  const completedToday = (workoutLog || []).filter(e => e.date === todayStr).length;
  const todayLoggedWorkouts = (workoutLog || []).filter(e => e.date === todayStr);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // This week, Monday first, with a dot where a workout is planned or logged.
  const monday = shift(now, -((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = shift(monday, i), key = localDateKey(d), plan = schedule[key];
    const busy = (Array.isArray(plan) && plan.length > 0) || (workoutLog || []).some(e => e.date === key);
    return { key, num: d.getDate(), label: "MTWTFSS"[i], busy, isToday: key === todayStr };
  });

  // Next period window and fertile window for the current cycle.
  const next = cycleInfo ? new Date(cycleInfo.nextPeriodDate + "T12:00") : null;
  const cycleStart = cycleInfo ? shift(now, -(cycleInfo.dayOfCycle - 1)) : null;
  const ovDay = cycleInfo ? cycleInfo.cycleLength - 14 : 0;
  const fertileFrom = cycleStart ? shift(cycleStart, ovDay - 5) : null, fertileTo = cycleStart ? shift(cycleStart, ovDay + 1) : null;
  const inFertile = !!(fertileFrom && fertileTo && now >= fertileFrom && now <= fertileTo);
  const ground = cycleInfo ? PHASE_GROUND[cycleInfo.phase.id] : C.bg;

  return (
    <div className="scroll" style={{ padding: "28px 20px 40px", background: ground, transition: "background .4s", minHeight: "100dvh" }}>
      <style>{`@media(min-width:768px){.home-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}.home-full{grid-column:1/-1;}}`}</style>

      <div className="row-between" style={{ padding: "0 4px", marginBottom: 14 }}>
        <div>
          <div className="h-display" style={{ fontSize: 30, color: C.text, lineHeight: 1.1 }}>{greeting}{userName ? `, ${userName}` : ""}</div>
          <div style={{ fontSize: 13, color: C.textSoft, fontWeight: 600, marginTop: 2 }}>{today}</div>
        </div>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, boxShadow: `0 4px 12px ${C.shadow}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight:600, color: C.accentInk, flexShrink: 0 }}>{(userName || "F").slice(0, 1).toUpperCase()}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6, marginBottom: 16 }}>
        {week.map(d => (
          <div key={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0", borderRadius: 14, background: d.isToday ? C.petal : "rgba(255,255,255,.72)", boxShadow: d.isToday ? `0 6px 14px ${C.shadow}` : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: d.isToday ? C.text : C.textSoft }}>{d.isToday ? "Today" : d.label}</span>
            <span style={{ fontSize: 15, fontWeight:600, color: C.text }}>{d.num}</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: d.busy ? (d.isToday ? C.text : C.accentInk) : "transparent" }} />
          </div>
        ))}
      </div>

      {cycleInfo ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <CycleRing cycleInfo={cycleInfo} />
          <div className="row" style={{ gap: 14, fontSize: 12, fontWeight: 700, color: C.textSoft }}>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: RING.menstrual.arc }} />Period</span>
            <span className="row" style={{ gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: RING.ovulation.arc }} />Fertile window</span>
          </div>
          {(cycleInfo.daysLate > 0 || cycleInfo.dayOfCycle > cycleInfo.periodLength) && (
            <button className="btn" onClick={onPeriodStarted} style={{ background: C.white, color: C.accentInk, padding: "10px 18px", fontSize: 14, fontWeight:600, boxShadow: `0 4px 14px ${C.shadow}` }}>
              My period started <Glyph emoji="➕" chip={false} size={15} color="currentColor" />
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Mascot phase={null} size={110} />
          <div style={{ fontWeight:600, fontSize: 16 }}>Track your cycle</div>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>Log your last period and Formly will tune workouts and food to where you are in your cycle.</div>
          <button className="btn btn-primary" onClick={onOpenBody}>Set up cycle tracking</button>
        </div>
      )}

      {cycleInfo && cycleInfo.daysLate > 0 && (
        <div className="card" style={{ marginBottom: 14, background: C.rose }}>
          <div style={{ fontWeight:600, fontSize: 14, color: ACCENT.protein.text, marginBottom: 4 }}>Your period is {cycleInfo.daysLate} day{cycleInfo.daysLate > 1 ? "s" : ""} late</div>
          <div style={{ fontSize: 12, color: ACCENT.protein.text, fontWeight: 600, lineHeight: 1.6 }}>A few days either way is common: stress, sleep, travel and training can all shift a cycle. Tap "My period started" when it does.</div>
        </div>
      )}

      {cycleInfo && next && (
        <div className="card" style={{ marginBottom: 14, padding: 0 }}>
          <div className="row" style={{ gap: 12, padding: "14px 16px" }}>
            <Glyph emoji="💧" size={17} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Next period</span>
            <span style={{ fontSize: 14, fontWeight:600, color: C.accentInk }}>{cycleInfo.daysLate > 0 ? `Expected ${fmt(next)}` : `${fmt(shift(next, -predictionSpread))} – ${fmt(shift(next, predictionSpread))}`}</span>
          </div>
          {fertileFrom && fertileTo && <>
            <div style={{ height: 1, background: C.border, margin: "0 16px" }} />
            <div className="row" style={{ gap: 12, padding: "14px 16px" }}>
              <Glyph emoji="☀️" size={17} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Fertile window</span>
              <span style={{ fontSize: 14, fontWeight:600, color: ACCENT.carbs.text }}>{inFertile ? `Now · until ${fmt(fertileTo)}` : `${fmt(fertileFrom)} – ${fmt(fertileTo)}`}</span>
            </div>
          </>}
        </div>
      )}

      {cycleInfo && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="sec-title">Eat for this phase</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CYCLE_FOODS[cycleInfo.phase.id].eat.slice(0, 3).map((item, i) => (
              <span key={i} className="row" style={{ gap: 6, background: C.bgDeep, borderRadius: 99, padding: "7px 12px", fontSize: 13, fontWeight: 700, color: C.text }}>
                <Glyph emoji={item.emoji} chip={false} size={14} />{item.food}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div className="sec-title" style={{ margin: 0 }}>Today's workouts</div>
          {completedToday > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT.fiber.text, background: C.sage, padding: "3px 10px", borderRadius: 99 }}>✓ {completedToday} done</span>}
        </div>
        {isRestDay
          ? <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ marginBottom: 6 }}><Glyph emoji="🌿" size={20} /></div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Rest day</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Recovery is part of the plan. Enjoy it.</div>
            </div>
          : todayLoggedWorkouts.length > 0
            ? todayLoggedWorkouts.map(e => (
                <div key={e.id} className="row" style={{ padding: "8px 0", borderTop: `1px solid ${C.border}`, gap: 10 }}>
                  <Glyph emoji={e.emoji || "🏋️"} size={16} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500 }}>{e.sets && `${e.sets} sets`}{e.reps && ` × ${e.reps} reps`}{e.weight && ` @ ${e.weight}kg`}</div>
                  </div>
                  <span style={{ fontSize: 11, color: ACCENT.fiber.text, fontWeight: 700, background: C.sage, padding: "2px 8px", borderRadius: 99 }}>✓</span>
                </div>
              ))
            : todayScheduledItems.length > 0
              ? todayScheduledItems.map((item, i) => (
                  <div key={i} className="row" style={{ padding: "8px 0", borderTop: `1px solid ${C.border}`, gap: 10 }}>
                    <Glyph emoji={item.emoji || "🏋️"} size={16} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500 }}>{item.detail || ""}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 600 }}>planned</span>
                  </div>
                ))
              : <div style={{ textAlign: "center", padding: "16px 0", color: C.textSoft, fontSize: 13, fontWeight: 600 }}>
                  Nothing scheduled today <Glyph emoji="🌿" chip={false} size={13} /><br /><span style={{ fontSize: 12 }}>Head to Workouts to build your plan</span>
                </div>
        }
      </div>
      {weightHistory && weightHistory.length > 0 && <div className="card"><div className="sec-title">Weight this week</div><WeightChart history={weightHistory} cycleInfo={cycleInfo} /></div>}
    </div>
  );
}
