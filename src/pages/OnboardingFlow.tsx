import { useState } from "react";
import { C } from "../theme";

interface OnboardingFlowProps {
  /** Called on the last step. `periodStart` is "" when cycle tracking was declined or skipped. */
  onDone: (name: string, periodStart: string, cycleLength: number) => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function OnboardingFlow({ onDone }: OnboardingFlowProps) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [pStart,setPStart]=useState("");
  const [cLen,setCLen]=useState(28);
  const [trackCycle,setTrackCycle]=useState<boolean|null>(null);

  const next=()=>{
    if(step===0){setStep(1);return;}
    if(step===1){setStep(2);return;}
    if(step===2){if(trackCycle===false){setStep(4);}else if(trackCycle===true){setStep(3);}return;}
    if(step===3){setStep(4);return;}
    if(step===4){onDone(name,trackCycle?pStart:"",cLen);return;}
  };
  const canNext=()=>{if(step===1&&!name.trim())return false;if(step===2&&trackCycle===null)return false;return true;};

  const STEPS=[
    {emoji:"🌸",title:"Welcome to Formly",sub:"A fitness app built around how your body actually works."},
    {emoji:"👋",title:"What should we call you?",sub:"Just your first name is fine."},
    {emoji:"🌙",title:"Would you like to track your cycle?",sub:"Formly uses your cycle phase to give context to your weight, energy, and mood, and to personalise workout and nutrition suggestions. Your data never leaves your device."},
    {emoji:"📅",title:"When did your last period start?",sub:"An estimate is fine. You can always update this later."},
    {emoji:"✨",title:"You're all set!",sub:"Formly will guide you through each phase, help you understand your body's patterns, and suggest workouts and nutrition that fit where you are."},
  ];
  const progressMap=trackCycle===false?[0,1,2,4]:[0,1,2,3,4];
  const curIdx=progressMap.indexOf(step);
  const s=STEPS[step];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",padding:"0 24px",background:C.bg}}>
      <div style={{padding:"52px 0 0"}}>
        <div style={{height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:C.lavenderDeep,width:`${(curIdx/(progressMap.length-1))*100}%`,transition:"width .4s ease"}}/>
        </div>
        <div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginTop:6}}>Step {curIdx+1} of {progressMap.length}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:24}}>
        <div style={{fontSize:56,textAlign:"center"}}>{s.emoji}</div>
        <div>
          <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:26,color:C.text,textAlign:"center",lineHeight:1.2,marginBottom:12}}>{s.title}</div>
          <div style={{fontSize:14,color:C.textSoft,fontWeight:500,textAlign:"center",lineHeight:1.7}}>{s.sub}</div>
        </div>
        {step===1&&<input className="input" placeholder="Your name" value={name} autoFocus onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canNext()&&next()} style={{fontSize:16,textAlign:"center",padding:"14px"}}/>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{val:true,emoji:"🌸",label:"Yes, track my cycle",sub:"Get phase-aware insights, workouts and nutrition"},{val:false,emoji:"✦",label:"No thanks, skip this",sub:"You can always enable it later in the Body tab"}].map(opt=>(
            <button key={String(opt.val)} onClick={()=>setTrackCycle(opt.val)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:16,border:`2px solid ${trackCycle===opt.val?C.lavenderDeep:C.border}`,background:trackCycle===opt.val?C.lavender:C.white,cursor:"pointer",fontFamily:"Nunito",textAlign:"left",transition:"all .15s"}}>
              <span style={{fontSize:24}}>{opt.emoji}</span>
              <div><div style={{fontWeight:800,fontSize:14,color:trackCycle===opt.val?"#5040A0":C.text}}>{opt.label}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginTop:2}}>{opt.sub}</div></div>
              <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",border:`2px solid ${trackCycle===opt.val?"#7050B0":C.border}`,background:trackCycle===opt.val?"#7050B0":"transparent",flexShrink:0}}/>
            </button>
          ))}
        </div>}
        {step===3&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label className="label">First day of your last period</label><input className="input" type="date" value={pStart} onChange={e=>setPStart(e.target.value)} style={{fontSize:15}}/></div>
          <div><label className="label">Average cycle length (days)</label><input className="input" type="number" min="21" max="40" value={cLen} onChange={e=>setCLen(parseInt(e.target.value)||28)}/><div style={{fontSize:11,color:C.textSoft,marginTop:5,fontWeight:600}}>Most cycles are 21-35 days. The average is 28.</div></div>
          <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start"}} onClick={()=>setStep(4)}>Skip for now</button>
        </div>}
        {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{emoji:"🥗",text:"Get food insights for your cycle phase and fitness goals"},{emoji:"🏋️",text:"Plan and log workouts with cycle-aware suggestions"},{emoji:trackCycle?"🌙":"📏",text:trackCycle?"See what phase you're in and why your body feels the way it does":"Track your measurements and weight over time"},{emoji:"✨",text:"Get an AI workout plan"+(trackCycle?" tailored to your current cycle phase":"")}].map((item,i)=>(
            <div key={i} className="row" style={{background:C.card,borderRadius:14,padding:"12px 14px",gap:12,border:`1px solid ${C.border}`}}><span style={{fontSize:22}}>{item.emoji}</span><span style={{fontSize:13,fontWeight:600,color:C.textMid}}>{item.text}</span></div>
          ))}
        </div>}
      </div>
      <div style={{paddingBottom:"max(32px,env(safe-area-inset-bottom))",paddingTop:16}}>
        <button className="btn btn-primary" style={{width:"100%",fontSize:16,padding:16}} onClick={next} disabled={!canNext()}>
          {step===4?`Let's go, ${name||"you"} 🌸`:"Continue →"}
        </button>
      </div>
    </div>
  );
}
