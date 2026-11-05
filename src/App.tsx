import { useState, useEffect, useMemo } from "react";
import { C, CSS } from "./theme";
import { load, save } from "./lib/storage";
import { cycleStats, getCycleInfo, periodContaining, periodLengthFrom, periodStarts } from "./lib/cycle";
import { useToast } from "./hooks/useToast";
import { TABS } from "./data/tabs";
import { Icon } from "./components/Icon";
import { Icons } from "./components/icons";
import { Glyph } from "./components/Glyph";
import { localDateKey } from "./lib/date";
import { markNoFlow, setFlow, setPeriodEnd } from "./lib/periodFlow";
import { seedHistory, weightHistoryFrom } from "./lib/measurementHistory";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { Dashboard } from "./pages/Dashboard";
import { NutritionPage } from "./pages/NutritionPage";
import { BodyPage } from "./pages/BodyPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { FlowLevel, MeasurementSnapshot, Measurements, PeriodEntry, Schedule, TabId, WeightEntry, Workout, WorkoutLogEntry } from "./types";

// ══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [tab,setTab]=useState<TabId>("home");
  const [onboarded,setOnboarded]=useState<boolean>(()=>load("onboarded",false));
  const [userName,setUserName]=useState<string>(()=>load("user-name",""));
  const [measurements,setMeasurements]=useState<Measurements>(()=>load("measurements",{}));
  const [workoutPlan,setWorkoutPlan]=useState<Workout[]>(()=>load("workout-plan",[]));
  const [schedule,setSchedule]=useState<Schedule>(()=>load("schedule",{}));
  const [workoutLog,setWorkoutLog]=useState<WorkoutLogEntry[]>(()=>load("workout-log",[]));
  // Seeded from the older weight-only log the first time (when the key doesn't exist yet).
  const [measurementHistory,setMeasurementHistory]=useState<MeasurementSnapshot[]>(()=>load<MeasurementSnapshot[]|null>("measurement-history",null)??seedHistory(load<Measurements>("measurements",{}),load<WeightEntry[]>("weight-history",[]),localDateKey()));
  const weightHistory=useMemo(()=>weightHistoryFrom(measurementHistory),[measurementHistory]);
  const [periodStart,setPeriodStart]=useState<string>(()=>load("period-start",""));
  const [periodHistory,setPeriodHistory]=useState<PeriodEntry[]>(()=>load("period-history",[]));
  const [cycleLength,setCycleLength]=useState<number>(()=>load("cycle-length",28));
  const [periodLengthSetting,setPeriodLengthSetting]=useState<number>(()=>load("period-length",5));
  const [aiPlan,setAiPlan]=useState<string | null>(()=>load<string | null>("ai-plan",null));
  const [toast,showToast]=useToast();
  const [addOpen,setAddOpen]=useState(false);

  // Predict with the cycle length learned from logged periods; the setting is the fallback.
  const starts=periodStarts(periodHistory,periodStart);
  const stats=cycleStats(starts,cycleLength);
  const periodLen=periodLengthFrom(periodHistory,periodLengthSetting);
  const cycleInfo=getCycleInfo(periodStart,stats.length,periodLen.length);

  /** Records a period that started on `date` (YYYY-MM-DD); the latest start drives the cycle. */
  const logPeriodStart=(date: string)=>{
    setPeriodHistory(h=>h.some(x=>x.date===date)?h:[...h,{date}].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,24));
    setPeriodStart(p=>!p||date>p?date:p);
  };

  /** Records `date` as the last bleeding day of the period it falls in. */
  const logPeriodEnd=(date: string)=>{
    // The current start may only exist as "period-start" (e.g. from onboarding); setPeriodEnd adds it.
    setPeriodHistory(h=>setPeriodEnd(h,periodStart,date));
  };

  /** Records the flow on `date` (null = no flow, which ends or, on the first day, removes the period). */
  const logPeriodFlow=(date: string,level: FlowLevel|null)=>{
    if(level){setPeriodHistory(h=>setFlow(h,periodStart,date,level,periodLen.length));return;}
    const {history,removed}=markNoFlow(periodHistory,periodStart,date,periodLen.length);
    setPeriodHistory(history);
    if(removed){
      if(removed===periodStart)setPeriodStart(periodStarts(history,"").pop()??"");
      showToast("Period removed");
    }
  };

  useEffect(()=>{save("onboarded",onboarded);},[onboarded]);
  useEffect(()=>{save("user-name",userName);},[userName]);
  useEffect(()=>{save("measurements",measurements);},[measurements]);
  useEffect(()=>{save("workout-plan",workoutPlan);},[workoutPlan]);
  useEffect(()=>{save("schedule",schedule);},[schedule]);
  useEffect(()=>{save("workout-log",workoutLog);},[workoutLog]);
  useEffect(()=>{save("measurement-history",measurementHistory);},[measurementHistory]);
  // Still written for older app versions and anything reading the weight-only log.
  useEffect(()=>{save("weight-history",weightHistory);},[weightHistory]);
  useEffect(()=>{save("period-start",periodStart);},[periodStart]);
  useEffect(()=>{save("period-history",periodHistory);},[periodHistory]);
  useEffect(()=>{save("cycle-length",cycleLength);},[cycleLength]);
  useEffect(()=>{save("period-length",periodLengthSetting);},[periodLengthSetting]);
  useEffect(()=>{save("ai-plan",aiPlan);},[aiPlan]);

  const finishOnboard=(name: string,pStart: string,cLen: number)=>{
    if(name){setUserName(name);save("user-name",name);}
    if(pStart){setPeriodStart(pStart);save("period-start",pStart);}
    if(cLen){setCycleLength(cLen);save("cycle-length",cLen);}
    setOnboarded(true);
  };

  const todayKey=localDateKey();
  const quickActions: {emoji:string;label:string;run:()=>void}[]=[
    ...(starts.includes(todayKey)?[]:[{emoji:"💧",label:"My period started today",run:()=>{logPeriodStart(todayKey);showToast("Period logged");}}]),
    ...(cycleInfo&&cycleInfo.daysLate===0&&cycleInfo.dayOfCycle>1&&cycleInfo.dayOfCycle<=10&&!periodContaining(periodHistory,todayKey)?.end?[{emoji:"🌸",label:"My period ended today",run:()=>{logPeriodEnd(todayKey);showToast("Period end logged");}}]:[]),
    {emoji:"🏋️",label:"Log a workout",run:()=>setTab("workouts")},
    {emoji:"✨",label:"Ask the food coach",run:()=>setTab("nutrition")},
    {emoji:"📏",label:"Update measurements",run:()=>setTab("body")},
  ];

  if(!onboarded) return <><style>{CSS}</style><div className="shell"><OnboardingFlow onDone={finishOnboard}/></div></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {toast&&<div className="toast">{toast}</div>}
        {/* Desktop sidebar — hidden on mobile via CSS */}
        <div className="desktop-sidebar">
          <div style={{padding:"0 24px 32px",fontFamily:"DM Sans",fontWeight:700,fontSize:22,color:"#8E3A55",letterSpacing:"-0.5px"}}>
            formly
          </div>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 24px",background:tab===t.id?C.rose:"transparent",border:"none",cursor:"pointer",width:"100%",textAlign:"left",fontFamily:"DM Sans",fontWeight:700,fontSize:14,color:tab===t.id?"#8E3A55":C.textMid,borderLeft:tab===t.id?"3px solid #B5506E":"3px solid transparent",transition:"all .15s"}}>
              <Icon d={Icons[t.icon]} size={18} stroke={tab===t.id?"#B5506E":C.textMid} strokeWidth={1.8}/>
              {t.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          {cycleInfo&&<div style={{margin:"0 16px 16px",background:C.rose,borderRadius:14,padding:"12px 14px"}}>
            <div style={{fontSize:12,fontWeight:600,color:cycleInfo.phase.textColor}}><Glyph emoji={cycleInfo.phase.emoji} chip={false} size={13} color={cycleInfo.phase.textColor}/> {cycleInfo.phase.label} phase</div>
            <div style={{fontSize:11,color:cycleInfo.phase.textColor,opacity:.8,marginTop:2,fontWeight:500}}>Day {cycleInfo.dayOfCycle} of {cycleInfo.cycleLength}</div>
          </div>}
        </div>
        <div className="desktop-content">
        {tab==="home"&&<Dashboard schedule={schedule} weightHistory={weightHistory} cycleInfo={cycleInfo} workoutLog={workoutLog} userName={userName} predictionSpread={stats.spread} onPeriodStarted={()=>{logPeriodStart(localDateKey());showToast("Period logged");}} onOpenBody={()=>setTab("body")}/>}
        {tab==="nutrition"&&<NutritionPage cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="body"&&<BodyPage measurements={measurements} setMeasurements={setMeasurements} measurementHistory={measurementHistory} setMeasurementHistory={setMeasurementHistory} weightHistory={weightHistory} cycleInfo={cycleInfo} periodStart={periodStart} setPeriodStart={setPeriodStart} periodHistory={periodHistory} setPeriodHistory={setPeriodHistory} cycleLength={cycleLength} setCycleLength={setCycleLength} starts={starts} stats={stats} logPeriodStart={logPeriodStart} periodLength={periodLen} periodLengthSetting={periodLengthSetting} setPeriodLengthSetting={setPeriodLengthSetting} logPeriodEnd={logPeriodEnd} logPeriodFlow={logPeriodFlow} showToast={showToast}/>}
        {tab==="workouts"&&<WorkoutsPage workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan} schedule={schedule} setSchedule={setSchedule} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} aiPlan={aiPlan} setAiPlan={setAiPlan} measurements={measurements} cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="settings"&&<SettingsPage userName={userName} setUserName={setUserName} showToast={showToast} cycle={periodStart?{length:stats.length,cyclesLogged:stats.cyclesLogged,periodLength:periodLen.length,periodsLogged:periodLen.logged}:null} onOpenCycle={()=>setTab("body")}/>}
        <nav className="bottom-nav" aria-label="Main">
          <div className="nav-pill">
            {TABS.map(t=>(
              <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)} aria-label={t.label} aria-current={tab===t.id?"page":undefined}>
                <span className="nav-icon-wrap"><Icon d={Icons[t.icon]} size={19} stroke={tab===t.id?C.text:"#E9D9E0"} strokeWidth={tab===t.id?2.2:1.9}/></span>
                <span className={`nav-label${tab===t.id?" active":""}`}>{t.label}</span>
              </button>
            ))}
          </div>
          <button className="nav-add" aria-label="Quick add" onClick={()=>setAddOpen(true)}><Glyph emoji="➕" chip={false} size={24} color={C.petal}/></button>
        </nav>
        {addOpen&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAddOpen(false)}><div className="modal">
          <div className="modal-handle"/>
          <div className="modal-title">Quick add</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {quickActions.map(a=>(
              <button key={a.label} onClick={()=>{a.run();setAddOpen(false);}} className="row" style={{gap:12,width:"100%",padding:"12px 14px",background:C.white,border:"none",borderRadius:16,cursor:"pointer",fontFamily:"DM Sans",textAlign:"left",boxShadow:`0 4px 14px ${C.shadow}`}}>
                <Glyph emoji={a.emoji} size={16}/>
                <span style={{fontSize:14,fontWeight:700,color:C.text}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div></div>}
      </div>
        </div>{/* end desktop-content */}
    </>
  );
}
