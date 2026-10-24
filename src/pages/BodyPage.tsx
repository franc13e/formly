import { useState } from "react";
import { C } from "../theme";
import { callAI } from "../lib/api";
import { load, save } from "../lib/storage";
import { PHASES } from "../lib/cycle";
import { PhaseWheel } from "../components/PhaseWheel";
import { PhaseBadge } from "../components/PhaseBadge";
import { WeightChart } from "../components/WeightChart";
import { MeasurementRings } from "../components/MeasurementRings";
import type { CycleInfo, MeasurementKey, Measurements, PeriodEntry, Setter, ShowToast, WeightEntry } from "../types";

type BodySubTab = "cycle" | "measurements" | "insights";
type BodyModal = "cycle-setup" | "update";

interface BodyPageProps {
  measurements: Measurements;
  setMeasurements: Setter<Measurements>;
  weightHistory: WeightEntry[];
  setWeightHistory: Setter<WeightEntry[]>;
  cycleInfo: CycleInfo | null;
  periodStart: string;
  setPeriodStart: Setter<string>;
  periodHistory: PeriodEntry[];
  setPeriodHistory: Setter<PeriodEntry[]>;
  cycleLength: number;
  setCycleLength: Setter<number>;
  showToast: ShowToast;
}

interface MeasurementField {
  k: MeasurementKey;
  label: string;
  unit: string;
}

/** The Cycle / Body / Insights switcher at the top of the Body tab. */
function SubTabs({ subTab, setSubTab }: { subTab: BodySubTab; setSubTab: (tab: BodySubTab) => void }) {
  return (
    <div style={{display:"flex",borderBottom:`2px solid ${C.border}`}}>
      {([["cycle","Cycle"],["measurements","Body"],["insights","Insights"]] as const).map(([v,l])=>(
        <button key={v} onClick={()=>setSubTab(v)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",cursor:"pointer",fontFamily:"Nunito",fontWeight:800,fontSize:14,color:subTab===v?"#7050B0":C.textSoft,borderBottom:subTab===v?"2px solid #7050B0":"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

export function BodyPage({ measurements, setMeasurements, weightHistory, setWeightHistory, cycleInfo, periodStart, setPeriodStart, periodHistory, setPeriodHistory, cycleLength, setCycleLength, showToast }: BodyPageProps) {
  const [subTab,setSubTab]=useState<BodySubTab>("cycle");
  const [modal,setModal]=useState<BodyModal|null>(null);
  const [form,setForm]=useState<Measurements>({});
  const [aiInsight,setAiInsight]=useState<string>(()=>load("body-insight",""));
  const [aiLoading,setAiLoading]=useState(false);

  const fields: MeasurementField[]=[{k:"weight",label:"Weight",unit:"kg"},{k:"height",label:"Height",unit:"cm"},{k:"waist",label:"Waist",unit:"cm"},{k:"hips",label:"Hips",unit:"cm"},{k:"bust",label:"Bust / Chest",unit:"cm"},{k:"glutes",label:"Glutes",unit:"cm"},{k:"thighs",label:"Thighs",unit:"cm"},{k:"arms",label:"Arms",unit:"cm"}];

  const save_m=()=>{
    setMeasurements(form);
    if(form.weight){setWeightHistory(h=>{const today=new Date().toISOString().slice(0,10);return [...h.filter(x=>x.date!==today),{date:today,weight:parseFloat(String(form.weight))}].sort((a,b)=>a.date.localeCompare(b.date));});}
    setModal(null);showToast("Measurements saved ✓");
  };

  const generateInsight=async()=>{
    setAiLoading(true);
    const phaseCtx=cycleInfo?`Currently in ${cycleInfo.phase.label} phase (Day ${cycleInfo.dayOfCycle}).`:"No cycle data logged.";
    const mStr=fields.filter(f=>measurements[f.k]).map(f=>`${f.label}: ${measurements[f.k]}${f.unit}`).join(", ");
    const weightTrend=weightHistory.length>=2?`Weight: ${weightHistory[weightHistory.length-2]?.weight}kg to ${weightHistory[weightHistory.length-1]?.weight}kg`:"";
    try{
      const result=await callAI("/api/body-insight",`My measurements: ${mStr||"not yet logged"}. ${weightTrend}. ${phaseCtx} Give me a warm explanation of what I'm seeing in my body right now, factoring in my cycle phase. Reassure me about any fluctuations.`);
      const cleaned=result.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").trim();
      setAiInsight(cleaned);save("body-insight",cleaned);
    }catch{showToast("Could not get insight. Is the backend running?");}
    setAiLoading(false);
  };

  const bmi=measurements.weight&&measurements.height?(Number(measurements.weight)/((Number(measurements.height)/100)**2)).toFixed(1):null;
  const latestWeight=weightHistory.length?weightHistory[weightHistory.length-1]?.weight:null;
  const prevWeight=weightHistory.length>1?weightHistory[weightHistory.length-2]?.weight:null;
  const weightDiff=latestWeight&&prevWeight?(latestWeight-prevWeight).toFixed(1):null;

  return (
    <div className="scroll" style={{paddingBottom:90}}>
      <div style={{padding:"24px 24px 0",background:C.bg}}>
        <div className="row" style={{marginBottom:2}}><span style={{fontSize:26}}>🌸</span><div style={{fontSize:24,fontWeight:900,color:C.text}}>Body</div></div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:14}}>Your body, your cycle, your context</div>
        <SubTabs subTab={subTab} setSubTab={setSubTab}/>
      </div>
      <div style={{padding:"16px 16px 0"}}>

        {subTab==="cycle"&&<div>
          {!periodStart?<div className="card" style={{textAlign:"center",padding:"28px 20px",marginBottom:14}}>
            <div style={{fontSize:40,marginBottom:10}}>🌸</div>
            <div style={{fontWeight:900,fontSize:16,marginBottom:6}}>Track your cycle</div>
            <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:18}}>Log when your last period started and we'll tell you what phase you're in, what to expect, and how to work with your body.</div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>setModal("cycle-setup")}>Log my last period</button>
          </div>:<>
            <div className="card" style={{marginBottom:14,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <PhaseWheel cycleInfo={cycleInfo} size={200}/>
              {cycleInfo&&<div style={{width:"100%",background:cycleInfo.phase.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
                <div style={{fontWeight:900,fontSize:15,color:cycleInfo.phase.textColor,marginBottom:4}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase</div>
                <div style={{fontSize:13,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.body}</div>
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  <div style={{flex:1,background:"white",borderRadius:10,padding:"8px 10px",opacity:.85}}><div style={{fontSize:10,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:2}}>ENERGY</div><div style={{fontSize:11,color:C.textMid,fontWeight:600,lineHeight:1.4}}>{cycleInfo.phase.energy}</div></div>
                  <div style={{flex:1,background:"white",borderRadius:10,padding:"8px 10px",opacity:.85}}><div style={{fontSize:10,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:2}}>NEXT PERIOD</div><div style={{fontSize:11,color:C.textMid,fontWeight:600}}>{cycleInfo.daysUntilNext>0?`~${cycleInfo.daysUntilNext} days`:"very soon"}</div></div>
                </div>
              </div>}
            </div>
            {weightDiff&&cycleInfo&&<div className="card" style={{marginBottom:14,background:cycleInfo.phase.bg,border:`1.5px solid ${cycleInfo.phase.color}`}}>
              <div style={{fontWeight:800,fontSize:13,color:cycleInfo.phase.textColor,marginBottom:6}}>⚖️ About your weight right now</div>
              <div style={{fontSize:13,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.weight}</div>
              {Math.abs(Number(weightDiff))>=.5&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:cycleInfo.phase.textColor,opacity:.75}}>Your log shows a {Number(weightDiff)>0?"+":""}{weightDiff} kg change since your last entry.</div>}
            </div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}><div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:6}}>💭 Mood and mind</div><div style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{cycleInfo.phase.moodNote}</div></div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🏋️ Workouts this phase</div>
              {cycleInfo.phase.workouts.map((w,i)=><div key={i} className="row" style={{padding:"5px 0",gap:8}}><span style={{color:cycleInfo.phase.color,fontWeight:900,flexShrink:0}}>→</span><span style={{fontSize:13,color:C.textMid,fontWeight:600}}>{w}</span></div>)}
              {cycleInfo.phase.avoid.length>0&&<div style={{marginTop:10,padding:"10px 12px",background:C.bgDeep,borderRadius:10}}><div style={{fontSize:11,fontWeight:800,color:C.textSoft,marginBottom:6}}>EASE OFF ON</div>{cycleInfo.phase.avoid.map((a,i)=><div key={i} style={{fontSize:12,color:C.textSoft,fontWeight:600,padding:"2px 0"}}>· {a}</div>)}</div>}
            </div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🥗 Nutrients to prioritise</div>
              {cycleInfo.phase.foods.map((f,i)=><div key={i} className="row" style={{padding:"5px 0",gap:8}}><span style={{color:cycleInfo.phase.color,fontWeight:900,flexShrink:0}}>→</span><span style={{fontSize:13,color:C.textMid,fontWeight:600}}>{f}</span></div>)}
            </div>}
            {periodHistory&&periodHistory.length>1&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🗓 Period history</div>
              {(() => {
                const entries = periodHistory.slice(0,6);
                const lengths = entries.map((p,i,arr)=>arr[i+1]?Math.round((new Date(p.date).getTime()-new Date(arr[i+1].date).getTime())/(1000*60*60*24)):null).filter((n): n is number => Boolean(n));
                const avg = lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length) : null;
                return (<>
                  {avg&&<div style={{background:C.lavender,borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,fontWeight:700,color:"#7050B0"}}>Your average cycle: {avg} days</div>}
                  {entries.map((p,i,arr)=>{const next=arr[i+1];const len=next?Math.round((new Date(p.date).getTime()-new Date(next.date).getTime())/(1000*60*60*24)):null;return(<div key={p.date} className="row-between" style={{padding:"6px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}><span style={{fontSize:13,fontWeight:600,color:C.textMid}}>{new Date(p.date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>{len&&<span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>{len}d</span>}</div>);})}
                </>);
              })()}
            </div>}
            <button className="btn btn-ghost" style={{width:"100%",marginBottom:14}} onClick={()=>setModal("cycle-setup")}>✏️ Update period date or cycle length</button>
          </>}
        </div>}

        {subTab==="measurements"&&<div>
          {/* Measurement rings */}
          <div className="card" style={{marginBottom:14}}>
            <div className="row-between" style={{marginBottom:14}}>
              <div className="sec-title" style={{margin:0}}>Measurements</div>
              <button className="btn btn-primary btn-sm" onClick={()=>{setForm({...measurements});setModal("update");}}>Update</button>
            </div>
            <MeasurementRings measurements={measurements} goalMeasurements={{}}/>
          </div>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {([{k:"weight",label:"Weight",unit:"kg"},{k:"height",label:"Height",unit:"cm"}] as const).map(f=>(
              <div key={f.k} className="card" style={{padding:"14px"}}>
                <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:4}}>{f.label}</div>
                <div style={{fontSize:24,fontWeight:900,color:C.text}}>{measurements[f.k]||"—"}<span style={{fontSize:12,color:C.textSoft,marginLeft:3}}>{measurements[f.k]?f.unit:""}</span></div>
              </div>
            ))}
          </div>
          {bmi&&<div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginBottom:14,padding:"6px 10px",background:C.bgDeep,borderRadius:10}}>
            BMI {bmi} · BMI is one of many indicators and doesn't account for muscle, cycle phase, or body composition. Use it as context, not a verdict.
          </div>}
          {/* Weight chart */}
          <div className="card" style={{marginBottom:14}}><div className="sec-title">Weight history</div><WeightChart history={weightHistory} cycleInfo={cycleInfo}/></div>
          {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:18,padding:"14px 16px",border:`1.5px solid ${cycleInfo.phase.color}`,marginBottom:14}}><div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase context</div><div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.weight}</div></div>}
        </div>}

        {subTab==="insights"&&<div>
          {cycleInfo&&<PhaseBadge cycleInfo={cycleInfo}/>}
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:4}}>✨ AI body insight</div>
            <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginBottom:14,lineHeight:1.5}}>Get a warm, personalised explanation of what's going on in your body right now, taking into account your cycle phase, weight trend, and measurements.</div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={generateInsight} disabled={aiLoading}>{aiLoading?<><div className="spin"/>Thinking about your body...</>:"✨ Get my insight"}</button>
            {aiInsight&&<div style={{marginTop:14,background:C.lavender,borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7050B0",marginBottom:8}}>YOUR INSIGHT</div>
              <div style={{fontSize:13,lineHeight:1.7,color:"#4030A0",fontWeight:500}}>{aiInsight}</div>
              <button style={{marginTop:10,background:"none",border:"none",fontSize:11,color:"#9070C0",fontWeight:700,cursor:"pointer",padding:0,fontFamily:"Nunito"}} onClick={()=>{setAiInsight("");save("body-insight","");}}>Clear</button>
            </div>}
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:10}}>UNDERSTANDING YOUR CYCLE</div>
            {Object.values(PHASES).map(p=><div key={p.id} style={{background:p.bg,borderRadius:18,padding:"14px 16px",marginBottom:10,border:`1.5px solid ${p.color}`,opacity:cycleInfo?.phase?.id===p.id?1:.7}}><div style={{fontWeight:900,fontSize:14,color:p.textColor,marginBottom:4}}>{p.emoji} {p.label} · {p.days}</div><div style={{fontSize:12,color:p.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{p.body}</div></div>)}
          </div>
        </div>}
      </div>

      {modal==="cycle-setup"&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="modal">
        <div className="modal-handle"/><div className="modal-title">🌸 Your cycle</div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:18}}>We only need two things. Your data stays on your device and is never shared.</div>
        <div style={{marginBottom:14}}><label className="label">First day of your last period</label><input className="input" type="date" value={periodStart||""} onChange={e=>setPeriodStart(e.target.value)}/></div>
        <div style={{marginBottom:20}}><label className="label">Average cycle length (days)</label><input className="input" type="number" min="21" max="40" value={cycleLength||28} onChange={e=>setCycleLength(parseInt(e.target.value)||28)}/><div style={{fontSize:11,color:C.textSoft,marginTop:5,fontWeight:600}}>Most cycles are 21-35 days. The average is 28.</div></div>
        <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{if(periodStart){setPeriodHistory(h=>{const already=h.find(x=>x.date===periodStart);if(already)return h;return[...h,{date:periodStart}].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);});}setModal(null);showToast("Cycle logged 🌸");}}>Save</button>
      </div></div>}

      {modal==="update"&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="modal">
        <div className="modal-handle"/><div className="modal-title">Update measurements 📏</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {fields.map(f=><div key={f.k}><label className="label">{f.label} ({f.unit})</label><input className="input" type="number" value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}/></div>)}
        </div>
        <div className="row" style={{gap:10,marginTop:16}}><button className="btn btn-ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" style={{flex:2}} onClick={save_m}>Save</button></div>
      </div></div>}
    </div>
  );
}
