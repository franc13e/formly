import { useState } from "react";
import { C, ACCENT } from "../theme";
import { CYCLE_FOODS } from "../data/nutrition";
import { Glyph } from "../components/Glyph";
import { FoodChat } from "../components/FoodChat";
import { RecipesTab } from "../components/RecipesTab";
import type { CycleInfo, ShowToast } from "../types";

type NutritionSubTab = "cycle" | "goals" | "recipes";

interface NutritionPageProps {
  cycleInfo: CycleInfo | null;
  showToast: ShowToast;
}

/** The This Phase / Ask / Recipes switcher at the top of the Nutrition tab. */
function SubTabs({ subTab, setSubTab }: { subTab: NutritionSubTab; setSubTab: (tab: NutritionSubTab) => void }) {
  return (
    <div style={{display:"flex",borderBottom:`2px solid ${C.border}`}}>
      {([["cycle","This Phase"],["goals","Ask"],["recipes","Recipes"]] as const).map(([v,l]) => (
        <button key={v} onClick={() => setSubTab(v)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",cursor:"pointer",fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:subTab===v?"#A95C76":C.textSoft,borderBottom:subTab===v?"2px solid #A95C76":"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── NUTRITION ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function NutritionPage({ cycleInfo, showToast }: NutritionPageProps) {
  const [subTab, setSubTab] = useState<NutritionSubTab>("cycle");
  // Note: the old "food-diary", "ai-goal-foods" and "food-goal" keys are left in storage untouched;
  // the food chat still reads "food-goal" for context.

  const phase = cycleInfo?.phase;
  const phaseFoods = phase ? CYCLE_FOODS[phase.id] : null;

  return (
    <div className="scroll" style={{paddingBottom:90}}>
      <div style={{padding:"24px 24px 0",background:C.bg}}>
        <div className="row" style={{marginBottom:2}}><div className="h-display" style={{fontSize:32,color:C.text}}>Nutrition</div></div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:14}}>Food insights for your cycle and goals</div>
        <SubTabs subTab={subTab} setSubTab={setSubTab}/>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* CYCLE TAB */}
        {subTab==="cycle" && (
          <div>
            {!phase || !phaseFoods ? (
              <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
                <div style={{marginBottom:10}}><Glyph emoji="🌸" size={22}/></div>
                <div style={{fontWeight:600,fontSize:16,marginBottom:8}}>Log your cycle first</div>
                <div style={{fontSize:13,color:C.textSoft,lineHeight:1.6}}>Head to the Body tab and log your last period date to get personalised food insights for each phase of your cycle.</div>
              </div>
            ) : (
              <div>
                <div style={{background:phase.bg,borderRadius:18,padding:"16px",marginBottom:14,border:`1.5px solid ${phase.color}`}}>
                  <div style={{fontWeight:700,fontSize:16,color:phase.textColor,marginBottom:4}}><Glyph emoji={phase.emoji} chip={false} size={15} color={phase.textColor}/> {phase.label} phase</div>
                  <div style={{fontSize:13,color:phase.textColor,fontWeight:500,opacity:.9,lineHeight:1.6}}>Day {cycleInfo.dayOfCycle} of your cycle. Here is what your body benefits most from right now.</div>
                </div>

                <div className="card" style={{marginBottom:14}}>
                  <div style={{fontWeight:600,fontSize:14,color:C.textMid,marginBottom:12}}>Foods to focus on</div>
                  {phaseFoods.eat.map((item, i) => (
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",alignItems:"flex-start"}}>
                      <Glyph emoji={item.emoji} size={16}/>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{item.food}</div>
                        <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.5}}>{item.why}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {phaseFoods.ease.length > 0 && (
                  <div className="card" style={{marginBottom:14,background:C.rose,border:"none"}}>
                    <div style={{fontWeight:600,fontSize:14,color:ACCENT.protein.text,marginBottom:12}}>Ease off on</div>
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

        {/* GOAL TAB: food chat */}
        {subTab==="goals" && <FoodChat cycleInfo={cycleInfo}/>}

        {/* RECIPES TAB */}
        {subTab==="recipes" && <RecipesTab cycleInfo={cycleInfo} showToast={showToast}/>}

      </div>
    </div>
  );
}
