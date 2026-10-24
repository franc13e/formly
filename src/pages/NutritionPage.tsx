import { useState, useEffect } from "react";
import { C, ACCENT } from "../theme";
import { callAI } from "../lib/api";
import { load, save } from "../lib/storage";
import { CYCLE_FOODS, GOAL_FOODS } from "../data/nutrition";
import type { CycleInfo, FoodLogEntry, ShowToast } from "../types";
import { localDateKey } from "../lib/date";

type NutritionSubTab = "cycle" | "goals" | "diary";

interface NutritionPageProps {
  cycleInfo: CycleInfo | null;
  showToast: ShowToast;
}

/** The This Phase / My Goal / Diary switcher at the top of the Nutrition tab. */
function SubTabs({ subTab, setSubTab }: { subTab: NutritionSubTab; setSubTab: (tab: NutritionSubTab) => void }) {
  return (
    <div style={{display:"flex",borderBottom:`2px solid ${C.border}`}}>
      {([["cycle","This Phase"],["goals","My Goal"],["diary","Diary"]] as const).map(([v,l]) => (
        <button key={v} onClick={() => setSubTab(v)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",cursor:"pointer",fontFamily:"Nunito",fontWeight:800,fontSize:14,color:subTab===v?"#7050B0":C.textSoft,borderBottom:subTab===v?"2px solid #7050B0":"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── NUTRITION ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function NutritionPage({ cycleInfo, showToast }: NutritionPageProps) {
  const [subTab, setSubTab] = useState<NutritionSubTab>("cycle");
  const [selectedGoal, setSelectedGoal] = useState<string>(() => load("food-goal", ""));
  const [customGoal, setCustomGoal] = useState("");
  const [aiGoalFoods, setAiGoalFoods] = useState<string | null>(() => load<string | null>("ai-goal-foods", null));
  const [aiGoalLoading, setAiGoalLoading] = useState(false);

  const fetchAiGoalFoods = async () => {
    const goalText = customGoal.trim() || selectedGoal;
    if (!goalText) return;
    setAiGoalLoading(true);
    const phaseCtx = cycleInfo ? `Currently in ${cycleInfo.phase.label} phase (Day ${cycleInfo.dayOfCycle}).` : "";
    try {
      const result = await callAI("/api/suggest-goals", `My fitness goal: ${goalText}. ${phaseCtx} What foods should I focus on to support this goal? Be practical and specific. Mention how my current cycle phase affects food needs if provided.`);
      const cleaned = result.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").trim();
      setAiGoalFoods(cleaned);
      save("ai-goal-foods", cleaned);
    } catch(e) { console.error(e); }
    setAiGoalLoading(false);
  };
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>(() => load("food-diary", []));
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => { save("food-diary", foodLog); }, [foodLog]);
  useEffect(() => { save("food-goal", selectedGoal); }, [selectedGoal]);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    setFoodLog(l => [{ text: newEntry.trim(), time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}), date: localDateKey(), id: Date.now() }, ...l]);
    setNewEntry("");
    showToast("Added to diary");
  };

  const phase = cycleInfo?.phase;
  const phaseFoods = phase ? CYCLE_FOODS[phase.id] : null;
  const goalFoods = selectedGoal ? GOAL_FOODS[selectedGoal] : null;

  return (
    <div className="scroll" style={{paddingBottom:90}}>
      <div style={{padding:"24px 24px 0",background:C.bg}}>
        <div className="row" style={{marginBottom:2}}><span style={{fontSize:26}}>🥗</span><div style={{fontSize:24,fontWeight:900,color:C.text,marginLeft:8}}>Nutrition</div></div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:14}}>Food insights for your cycle and goals</div>
        <SubTabs subTab={subTab} setSubTab={setSubTab}/>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* CYCLE TAB */}
        {subTab==="cycle" && (
          <div>
            {!phase || !phaseFoods ? (
              <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
                <div style={{fontSize:36,marginBottom:10}}>🌸</div>
                <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>Log your cycle first</div>
                <div style={{fontSize:13,color:C.textSoft,lineHeight:1.6}}>Head to the Body tab and log your last period date to get personalised food insights for each phase of your cycle.</div>
              </div>
            ) : (
              <div>
                <div style={{background:phase.bg,borderRadius:18,padding:"16px",marginBottom:14,border:`1.5px solid ${phase.color}`}}>
                  <div style={{fontWeight:900,fontSize:16,color:phase.textColor,marginBottom:4}}>{phase.emoji} {phase.label} phase</div>
                  <div style={{fontSize:13,color:phase.textColor,fontWeight:500,opacity:.9,lineHeight:1.6}}>Day {cycleInfo.dayOfCycle} of your cycle. Here is what your body benefits most from right now.</div>
                </div>

                <div className="card" style={{marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>Foods to focus on</div>
                  {phaseFoods.eat.map((item, i) => (
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",alignItems:"flex-start"}}>
                      <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:13,marginBottom:2}}>{item.food}</div>
                        <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.5}}>{item.why}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {phaseFoods.ease.length > 0 && (
                  <div className="card" style={{marginBottom:14,background:C.rose,border:"none"}}>
                    <div style={{fontWeight:800,fontSize:14,color:ACCENT.protein.text,marginBottom:12}}>Ease off on</div>
                    {phaseFoods.ease.map((item, i) => (
                      <div key={i} style={{padding:"8px 0",borderTop:i>0?`1px solid ${C.roseDeep}`:"none"}}>
                        <div style={{fontWeight:700,fontSize:13,color:ACCENT.protein.text}}>{item.food}</div>
                        <div style={{fontSize:12,color:ACCENT.protein.text,fontWeight:500,opacity:.8,marginTop:2}}>{item.why}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GOAL TAB */}
        {subTab==="goals" && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>What is your main goal?</div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {Object.keys(GOAL_FOODS).map(g => {
                  const sel = selectedGoal === g;
                  return (
                    <button key={g} onClick={() => setSelectedGoal(g)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:14,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,background:sel?C.lavender:C.bgDeep,cursor:"pointer",fontFamily:"Nunito",textAlign:"left",transition:"all .15s"}}>
                      <span style={{fontWeight:700,fontSize:13,color:sel?"#5040A0":C.text}}>{g}</span>
                      <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
                    </button>
                  );
                })}
              </div>
              <div style={{marginBottom:6}}>
                <label className="label">Or describe your goal in your own words</label>
                <textarea className="input" rows={2} placeholder="e.g. I want to build my glutes and feel stronger. I train 4x a week and prefer whole foods." value={customGoal} onChange={e=>setCustomGoal(e.target.value)} style={{resize:"none",lineHeight:1.6,marginBottom:8}}/>
                <button className="btn btn-primary" style={{width:"100%"}} onClick={fetchAiGoalFoods} disabled={aiGoalLoading||(!selectedGoal&&!customGoal.trim())}>
                  {aiGoalLoading?<><div className="spin"/>Getting your food focus...</>:"✨ Get personalised food suggestions"}
                </button>
              </div>
            </div>

            {goalFoods && (
              <div>
                <div className="card" style={{marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>What to focus on</div>
                  {goalFoods.focus.map((f,i) => (
                    <div key={i} className="row" style={{gap:8,padding:"6px 0",borderTop:i>0?`1px solid ${C.border}`:"none",alignItems:"flex-start"}}>
                      <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:3}}>•</span>
                      <span style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{marginBottom:14,background:C.sage,border:"none"}}>
                  <div style={{fontWeight:800,fontSize:14,color:ACCENT.fiber.text,marginBottom:10}}>Great foods to include</div>
                  {goalFoods.examples.map((ex,i) => (
                    <div key={i} className="row" style={{gap:8,padding:"4px 0",alignItems:"flex-start"}}>
                      <span style={{color:ACCENT.fiber.text,fontWeight:900,flexShrink:0}}>•</span>
                      <span style={{fontSize:13,color:"#2A5A28",fontWeight:500,lineHeight:1.5}}>{ex}</span>
                    </div>
                  ))}
                </div>
                {cycleInfo && (
                  <div style={{background:cycleInfo.phase.bg,borderRadius:16,padding:"14px 16px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
                    <div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>{cycleInfo.phase.emoji} Combined with your {cycleInfo.phase.label.toLowerCase()} phase</div>
                    <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>
                      Your cycle phase affects how your body uses nutrients. Right now your body benefits from: {CYCLE_FOODS[cycleInfo.phase.id].eat.slice(0,2).map(f=>f.food.toLowerCase()).join(" and ")}.
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiGoalFoods && (
              <div style={{marginTop:14,background:C.lavender,borderRadius:16,padding:"14px 16px"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#7050B0",marginBottom:8}}>✨ AI FOOD SUGGESTIONS</div>
                <div style={{fontSize:13,lineHeight:1.7,color:"#4030A0",fontWeight:500,whiteSpace:"pre-wrap"}}>{aiGoalFoods}</div>
                <button style={{marginTop:10,background:"none",border:"none",fontSize:11,color:"#9070C0",fontWeight:700,cursor:"pointer",fontFamily:"Nunito"}} onClick={()=>{setAiGoalFoods(null);save("ai-goal-foods",null);}}>Clear</button>
              </div>
            )}
          </div>
        )}

        {/* DIARY TAB */}
        {subTab==="diary" && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:4}}>Food diary</div>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginBottom:12,lineHeight:1.5}}>A simple log of what you ate. No numbers, no tracking. Just awareness.</div>
              <div className="row" style={{gap:8}}>
                <input className="input" placeholder="What did you eat?" value={newEntry} onChange={e=>setNewEntry(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEntry()} style={{fontSize:13}}/>
                <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={addEntry}>Add</button>
              </div>
            </div>
            {foodLog.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 0",color:C.textSoft}}>
                <div style={{fontSize:32,marginBottom:8}}>🌿</div>
                <div style={{fontWeight:700}}>Nothing logged yet</div>
                <div style={{fontSize:12,marginTop:4}}>Add what you ate above</div>
              </div>
            ) : (
              Object.entries(foodLog.reduce<Record<string, FoodLogEntry[]>>((acc,e)=>{const d=e.date||"Today";if(!acc[d])acc[d]=[];acc[d].push(e);return acc;},{})).sort(([a],[b])=>b.localeCompare(a)).map(([date,entries])=>(
                <div key={date} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:8}}>
                    {date===localDateKey()?"Today":new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                  </div>
                  {entries.map(e=>(
                    <div key={e.id} className="card" style={{marginBottom:8,padding:"10px 14px"}}>
                      <div className="row-between">
                        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{e.text}</span>
                        <span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>{e.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
