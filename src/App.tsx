import { useState, useEffect } from "react";
import { C, CSS } from "./theme";
import { load, save } from "./lib/storage";
import { getCycleInfo } from "./lib/cycle";
import { useToast } from "./hooks/useToast";
import { TABS } from "./data/tabs";
import { Icon } from "./components/Icon";
import { Icons } from "./components/icons";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { Dashboard } from "./pages/Dashboard";
import { NutritionPage } from "./pages/NutritionPage";
import { BodyPage } from "./pages/BodyPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { Goals, Measurements, NutritionTotals, PeriodEntry, Schedule, TabId, WeightEntry, Workout, WorkoutLogEntry } from "./types";

// ══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [tab,setTab]=useState<TabId>("home");
  const [onboarded,setOnboarded]=useState<boolean>(()=>load("onboarded",false));
  const [userName,setUserName]=useState<string>(()=>load("user-name",""));
  const todayKey=new Date().toISOString().slice(0,10);
  const [nutrition,setNutrition]=useState<NutritionTotals>(()=>load("nutrition-"+new Date().toISOString().slice(0,10),{protein:0,carbs:0,fats:0,sugar:0,fiber:0}));
  const [goals,setGoals]=useState<Goals>(()=>load("goals",{protein:150,carbs:200,fats:65,sugar:30,fiber:25,calories:2000}));
  const [measurements,setMeasurements]=useState<Measurements>(()=>load("measurements",{}));
  const [workoutPlan,setWorkoutPlan]=useState<Workout[]>(()=>load("workout-plan",[]));
  const [schedule,setSchedule]=useState<Schedule>(()=>load("schedule",{}));
  const [workoutLog,setWorkoutLog]=useState<WorkoutLogEntry[]>(()=>load("workout-log",[]));
  const [weightHistory,setWeightHistory]=useState<WeightEntry[]>(()=>load("weight-history",[]));
  const [periodStart,setPeriodStart]=useState<string>(()=>load("period-start",""));
  const [periodHistory,setPeriodHistory]=useState<PeriodEntry[]>(()=>load("period-history",[]));
  const [cycleLength,setCycleLength]=useState<number>(()=>load("cycle-length",28));
  const [toast,showToast]=useToast();

  const cycleInfo=getCycleInfo(periodStart,cycleLength);

  useEffect(()=>{save("onboarded",onboarded);},[onboarded]);
  useEffect(()=>{save("user-name",userName);},[userName]);
  useEffect(()=>{save("nutrition-"+todayKey,nutrition);},[nutrition,todayKey]);
  useEffect(()=>{save("goals",goals);},[goals]);
  useEffect(()=>{save("measurements",measurements);},[measurements]);
  useEffect(()=>{save("workout-plan",workoutPlan);},[workoutPlan]);
  useEffect(()=>{save("schedule",schedule);},[schedule]);
  useEffect(()=>{save("workout-log",workoutLog);},[workoutLog]);
  useEffect(()=>{save("weight-history",weightHistory);},[weightHistory]);
  useEffect(()=>{save("period-start",periodStart);},[periodStart]);
  useEffect(()=>{save("period-history",periodHistory);},[periodHistory]);
  useEffect(()=>{save("cycle-length",cycleLength);},[cycleLength]);

  const finishOnboard=(name: string,pStart: string,cLen: number)=>{
    if(name){setUserName(name);save("user-name",name);}
    if(pStart){setPeriodStart(pStart);save("period-start",pStart);}
    if(cLen){setCycleLength(cLen);save("cycle-length",cLen);}
    setOnboarded(true);
  };

  if(!onboarded) return <><style>{CSS}</style><div className="shell"><OnboardingFlow onDone={finishOnboard}/></div></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {toast&&<div className="toast">{toast}</div>}
        {/* Desktop sidebar — hidden on mobile via CSS */}
        <div className="desktop-sidebar">
          <div style={{padding:"0 24px 32px",fontFamily:"Nunito",fontWeight:900,fontSize:22,color:"#5040A0",letterSpacing:"-0.5px"}}>
            formly
          </div>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 24px",background:tab===t.id?C.lavender:"transparent",border:"none",cursor:"pointer",width:"100%",textAlign:"left",fontFamily:"Nunito",fontWeight:700,fontSize:14,color:tab===t.id?"#5040A0":C.textMid,borderLeft:tab===t.id?"3px solid #7050B0":"3px solid transparent",transition:"all .15s"}}>
              <Icon d={Icons[t.icon]} size={18} stroke={tab===t.id?"#7050B0":C.textMid} strokeWidth={1.8}/>
              {t.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          {cycleInfo&&<div style={{margin:"0 16px 16px",background:cycleInfo.phase.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
            <div style={{fontSize:12,fontWeight:800,color:cycleInfo.phase.textColor}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase</div>
            <div style={{fontSize:11,color:cycleInfo.phase.textColor,opacity:.8,marginTop:2,fontWeight:500}}>Day {cycleInfo.dayOfCycle} of {cycleInfo.cycleLength}</div>
          </div>}
        </div>
        <div className="desktop-content">
        {tab==="home"&&<Dashboard nutrition={nutrition} goals={goals} measurements={measurements} workoutPlan={workoutPlan} schedule={schedule} weightHistory={weightHistory} cycleInfo={cycleInfo} workoutLog={workoutLog} userName={userName}/>}
        {tab==="nutrition"&&<NutritionPage cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="body"&&<BodyPage measurements={measurements} setMeasurements={setMeasurements} weightHistory={weightHistory} setWeightHistory={setWeightHistory} cycleInfo={cycleInfo} periodStart={periodStart} setPeriodStart={setPeriodStart} periodHistory={periodHistory} setPeriodHistory={setPeriodHistory} cycleLength={cycleLength} setCycleLength={setCycleLength} showToast={showToast}/>}
        {tab==="workouts"&&<WorkoutsPage workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan} schedule={schedule} setSchedule={setSchedule} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} aiPlan={load<string | null>("ai-plan",null)} measurements={measurements} goals={goals} cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="settings"&&<SettingsPage userName={userName} setUserName={setUserName} showToast={showToast}/>}
        <nav className="bottom-nav">
          {TABS.map(t=>(
            <div key={t.id} className="nav-tab" onClick={()=>setTab(t.id)}>
              <div className={`nav-icon-wrap${tab===t.id?" active":""}`}>
              <Icon d={Icons[t.icon]} size={18} stroke={tab===t.id?"#7050B0":"#B09A8A"} strokeWidth={1.8}/>
            </div>
              <span className={`nav-label${tab===t.id?" active":""}`}>{t.label}</span>
            </div>
          ))}
        </nav>
      </div>
        </div>{/* end desktop-content */}
    </>
  );
}
