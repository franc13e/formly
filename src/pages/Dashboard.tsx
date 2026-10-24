import { C, ACCENT } from "../theme";
import { CYCLE_FOODS } from "../data/nutrition";
import { PhaseBadge } from "../components/PhaseBadge";
import { WeightChart } from "../components/WeightChart";
import type { CycleInfo, Schedule, WeightEntry, WorkoutLogEntry } from "../types";
import { localDateKey } from "../lib/date";

interface DashboardProps {
  schedule: Schedule;
  weightHistory: WeightEntry[];
  cycleInfo: CycleInfo | null;
  workoutLog: WorkoutLogEntry[];
  userName: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function Dashboard({ schedule, weightHistory, cycleInfo, workoutLog, userName }: DashboardProps) {
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const todayStr = localDateKey();
  const todaySchedule = schedule[todayStr]||[];
  const isRestDay = todaySchedule === "rest";
  const todayScheduledItems = Array.isArray(todaySchedule) ? todaySchedule : [];
  const completedToday = (workoutLog||[]).filter(e=>e.date===todayStr).length;
  const todayLoggedWorkouts = (workoutLog||[]).filter(e=>e.date===todayStr);
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning ☀️":h<17?"Good afternoon 🌤️":"Good evening 🌙";};
  const weekStreak = (() => {
    const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return localDateKey(d);});
    return days.filter(d=>(workoutLog||[]).some(e=>e.date===d)).length;
  })();

  return (
    <div className="scroll" style={{padding:"32px 24px 40px"}}>
      <style>{`@media(min-width:768px){.home-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}.home-full{grid-column:1/-1;}}`}</style>
      <div style={{marginBottom:cycleInfo?10:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:22,fontWeight:900,color:C.text}}>{greet()}{userName?`, ${userName}`:""}</div>
        </div>
        <div className="row-between" style={{marginTop:2}}>
          <div style={{fontSize:13,color:C.textSoft,fontWeight:500}}>{today}</div>
          {weekStreak>0&&<div style={{fontSize:12,fontWeight:700,color:ACCENT.carbs.text}}>🔥 {weekStreak} day{weekStreak>1?"s":""} this week</div>}
        </div>
      </div>
      {cycleInfo&&<div style={{marginBottom:10}}><PhaseBadge cycleInfo={cycleInfo}/></div>}
      {cycleInfo && (
        <div className="card" style={{marginBottom:14,background:cycleInfo.phase.bg,border:`1.5px solid ${cycleInfo.phase.color}`}}>
          <div style={{fontWeight:800,fontSize:13,color:cycleInfo.phase.textColor,marginBottom:8}}>
            {cycleInfo.phase.emoji} What to eat this phase
          </div>
          {CYCLE_FOODS[cycleInfo.phase.id].eat.slice(0,3).map((item,i)=>(
            <div key={i} className="row" style={{gap:8,padding:"4px 0",alignItems:"flex-start"}}>
              <span style={{fontSize:14,flexShrink:0}}>{item.emoji}</span>
              <span style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:600,opacity:.9}}>{item.food}</span>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:11,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.7}}>See Nutrition for the full breakdown</div>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div className="row-between" style={{marginBottom:12}}>
          <div className="sec-title" style={{margin:0}}>Today's workouts</div>
          {completedToday>0&&<span style={{fontSize:12,fontWeight:700,color:ACCENT.fiber.text,background:C.sage,padding:"3px 10px",borderRadius:99}}>✓ {completedToday} done</span>}
        </div>
        {isRestDay
          ? <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:28,marginBottom:6}}>🌿</div>
              <div style={{fontWeight:700,fontSize:14,color:C.text}}>Rest day</div>
              <div style={{fontSize:12,color:C.textSoft,marginTop:4}}>Recovery is part of the plan. Enjoy it.</div>
            </div>
          : todayLoggedWorkouts.length > 0
            ? todayLoggedWorkouts.map(e=>(
                <div key={e.id} className="row" style={{padding:"8px 0",borderTop:`1px solid ${C.border}`,gap:10}}>
                  <span style={{fontSize:22}}>{e.emoji||"🏋️"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{e.name}</div>
                    <div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{e.sets&&`${e.sets} sets`}{e.reps&&` × ${e.reps} reps`}{e.weight&&` @ ${e.weight}kg`}</div>
                  </div>
                  <span style={{fontSize:11,color:ACCENT.fiber.text,fontWeight:700,background:C.sage,padding:"2px 8px",borderRadius:99}}>✓</span>
                </div>
              ))
            : todayScheduledItems.length > 0
              ? todayScheduledItems.map((item,i)=>(
                  <div key={i} className="row" style={{padding:"8px 0",borderTop:`1px solid ${C.border}`,gap:10}}>
                    <span style={{fontSize:22}}>{item.emoji||"🏋️"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{item.name}</div>
                      <div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{item.detail||""}</div>
                    </div>
                    <span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>planned</span>
                  </div>
                ))
              : <div style={{textAlign:"center",padding:"16px 0",color:C.textSoft,fontSize:13,fontWeight:600}}>
                  Nothing scheduled today 🌿<br/><span style={{fontSize:12}}>Head to Workouts to build your plan</span>
                </div>
        }
      </div>
      {weightHistory&&weightHistory.length>0&&<div className="card"><div className="sec-title">Weight this week</div><WeightChart history={weightHistory} cycleInfo={cycleInfo}/></div>}
    </div>
  );
}
