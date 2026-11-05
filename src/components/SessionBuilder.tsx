import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Search, X } from "lucide-react";
import { C } from "../theme";
import { WORKOUT_ICONS } from "../data/workouts";
import { Glyph } from "./Glyph";
import { WorkoutThumb } from "./WorkoutThumb";
import { filterWorkouts, focusFrom, formatMinutes, moveBy, sessionTotals, sessionWorkouts, workoutDetail, MUSCLE_FILTERS } from "../lib/sessions";
import type { Workout, WorkoutSession } from "../types";

interface SessionBuilderProps {
  /** The session being edited, or null to create one. */
  initial: WorkoutSession | null;
  /** Library workouts plus your custom workouts. */
  pool: Workout[];
  /** Ids of your custom workouts (for the "Yours" chip). */
  customIds: Set<number>;
  /** Called with the finished session; a new one has an empty id for the caller to fill. */
  onSave: (session: WorkoutSession) => void;
  onClose: () => void;
}

const smallBtn = { background:C.white, border:`1.5px solid ${C.border}`, color:C.textMid, cursor:"pointer", width:30, height:30, borderRadius:10, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:0, flexShrink:0 } as const;

/** Bottom sheet for building a session: name, icon, then exercises picked from the library and your own, in order. */
export function SessionBuilder({ initial, pool, customIds, onSave, onClose }: SessionBuilderProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🏋️");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [ids, setIds] = useState<number[]>(() => initial ? sessionWorkouts(initial, pool).map(w => w.id) : []);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<string>("All");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const chosen = sessionWorkouts({ workoutIds: ids }, pool);
  const totals = sessionTotals(chosen);
  const chips = [...MUSCLE_FILTERS, "Yours"].filter(m => m === "All" || (m === "Yours" ? customIds.size > 0 : pool.some(w => w.muscle === m)));
  const shown = muscle === "Yours"
    ? filterWorkouts(pool.filter(w => customIds.has(w.id)), "All", query)
    : filterWorkouts(pool, muscle, query);
  const canSave = name.trim().length > 0 && ids.length > 0;
  const toggle = (id: number) => setIds(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const save = () => {
    if (!canSave) return;
    onSave({
      ...(initial ?? {}),
      id: initial?.id ?? "",
      name: name.trim(), emoji,
      focus: focus.trim() || focusFrom(chosen),
      workoutIds: ids,
    });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="session-builder-title">
      <div className="modal-handle"/>
      <div className="row" style={{gap:10,marginBottom:16}}>
        <Glyph emoji={emoji} size={20}/>
        <h2 className="modal-title" id="session-builder-title" style={{marginBottom:0,flex:1}}>{initial?"Edit session":"Create session"}</h2>
        <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",padding:4,display:"inline-flex",borderRadius:8}}><X size={18} strokeWidth={1.8} aria-hidden="true"/></button>
      </div>

      <div style={{marginBottom:12}}><label className="label" htmlFor="sb-name">Name</label><input id="sb-name" className="input" placeholder="e.g. Glute day" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
      <div style={{marginBottom:12}}><label className="label" htmlFor="sb-focus">Focus (optional)</label><input id="sb-focus" className="input" placeholder={focusFrom(chosen) || "e.g. Glutes and hamstrings"} value={focus} onChange={e=>setFocus(e.target.value)}/></div>

      <div style={{marginBottom:16}}>
        <div className="label" id="sb-icon">Icon</div>
        <div role="radiogroup" aria-labelledby="sb-icon" style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6}}>
          {WORKOUT_ICONS.map(([e,label])=>{const on=emoji===e;return(
            <button key={e} type="button" role="radio" aria-checked={on} aria-label={label} title={label} onClick={()=>setEmoji(e)} style={{aspectRatio:"1",borderRadius:12,border:`2px solid ${on?C.accentInk:"transparent"}`,background:on?C.lavender:C.bgDeep,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
              <Glyph emoji={e} size={13}/>
            </button>
          );})}
        </div>
      </div>

      {/* The session so far, in order */}
      <section aria-labelledby="sb-chosen" style={{marginBottom:16}}>
        <div className="row-between" style={{marginBottom:6}}>
          <h3 className="label" id="sb-chosen" style={{marginBottom:0}}>In this session</h3>
          {ids.length>0&&<span style={{fontSize:11,fontWeight:600,color:C.textSoft}}>{totals.count} exercise{totals.count===1?"":"s"}{totals.minutes?` · ${formatMinutes(totals.minutes)}`:""}</span>}
        </div>
        {chosen.length===0
          ? <div style={{fontSize:12,color:C.textSoft,fontWeight:500,background:C.bgDeep,borderRadius:12,padding:"10px 12px"}}>Pick exercises below. You can reorder them here.</div>
          : <ol style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
              {chosen.map((w,i)=>(
                <li key={w.id} className="row" style={{gap:8,background:C.card,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"6px 8px"}}>
                  <span aria-hidden="true" style={{fontSize:11,fontWeight:700,color:C.textSoft,width:14,textAlign:"right"}}>{i+1}</span>
                  <WorkoutThumb workout={w} size={34} radius={9}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:C.text}}>{w.name}</div>
                    <div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{workoutDetail(w)}</div>
                  </div>
                  <button type="button" style={{...smallBtn,opacity:i===0?.4:1}} disabled={i===0} aria-label={`Move ${w.name} up`} onClick={()=>setIds(l=>moveBy(l,i,-1))}><ChevronUp size={15} aria-hidden="true"/></button>
                  <button type="button" style={{...smallBtn,opacity:i===chosen.length-1?.4:1}} disabled={i===chosen.length-1} aria-label={`Move ${w.name} down`} onClick={()=>setIds(l=>moveBy(l,i,1))}><ChevronDown size={15} aria-hidden="true"/></button>
                  <button type="button" style={smallBtn} aria-label={`Remove ${w.name} from session`} onClick={()=>toggle(w.id)}><X size={14} aria-hidden="true"/></button>
                </li>
              ))}
            </ol>}
      </section>

      {/* Exercise picker */}
      <section aria-labelledby="sb-pick" style={{marginBottom:16}}>
        <h3 className="label" id="sb-pick">Add exercises</h3>
        <div style={{position:"relative",marginBottom:8}}>
          <Search size={15} color={C.textSoft} aria-hidden="true" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
          <input className="input" type="search" aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:34,fontSize:13}}/>
        </div>
        <div role="group" aria-label="Filter by muscle group" style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {chips.map(m=>{const on=muscle===m;return(
            <button key={m} type="button" className="chip" aria-pressed={on} onClick={()=>setMuscle(m)} style={{padding:"5px 12px",fontSize:11,background:on?C.petal:C.white,color:on?C.text:C.textMid,borderColor:on?C.petal:C.border}}>{m}</button>
          );})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:280,overflowY:"auto"}}>
          {shown.length===0&&<div style={{fontSize:12,color:C.textSoft,fontWeight:500,padding:"6px 2px"}}>No exercises match.</div>}
          {shown.map(w=>{const on=ids.includes(w.id);return(
            <button key={w.id} type="button" aria-pressed={on} onClick={()=>toggle(w.id)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",padding:"6px 8px",borderRadius:12,border:`1.5px solid ${on?C.roseDeep:C.border}`,background:on?C.rose:C.white,cursor:"pointer",fontFamily:"DM Sans"}}>
              <WorkoutThumb workout={w} size={34} radius={9} decorative/>
              <span style={{flex:1,minWidth:0}}>
                <span style={{display:"block",fontWeight:700,fontSize:13,color:C.text}}>{w.name}</span>
                <span style={{display:"block",fontSize:11,color:C.textSoft,fontWeight:500}}>{workoutDetail(w)}</span>
              </span>
              <span aria-hidden="true" style={{width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:on?C.petal:C.bgDeep,color:on?C.text:C.textMid,fontSize:12,fontWeight:700}}>
                {on?"✓":<Plus size={14}/>}
              </span>
            </button>
          );})}
        </div>
      </section>

      <div className="row" style={{gap:10}}>
        <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{flex:2}} disabled={!canSave} onClick={save}>{initial?"Save changes":"Save session"}</button>
      </div>
      {!canSave&&<div style={{fontSize:11,color:C.textSoft,fontWeight:600,textAlign:"center",marginTop:8}}>{!name.trim()?"Give it a name":"Add at least one exercise"} to save.</div>}
    </div></div>
  );
}
