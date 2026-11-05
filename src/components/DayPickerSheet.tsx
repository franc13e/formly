import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { C } from "../theme";
import { weekOf } from "../lib/workouts";
import type { Schedule } from "../types";

interface DayPickerSheetProps {
  /** e.g. "Add Hip Thrust" */
  title: string;
  /** Shown under the title, e.g. "Glutes · 30 min". */
  subtitle?: string;
  /** Picture or glyph shown next to the title. */
  media?: ReactNode;
  /** YYYY-MM-DD of today; the chips are this week's days. */
  today: string;
  schedule: Schedule;
  onPick: (date: string) => void;
  onClose: () => void;
}

/** Bottom sheet for picking the day to add something to: this week's days as chips, or any date. */
export function DayPickerSheet({ title, subtitle, media, today, schedule, onPick, onClose }: DayPickerSheetProps) {
  const [date, setDate] = useState("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="day-picker-title">
        <div className="modal-handle"/>
        <div className="row" style={{gap:12,marginBottom:16,alignItems:"center"}}>
          {media}
          <div style={{flex:1,minWidth:0}}>
            <h2 id="day-picker-title" className="h-display" style={{fontSize:22,color:C.text,lineHeight:1.15}}>{title}</h2>
            {subtitle && <div style={{fontSize:12,color:C.textSoft,fontWeight:600,marginTop:2}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",padding:4,display:"inline-flex",borderRadius:8,alignSelf:"flex-start"}}><X size={18} strokeWidth={1.8} aria-hidden="true"/></button>
        </div>

        <div className="label" id="day-picker-week">This week</div>
        <div role="group" aria-labelledby="day-picker-week" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
          {weekOf(today).map(d => {
            const dt = new Date(d+"T12:00");
            const past = d < today, isToday = d === today;
            const entry = schedule[d];
            const count = Array.isArray(entry) ? entry.length : 0;
            const note = entry === "rest" ? "Rest" : count ? `${count} planned` : "";
            const label = `${dt.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}${isToday?", today":""}${note?`, ${note}`:""}`;
            return (
              <button key={d} disabled={past} onClick={()=>onPick(d)} aria-label={label}
                style={{padding:"8px 0 6px",borderRadius:12,border:`1.5px solid ${isToday?C.accentInk:C.border}`,background:isToday?C.petal:C.white,color:past?C.textSoft:C.text,cursor:past?"default":"pointer",opacity:past?.45:1,fontFamily:"DM Sans",display:"flex",flexDirection:"column",alignItems:"center",gap:1,lineHeight:1.2}}>
                <span style={{fontSize:10,fontWeight:600}}>{dt.toLocaleDateString("en-US",{weekday:"short"})}</span>
                <span style={{fontSize:14,fontWeight:700}}>{dt.getDate()}</span>
                <span aria-hidden="true" style={{height:5,display:"flex",gap:2}}>
                  {entry==="rest"
                    ? <span style={{width:5,height:5,borderRadius:"50%",border:`1px solid ${C.textSoft}`}}/>
                    : Array.from({length:Math.min(count,3)},(_,i)=><span key={i} style={{width:4,height:4,borderRadius:"50%",background:C.accentInk}}/>)}
                </span>
              </button>
            );
          })}
        </div>

        <label className="label" htmlFor="day-picker-date">Another date</label>
        <div className="row" style={{gap:8}}>
          <input id="day-picker-date" className="input" type="date" value={date} min={today} onChange={e=>setDate(e.target.value)} style={{fontSize:13,padding:"9px 12px"}}/>
          <button className="btn btn-primary btn-sm" style={{flexShrink:0}} disabled={!date} onClick={()=>date&&onPick(date)}>Add</button>
        </div>
      </div>
    </div>
  );
}
