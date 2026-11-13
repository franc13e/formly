import { useMemo, useState } from "react";
import { CalendarPlus, Minus, Plus, RefreshCw, Sparkles } from "lucide-react";
import { C, RING } from "../theme";
import { ALL_WORKOUTS } from "../data/workouts";
import { PHASES } from "../lib/cycle";
import { callPlanWeek } from "../lib/api";
import { load, save } from "../lib/storage";
import { addItemsToDay, toScheduled } from "../lib/sessions";
import { addDays } from "../lib/workouts";
import { workoutKind } from "../lib/workoutKind";
import {
  ENERGY, FEELINGS, checkInAdvice, coachContext, planFromAi, planRequest, planWeek, weekRecap,
  type AiPlan, type CheckIn, type PlanDay, type PlanOptions,
} from "../lib/coach";
import type { PhaseContext } from "../lib/phaseSuggest";
import { Glyph } from "./Glyph";
import { FoodChat } from "./FoodChat";
import type { CycleInfo, Schedule, ScheduledWorkout, Setter, ShowToast, Workout, WorkoutLogEntry } from "../types";

interface CoachPanelProps {
  cycleInfo: CycleInfo | null;
  /** Cycle details on any date (for planning ahead), or null when unknown. */
  ctxOn: (date: string) => PhaseContext | null;
  schedule: Schedule;
  setSchedule: Setter<Schedule>;
  workoutLog: WorkoutLogEntry[];
  today: string;
  showToast: ShowToast;
}

interface SavedCheckIn extends CheckIn { date: string }
interface SavedWeek extends AiPlan { start: string; source: "ai" | "offline" }

const card = { marginBottom: 14 } as const;
const h = { fontWeight: 700, fontSize: 15, color: C.text } as const;
const sub = { fontSize: 12, color: C.textSoft, fontWeight: 500, lineHeight: 1.5 } as const;
const dayLabel = (d: string) => new Date(d + "T12:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

/** The Coach tab: today's check-in, this week's recap, "Plan my week" and a training chat. */
export function CoachPanel({ cycleInfo, ctxOn, schedule, setSchedule, workoutLog, today, showToast }: CoachPanelProps) {
  const [checkIn, setCheckIn] = useState<SavedCheckIn | null>(() => {
    const c = load<SavedCheckIn | null>("coach-checkin", null);
    return c && c.date === today ? c : null;
  });
  const [draftFeelings, setDraftFeelings] = useState<string[]>(checkIn?.feelings ?? []);
  const [sessions, setSessions] = useState<number>(() => load<number>("coach-sessions", 3));
  const [week, setWeek] = useState<SavedWeek | null>(() => {
    const w = load<SavedWeek | null>("coach-week", null);
    return w && addDays(w.start, 6) >= today ? w : null;
  });
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const todayItems = Array.isArray(schedule[today]) ? (schedule[today] as ScheduledWorkout[]) : [];
  const ctxToday = cycleInfo ?? ctxOn(today);
  const advice = checkIn ? checkInAdvice(checkIn, ctxToday, todayItems, ALL_WORKOUTS, workoutLog, today) : null;
  const recap = useMemo(() => weekRecap(workoutLog, today), [workoutLog, today]);
  const context = coachContext(workoutLog, today, checkIn, ctxToday);

  const saveCheckIn = (c: SavedCheckIn | null) => { setCheckIn(c); save("coach-checkin", c); };
  const pickEnergy = (energy: CheckIn["energy"]) => saveCheckIn({ date: today, energy, feelings: draftFeelings });
  const toggleFeeling = (f: string) => {
    const next = draftFeelings.includes(f) ? draftFeelings.filter(x => x !== f) : [...draftFeelings, f];
    setDraftFeelings(next);
    if (checkIn) saveCheckIn({ ...checkIn, feelings: next });
  };

  const addToday = (w: Workout) => { setSchedule(s => addItemsToDay(s, today, [toScheduled(w)])); showToast(`Added ${w.name} to today`); };
  const swapToday = (w: Workout) => {
    // Keep anything gentle already planned; swap out the harder items.
    setSchedule(s => {
      const cur = Array.isArray(s[today]) ? (s[today] as ScheduledWorkout[]) : [];
      const keep = cur.filter(p => workoutKind({ name: p.name, muscle: p.detail ?? "" }) === "recovery");
      return { ...s, [today]: [...keep, toScheduled(w)] };
    });
    showToast(`Swapped today for ${w.name}`);
  };
  const restToday = () => { setSchedule(s => ({ ...s, [today]: "rest" })); showToast("Today is a rest day"); };

  const options: PlanOptions = { start: today, sessions, ctxOn: d => (d === today ? ctxToday : ctxOn(d)), library: ALL_WORKOUTS, log: workoutLog, energy: checkIn?.energy ?? null };
  const planDays: PlanDay[] | null = week ? planFromAi(week, { ...options, start: week.start }) : null;

  const makePlan = async () => {
    setPlanning(true);
    setPlanError(null);
    let next: SavedWeek;
    try {
      const ai = await callPlanWeek(planRequest(options, context));
      next = { ...ai, start: today, source: "ai" };
    } catch (e) {
      // The plan still works without AI: fall back to the built-in planner.
      console.error(e);
      const offline = planWeek(options);
      next = { start: today, source: "offline", summary: "Here's a balanced week built around your phase and the muscles you've rested longest.",
        days: offline.map(d => ({ date: d.date, ids: d.workouts.map(w => w.id), note: d.note })) };
      setPlanError("The AI coach couldn't be reached, so this plan was made on your phone.");
    }
    setWeek(next); save("coach-week", next);
    setPlanning(false);
  };

  const addWeek = () => {
    if (!planDays) return;
    setSchedule(s => planDays.reduce((acc, d) => {
      const day = acc[d.date];
      const have = new Set(Array.isArray(day) ? day.map(x => x.name) : []);
      return addItemsToDay(acc, d.date, d.workouts.filter(w => !have.has(w.name)).map(w => toScheduled(w, "Coach plan")));
    }, s));
    showToast("Your week is in the schedule");
  };

  const setSessionCount = (n: number) => { const v = Math.max(1, Math.min(6, n)); setSessions(v); save("coach-sessions", v); };

  return (
    <div>
      {/* ── Today's check-in ── */}
      <div className="card" style={card}>
        <div style={h}>How are you feeling today?</div>
        <div style={{ ...sub, marginTop: 2, marginBottom: 12 }}>Your coach adjusts today's workout to match.</div>
        <div role="radiogroup" aria-label="Energy today" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {ENERGY.map(e => {
            const on = checkIn?.energy === e.id;
            return (
              <button key={e.id} type="button" role="radio" aria-checked={on} onClick={() => pickEnergy(e.id)}
                style={{ padding: "12px 4px", borderRadius: 14, cursor: "pointer", fontFamily: "DM Sans", fontWeight: 700, fontSize: 14,
                  border: `2px solid ${on ? C.accentInk : C.border}`, background: on ? C.lavender : C.white, color: on ? C.accentDeep : C.textMid }}>
                {e.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }} role="group" aria-label="Anything else?">
          {FEELINGS.map(f => {
            const on = draftFeelings.includes(f);
            return <button key={f} type="button" aria-pressed={on} className="chip" onClick={() => toggleFeeling(f)}
              style={on ? { background: C.lavenderDeep, borderColor: "transparent", color: C.accentDeep } : undefined}>{f}</button>;
          })}
        </div>

        {advice && (
          <div className="slide-in" style={{ marginTop: 14, padding: "14px", borderRadius: 16, background: advice.tone === "gentle" ? C.rose : advice.tone === "go" ? C.sage : C.bgDeep }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>{advice.title}</div>
            <div style={{ fontSize: 13, color: C.textMid, fontWeight: 500, lineHeight: 1.6 }}>{advice.text}</div>
            {(advice.swaps.length > 0 || advice.suggest) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {todayItems.length > 0 && advice.swaps.map(w => (
                  <button key={w.id} className="btn btn-ghost btn-sm" onClick={() => swapToday(w)}>
                    <RefreshCw size={13} aria-hidden="true"/> Swap for {w.name}
                  </button>
                ))}
                {advice.tone === "gentle" && todayItems.length > 0 && <button className="btn btn-ghost btn-sm" onClick={restToday}>Make it a rest day</button>}
                {advice.suggest && <button className="btn btn-primary btn-sm" onClick={() => addToday(advice.suggest!)}><Plus size={14} aria-hidden="true"/> Add {advice.suggest.name} to today</button>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── This week so far ── */}
      <div className="card" style={{ ...card, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ textAlign: "center", minWidth: 56 }}>
          <div className="h-display" style={{ fontSize: 34, lineHeight: 1, color: C.accentInk }}>{recap.thisWeek}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSoft, marginTop: 4 }}>THIS WEEK</div>
        </div>
        <div style={{ fontSize: 13, color: C.textMid, fontWeight: 500, lineHeight: 1.6 }}>{recap.line}</div>
      </div>

      {/* ── Plan my week ── */}
      <div className="card" style={card}>
        <div className="row-between" style={{ alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={h}>Plan my week</div>
            <div style={{ ...sub, marginTop: 2 }}>7 days fitted to your cycle, energy and the muscles you've rested.</div>
          </div>
        </div>
        <div className="row" style={{ gap: 10, margin: "14px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.textMid, flex: 1 }}>Workout days</span>
          <button className="btn btn-ghost btn-sm" aria-label="Fewer workout days" onClick={() => setSessionCount(sessions - 1)} disabled={sessions <= 1} style={{ width: 36, height: 36, padding: 0 }}><Minus size={15}/></button>
          <span aria-live="polite" style={{ fontWeight: 700, fontSize: 16, minWidth: 18, textAlign: "center", color: C.text }}>{sessions}</span>
          <button className="btn btn-ghost btn-sm" aria-label="More workout days" onClick={() => setSessionCount(sessions + 1)} disabled={sessions >= 6} style={{ width: 36, height: 36, padding: 0 }}><Plus size={15}/></button>
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => void makePlan()} disabled={planning}>
          {planning ? <><div className="spin"/> Planning your week…</> : <><Sparkles size={16} aria-hidden="true"/> {week ? "Plan again" : "Plan my week"}</>}
        </button>

        {planDays && week && (
          <div className="slide-in" style={{ marginTop: 16 }}>
            {planError && <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 600, marginBottom: 8 }}>{planError}</div>}
            {week.summary && <div style={{ fontSize: 13, color: C.textMid, fontWeight: 500, lineHeight: 1.6, marginBottom: 12 }}>{week.summary}</div>}
            <div style={{ display: "grid", gap: 8 }}>
              {planDays.map(d => {
                const ph = d.ctx?.phase.id;
                return (
                  <div key={d.date} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 14, background: d.workouts.length ? C.bgDeep : "transparent", border: d.workouts.length ? "none" : `1.5px dashed ${C.border}` }}>
                    <div style={{ width: 54, flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: d.date === today ? C.accentInk : C.text }}>{d.date === today ? "Today" : dayLabel(d.date)}</div>
                      {ph && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: C.textSoft, marginTop: 3 }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: RING[ph].mark }}/>{PHASES[ph].label}
                      </div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {d.workouts.length ? d.workouts.map(w => (
                        <div key={w.id} className="row" style={{ gap: 8, marginBottom: 4 }}>
                          <Glyph emoji={w.emoji} size={12}/>
                          <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{w.name}</span>
                          <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 600 }}>{w.muscle}</span>
                        </div>
                      )) : <div style={{ fontWeight: 700, fontSize: 13, color: C.textSoft }}>Rest</div>}
                      {d.note && <div style={{ ...sub, marginTop: 2 }}>{d.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={addWeek}>
              <CalendarPlus size={16} aria-hidden="true"/> Add to my schedule
            </button>
          </div>
        )}
      </div>

      {/* ── Chat ── */}
      <div className="card" style={card}>
        <FoodChat cycleInfo={cycleInfo} topic="training" extraContext={context}/>
      </div>
    </div>
  );
}
