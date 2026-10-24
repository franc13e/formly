import { useState } from "react";
import { C, ACCENT } from "../theme";
import { ALL_WORKOUTS, DIFF_COLOR } from "../data/workouts";
import { SwipeToDelete } from "../components/SwipeToDelete";
import { AICoachPanel } from "../components/AICoachPanel";
import type { CycleInfo, LoggableWorkout, Measurements, Schedule, ScheduledWorkout, Setter, ShowToast, Workout, WorkoutLogEntry, WorkoutLogForm } from "../types";

type WorkoutsTab = "schedule" | "browse" | "ai" | "history";

interface WorkoutsPageProps {
  workoutPlan: Workout[];
  setWorkoutPlan: Setter<Workout[]>;
  schedule: Schedule;
  setSchedule: Setter<Schedule>;
  workoutLog: WorkoutLogEntry[];
  setWorkoutLog: Setter<WorkoutLogEntry[]>;
  /** The saved AI coach plan text (App state, persisted under "ai-plan"), or null. */
  aiPlan: string | null;
  setAiPlan: Setter<string | null>;
  measurements: Measurements;
  cycleInfo: CycleInfo | null;
  showToast: ShowToast;
}

/** The Schedule / Browse / AI Coach / History switcher at the top of the Workouts tab. */
function TabRow({ tab, setTab }: { tab: WorkoutsTab; setTab: (tab: WorkoutsTab) => void }) {
  return (
    <div className="row" style={{gap:6,marginBottom:16,background:C.bgDeep,borderRadius:14,padding:5}}>
      {([["schedule","Schedule"],["browse","Browse"],["ai","AI Coach"],["history","History"]] as const).map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",cursor:"pointer",background:tab===v?C.white:"transparent",color:tab===v?"#7050B0":C.textSoft,fontWeight:800,fontSize:13,fontFamily:"Nunito",boxShadow:tab===v?`0 1px 6px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
export function WorkoutsPage({ workoutPlan, setWorkoutPlan, schedule, setSchedule, workoutLog, setWorkoutLog, aiPlan, setAiPlan, measurements, cycleInfo, showToast }: WorkoutsPageProps) {
  const [tab, setTab] = useState<WorkoutsTab>("schedule");
  const [logModal, setLogModal] = useState<LoggableWorkout | null>(null);
  const [logForm, setLogForm] = useState<WorkoutLogForm>({ sets:"", reps:"", weight:"", notes:"", duration:"" });
  const [customInput, setCustomInput] = useState("");
  const [pickingDay, setPickingDay] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = new Set((workoutLog||[]).filter(e=>e.date===todayStr).map(e=>e.name));

  const DAYS = Array.from({length:7}, (_,i) => {
    const d = new Date();
    const monday = d.getDate() - ((d.getDay()+6)%7);
    d.setDate(monday + i);
    return { date: d.toISOString().slice(0,10), label:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], num: d.getDate() };
  });

  const addToDay = (date: string, item: ScheduledWorkout) => setSchedule(s => ({ ...s, [date]: [...(Array.isArray(s[date])?s[date]:[]), item] }));
  const removeFromDay = (date: string, idx: number) => setSchedule(s => ({ ...s, [date]: (Array.isArray(s[date])?s[date]:[]).filter((_,i)=>i!==idx) }));

  const logWorkout = () => {
    if (!logModal) return;
    const entry = { workoutId: logModal.id||logModal.name, name: logModal.name, emoji: logModal.emoji||"🏋️", muscle: logModal.muscle||"", date: todayStr, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), sets:logForm.sets, reps:logForm.reps, weight:logForm.weight, duration:logForm.duration||logModal.duration||"", notes:logForm.notes, id:Date.now() };
    setWorkoutLog(l=>[entry,...(l||[])]);
    setLogModal(null); setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});
    showToast(`${logModal.emoji||"🏋️"} Workout logged!`);
  };

  return (
    <div className="scroll" style={{padding:"24px 24px 40px"}}>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:16}}>Workouts</div>
      <TabRow tab={tab} setTab={setTab}/>

      {tab==="schedule" && (
        <div>
          {aiPlan && (
            <div style={{background:`linear-gradient(135deg,${C.lavender},${C.rose})`,borderRadius:16,padding:"12px 14px",marginBottom:14,border:`1.5px solid ${C.lavenderDeep}`}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7050B0",marginBottom:2}}>✨ AI plan active</div>
              <div style={{fontSize:12,color:C.textMid,fontWeight:500}}>Tap any day to add workouts to your schedule.</div>
            </div>
          )}

          {/* Calendar grid header */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:800,color:C.textSoft,padding:"4px 0"}}>{d}</div>
            ))}
          </div>

          {/* Calendar day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
            {DAYS.map(day => {
              const entry = schedule[day.date];
              const items = Array.isArray(entry) ? entry : entry === "rest" ? "rest" : [];
              const isToday = day.date === todayStr;
              const isPicking = pickingDay === day.date;
              return (
                <div key={day.date} onClick={()=>setPickingDay(isPicking?null:day.date)} style={{
                  borderRadius:12, padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  cursor:"pointer", border:`1.5px solid ${isPicking?"#9070D0":isToday?C.lavenderDeep:items==="rest"?C.sageDeep:items.length?C.lavenderDeep:C.border}`,
                  background:isPicking?"#9070D0":isToday?C.lavender:items==="rest"?C.sage:items.length?C.lavender+"60":C.white,
                  transition:"all .15s",
                }}>
                  <div style={{fontSize:11,fontWeight:900,color:isPicking?"white":isToday?"#7050B0":C.text}}>{day.num}</div>
                  {items==="rest"
                    ? <div style={{fontSize:9}}>🌿</div>
                    : items.length>0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>
                        {items.slice(0,3).map((_,i)=>(
                          <div key={i} style={{width:5,height:5,borderRadius:"50%",background:isPicking?"white":"#9070D0"}}/>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Selected day detail panel */}
          {pickingDay && (()=>{
            const day = DAYS.find(d=>d.date===pickingDay);
            const items = Array.isArray(schedule[pickingDay]) ? schedule[pickingDay] : [];
            const isToday = pickingDay===todayStr;
            return (
              <div className="card slide-in" style={{marginBottom:14}}>
                <div className="row-between" style={{marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:900,fontSize:16,color:C.text}}>{day?.label}, {new Date(pickingDay+"T12:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}</div>
                    {isToday&&<div style={{fontSize:11,fontWeight:700,color:"#9070D0"}}>Today</div>}
                  </div>
                  <span style={{fontSize:13,color:C.textSoft,fontWeight:600}}>{items.length?`${items.length} workout${items.length>1?"s":""}` : "Rest day"}</span>
                </div>

                {/* Workouts for this day */}
                {items.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bgDeep,borderRadius:12,marginBottom:8}}>
                    <span style={{fontSize:20}}>{item.emoji||"🏋️"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.name}</div>
                      {item.detail&&<div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{item.detail}</div>}
                    </div>
                    <div className="row" style={{gap:6}}>
                      {isToday&&<button className="btn btn-sm" style={{background:completedToday.has(item.name)?C.sage:C.butter,color:completedToday.has(item.name)?ACCENT.fiber.text:ACCENT.carbs.text,border:"none",fontSize:11}} onClick={()=>{setLogModal(item);setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});}}>
                        {completedToday.has(item.name)?"✓ Done":"Log"}
                      </button>}
                      <button style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:16}} onClick={()=>removeFromDay(pickingDay,idx)}>×</button>
                    </div>
                  </div>
                ))}

                {/* Add workout */}
                <div style={{marginTop:8}}>
                  {/* Rest day toggle */}
                  <div className="row" style={{marginBottom:12,gap:8}}>
                    <button onClick={()=>{setSchedule(s=>({...s,[pickingDay]:s[pickingDay]==="rest"?[]:"rest"}));showToast(schedule[pickingDay]==="rest"?"Rest day removed":"Rest day set 🌿");}} style={{padding:"7px 14px",borderRadius:99,border:`1.5px solid ${schedule[pickingDay]==="rest"?C.sageDeep:C.border}`,background:schedule[pickingDay]==="rest"?C.sage:"transparent",color:schedule[pickingDay]==="rest"?ACCENT.fiber.text:C.textSoft,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Nunito",transition:"all .15s"}}>
                      🌿 {schedule[pickingDay]==="rest"?"Rest day set":"Mark as rest day"}
                    </button>
                  </div>
                  {workoutPlan.length>0&&schedule[pickingDay]!=="rest"&&(
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:6}}>Quick add from your plan:</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {workoutPlan.map(w=>(
                          <button key={w.id} onClick={()=>{addToDay(pickingDay,{name:w.name,emoji:w.emoji,detail:`${w.muscle} · ${w.duration}`});showToast("Added ✓");}} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${C.lavenderDeep}`,background:C.lavender,color:"#5040A0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"Nunito"}}>
                            {w.emoji} {w.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {schedule[pickingDay]!=="rest"&&<div className="row" style={{gap:8}}>
                    <input className="input" placeholder="Type a workout name..." value={customInput} onChange={e=>setCustomInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&customInput.trim()){addToDay(pickingDay,{name:customInput.trim(),emoji:"🏋️"});setCustomInput("");showToast("Added ✓");}}}
                      style={{fontSize:13}}/>
                    <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={()=>{if(customInput.trim()){addToDay(pickingDay,{name:customInput.trim(),emoji:"🏋️"});setCustomInput("");showToast("Added ✓");}}}>Add</button>
                  </div>}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab==="browse" && (
        <div>
          {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:14,padding:"10px 14px",marginBottom:14,border:`1.5px solid ${cycleInfo.phase.color}`}}>
            <div style={{fontSize:11,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:4}}>{cycleInfo.phase.emoji} Best for your {cycleInfo.phase.label.toLowerCase()} phase</div>
            <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.9}}>{cycleInfo.phase.workouts[0]} · {cycleInfo.phase.workouts[1]}</div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ALL_WORKOUTS.map(w=>{
              const dc=DIFF_COLOR[w.difficulty];
              const inPlan=workoutPlan.some(p=>p.id===w.id);
              return(
                <div key={w.id} className="workout-card">
                  <div className="row-between">
                    <div className="row"><span style={{fontSize:24}}>{w.emoji}</span><div><div style={{fontWeight:800,fontSize:15}}>{w.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{w.muscle} · {w.duration}</div></div></div>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:dc.bg,color:dc.text}}>{w.difficulty}</span>
                  </div>
                  {w.achieve&&<div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5,background:C.bgDeep,borderRadius:10,padding:"6px 10px"}}>{w.achieve}</div>}
                  <div className="row" style={{gap:8}}>
                    <button className={`btn btn-sm ${inPlan?"btn-ghost":"btn-primary"}`} style={{flex:1}} onClick={()=>{if(inPlan){setWorkoutPlan(p=>p.filter(x=>x.id!==w.id));showToast("Removed");}else{setWorkoutPlan(p=>[...p,w]);showToast(`${w.emoji} Added!`);}}}>
                      {inPlan?"✓ In plan":"+ Add to plan"}
                    </button>
                    <button className="btn btn-sm" style={{flex:1,background:C.butter,color:ACCENT.carbs.text,border:"none"}} onClick={()=>{setLogModal(w);setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});}}>Log workout</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="history" && (
        <div>
          {(!workoutLog||workoutLog.length===0)
            ?<div style={{textAlign:"center",padding:"40px 0",color:C.textSoft}}><div style={{fontSize:40,marginBottom:10}}>🌱</div><div style={{fontWeight:800,fontSize:15,color:C.text}}>Nothing logged yet</div><div style={{fontSize:13,marginTop:6,lineHeight:1.6}}>Every workout counts. Tap Log on any session to start tracking your progress.</div></div>
            :Object.entries((workoutLog||[]).reduce<Record<string, WorkoutLogEntry[]>>((acc,e)=>{if(!acc[e.date])acc[e.date]=[];acc[e.date].push(e);return acc;},{})).sort(([a],[b])=>b.localeCompare(a)).map(([date,entries])=>(
              <div key={date} style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:8}}>
                  {date===todayStr?"Today":new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                  <span style={{fontWeight:600,color:C.textSoft,marginLeft:8}}>{entries.length} workout{entries.length>1?"s":""}</span>
                </div>
                {entries.map(e=>(
                  <div key={e.id} className="card" style={{marginBottom:8,padding:"12px 14px"}}>
                    <div className="row" style={{gap:10}}>
                      <span style={{fontSize:22}}>{e.emoji||"🏋️"}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14}}>{e.name}</div>
                        <div style={{fontSize:11,color:C.textSoft,marginTop:3}}>{e.duration}{e.sets?` · ${e.sets} sets`:""}{e.reps?` x ${e.reps} reps`:""}{e.weight?` @ ${e.weight}kg`:""}</div>
                        {e.notes&&<div style={{fontSize:11,color:C.textMid,marginTop:4,fontStyle:"italic"}}>{e.notes}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <span style={{fontSize:10,color:C.textSoft,fontWeight:600}}>{e.time}</span>
                        <SwipeToDelete onDelete={()=>setWorkoutLog(l=>l.filter(x=>x.id!==e.id))}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}


      {tab==="ai" && <AICoachPanel measurements={measurements} cycleInfo={cycleInfo} plan={aiPlan} setPlan={setAiPlan} showToast={showToast}/>}

      {logModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setLogModal(null)}><div className="modal">
        <div className="modal-handle"/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:28}}>{logModal.emoji||"🏋️"}</span>
          <div><div className="modal-title" style={{marginBottom:0}}>{logModal.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{logModal.muscle||""}{logModal.duration?` · ${logModal.duration}`:""}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {([["sets","Sets","e.g. 3"],["reps","Reps","e.g. 12"],["weight","Weight (kg)","e.g. 40"],["duration","Duration","e.g. 30 min"]] as const).map(([k,lbl,ph])=>(
            <div key={k}><label className="label">{lbl}</label><input className="input" placeholder={ph} value={logForm[k]} onChange={e=>setLogForm(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
        </div>
        <div style={{marginBottom:14}}><label className="label">Notes (optional)</label><input className="input" placeholder="How did it feel? Any PRs?" value={logForm.notes} onChange={e=>setLogForm(p=>({...p,notes:e.target.value}))}/></div>
        {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:12,padding:"8px 12px",marginBottom:14,fontSize:12,fontWeight:600,color:cycleInfo.phase.textColor}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase: {cycleInfo.phase.workouts[0]}</div>}
        <div className="row" style={{gap:10}}><button className="btn btn-ghost" style={{flex:1}} onClick={()=>setLogModal(null)}>Cancel</button><button className="btn btn-primary" style={{flex:2}} onClick={logWorkout}>Save workout ✓</button></div>
      </div></div>}
    </div>
  );
}
