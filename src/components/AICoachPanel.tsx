import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { C } from "../theme";
import { callAI } from "../lib/api";
import { load, save } from "../lib/storage";
import { PhaseBadge } from "./PhaseBadge";
import type { CycleInfo, FocusArea, Measurements, OptionCard, Setter, ShowToast } from "../types";

interface AICoachPanelProps {
  measurements: Measurements;
  cycleInfo: CycleInfo | null;
  /** The saved AI plan text (App state, persisted under "ai-plan"), or null. */
  plan: string | null;
  setPlan: Setter<string | null>;
  showToast: ShowToast;
}

interface PlanDay {
  title: string;
  items: string[];
}

// ─── AI Coach Panel (embedded in Workouts tab) ────────────────────────────────
export function AICoachPanel({ measurements, cycleInfo, plan, setPlan, showToast }: AICoachPanelProps) {
  const [goalId, setGoalId] = useState<string>(() => load("ai-goal", ""));
  const [activityId, setActivityId] = useState<string>(() => load("ai-activity", ""));
  const [focusAreas, setFocusAreas] = useState<string[]>(() => load("ai-focus", []));
  const [age, setAge] = useState<string>(() => load("ai-age", ""));
  const [sex, setSex] = useState<string>(() => load("ai-sex", "Female"));
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<string>(() => load("ai-wpw", "4"));
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { save("ai-goal", goalId); }, [goalId]);
  useEffect(() => { save("ai-activity", activityId); }, [activityId]);
  useEffect(() => { save("ai-focus", focusAreas); }, [focusAreas]);
  useEffect(() => { save("ai-age", age); }, [age]);
  useEffect(() => { save("ai-sex", sex); }, [sex]);
  useEffect(() => { save("ai-wpw", workoutsPerWeek); }, [workoutsPerWeek]);

  const toggleFocus = (id: string) => setFocusAreas(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const GOAL_CARDS: OptionCard[] = [
    {id:"lose-fat",emoji:"🔥",label:"Lose Fat",sub:"Caloric deficit + cardio focus"},
    {id:"build-muscle",emoji:"💪",label:"Build Muscle",sub:"Caloric surplus + progressive overload"},
    {id:"tone-define",emoji:"✨",label:"Tone & Define",sub:"Slight deficit + strength training"},
    {id:"endurance",emoji:"🏃",label:"Endurance",sub:"Cardio base + light resistance"},
    {id:"maintain",emoji:"🌸",label:"Maintain",sub:"Maintenance calories + balanced training"},
  ];
  const ACTIVITY_OPTIONS: OptionCard[] = [
    {id:"sedentary",emoji:"🪑",label:"Sedentary",sub:"Desk job, little exercise"},
    {id:"light",emoji:"🚶",label:"Light",sub:"1-3 days/week"},
    {id:"moderate",emoji:"🏃",label:"Moderate",sub:"3-5 days/week"},
    {id:"active",emoji:"⚡",label:"Active",sub:"6-7 days/week"},
    {id:"very-active",emoji:"🔥",label:"Very Active",sub:"Physical job or 2x/day"},
  ];
  const FOCUS_AREAS: FocusArea[] = [
    {id:"chest",emoji:"💪",label:"Chest"},{id:"back",emoji:"🦅",label:"Back"},
    {id:"legs",emoji:"🦵",label:"Legs"},{id:"arms",emoji:"💪",label:"Arms"},
    {id:"shoulders",emoji:"🏋️",label:"Shoulders"},{id:"core",emoji:"🔥",label:"Core"},
    {id:"cardio",emoji:"🏃",label:"Cardio"},{id:"glutes",emoji:"🍑",label:"Glutes"},
  ];

  const generate = async () => {
    if (!goalId || !activityId) { setError("Pick a goal and activity level to continue."); return; }
    // The previous plan stays saved until a new one arrives; it is only hidden while loading.
    setLoading(true); setError("");
    const goalLabel = GOAL_CARDS.find(g => g.id === goalId)?.label || goalId;
    const actLabel = ACTIVITY_OPTIONS.find(a => a.id === activityId)?.label || activityId;
    const phaseCtx = cycleInfo ? `Currently in ${cycleInfo.phase.label} phase (Day ${cycleInfo.dayOfCycle}). ${cycleInfo.phase.tagline}.` : "";
    const ctx = [
      age && `Age: ${age}`,
      sex && `Sex: ${sex}`,
      measurements?.height && `Height: ${measurements.height}cm`,
      measurements?.weight && `Weight: ${measurements.weight}kg`,
      `Goal: ${goalLabel}`,
      `Activity: ${actLabel}`,
      workoutsPerWeek && `Workouts/week: ${workoutsPerWeek}`,
      focusAreas.length && `Focus: ${focusAreas.join(", ")}`,
      phaseCtx,
      customNote && `Extra context: ${customNote}`,
    ].filter(Boolean).join(". ");
    try {
      const result = await callAI("/api/ai-plan", `My profile: ${ctx}

Build me a personalised weekly workout structure and daily nutrition targets. Give practical food suggestions. End with what I will achieve and a motivating note.`);
      const cleaned = result.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
      setPlan(cleaned);
      showToast("Your plan is ready! ✨");
    } catch { setError("Could not generate plan. Make sure the backend is running."); }
    setLoading(false);
  };

  const clean = (t: string) => t.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/^#+\s*/gm,"").trim();

  const formatPlan = (text: string | null): ReactNode[] | null => {
    if (!text) return null;
    const stripped = clean(text);

    // Split into major sections by ALL-CAPS headers
    const sectionColors: Record<string, string> = {
      "WEEKLY WORKOUT PLAN": C.lavender,
      "DAILY NUTRITION TARGETS": C.butter,
      "FOODS TO FOCUS ON": C.sage,
      "WHAT YOU WILL ACHIEVE": C.rose,
      "COACH": C.peach,
    };
    const defaultColors = [C.lavender, C.butter, C.sage, C.rose, C.peach, C.sky];

    const sections = stripped.split(/\n(?=[A-Z][A-Z\s']+:)/);

    return sections.map((section, i) => {
      const lines = section.split("\n").filter(l => l.trim());
      if (!lines.length) return null;
      const firstLine = lines[0];
      const isHeader = /^[A-Z][A-Z\s']+:/.test(firstLine);
      const headerKey = isHeader ? Object.keys(sectionColors).find(k => firstLine.toUpperCase().includes(k)) : null;
      const bg = headerKey ? sectionColors[headerKey] : defaultColors[i % defaultColors.length];
      const headerLabel = isHeader ? firstLine.replace(/:$/, "").trim() : null;
      const bodyLines = isHeader ? lines.slice(1) : lines;

      // Parse day blocks within workout plan section
      const isDayBlock = bodyLines.some(l => /^-?\s*Day\s+\d/i.test(l));

      return (
        <div key={i} style={{marginBottom:12}}>
          {headerLabel && (
            <div style={{fontSize:11,fontWeight:900,color:C.textMid,letterSpacing:"1px",marginBottom:8,paddingLeft:2}}>
              {headerLabel.toUpperCase()}
            </div>
          )}
          {isDayBlock ? (
            // Render each day as its own card
            bodyLines.reduce<PlanDay[]>((acc, line) => {
              if (/^-?\s*Day\s+\d/i.test(line)) {
                acc.push({ title: line.replace(/^-\s*/, "").trim(), items: [] });
              } else if (acc.length > 0 && line.trim()) {
                acc[acc.length - 1].items.push(line.replace(/^\s*-\s*/, "").trim());
              }
              return acc;
            }, []).map((day, di) => (
              <div key={di} style={{background:bg,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:6}}>{day.title}</div>
                {day.items.map((item, ii) => (
                  <div key={ii} className="row" style={{gap:6,padding:"2px 0",alignItems:"flex-start"}}>
                    <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:2}}>·</span>
                    <span style={{fontSize:12.5,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{item}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div style={{background:bg,borderRadius:14,padding:"12px 14px"}}>
              {bodyLines.map((line, li) => (
                <div key={li} className="row" style={{gap:6,padding:"2px 0",alignItems:"flex-start"}}>
                  {line.startsWith("-") && <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:2}}>·</span>}
                  <span style={{fontSize:13,color:C.text,fontWeight:line.startsWith("-")?500:600,lineHeight:1.7}}>{line.replace(/^-\s*/,"")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div>
      {cycleInfo && (
        <div style={{marginBottom:14}}>
          <PhaseBadge cycleInfo={cycleInfo} compact/>
          <div style={{marginTop:10,background:cycleInfo.phase.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
            <div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>
              How this phase affects your plan
            </div>
            <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>
              {cycleInfo.phase.body}
            </div>
            <div style={{marginTop:8,fontSize:11,fontWeight:700,color:cycleInfo.phase.textColor,opacity:.8}}>
              Best workouts right now: {cycleInfo.phase.workouts.slice(0,2).join(", ")}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Your goal</div>
        {GOAL_CARDS.map(g => { const sel = goalId === g.id; return (
          <button key={g.id} onClick={() => setGoalId(g.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:sel?C.lavender:C.bgDeep,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:14,padding:"11px 14px",marginBottom:7,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
            <span style={{fontSize:20}}>{g.emoji}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:sel?"#5040A0":C.text}}>{g.label}</div><div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{g.sub}</div></div>
            <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
          </button>
        );})}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Activity level</div>
        {ACTIVITY_OPTIONS.map(a => { const sel = activityId === a.id; return (
          <button key={a.id} onClick={() => setActivityId(a.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:sel?C.lavender:C.bgDeep,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:12,padding:"10px 12px",marginBottom:6,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
            <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
            <span style={{fontSize:16}}>{a.emoji}</span>
            <div><span style={{fontWeight:800,fontSize:13,color:sel?"#5040A0":C.text}}>{a.label}</span><span style={{fontSize:11,color:C.textSoft}}> · {a.sub}</span></div>
          </button>
        );})}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Stats</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label className="label">Age</label><input className="input" type="number" placeholder="e.g. 26" value={age} onChange={e=>setAge(e.target.value)}/></div>
          <div><label className="label">Workouts/week</label><input className="input" type="number" min="1" max="7" placeholder="4" value={workoutsPerWeek} onChange={e=>setWorkoutsPerWeek(e.target.value)}/></div>
        </div>
        <div><label className="label">Sex</label><select className="input" value={sex} onChange={e=>setSex(e.target.value)}><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
        <div style={{fontSize:11,color:C.textSoft,marginTop:6,fontWeight:600}}>Height and weight pull from your Body tab automatically.</div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Focus areas <span style={{fontWeight:500,color:C.textSoft,fontSize:12}}>(optional)</span></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {FOCUS_AREAS.map(f => { const on = focusAreas.includes(f.id); return (
            <button key={f.id} onClick={() => toggleFocus(f.id)} className={`chip${on?" on":""}`} style={on?{background:C.lavenderDeep,borderColor:"transparent",color:"#5040A0"}:{}}>{f.emoji} {f.label}</button>
          );})}
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Anything else? <span style={{fontWeight:500,color:C.textSoft,fontSize:12}}>(optional)</span></div>
        <textarea className="input" rows={3} placeholder="e.g. I have a bad knee, I prefer home workouts, I don't eat meat..." value={customNote} onChange={e=>setCustomNote(e.target.value)} style={{resize:"none",lineHeight:1.6}}/>
      </div>

      {error && <div style={{fontSize:13,color:"#C05070",fontWeight:700,marginBottom:12,padding:"10px 14px",background:C.rose,borderRadius:12}}>{error}</div>}
      <button className="btn btn-primary" style={{width:"100%",fontSize:15,padding:"14px",marginBottom:16}} onClick={generate} disabled={loading}>
        {loading ? <><div className="spin"/>Crafting your plan...</> : "✨ Generate my plan"}
      </button>

      {plan && !loading && (
        <div style={{marginBottom:16}}>
          {formatPlan(plan)}
          <div style={{fontSize:11,color:C.textSoft,textAlign:"center",marginTop:8,lineHeight:1.6}}>Suggestions only. Adjust based on how you feel your body knows best.</div>
          <button className="btn btn-ghost" style={{width:"100%",marginTop:10}} onClick={()=>setPlan(null)}>Clear and start over</button>
        </div>
      )}
    </div>
  );
}
