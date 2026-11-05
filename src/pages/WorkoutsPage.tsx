import { useEffect, useState } from "react";
import { ArrowRightLeft, BookOpen, Pencil, Plus } from "lucide-react";
import { C, ACCENT } from "../theme";
import { ALL_WORKOUTS, DIFF_COLOR } from "../data/workouts";
import { SwipeToDelete } from "../components/SwipeToDelete";
import { Glyph } from "../components/Glyph";
import { AICoachPanel } from "../components/AICoachPanel";
import { MonthCalendar, type DayLook } from "../components/MonthCalendar";
import { CustomWorkoutModal } from "../components/CustomWorkoutModal";
import { WorkoutGuide, type GuideTarget } from "../components/WorkoutGuide";
import { WorkoutInsights } from "../components/WorkoutInsights";
import type { CycleInfo, LoggableWorkout, PhaseId, Measurements, Schedule, ScheduledWorkout, Setter, ShowToast, Workout, WorkoutLogEntry, WorkoutLogForm } from "../types";
import { localDateKey } from "../lib/date";
import { load, save } from "../lib/storage";
import { addDays, groupLogByDate, logStreak, monthStats, moveInSchedule, weekOf } from "../lib/workouts";
import { builtInGuide, cachedFormTips, findLibraryWorkout } from "../lib/formTips";

type WorkoutsTab = "schedule" | "browse" | "ai" | "history";
type ScheduleView = "week" | "month";

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
  /** Opens the food coach with a question (from a workout guide's "Ask the food coach"). */
  onAskCoach?: (question: string) => void;
  /** Cycle phase on a YYYY-MM-DD date, or null when unknown; feeds the History insights. */
  phaseOn?: (date: string) => PhaseId | null;
}

/** The Schedule / Browse / AI Coach / History switcher at the top of the Workouts tab. */
function TabRow({ tab, setTab }: { tab: WorkoutsTab; setTab: (tab: WorkoutsTab) => void }) {
  return (
    <div className="row" style={{gap:6,marginBottom:16,background:C.bgDeep,borderRadius:14,padding:5}}>
      {([["schedule","Schedule"],["browse","Browse"],["ai","AI Coach"],["history","History"]] as const).map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",cursor:"pointer",background:tab===v?C.white:"transparent",color:tab===v?"#A95C76":C.textSoft,fontWeight:600,fontSize:13,fontFamily:"DM Sans",boxShadow:tab===v?`0 1px 6px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

/** "Thu, Nov 12" */
const shortDate = (date: string) => new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
/** Timestamp id for a new log entry (kept outside the component so the React compiler's purity check doesn't flag the click handler). */
const newLogId = () => Date.now();
const EMPTY_LOG_FORM: WorkoutLogForm = { sets:"", reps:"", weight:"", notes:"", duration:"" };
const iconBtn = { background:"none", border:"none", color:C.textSoft, cursor:"pointer", padding:4, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:8 } as const;

/** A guide target for a scheduled item: the library workout when the name matches one, else the item itself. */
const guideTargetFor = (item: ScheduledWorkout): GuideTarget => findLibraryWorkout(item) ?? { name:item.name, emoji:item.emoji };
/** The first form cue for a workout: built-in, or cached AI tips; undefined when there are none yet. */
const firstCue = (w: GuideTarget) => builtInGuide(findLibraryWorkout(w)).guide?.cues[0] ?? cachedFormTips(w.name)?.cues[0];

// ══════════════════════════════════════════════════════════════════════════════
// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
export function WorkoutsPage({ workoutPlan, setWorkoutPlan, schedule, setSchedule, workoutLog, setWorkoutLog, aiPlan, setAiPlan, measurements, cycleInfo, showToast, onAskCoach, phaseOn }: WorkoutsPageProps) {
  const [tab, setTab] = useState<WorkoutsTab>("schedule");
  const [logModal, setLogModal] = useState<LoggableWorkout | null>(null);
  const [logForm, setLogForm] = useState<WorkoutLogForm>(EMPTY_LOG_FORM);
  const [customInput, setCustomInput] = useState("");
  const [pickingDay, setPickingDay] = useState<string | null>(null);
  const [scheduleView, setScheduleView] = useState<ScheduleView>("week");
  const [movingIdx, setMovingIdx] = useState<number | null>(null);
  const [moveDate, setMoveDate] = useState("");
  const [historyDay, setHistoryDay] = useState<string | null>(null);
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>(()=>load("custom-workouts",[]));
  const [customModal, setCustomModal] = useState<{ initial: Workout | null } | null>(null);
  const [guideFor, setGuideFor] = useState<GuideTarget | null>(null);
  useEffect(()=>{save("custom-workouts",customWorkouts);},[customWorkouts]);

  const todayStr = localDateKey();
  const completedToday = new Set((workoutLog||[]).filter(e=>e.date===todayStr).map(e=>e.name));

  const currentPhase: PhaseId | null = cycleInfo?.phase.id ?? null;
  // "Form tips for today": today's planned workouts, else the next planned day within a week.
  const tipsDay = Array.from({length:7},(_,i)=>addDays(todayStr,i)).find(d=>{const e=schedule[d];return Array.isArray(e)&&e.length>0;});
  const tipsEntry = tipsDay ? schedule[tipsDay] : undefined;
  const tipsItems = Array.isArray(tipsEntry) ? tipsEntry : [];

  const DAYS = weekOf(todayStr).map((date,i) => ({ date, label:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], num: new Date(date+"T12:00").getDate() }));

  const addToDay = (date: string, item: ScheduledWorkout) => setSchedule(s => ({ ...s, [date]: [...(Array.isArray(s[date])?s[date]:[]), item] }));
  const removeFromDay = (date: string, idx: number) => { setSchedule(s => ({ ...s, [date]: (Array.isArray(s[date])?s[date]:[]).filter((_,i)=>i!==idx) })); setMovingIdx(null); };
  const moveItem = (from: string, idx: number, to: string) => {
    if (!to || to===from) return;
    setSchedule(s => moveInSchedule(s, from, idx, to));
    setMovingIdx(null); setMoveDate("");
    showToast(`Moved to ${shortDate(to)}`);
  };
  const selectDay = (date: string) => { setPickingDay(p => p===date ? null : date); setMovingIdx(null); };
  const openLog = (w: LoggableWorkout) => { setLogModal(w); setLogForm(EMPTY_LOG_FORM); };

  const logWorkout = () => {
    if (!logModal) return;
    const entry = { workoutId: logModal.id||logModal.name, name: logModal.name, emoji: logModal.emoji||"🏋️", muscle: logModal.muscle||"", date: todayStr, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), sets:logForm.sets, reps:logForm.reps, weight:logForm.weight, duration:logForm.duration||logModal.duration||"", notes:logForm.notes, id:newLogId() };
    setWorkoutLog(l=>[entry,...(l||[])]);
    setLogModal(null); setLogForm(EMPTY_LOG_FORM);
    showToast("Workout logged!");
  };

  const saveCustomWorkout = (w: Workout) => {
    const exists = customWorkouts.some(x=>x.id===w.id);
    setCustomWorkouts(list => exists ? list.map(x=>x.id===w.id?w:x) : [w,...list]);
    if (exists) setWorkoutPlan(p=>p.map(x=>x.id===w.id?w:x));
    setCustomModal(null);
    showToast(exists?"Workout updated":"Workout created ✓");
  };
  const deleteCustomWorkout = (id: number) => {
    setCustomWorkouts(list=>list.filter(x=>x.id!==id));
    setWorkoutPlan(p=>p.filter(x=>x.id!==id));
    showToast("Workout deleted");
  };

  /** Month-view look for a schedule day: dots for planned workouts, a leaf for rest. */
  const scheduleLook = (date: string): DayLook => {
    const entry = schedule[date];
    const isToday = date===todayStr;
    if (entry==="rest") return { background:C.bgDeep, border:`1.5px solid ${C.border}`, content:<Glyph emoji="🌿" chip={false} size={11}/> };
    if (!Array.isArray(entry) || entry.length===0) return {};
    return {
      background: isToday ? C.lavender : C.lavender+"60", border:`1.5px solid ${C.lavenderDeep}`,
      content: <div style={{display:"flex",gap:2,justifyContent:"center"}}>{entry.slice(0,3).map((_,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#B9728A"}}/>)}</div>,
    };
  };

  // History: grouped log, monthly summary and the default selected day
  const logByDate = groupLogByDate(workoutLog||[]);
  const latestLogged = Object.keys(logByDate).sort().pop();
  const shownHistoryDay = historyDay ?? (logByDate[todayStr] ? todayStr : latestLogged ?? todayStr);
  const stats = monthStats(workoutLog||[], todayStr);
  const streak = logStreak(Object.keys(logByDate), todayStr);

  const renderWorkoutCard = (w: Workout, custom: boolean) => {
    const dc=DIFF_COLOR[w.difficulty] ?? DIFF_COLOR.Beginner;
    const inPlan=workoutPlan.some(p=>p.id===w.id);
    return(
      <div key={w.id} className="workout-card">
        <div className="row-between" style={{gap:8}}>
          <div className="row" style={{minWidth:0}}><Glyph emoji={w.emoji} size={17}/><div style={{minWidth:0}}><div style={{fontWeight:600,fontSize:15}}>{w.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{w.muscle}{w.duration?` · ${w.duration}`:""}</div></div></div>
          <div className="row" style={{gap:4,flexShrink:0}}>
            {custom&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:C.lavender,color:"#A95C76"}}>Yours</span>}
            <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:dc.bg,color:dc.text}}>{w.difficulty}</span>
          </div>
        </div>
        {w.achieve&&<div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5,background:C.bgDeep,borderRadius:10,padding:"6px 10px"}}>{w.achieve}</div>}
        <div className="row" style={{gap:8}}>
          <button className={`btn btn-sm ${inPlan?"btn-ghost":"btn-primary"}`} style={{flex:1}} onClick={()=>{if(inPlan){setWorkoutPlan(p=>p.filter(x=>x.id!==w.id));showToast("Removed");}else{setWorkoutPlan(p=>[...p,w]);showToast("Added!");}}}>
            {inPlan?"✓ In plan":"+ Add to plan"}
          </button>
          <button className="btn btn-sm" style={{flex:1,background:C.butter,color:ACCENT.carbs.text,border:"none"}} onClick={()=>openLog(w)}>Log workout</button>
          <button className="btn btn-ghost btn-sm" style={{flexShrink:0,padding:"8px 12px"}} onClick={()=>setGuideFor(w)} aria-label={`How to do ${w.name}: form guide`}><BookOpen size={14} strokeWidth={1.8} aria-hidden="true"/>Guide</button>
          {custom&&<>
            <button style={iconBtn} onClick={()=>setCustomModal({initial:w})} aria-label={`Edit ${w.name}`}><Pencil size={15} strokeWidth={1.8}/></button>
            <SwipeToDelete onDelete={()=>deleteCustomWorkout(w.id)}/>
          </>}
        </div>
      </div>
    );
  };

  return (
    <div className="scroll" style={{padding:"24px 24px 40px"}}>
      <div className="h-display" style={{fontSize:32,color:C.text,marginBottom:16}}>Workouts</div>
      <TabRow tab={tab} setTab={setTab}/>

      {tab==="schedule" && (
        <div>
          {tipsDay && (
            <section className="card" aria-labelledby="form-tips-today" style={{padding:"14px 16px",marginBottom:14}}>
              <div className="row-between" style={{marginBottom:10}}>
                <h2 id="form-tips-today" style={{fontSize:14,fontWeight:700,color:C.text}}>{tipsDay===todayStr?"Form tips for today":`Form tips for ${shortDate(tipsDay)}`}</h2>
                {tipsDay!==todayStr&&<span style={{fontSize:11,fontWeight:600,color:C.textSoft}}>Next planned</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {tipsItems.map((item,i)=>{
                  const target = guideTargetFor(item);
                  const cue = firstCue(target);
                  return (
                    <div key={i} className="row" style={{gap:10,background:C.bgDeep,borderRadius:12,padding:"10px 12px"}}>
                      <Glyph emoji={item.emoji||"🏋️"} size={14}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text}}>{item.name}</div>
                        <div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.45}}>{cue ?? "Open the guide for form cues and what to eat."}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{flexShrink:0,padding:"6px 12px",fontSize:11}} onClick={()=>setGuideFor(target)} aria-label={`See guide for ${item.name}`}>See guide</button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Week / Month toggle */}
          <div className="row" role="group" aria-label="Calendar view" style={{gap:4,marginBottom:12,background:C.bgDeep,borderRadius:12,padding:4,width:"fit-content"}}>
            {([["week","Week"],["month","Month"]] as const).map(([v,l])=>(
              <button key={v} onClick={()=>setScheduleView(v)} aria-pressed={scheduleView===v} style={{padding:"5px 16px",borderRadius:9,border:"none",cursor:"pointer",background:scheduleView===v?C.white:"transparent",color:scheduleView===v?"#A95C76":C.textSoft,fontWeight:600,fontSize:12,fontFamily:"DM Sans",boxShadow:scheduleView===v?`0 1px 6px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
            ))}
          </div>

          {scheduleView==="month" ? (
            <div style={{marginBottom:16}}>
              <MonthCalendar selected={pickingDay} onSelect={selectDay} renderDay={scheduleLook} initialMonth={pickingDay ?? undefined}/>
            </div>
          ) : (<>
            {/* Calendar grid header */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
              {["M","T","W","T","F","S","S"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:600,color:C.textSoft,padding:"4px 0"}}>{d}</div>
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
                  <button key={day.date} onClick={()=>selectDay(day.date)} aria-pressed={isPicking} aria-label={`${day.label} ${day.num}`} style={{
                    borderRadius:12, padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, minHeight:44, fontFamily:"DM Sans",
                    cursor:"pointer", border:`1.5px solid ${isPicking?"#B9728A":isToday?C.lavenderDeep:items==="rest"?C.border:items.length?C.lavenderDeep:C.border}`,
                    background:isPicking?"#B9728A":isToday?C.lavender:items==="rest"?C.bgDeep:items.length?C.lavender+"60":C.white,
                    transition:"all .15s",
                  }}>
                    <div style={{fontSize:11,fontWeight:700,color:isPicking?"white":isToday?"#A95C76":C.text}}>{day.num}</div>
                    {items==="rest"
                      ? <div><Glyph emoji="🌿" chip={false} size={11}/></div>
                      : items.length>0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>
                          {items.slice(0,3).map((_,i)=>(
                            <div key={i} style={{width:5,height:5,borderRadius:"50%",background:isPicking?"white":"#B9728A"}}/>
                          ))}
                        </div>
                      )}
                  </button>
                );
              })}
            </div>
          </>)}

          {/* Selected day detail panel */}
          {pickingDay && (()=>{
            const items = Array.isArray(schedule[pickingDay]) ? schedule[pickingDay] : [];
            const isToday = pickingDay===todayStr;
            const sel = new Date(pickingDay+"T12:00");
            return (
              <div className="card slide-in" style={{marginBottom:14}}>
                <div className="row-between" style={{marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,color:C.text}}>{sel.toLocaleDateString("en-US",{weekday:"short"})}, {sel.toLocaleDateString("en-US",{month:"long",day:"numeric"})}</div>
                    {isToday&&<div style={{fontSize:11,fontWeight:700,color:"#B9728A"}}>Today</div>}
                  </div>
                  <span style={{fontSize:13,color:C.textSoft,fontWeight:600}}>{items.length?`${items.length} workout${items.length>1?"s":""}` : "Rest day"}</span>
                </div>

                {/* Workouts for this day */}
                {items.map((item,idx)=>(
                  <div key={idx} style={{background:C.bgDeep,borderRadius:12,marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
                      <Glyph emoji={item.emoji||"🏋️"} size={15}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{item.name}</div>
                        {item.detail&&<div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{item.detail}</div>}
                      </div>
                      <div className="row" style={{gap:4}}>
                        {isToday&&<button className="btn btn-sm" style={{background:completedToday.has(item.name)?C.rose:C.petal,color:completedToday.has(item.name)?C.accentInk:C.text,border:"none",fontSize:11}} onClick={()=>openLog(item)}>
                          {completedToday.has(item.name)?"✓ Done":"Log"}
                        </button>}
                        <button style={iconBtn} aria-label={`Form guide for ${item.name}`} onClick={()=>setGuideFor(guideTargetFor(item))}>
                          <BookOpen size={15} strokeWidth={1.8} aria-hidden="true"/>
                        </button>
                        <button style={{...iconBtn,color:movingIdx===idx?"#A95C76":C.textSoft,background:movingIdx===idx?C.lavender:"none"}} aria-label={`Move ${item.name} to another day`} aria-expanded={movingIdx===idx} onClick={()=>{setMovingIdx(movingIdx===idx?null:idx);setMoveDate("");}}>
                          <ArrowRightLeft size={15} strokeWidth={1.8}/>
                        </button>
                        <button style={{...iconBtn,fontSize:16}} aria-label={`Remove ${item.name}`} onClick={()=>removeFromDay(pickingDay,idx)}>×</button>
                      </div>
                    </div>
                    {movingIdx===idx&&(
                      <div className="slide-in" style={{padding:"0 12px 12px"}}>
                        <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:6}}>Move to:</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
                          {weekOf(pickingDay).map(d=>{const dt=new Date(d+"T12:00"),cur=d===pickingDay;return(
                            <button key={d} disabled={cur} onClick={()=>moveItem(pickingDay,idx,d)} aria-label={`Move to ${shortDate(d)}`} style={{padding:"6px 0",borderRadius:10,border:`1.5px solid ${cur?C.border:C.lavenderDeep}`,background:cur?"transparent":C.white,color:cur?C.textSoft:"#8A4862",cursor:cur?"default":"pointer",fontFamily:"DM Sans",display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.2,opacity:cur?.5:1}}>
                              <span style={{fontSize:9,fontWeight:600}}>{dt.toLocaleDateString("en-US",{weekday:"short"})}</span>
                              <span style={{fontSize:12,fontWeight:700}}>{dt.getDate()}</span>
                            </button>
                          );})}
                        </div>
                        <div className="row" style={{gap:8}}>
                          <input className="input" type="date" aria-label="Move to another date" value={moveDate} onChange={e=>setMoveDate(e.target.value)} style={{fontSize:13,padding:"8px 12px"}}/>
                          <button className="btn btn-primary btn-sm" style={{flexShrink:0}} disabled={!moveDate||moveDate===pickingDay} onClick={()=>moveItem(pickingDay,idx,moveDate)}>Move</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add workout */}
                <div style={{marginTop:8}}>
                  {/* Rest day toggle */}
                  <div className="row" style={{marginBottom:12,gap:8}}>
                    <button onClick={()=>{setSchedule(s=>({...s,[pickingDay]:s[pickingDay]==="rest"?[]:"rest"}));setMovingIdx(null);showToast(schedule[pickingDay]==="rest"?"Rest day removed":"Rest day set");}} style={{padding:"7px 14px",borderRadius:99,border:`1.5px solid ${schedule[pickingDay]==="rest"?C.sageDeep:C.border}`,background:schedule[pickingDay]==="rest"?C.sage:"transparent",color:schedule[pickingDay]==="rest"?ACCENT.fiber.text:C.textSoft,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans",transition:"all .15s"}}>
                      <Glyph emoji="🌿" chip={false} size={13} color="currentColor"/> {schedule[pickingDay]==="rest"?"Rest day set":"Mark as rest day"}
                    </button>
                  </div>
                  {workoutPlan.length>0&&schedule[pickingDay]!=="rest"&&(
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:6}}>Quick add from your plan:</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {workoutPlan.map(w=>(
                          <button key={w.id} onClick={()=>{addToDay(pickingDay,{name:w.name,emoji:w.emoji,detail:[w.muscle,w.duration].filter(Boolean).join(" · ")});showToast("Added ✓");}} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${C.lavenderDeep}`,background:C.lavender,color:"#8A4862",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans"}}>
                            <Glyph emoji={w.emoji} chip={false} size={13}/> {w.name}
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
            <div style={{fontSize:11,fontWeight:600,color:cycleInfo.phase.textColor,marginBottom:4}}><Glyph emoji={cycleInfo.phase.emoji} chip={false} size={12} color={cycleInfo.phase.textColor}/> Best for your {cycleInfo.phase.label.toLowerCase()} phase</div>
            <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.9}}>{cycleInfo.phase.workouts[0]} · {cycleInfo.phase.workouts[1]}</div>
          </div>}
          <button onClick={()=>setCustomModal({initial:null})} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:10,borderRadius:18,border:`1.5px dashed ${C.lavenderDeep}`,background:C.lavender+"60",cursor:"pointer",fontFamily:"DM Sans",textAlign:"left"}}>
            <span style={{width:34,height:34,borderRadius:"50%",background:C.lavender,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Plus size={18} color="#A95C76" strokeWidth={2.4} aria-hidden="true"/></span>
            <span><span style={{display:"block",fontWeight:600,fontSize:15,color:"#8A4862"}}>Create workout</span><span style={{display:"block",fontSize:12,color:C.textSoft,fontWeight:500}}>Add your own session, with its own icon</span></span>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {customWorkouts.map(w=>renderWorkoutCard(w,true))}
            {ALL_WORKOUTS.map(w=>renderWorkoutCard(w,false))}
          </div>
        </div>
      )}

      {tab==="history" && (
        <div>
          {(!workoutLog||workoutLog.length===0)
            ?<div style={{textAlign:"center",padding:"40px 0",color:C.textSoft}}><div style={{marginBottom:10}}><Glyph emoji="🌱" size={24}/></div><div style={{fontWeight:600,fontSize:15,color:C.text}}>Nothing logged yet</div><div style={{fontSize:13,marginTop:6,lineHeight:1.6}}>Every workout counts. Tap Log on any session to start tracking your progress.</div></div>
            :<>
              {/* Monthly summary */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                {([["🏋️",stats.workouts,stats.workouts===1?"workout this month":"workouts this month"],["📅",stats.activeDays,stats.activeDays===1?"active day this month":"active days this month"],["🔥",streak,"day streak"]] as const).map(([emoji,value,label])=>(
                  <div key={emoji} className="card" style={{padding:"12px 10px",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",gap:4,textAlign:"center"}}>
                    <Glyph emoji={emoji} size={13}/>
                    <div style={{fontSize:20,fontWeight:700,color:C.text,lineHeight:1.1}}>{value}</div>
                    <div style={{fontSize:10,fontWeight:700,color:C.textSoft,lineHeight:1.3}}>{label}</div>
                  </div>
                ))}
              </div>

              <WorkoutInsights workoutLog={workoutLog} phaseOn={phaseOn}/>

              <div className="card" style={{padding:14,marginBottom:16}}>
                <MonthCalendar selected={shownHistoryDay} onSelect={setHistoryDay} initialMonth={shownHistoryDay} renderDay={date=>{
                  const entries = logByDate[date];
                  if (!entries) return {};
                  return {
                    background:C.rose, border:`1.5px solid ${C.roseDeep}`,
                    content:<span style={{display:"inline-flex",alignItems:"center",gap:1}}><Glyph emoji={entries[0].emoji||"🏋️"} chip={false} size={12}/>{entries.length>1&&<span style={{fontSize:9,fontWeight:600,color:ACCENT.fiber.text}}>+{entries.length-1}</span>}</span>,
                  };
                }}/>
              </div>

              {/* Selected day's entries */}
              {(()=>{
                const entries = logByDate[shownHistoryDay] ?? [];
                return (
                  <div className="slide-in" key={shownHistoryDay}>
                    <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:8}}>
                      {shownHistoryDay===todayStr?"Today":shortDate(shownHistoryDay)}
                      {entries.length>0&&<span style={{fontWeight:600,color:C.textSoft,marginLeft:8}}>{entries.length} workout{entries.length>1?"s":""}</span>}
                    </div>
                    {entries.length===0&&<div style={{fontSize:13,color:C.textSoft,fontWeight:500,padding:"4px 0 12px"}}>No workouts logged on this day.</div>}
                    {entries.map(e=>(
                      <div key={e.id} className="card" style={{marginBottom:8,padding:"12px 14px"}}>
                        <div className="row" style={{gap:10}}>
                          <Glyph emoji={e.emoji||"🏋️"} size={16}/>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:14}}>{e.name}</div>
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
                );
              })()}
            </>
          }
        </div>
      )}


      {tab==="ai" && <AICoachPanel measurements={measurements} cycleInfo={cycleInfo} plan={aiPlan} setPlan={setAiPlan} showToast={showToast}/>}

      {customModal&&<CustomWorkoutModal initial={customModal.initial} onSave={saveCustomWorkout} onClose={()=>setCustomModal(null)}/>}

      {logModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setLogModal(null)}><div className="modal">
        <div className="modal-handle"/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <Glyph emoji={logModal.emoji||"🏋️"} size={20}/>
          <div style={{flex:1,minWidth:0}}><div className="modal-title" style={{marginBottom:0}}>{logModal.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{logModal.muscle||""}{logModal.duration?` · ${logModal.duration}`:""}</div></div>
          <button onClick={()=>setGuideFor(findLibraryWorkout(logModal) ?? { name:logModal.name, emoji:logModal.emoji, muscle:logModal.muscle, duration:logModal.duration })} style={{background:"none",border:"none",padding:4,cursor:"pointer",fontFamily:"DM Sans",fontSize:12,fontWeight:700,color:C.accentInk,textDecoration:"underline",flexShrink:0}}>Form guide</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {([["sets","Sets","e.g. 3"],["reps","Reps","e.g. 12"],["weight","Weight (kg)","e.g. 40"],["duration","Duration","e.g. 30 min"]] as const).map(([k,lbl,ph])=>(
            <div key={k}><label className="label">{lbl}</label><input className="input" placeholder={ph} value={logForm[k]} onChange={e=>setLogForm(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
        </div>
        <div style={{marginBottom:14}}><label className="label">Notes (optional)</label><input className="input" placeholder="How did it feel? Any PRs?" value={logForm.notes} onChange={e=>setLogForm(p=>({...p,notes:e.target.value}))}/></div>
        {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:12,padding:"8px 12px",marginBottom:14,fontSize:12,fontWeight:600,color:cycleInfo.phase.textColor}}><Glyph emoji={cycleInfo.phase.emoji} chip={false} size={12} color={cycleInfo.phase.textColor}/> {cycleInfo.phase.label} phase: {cycleInfo.phase.workouts[0]}</div>}
        <div className="row" style={{gap:10}}><button className="btn btn-ghost" style={{flex:1}} onClick={()=>setLogModal(null)}>Cancel</button><button className="btn btn-primary" style={{flex:2}} onClick={logWorkout}>Save workout ✓</button></div>
      </div></div>}

      {guideFor&&<WorkoutGuide key={guideFor.name} workout={guideFor} phase={currentPhase} onClose={()=>setGuideFor(null)} onAskCoach={onAskCoach}/>}
    </div>
  );
}
