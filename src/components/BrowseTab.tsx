import { useEffect, useState } from "react";
import { BookOpen, CalendarPlus, ChevronDown, Pencil, Plus, Star } from "lucide-react";
import { C } from "../theme";
import { DIFF_COLOR } from "../data/workouts";
import { PRESET_SESSIONS } from "../data/sessions";
import { Glyph } from "./Glyph";
import { SwipeToDelete } from "./SwipeToDelete";
import { WorkoutThumb } from "./WorkoutThumb";
import { DayPickerSheet } from "./DayPickerSheet";
import { SessionBuilder } from "./SessionBuilder";
import { load, save } from "../lib/storage";
import { phaseStripTitle, suggestForPhase } from "../lib/phaseSuggest";
import {
  addItemsToDay, addSessionToSchedule, filterWorkouts, formatMinutes, sanitizeSessions, sessionTotals, sessionWorkouts,
  toScheduled, workoutDetail, MUSCLE_FILTERS, SESSIONS_KEY,
} from "../lib/sessions";
import type { CycleInfo, Schedule, Setter, ShowToast, Workout, WorkoutSession } from "../types";

interface BrowseTabProps {
  /** The built-in library (`ALL_WORKOUTS`). */
  library: Workout[];
  customWorkouts: Workout[];
  cycleInfo: CycleInfo | null;
  workoutPlan: Workout[];
  setWorkoutPlan: Setter<Workout[]>;
  schedule: Schedule;
  setSchedule: Setter<Schedule>;
  /** YYYY-MM-DD */
  today: string;
  showToast: ShowToast;
  onLog: (w: Workout) => void;
  onGuide: (w: Workout) => void;
  onCreateWorkout: () => void;
  onEditWorkout: (w: Workout) => void;
  onDeleteWorkout: (id: number) => void;
}

type BrowseView = "exercises" | "sessions";
type AddTarget = { kind: "workout"; workout: Workout } | { kind: "session"; session: WorkoutSession };

/** "Thu, Nov 12" */
const shortDate = (date: string) => new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
/** Id for a new session (outside the component so the React compiler's purity check doesn't flag the handler). */
const newSessionId = () => `s-${Date.now()}`;

const iconBtn = { background:"none", border:"none", color:C.textSoft, cursor:"pointer", padding:6, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:8, flexShrink:0 } as const;
const sectionHead = { fontSize:13, fontWeight:700, color:C.textMid, margin:"18px 0 8px" } as const;
const createBtn = { width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px", marginBottom:12, borderRadius:18, border:`1.5px dashed ${C.lavenderDeep}`, background:C.card, cursor:"pointer", fontFamily:"DM Sans", textAlign:"left" } as const;

function CreateButton({ title, hint, onClick }: { title: string; hint: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={createBtn}>
      <span style={{width:34,height:34,borderRadius:"50%",background:C.petal,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Plus size={18} color={C.text} strokeWidth={2.2} aria-hidden="true"/></span>
      <span><span style={{display:"block",fontWeight:600,fontSize:15,color:C.text}}>{title}</span><span style={{display:"block",fontSize:12,color:C.textSoft,fontWeight:500}}>{hint}</span></span>
    </button>
  );
}

/** Browse: phase picks, then exercises by muscle group or ready-made and your own sessions. */
export function BrowseTab({ library, customWorkouts, cycleInfo, workoutPlan, setWorkoutPlan, schedule, setSchedule, today, showToast, onLog, onGuide, onCreateWorkout, onEditWorkout, onDeleteWorkout }: BrowseTabProps) {
  const [view, setView] = useState<BrowseView>("exercises");
  const [muscle, setMuscle] = useState<string>("All");
  const [adding, setAdding] = useState<AddTarget | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => sanitizeSessions(load<unknown>(SESSIONS_KEY, [])));
  const [builder, setBuilder] = useState<{ initial: WorkoutSession | null } | null>(null);
  const [openSession, setOpenSession] = useState<string | null>(null);
  useEffect(() => { save(SESSIONS_KEY, sessions); }, [sessions]);

  const pool = [...library, ...customWorkouts];
  const customIds = new Set(customWorkouts.map(w => w.id));
  const suggestions = cycleInfo ? suggestForPhase(library, cycleInfo, 5) : [];

  // Muscle chips with something in them; "Yours" when there are custom workouts.
  const chips = [...MUSCLE_FILTERS, "Yours"].filter(m => m === "All" || (m === "Yours" ? customWorkouts.length > 0 : pool.some(w => w.muscle === m)));
  const activeMuscle = chips.includes(muscle) ? muscle : "All";
  const shown = activeMuscle === "Yours" ? customWorkouts
    : activeMuscle === "All" ? [...customWorkouts, ...library]
    : [...filterWorkouts(customWorkouts, activeMuscle), ...filterWorkouts(library, activeMuscle)];

  const togglePlan = (w: Workout) => {
    const inPlan = workoutPlan.some(p => p.id === w.id);
    setWorkoutPlan(p => inPlan ? p.filter(x => x.id !== w.id) : [...p, w]);
    showToast(inPlan ? "Removed from your plan" : "Saved to your plan");
  };

  const pickDay = (date: string) => {
    if (!adding) return;
    if (adding.kind === "workout") {
      setSchedule(s => addItemsToDay(s, date, [toScheduled(adding.workout)]));
      showToast(`Added to ${date===today?"today":shortDate(date)}`);
    } else {
      setSchedule(s => addSessionToSchedule(s, date, adding.session, pool));
      showToast(`${adding.session.name} added to ${date===today?"today":shortDate(date)}`);
    }
    setAdding(null);
  };

  const saveSession = (s: WorkoutSession) => {
    const session = s.id ? s : { ...s, id: newSessionId() };
    setSessions(list => list.some(x => x.id === session.id) ? list.map(x => x.id === session.id ? session : x) : [session, ...list]);
    setBuilder(null);
    showToast(s.id ? "Session updated" : "Session saved ✓");
  };
  const deleteSession = (id: string) => { setSessions(list => list.filter(x => x.id !== id)); showToast("Session deleted"); };

  const renderWorkoutCard = (w: Workout) => {
    const custom = customIds.has(w.id);
    const dc = DIFF_COLOR[w.difficulty] ?? DIFF_COLOR.Beginner;
    const inPlan = workoutPlan.some(p => p.id === w.id);
    return (
      <li key={w.id} className="workout-card" style={{gap:10}}>
        <div className="row" style={{gap:12,alignItems:"flex-start"}}>
          <WorkoutThumb workout={w} size={56} radius={14}/>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{fontWeight:600,fontSize:15,color:C.text,lineHeight:1.3}}>{w.name}</h3>
            <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginTop:1}}>{workoutDetail(w)}</div>
            <div className="row" style={{gap:4,marginTop:6,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:99,background:dc.bg,color:dc.text}}>{w.difficulty}</span>
              {custom&&<span style={{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:99,background:C.bgDeep,color:C.accentInk}}>Yours</span>}
            </div>
          </div>
          <button style={{...iconBtn,color:inPlan?C.accentInk:C.textSoft}} aria-pressed={inPlan} aria-label={`Save ${w.name} to your plan`} title={inPlan?"In your plan: quick add from any day":"Save to your plan for quick add"} onClick={()=>togglePlan(w)}>
            <Star size={18} strokeWidth={1.8} fill={inPlan?C.petal:"none"} aria-hidden="true"/>
          </button>
        </div>
        <div className="row" style={{gap:6}}>
          <button className="btn btn-primary btn-sm" style={{flex:1.4,padding:"8px 10px",boxShadow:"none"}} onClick={()=>setAdding({kind:"workout",workout:w})} aria-label={`Add ${w.name} to a day`}><CalendarPlus size={14} strokeWidth={1.8} aria-hidden="true"/>Add to day</button>
          <button className="btn btn-ghost btn-sm" style={{flex:1,padding:"8px 10px"}} onClick={()=>onLog(w)} aria-label={`Log ${w.name}`}>Log</button>
          <button className="btn btn-ghost btn-sm" style={{flex:1,padding:"8px 10px"}} onClick={()=>onGuide(w)} aria-label={`How to do ${w.name}: form guide`}><BookOpen size={14} strokeWidth={1.8} aria-hidden="true"/>Guide</button>
          {custom&&<>
            <button style={iconBtn} onClick={()=>onEditWorkout(w)} aria-label={`Edit ${w.name}`}><Pencil size={15} strokeWidth={1.8} aria-hidden="true"/></button>
            <SwipeToDelete onDelete={()=>onDeleteWorkout(w.id)}/>
          </>}
        </div>
      </li>
    );
  };

  const renderSession = (s: WorkoutSession, own: boolean) => {
    const items = sessionWorkouts(s, pool);
    const { count, minutes } = sessionTotals(items);
    const open = openSession === s.id;
    const listId = `session-${s.id}-list`;
    return (
      <li key={s.id} className="workout-card" style={{gap:10}}>
        <div className="row" style={{gap:12,alignItems:"flex-start"}}>
          <Glyph emoji={s.emoji} size={17}/>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{fontWeight:600,fontSize:15,color:C.text,lineHeight:1.3}}>{s.name}</h3>
            {s.focus&&<div style={{fontSize:12,color:C.textMid,fontWeight:500}}>{s.focus}</div>}
            <div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginTop:2}}>{count} exercise{count===1?"":"s"}{minutes?` · ${formatMinutes(minutes)}`:""}</div>
          </div>
          {items.length>0&&(
            <div aria-hidden="true" style={{display:"flex",flexShrink:0,paddingLeft:8}}>
              {items.slice(0,4).map((w,i)=>(
                <span key={w.id} style={{marginLeft:i?-12:0,borderRadius:11,boxShadow:`0 0 0 2px ${C.card}`,display:"inline-flex",zIndex:4-i}}>
                  <WorkoutThumb workout={w} size={32} radius={10} decorative/>
                </span>
              ))}
            </div>
          )}
        </div>
        {s.phaseNote&&<div style={{fontSize:11,fontWeight:600,color:C.textMid,background:C.bgDeep,borderRadius:10,padding:"5px 10px",alignSelf:"flex-start"}}>{s.phaseNote}</div>}
        {open&&(
          <ol id={listId} className="slide-in" style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
            {items.length===0&&<li style={{fontSize:12,color:C.textSoft,fontWeight:500}}>These exercises aren't in your library any more.</li>}
            {items.map((w,i)=>(
              <li key={`${w.id}-${i}`} className="row" style={{gap:10,background:C.bgDeep,borderRadius:12,padding:"6px 8px"}}>
                <WorkoutThumb workout={w} size={36} radius={10}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:C.text}}>{w.name}</div>
                  <div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{workoutDetail(w)}</div>
                </div>
                <button style={iconBtn} onClick={()=>onGuide(w)} aria-label={`Form guide for ${w.name}`}><BookOpen size={15} strokeWidth={1.8} aria-hidden="true"/></button>
              </li>
            ))}
          </ol>
        )}
        <div className="row" style={{gap:6}}>
          <button className="btn btn-primary btn-sm" style={{flex:1.4,padding:"8px 10px",boxShadow:"none"}} disabled={!items.length} onClick={()=>setAdding({kind:"session",session:s})} aria-label={`Add ${s.name} to a day`}><CalendarPlus size={14} strokeWidth={1.8} aria-hidden="true"/>Add to day</button>
          <button className="btn btn-ghost btn-sm" style={{flex:1,padding:"8px 10px"}} aria-expanded={open} aria-controls={open?listId:undefined} onClick={()=>setOpenSession(open?null:s.id)}>
            {open?"Hide":"Exercises"}<ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" style={{transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}/>
          </button>
          {own&&<>
            <button style={iconBtn} onClick={()=>setBuilder({initial:s})} aria-label={`Edit ${s.name}`}><Pencil size={15} strokeWidth={1.8} aria-hidden="true"/></button>
            <SwipeToDelete onDelete={()=>deleteSession(s.id)}/>
          </>}
        </div>
      </li>
    );
  };

  return (
    <div>
      {cycleInfo && suggestions.length>0 && (
        <section aria-labelledby="phase-picks-title" style={{marginBottom:18}}>
          <div className="row-between" style={{marginBottom:10,gap:8}}>
            <h2 id="phase-picks-title" className="h-display" style={{fontSize:20,color:C.text,lineHeight:1.2}}>{phaseStripTitle(cycleInfo)}</h2>
            <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:cycleInfo.phase.bg,color:cycleInfo.phase.textColor,flexShrink:0,display:"inline-flex",alignItems:"center",gap:4}}>
              <Glyph emoji={cycleInfo.phase.emoji} chip={false} size={11} color={cycleInfo.phase.textColor}/>Day {cycleInfo.dayOfCycle}
            </span>
          </div>
          <ul className="phase-strip" tabIndex={0} aria-label={`Workouts that suit your ${cycleInfo.phase.label.toLowerCase()} phase`}
            style={{listStyle:"none",display:"flex",gap:10,overflowX:"auto",scrollSnapType:"x mandatory",scrollPaddingLeft:2,margin:"0 -24px",padding:"2px 24px 12px",borderRadius:4}}>
            {suggestions.map(({workout:w,reason})=>(
              <li key={w.id} style={{flex:"0 0 158px",scrollSnapAlign:"start",background:C.card,borderRadius:18,boxShadow:`0 4px 14px ${C.shadow}`,padding:8,display:"flex",flexDirection:"column",gap:6}}>
                <button onClick={()=>onGuide(w)} aria-label={`${w.name}: open form guide`} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left",fontFamily:"DM Sans",display:"flex",flexDirection:"column",gap:6,borderRadius:12}}>
                  <WorkoutThumb workout={w} size="100%" height={92} radius={12}/>
                  <span style={{padding:"0 2px"}}>
                    <span style={{display:"block",fontWeight:700,fontSize:13,color:C.text,lineHeight:1.25}}>{w.name}</span>
                    <span style={{display:"block",fontSize:11,color:C.textSoft,fontWeight:500,marginTop:1}}>{workoutDetail(w)}</span>
                  </span>
                </button>
                <div style={{fontSize:11,color:C.textMid,fontWeight:500,lineHeight:1.4,padding:"0 2px",flex:1}}>{reason}</div>
                <button className="btn btn-primary btn-sm" style={{padding:"6px 10px",fontSize:11,boxShadow:"none"}} onClick={()=>setAdding({kind:"workout",workout:w})} aria-label={`Add ${w.name} to a day`}><Plus size={13} strokeWidth={2} aria-hidden="true"/>Add</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row" role="group" aria-label="Browse" style={{gap:4,marginBottom:14,background:C.bgDeep,borderRadius:12,padding:4}}>
        {([["exercises","Exercises"],["sessions","Sessions"]] as const).map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} aria-pressed={view===v} style={{flex:1,padding:"7px 0",borderRadius:9,border:"none",cursor:"pointer",background:view===v?C.white:"transparent",color:view===v?C.accentInk:C.textSoft,fontWeight:600,fontSize:13,fontFamily:"DM Sans",boxShadow:view===v?`0 1px 6px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
        ))}
      </div>

      {view==="exercises" ? (<>
        <div role="group" aria-label="Filter by muscle group" style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {chips.map(m=>{const on=activeMuscle===m;return(
            <button key={m} className="chip" aria-pressed={on} onClick={()=>setMuscle(m)} style={{background:on?C.petal:C.white,color:on?C.text:C.textMid,borderColor:on?C.petal:C.border}}>{m}</button>
          );})}
        </div>
        <CreateButton title="Create workout" hint="Add your own, with its own icon" onClick={onCreateWorkout}/>
        {shown.length===0
          ? <div style={{fontSize:13,color:C.textSoft,fontWeight:500,textAlign:"center",padding:"16px 0"}}>Nothing here yet.</div>
          : <ul aria-label={`${activeMuscle==="All"?"All":activeMuscle} exercises`} style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>{shown.map(renderWorkoutCard)}</ul>}
      </>) : (<>
        <CreateButton title="Create session" hint="Group exercises into a session to add in one go" onClick={()=>setBuilder({initial:null})}/>
        {sessions.length>0&&<>
          <h2 style={sectionHead}>Your sessions</h2>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>{sessions.map(s=>renderSession(s,true))}</ul>
        </>}
        {PRESET_SESSIONS.length>0&&<>
          <h2 style={sectionHead}>Ready-made</h2>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>{PRESET_SESSIONS.map(s=>renderSession(s,false))}</ul>
        </>}
        {sessions.length===0&&PRESET_SESSIONS.length===0&&(
          <div style={{textAlign:"center",padding:"24px 0",color:C.textSoft}}>
            <div style={{marginBottom:8}}><Glyph emoji="🏋️" size={20}/></div>
            <div style={{fontWeight:600,fontSize:14,color:C.text}}>No sessions yet</div>
            <div style={{fontSize:12,marginTop:4,lineHeight:1.6}}>Build one from your favourite exercises, then add the whole session to a day.</div>
          </div>
        )}
      </>)}

      {adding&&(()=>{
        const isSession = adding.kind==="session";
        const items = isSession ? sessionWorkouts(adding.session, pool) : [];
        const { minutes } = sessionTotals(items);
        return (
          <DayPickerSheet
            title={`Add ${isSession?adding.session.name:adding.workout.name}`}
            subtitle={isSession ? `${items.length} exercise${items.length===1?"":"s"}${minutes?` · ${formatMinutes(minutes)}`:""}` : workoutDetail(adding.workout)}
            media={isSession ? <Glyph emoji={adding.session.emoji} size={18}/> : <WorkoutThumb workout={adding.workout} size={48} radius={12}/>}
            today={today} schedule={schedule} onPick={pickDay} onClose={()=>setAdding(null)}/>
        );
      })()}
      {builder&&<SessionBuilder initial={builder.initial} pool={pool} customIds={customIds} onSave={saveSession} onClose={()=>setBuilder(null)}/>}
    </div>
  );
}
