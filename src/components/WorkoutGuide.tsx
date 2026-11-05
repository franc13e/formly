import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { C } from "../theme";
import { Glyph } from "./Glyph";
import { glyphFor, TONES } from "./glyphs";
import { YouTubeLogo } from "./RecipeMedia";
import { callFormTips } from "../lib/api";
import { builtInGuide, cachedFormTips, findLibraryWorkout, formVideoUrl, parseFormTips, rememberFormTips } from "../lib/formTips";
import { phaseFit, workoutFood, workoutKind, type FoodTip } from "../lib/workoutKind";
import type { FormTips, PhaseId, WorkoutImage } from "../types";

/** Anything a guide can open for: a library or custom `Workout`, a scheduled item or the workout in the log modal. */
export interface GuideTarget {
  id?: number;
  name: string;
  emoji?: string;
  muscle?: string;
  duration?: string;
  tags?: string[];
  achieve?: string;
}

interface WorkoutGuideProps {
  workout: GuideTarget;
  /** The current cycle phase, or null without cycle tracking. */
  phase: PhaseId | null;
  onClose: () => void;
  /** Opens the food coach with a question; the button is hidden without it. */
  onAskCoach?: (question: string) => void;
}

const sectionTitle = { fontSize:12, fontWeight:700, color:C.accentInk, letterSpacing:".02em", marginBottom:6 } as const;
const bodyText = { fontSize:13, color:C.textMid, fontWeight:500, lineHeight:1.55 } as const;
const creditLink = { color:C.textMid, fontWeight:700, textDecoration:"underline" } as const;
const pill = { display:"inline-flex", alignItems:"center", gap:8, padding:"9px 16px", borderRadius:50, border:`1.5px solid ${C.border}`, background:C.white, color:C.text, fontSize:13, fontWeight:700, fontFamily:"DM Sans", textDecoration:"none" } as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{marginBottom:16}}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

/** The wger demonstration image with its credit, or the workout's glyph on a soft block. */
function GuideImage({ image, emoji, name }: { image?: WorkoutImage; emoji: string; name: string }) {
  const [state, setState] = useState<"loading" | "shown" | "failed">("loading");
  const tone = TONES[glyphFor(emoji)[1]];
  const url = image && state !== "failed" ? image.url : null;
  return (
    <div style={{marginBottom:14}}>
      <div style={{position:"relative",overflow:"hidden",width:"100%",aspectRatio:"16 / 9",borderRadius:16,background:url&&state==="shown"?C.white:tone.bg,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${C.border}`}}>
        <Glyph emoji={emoji} chip={false} size={36} color={tone.fg}/>
        {url && (
          <img src={url} alt={`${image!.title} demonstration${image!.title.toLowerCase()===name.toLowerCase()?"":` (shown for ${name})`}`} loading="lazy" decoding="async"
            onLoad={()=>setState("shown")} onError={()=>setState("failed")}
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",background:C.white,opacity:state==="shown"?1:0,transition:"opacity .25s"}}/>
        )}
      </div>
      {image && state === "shown" && (
        <div style={{fontSize:10,color:C.textSoft,fontWeight:600,marginTop:4,textAlign:"right"}}>
          Image: {image.author} · {image.license} · <a href={image.source_url.startsWith("https://") ? image.source_url : "https://wger.de"} target="_blank" rel="noopener noreferrer" style={creditLink}>wger</a>
        </div>
      )}
    </div>
  );
}

function FoodBlock({ label, tip }: { label: string; tip: FoodTip }) {
  if (!tip.foods.length) return null;
  return (
    <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"10px 12px",marginBottom:8}}>
      <div className="row-between" style={{marginBottom:6,gap:8}}>
        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{label}</span>
        {tip.when && <span style={{fontSize:11,fontWeight:600,color:C.textSoft}}>{tip.when}</span>}
      </div>
      <ul aria-label={`${label} foods`} style={{display:"flex",flexWrap:"wrap",gap:6,listStyle:"none",marginBottom:tip.why?6:0}}>
        {tip.foods.map(f=>(
          <li key={f} style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:99,background:C.bgDeep,color:C.textMid}}>{f}</li>
        ))}
      </ul>
      {tip.why && <div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5}}>{tip.why}</div>}
    </div>
  );
}

type AiTips = { status: "ready"; tips: FormTips } | { status: "loading" } | { status: "error"; message: string } | { status: "none" };

/**
 * A sheet with how to do a workout well: demo image, what it helps with, phase fit, form cues,
 * a common mistake, a YouTube form search and what to eat around it. Built-in workouts use
 * bundled content; anything else asks /api/form-tips once and caches the reply ("form-tips").
 */
export function WorkoutGuide({ workout, phase, onClose, onAskCoach }: WorkoutGuideProps) {
  const library = findLibraryWorkout(workout);
  const { guide, image } = builtInGuide(library);
  const emoji = workout.emoji || library?.emoji || "🏋️";
  const muscle = workout.muscle || library?.muscle || "";
  const duration = workout.duration || library?.duration || "";
  const [ai, setAi] = useState<AiTips>(() => {
    if (guide) return { status: "none" };
    const cached = cachedFormTips(workout.name);
    return cached ? { status: "ready", tips: cached } : { status: "loading" };
  });

  useEffect(() => {
    if (ai.status !== "loading") return;
    let live = true;
    callFormTips(workout.name, muscle)
      .then(text => {
        const tips = parseFormTips(text);
        if (!tips) throw new Error("Couldn't read the tips. Please try again.");
        rememberFormTips(workout.name, tips);
        if (live) setAi({ status: "ready", tips });
      })
      .catch((e: unknown) => { if (live) setAi({ status: "error", message: e instanceof Error ? e.message : "Request failed" }); });
    return () => { live = false; };
  }, [ai.status, workout.name, muscle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tips: FormTips | null = guide ?? (ai.status === "ready" ? ai.tips : null);
  const helps = tips?.helps || workout.achieve || library?.achieve || "";
  const kind = workoutKind({ name: workout.name, muscle, tags: workout.tags ?? library?.tags });
  const fit = phaseFit(kind, phase);
  const food = workoutFood(kind, phase);
  const hasFood = food.before.foods.length > 0 || food.after.foods.length > 0;
  const question = `What should I eat before and after ${workout.name}${phase ? ` in my ${phase} phase` : ""}?`;
  const titleId = "workout-guide-title";

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-handle"/>
        <div className="row-between" style={{alignItems:"flex-start",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:700,color:C.textSoft}}>Workout guide</span>
          <button onClick={onClose} aria-label="Close guide" style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",padding:4,display:"inline-flex",borderRadius:8}}><X size={18} strokeWidth={1.8} aria-hidden="true"/></button>
        </div>

        <GuideImage image={image} emoji={emoji} name={workout.name}/>

        <h2 id={titleId} className="h-display" style={{fontSize:26,color:C.text,lineHeight:1.15}}>{workout.name}</h2>
        {(muscle||duration) && <div style={{fontSize:12,color:C.textSoft,fontWeight:600,marginTop:2,marginBottom:16}}>{[muscle,duration].filter(Boolean).join(" · ")}</div>}
        {!(muscle||duration) && <div style={{marginBottom:16}}/>}

        {helps && <Section title="How this helps"><p style={bodyText}>{helps}</p></Section>}

        {fit && (
          <div style={{background:C.bgDeep,borderRadius:12,padding:"10px 12px",marginBottom:16}}>
            <div style={{...sectionTitle,marginBottom:2}}>{phase ? `In your ${phase} phase` : "Through your cycle"}</div>
            <div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5}}>{fit}</div>
          </div>
        )}

        {tips ? (<>
          <Section title="Form cues">
            <ol style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
              {tips.cues.map((c,i)=>(
                <li key={i} className="row" style={{alignItems:"flex-start",gap:10}}>
                  <span aria-hidden="true" style={{width:22,height:22,borderRadius:"50%",background:C.petal,color:C.text,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                  <span style={{...bodyText,color:C.text}}>{c}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Avoid"><p style={bodyText}>{tips.mistake}</p></Section>
          {!guide && <p style={{fontSize:10,color:C.textSoft,fontWeight:600,marginTop:-8,marginBottom:16}}>AI-generated tips. Stop if anything hurts.</p>}
        </>) : ai.status === "loading" ? (
          <div className="row" role="status" style={{gap:10,padding:"8px 0 18px",fontSize:13,color:C.textSoft,fontWeight:600}}><div className="spin"/>Getting form tips…</div>
        ) : ai.status === "error" ? (
          <div role="alert" style={{background:C.bgDeep,borderRadius:12,padding:"10px 12px",marginBottom:16}}>
            <div style={{fontSize:12,color:C.textMid,fontWeight:600,marginBottom:8}}>Couldn't load form tips. {ai.message}</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setAi({status:"loading"})}>Try again</button>
          </div>
        ) : null}

        <Section title="Watch the form">
          <a href={formVideoUrl(workout.name, guide?.videoQuery)} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${workout.name} form videos on YouTube`} style={pill}>
            <YouTubeLogo/>Watch on YouTube
          </a>
        </Section>

        {(hasFood || onAskCoach) && (
          <Section title="Fuel it">
            <FoodBlock label="Before" tip={food.before}/>
            <FoodBlock label="After" tip={food.after}/>
            {onAskCoach && (
              <button className="btn btn-ghost btn-sm" style={{marginTop:4}} onClick={()=>{onClose();onAskCoach(question);}}>
                <Glyph emoji="💭" chip={false} size={14}/> Ask the food coach
              </button>
            )}
          </Section>
        )}

        <button className="btn btn-primary" style={{width:"100%",marginTop:4}} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
