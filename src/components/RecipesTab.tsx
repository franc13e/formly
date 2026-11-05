import { useEffect, useState, type ReactNode } from "react";
import { Bookmark, ChevronDown, Clock, X } from "lucide-react";
import { C } from "../theme";
import { callRecipe } from "../lib/api";
import { load, save } from "../lib/storage";
import { PHASES } from "../lib/cycle";
import { localDateKey } from "../lib/date";
import { parseRecipe, recipesFor, type RecipeFilter } from "../data/recipes";
import { buildFoodContext, stripEmphasis } from "../data/foodChat";
import { Glyph } from "./Glyph";
import { RecipePhotoView, RecipeVideoLinks } from "./RecipeMedia";
import type { AIRecipe, CycleInfo, PhaseId, RecipeKind, SavedRecipe, ShowToast } from "../types";

interface RecipesTabProps {
  cycleInfo: CycleInfo | null;
  showToast: ShowToast;
}

const PURPLE = "#B5506E";
const PHASE_IDS = Object.keys(PHASES) as PhaseId[];
const FILTERS: [RecipeFilter, string][] = [["all", "All"], ["meal", "Meals"], ["drink", "Drinks"]];

/** Ingredients + numbered steps, shown inside an expanded recipe card. */
function RecipeBody({ ingredients, steps }: { ingredients: string[]; steps: string[] }) {
  return (
    <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
      <div style={{fontSize:11,fontWeight:800,color:C.textMid,letterSpacing:.4,marginBottom:6}}>INGREDIENTS</div>
      {ingredients.map((ing, i) => (
        <div key={i} className="row" style={{gap:8,padding:"3px 0",alignItems:"flex-start"}}>
          <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0}}>•</span>
          <span style={{fontSize:13,color:C.text,fontWeight:500,lineHeight:1.5}}>{ing}</span>
        </div>
      ))}
      <div style={{fontSize:11,fontWeight:800,color:C.textMid,letterSpacing:.4,margin:"12px 0 6px"}}>STEPS</div>
      {steps.map((step, i) => (
        <div key={i} style={{display:"flex",gap:10,padding:"4px 0",alignItems:"flex-start"}}>
          <span style={{width:20,height:20,borderRadius:"50%",background:C.lavender,color:PURPLE,fontSize:11,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i + 1}</span>
          <span style={{fontSize:13,color:C.text,fontWeight:500,lineHeight:1.55}}>{step}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * A tappable card header (thumbnail, name, time, why) that expands to show a food photo,
 * the recipe body and YouTube / TikTok video links.
 */
function RecipeCard({ emoji, name, photoQuery, time, why, kind, open, onToggle, ingredients, steps, action }: {
  emoji: string; name: string; photoQuery?: string; time: string; why: string; kind: RecipeKind; open: boolean; onToggle: () => void;
  ingredients: string[]; steps: string[]; action?: ReactNode;
}) {
  return (
    <div className="card" style={{marginBottom:10,padding:"14px 16px"}}>
      {open && <RecipePhotoView name={name} photoQuery={photoQuery} emoji={emoji} variant="hero"/>}
      <button onClick={onToggle} aria-expanded={open} style={{display:"flex",gap:12,alignItems:"flex-start",width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"Nunito",textAlign:"left",color:C.text}}>
        {open ? <Glyph emoji={emoji} size={16}/> : <RecipePhotoView name={name} photoQuery={photoQuery} emoji={emoji} variant="thumb"/>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:3}}>{name}</div>
          <div className="row" style={{gap:10,fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:4}}>
            {time && <span className="row" style={{gap:3}}><Clock size={11} aria-hidden="true"/>{time}</span>}
            <span>{kind === "meal" ? "Meal" : "Drink"}</span>
          </div>
          {why && <div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5}}>{why}</div>}
        </div>
        <ChevronDown size={18} color={C.textSoft} aria-hidden="true" style={{flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}/>
      </button>
      {open && <RecipeBody ingredients={ingredients} steps={steps}/>}
      {open && <RecipeVideoLinks name={name}/>}
      {action}
    </div>
  );
}

/** The "Recipes" sub-tab: curated phase recipes, an AI recipe maker and saved AI recipes. */
export function RecipesTab({ cycleInfo, showToast }: RecipesTabProps) {
  const currentPhase = cycleInfo?.phase.id;
  const [phaseId, setPhaseId] = useState<PhaseId>(currentPhase ?? "menstrual");
  const [filter, setFilter] = useState<RecipeFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const [aiKind, setAiKind] = useState<RecipeKind>("meal");
  const [have, setHave] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ text: string; recipe: AIRecipe | null; kind: RecipeKind; phase: PhaseId; saved: boolean } | null>(null);
  const [aiOpen, setAiOpen] = useState(true);
  const [goal] = useState(() => load("food-goal", ""));

  const [saved, setSaved] = useState<SavedRecipe[]>(() => load<SavedRecipe[]>("saved-recipes", []));
  const [openSaved, setOpenSaved] = useState<number | null>(null);
  useEffect(() => { save("saved-recipes", saved); }, [saved]);

  const phase = PHASES[phaseId];
  const recipes = recipesFor(phaseId, filter);

  const makeRecipe = async () => {
    setAiLoading(true);
    try {
      const text = stripEmphasis(await callRecipe({ kind: aiKind, phase: phaseId, ingredients: have.trim() || undefined, context: buildFoodContext(null, goal) || undefined }));
      setAiResult({ text, recipe: parseRecipe(text), kind: aiKind, phase: phaseId, saved: false });
      setAiOpen(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't make a recipe");
    }
    setAiLoading(false);
  };

  const saveAi = () => {
    if (!aiResult?.recipe || aiResult.saved) return;
    const entry: SavedRecipe = { ...aiResult.recipe, id: Date.now(), kind: aiResult.kind, phase: aiResult.phase, savedAt: localDateKey() };
    setSaved(s => [entry, ...s]);
    setAiResult({ ...aiResult, saved: true });
    showToast("Recipe saved");
  };

  return (
    <div>
      {cycleInfo ? (
        <div style={{background:cycleInfo.phase.bg,borderRadius:18,padding:"16px",marginBottom:12,border:`1.5px solid ${cycleInfo.phase.color}`}}>
          <div style={{fontWeight:900,fontSize:16,color:cycleInfo.phase.textColor,marginBottom:4}}><Glyph emoji={cycleInfo.phase.emoji} chip={false} size={15} color={cycleInfo.phase.textColor}/> {cycleInfo.phase.label} phase recipes</div>
          <div style={{fontSize:13,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.9,lineHeight:1.6}}>Day {cycleInfo.dayOfCycle}. Meals and drinks built around what your body needs right now.</div>
        </div>
      ) : (
        <div className="card" style={{marginBottom:12,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <Glyph emoji="🌸" size={15}/>
          <div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.6}}>Log your cycle in the Body tab to get recipes for your current phase. Until then, pick a phase to browse.</div>
        </div>
      )}

      {/* Phase picker */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {PHASE_IDS.map(id => {
          const p = PHASES[id];
          const on = id === phaseId;
          return (
            <button key={id} className="chip" onClick={() => { setPhaseId(id); setOpenId(null); }} style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:5,...(on?{background:p.bg,borderColor:p.color,color:p.textColor}:{})}}>
              <Glyph emoji={p.emoji} chip={false} size={12} color={on?p.textColor:undefined}/>{p.label}{id === currentPhase ? " (now)" : ""}
            </button>
          );
        })}
      </div>

      {/* Meals / Drinks filter */}
      <div style={{display:"flex",background:C.bgDeep,borderRadius:50,padding:3,marginBottom:12}}>
        {FILTERS.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{flex:1,padding:"7px 0",border:"none",borderRadius:50,cursor:"pointer",fontFamily:"Nunito",fontWeight:800,fontSize:12,background:filter===v?C.white:"transparent",color:filter===v?PURPLE:C.textSoft,boxShadow:filter===v?`0 1px 4px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
        ))}
      </div>

      {recipes.map(r => (
        <RecipeCard key={r.id} emoji={r.emoji} name={r.name} photoQuery={r.photoQuery} time={r.time} why={r.why} kind={r.kind} ingredients={r.ingredients} steps={r.steps}
          open={openId === r.id} onToggle={() => setOpenId(o => o === r.id ? null : r.id)}/>
      ))}

      {/* AI recipe maker */}
      <div className="card" style={{marginTop:16,marginBottom:14,background:C.lavender,border:"none"}}>
        <div style={{fontWeight:800,fontSize:14,color:"#8E3A55",marginBottom:4}}><Glyph emoji="✨" chip={false} size={14} color={PURPLE}/> Make me a recipe</div>
        <div style={{fontSize:12,color:"#8E3A55",fontWeight:500,lineHeight:1.5,marginBottom:12}}>A {phase.label.toLowerCase()}-phase recipe from what you have at home.</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {(["meal","drink"] as const).map(k => (
            <button key={k} className="chip" onClick={() => setAiKind(k)} style={aiKind===k?{background:C.lavenderDeep,borderColor:"transparent",color:"#8E3A55"}:{}}>{k === "meal" ? "Meal" : "Drink"}</button>
          ))}
        </div>
        <label className="label" htmlFor="recipe-have" style={{color:"#8E3A55"}}>Ingredients I have (optional)</label>
        <input id="recipe-have" className="input" placeholder="e.g. eggs, spinach, sweet potato" value={have} maxLength={300} onChange={e => setHave(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !aiLoading) void makeRecipe(); }} style={{fontSize:13,marginBottom:10,background:C.white}}/>
        <button className="btn btn-primary" style={{width:"100%"}} onClick={() => void makeRecipe()} disabled={aiLoading}>
          {aiLoading ? <><div className="spin"/>Cooking something up...</> : <><Glyph emoji="✨" chip={false} size={16} color="currentColor"/>Make me a {aiKind}</>}
        </button>
      </div>

      {aiResult && (
        aiResult.recipe ? (
          <RecipeCard emoji={aiResult.kind === "drink" ? "🍵" : "🥗"} name={aiResult.recipe.title} time={aiResult.recipe.time} why={aiResult.recipe.why} kind={aiResult.kind}
            ingredients={aiResult.recipe.ingredients} steps={aiResult.recipe.steps} open={aiOpen} onToggle={() => setAiOpen(o => !o)}
            action={
              <div className="row" style={{gap:8,marginTop:12}}>
                <button className="btn btn-primary btn-sm" onClick={saveAi} disabled={aiResult.saved}><Bookmark size={13} aria-hidden="true"/>{aiResult.saved ? "Saved" : "Save recipe"}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAiResult(null)}>Dismiss</button>
              </div>
            }/>
        ) : (
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:13,lineHeight:1.7,color:C.text,fontWeight:500,whiteSpace:"pre-wrap"}}>{aiResult.text}</div>
            <button className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={() => setAiResult(null)}>Dismiss</button>
          </div>
        )
      )}

      {/* Saved recipes */}
      {saved.length > 0 && (
        <div style={{marginTop:6}}>
          <div className="sec-title">Saved recipes</div>
          {saved.map(r => (
            <RecipeCard key={r.id} emoji={r.kind === "drink" ? "🍵" : "🥗"} name={r.title} time={r.time} why={r.why} kind={r.kind}
              ingredients={r.ingredients} steps={r.steps} open={openSaved === r.id} onToggle={() => setOpenSaved(o => o === r.id ? null : r.id)}
              action={
                <div className="row-between" style={{marginTop:10}}>
                  <span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>{r.phase && PHASES[r.phase] ? `${PHASES[r.phase].label} phase` : "Saved"}</span>
                  <button onClick={() => setSaved(s => s.filter(x => x.id !== r.id))} style={{display:"inline-flex",alignItems:"center",gap:3,background:"none",border:"none",fontSize:11,color:"#B5506E",fontWeight:700,cursor:"pointer",fontFamily:"Nunito"}}>
                    <X size={12} aria-hidden="true"/> Remove
                  </button>
                </div>
              }/>
          ))}
        </div>
      )}
    </div>
  );
}
