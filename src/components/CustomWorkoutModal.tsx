import { useState } from "react";
import { C } from "../theme";
import { DIFF_COLOR, WORKOUT_ICONS, WORKOUT_MUSCLE_GROUPS } from "../data/workouts";
import { suggestWorkoutEmoji } from "../lib/workouts";
import { Glyph } from "./Glyph";
import type { Difficulty, Workout } from "../types";

interface CustomWorkoutModalProps {
  /** The workout being edited, or null to create a new one. */
  initial: Workout | null;
  onSave: (workout: Workout) => void;
  onClose: () => void;
}

const DIFFICULTIES = Object.keys(DIFF_COLOR) as Difficulty[];

/** Bottom-sheet form for creating or editing one of your own workouts. */
export function CustomWorkoutModal({ initial, onSave, onClose }: CustomWorkoutModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [muscle, setMuscle] = useState(initial?.muscle ?? "Full body");
  const [minutes, setMinutes] = useState(() => initial ? String(parseInt(initial.duration) || "") : "30");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "Beginner");
  const [achieve, setAchieve] = useState(initial?.achieve ?? "");
  // Until the user picks an icon, follow the suggestion from the name / muscle group
  const [pickedEmoji, setPickedEmoji] = useState<string | null>(initial?.emoji ?? null);
  const suggested = suggestWorkoutEmoji(name, muscle);
  const emoji = pickedEmoji ?? suggested;
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const mins = parseInt(minutes);
    onSave({
      id: initial?.id ?? Date.now(),
      name: name.trim(), emoji, muscle, difficulty,
      duration: mins > 0 ? `${mins} min` : "",
      tags: initial?.tags ?? [muscle.toLowerCase()],
      achieve: achieve.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="custom-workout-title">
      <div className="modal-handle"/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <Glyph emoji={emoji} size={20}/>
        <div className="modal-title" id="custom-workout-title" style={{marginBottom:0}}>{initial?"Edit workout":"Create workout"}</div>
      </div>
      <div style={{marginBottom:12}}><label className="label" htmlFor="cw-name">Name</label><input id="cw-name" className="input" placeholder="e.g. Saturday spin class" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div><label className="label" htmlFor="cw-muscle">Muscle group</label>
          <select id="cw-muscle" className="input" value={muscle} onChange={e=>setMuscle(e.target.value)}>{WORKOUT_MUSCLE_GROUPS.map(m=><option key={m}>{m}</option>)}</select>
        </div>
        <div><label className="label" htmlFor="cw-duration">Duration (min)</label><input id="cw-duration" className="input" type="number" inputMode="numeric" min={1} placeholder="e.g. 30" value={minutes} onChange={e=>setMinutes(e.target.value)}/></div>
      </div>
      <div style={{marginBottom:12}}>
        <div className="label" id="cw-diff">Difficulty</div>
        <div className="row" role="radiogroup" aria-labelledby="cw-diff" style={{gap:6}}>
          {DIFFICULTIES.map(d=>{const dc=DIFF_COLOR[d],on=difficulty===d;return(
            <button key={d} type="button" role="radio" aria-checked={on} onClick={()=>setDifficulty(d)} style={{flex:1,padding:"7px 0",borderRadius:99,border:`1.5px solid ${on?dc.text:C.border}`,background:on?dc.bg:C.white,color:on?dc.text:C.textSoft,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans",transition:"all .15s"}}>{d}</button>
          );})}
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div className="row-between" style={{marginBottom:5}}>
          <div className="label" id="cw-icon" style={{marginBottom:0}}>Icon</div>
          {pickedEmoji&&pickedEmoji!==suggested&&<button type="button" onClick={()=>setPickedEmoji(null)} style={{background:"none",border:"none",color:"#A95C76",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans"}}>Use suggested</button>}
        </div>
        <div role="radiogroup" aria-labelledby="cw-icon" style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6}}>
          {WORKOUT_ICONS.map(([e,label])=>{const on=emoji===e;return(
            <button key={e} type="button" role="radio" aria-checked={on} aria-label={label} title={label} onClick={()=>setPickedEmoji(e)} style={{aspectRatio:"1",borderRadius:12,border:`2px solid ${on?"#A95C76":"transparent"}`,background:on?C.lavender:C.bgDeep,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
              <Glyph emoji={e} size={13}/>
            </button>
          );})}
        </div>
      </div>
      <div style={{marginBottom:14}}><label className="label" htmlFor="cw-notes">What it achieves (optional)</label>
        <textarea id="cw-notes" className="input" rows={2} placeholder="e.g. Builds endurance and clears my head." value={achieve} onChange={e=>setAchieve(e.target.value)} style={{resize:"none",lineHeight:1.6}}/>
      </div>
      <div className="row" style={{gap:10}}><button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button><button className="btn btn-primary" style={{flex:2,opacity:canSave?1:.5}} disabled={!canSave} onClick={save}>{initial?"Save changes ✓":"Create workout ✓"}</button></div>
    </div></div>
  );
}
