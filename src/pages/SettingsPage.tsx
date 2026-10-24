import { useState } from "react";
import { C, ACCENT } from "../theme";
import { save } from "../lib/storage";
import { useAuth } from "../auth/AuthContext";
import type { Setter, ShowToast } from "../types";

interface SettingsPageProps {
  userName: string;
  setUserName: Setter<string>;
  showToast: ShowToast;
}

export function SettingsPage({ userName, setUserName, showToast }: SettingsPageProps) {
  const [localName, setLocalName] = useState(userName || "");
  const auth = useAuth();

  return (
    <div className="scroll" style={{padding:"24px 24px 40px"}}>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:4}}>Profile</div>
      <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:20}}>Your details and about Formly</div>

      {/* Name */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Your name</div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <label className="label">Display name</label>
            <input className="input" placeholder="e.g. Sofia" value={localName} onChange={e=>setLocalName(e.target.value)}/>
          </div>
          <button className="btn btn-primary btn-sm" style={{flexShrink:0,marginBottom:1}} onClick={()=>{setUserName(localName);save("user-name",localName);showToast("Name saved ✓");}}>Save</button>
        </div>
      </div>

      {/* Account */}
      {auth.mode !== "local" && (
        <div className="card" style={{marginBottom:14}}>
          <div className="sec-title">Account</div>
          {auth.mode === "account" ? (
            <>
              <div style={{fontSize:13,color:C.textMid,fontWeight:600,marginBottom:4}}>Signed in as {auth.email}</div>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:12}}>Your data syncs automatically across your devices.</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{void auth.signOut();}}>Sign out</button>
            </>
          ) : (
            <>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:12}}>You're using Formly without an account, so your data only lives in this browser. Create an account to back it up and sync it across devices — your current data comes with you.</div>
              <button className="btn btn-primary btn-sm" onClick={auth.startSignIn}>Sign in or create account</button>
            </>
          )}
        </div>
      )}

      {/* About */}
      <div className="card" style={{marginBottom:14,background:`linear-gradient(135deg,${C.lavender},${C.rose})`,border:"none"}}>
        <div style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:8}}>🌸 About Formly</div>
        <div style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.8}}>
          Formly is a women-forward fitness app built around how your body works across your cycle. Understand your energy, plan your workouts, and learn what your body needs at each phase.
        </div>
      </div>

      {/* What it does */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">What Formly does</div>
        {[
          {emoji:"🌙",title:"Cycle-aware fitness",desc:"Tracks your menstrual cycle and uses it to contextualise your energy, mood, weight fluctuations, and workout capacity. Because 1-3kg of water retention in luteal phase is not failure it's just physiology."},
          {emoji:"🥗",title:"Nutrition guidance",desc:"Get food suggestions tailored to your cycle phase and fitness goals. Understand what to prioritise and why based on where you are in your cycle."},
          {emoji:"🏋️",title:"Workout planning",desc:"Browse workouts, build a weekly schedule, and get an AI-generated plan tailored to your goal and current cycle phase. Log your sets, reps, and weights to track progress over time."},
          {emoji:"📏",title:"Body tracking",desc:"Track measurements over time and see trends. Weight naturally fluctuates throughout the month Formly helps you understand why rather than reacting to every number."},
          {emoji:"✨",title:"AI Coach",desc:"Generates personalised workout and nutrition plans that account for your cycle phase, fitness goal, activity level, and any personal context you share like injuries or preferences."},
        ].map(f=>(
          <div key={f.title} className="row" style={{padding:"12px 0",borderTop:`1px solid ${C.border}`,alignItems:"flex-start",gap:12}}>
            <span style={{fontSize:22,flexShrink:0}}>{f.emoji}</span>
            <div>
              <div style={{fontWeight:800,fontSize:14,marginBottom:3}}>{f.title}</div>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.6}}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Philosophy */}
      <div className="card" style={{marginBottom:14,background:C.sage,border:"none"}}>
        <div style={{fontSize:13,fontWeight:700,color:ACCENT.fiber.text,marginBottom:6}}>Our approach</div>
        <div style={{fontSize:13,color:"#2A5A28",fontWeight:500,lineHeight:1.7}}>
          Formly is built around awareness. Understanding your body, working with your cycle, and moving in ways that feel good.
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="sec-title">Data and privacy</div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:14}}>{auth.mode === "account"
          ? "Your data is stored in this browser and synced to your account, where only you can access it. Prompts are sent to the AI backend when you use AI features."
          : "Everything is stored locally in your browser. Nothing leaves your device except prompts sent to the AI backend when you use AI features."}</div>
        <button className="btn btn-ghost btn-sm" style={{color:"#C05070",borderColor:C.roseDeep}} onClick={()=>{
          const msg = auth.mode === "account" ? "Delete all your data from this device and your account? This cannot be undone." : "Clear all app data? This cannot be undone.";
          if(!window.confirm(msg)) return;
          void auth.deleteCloudData().then(()=>{localStorage.clear();window.location.reload();}, ()=>showToast("Couldn't delete cloud data — try again"));
        }}>Clear all data</button>
      </div>
    </div>
  );
}
