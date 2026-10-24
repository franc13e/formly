import { useState } from "react";
import { C } from "../theme";
import type { Setter, Workout, WorkoutIdSchedule } from "../types";

interface WeekCalendarProps {
  /** Id-based schedule; see `WorkoutIdSchedule`. This component is not rendered anywhere. */
  schedule: WorkoutIdSchedule;
  setSchedule: Setter<WorkoutIdSchedule>;
  workoutPlan: Workout[];
}

// ─── Week calendar ────────────────────────────────────────────────────────────
export function WeekCalendar({ schedule, setSchedule, workoutPlan }: WeekCalendarProps) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);
  const days = Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return{date:d.toISOString().slice(0,10),label:["Su","Mo","Tu","We","Th","Fr","Sa"][i],num:d.getDate()};});
  const [picking,setPicking]=useState<string|null>(null);
  return (
    <div>
      <div style={{display:"flex",gap:4}}>
        {days.map(d=>(
          <div key={d.date} onClick={()=>setPicking(picking===d.date?null:d.date)} style={{flex:1,borderRadius:12,padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",border:`1.5px solid ${d.date===todayStr?"#9070D0":schedule[d.date]?.length?C.lavenderDeep:C.border}`,background:schedule[d.date]?.length?C.lavender:"transparent",transition:"all .15s"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.textSoft}}>{d.label}</div>
            <div style={{fontSize:13,fontWeight:800,color:C.text}}>{d.num}</div>
            {(schedule[d.date]?.length ?? 0)>0&&<div style={{width:5,height:5,borderRadius:"50%",background:"#9070D0"}}/>}
          </div>
        ))}
      </div>
      {picking&&(
        <div style={{marginTop:10,background:C.lavender,borderRadius:14,padding:"10px 12px"}}>
          <div style={{fontSize:12,fontWeight:800,color:"#7050B0",marginBottom:8}}>Schedule for {picking}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {workoutPlan.map(w=>{const on=schedule[picking]?.includes(w.id);return(<button key={w.id} className={`chip${on?" on":""}`} style={on?{background:C.lavenderDeep,borderColor:"transparent",color:"#5040A0"}:{}} onClick={()=>setSchedule(s=>{const cur=s[picking]||[];return{...s,[picking]:on?cur.filter(x=>x!==w.id):[...cur,w.id]};})}>{w.emoji} {w.name}</button>);})}
            {workoutPlan.length===0&&<span style={{fontSize:12,color:C.textSoft}}>Add workouts first in the Workouts tab</span>}
          </div>
        </div>
      )}
    </div>
  );
}
