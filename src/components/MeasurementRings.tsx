import { C } from "../theme";
import type { MeasurementKey, Measurements } from "../types";

interface MeasurementRingsProps {
  measurements: Measurements;
  goalMeasurements?: Measurements;
}

interface RingField {
  key: MeasurementKey;
  label: string;
  color: string;
  track: string;
}

// ─── Body visualizer ──────────────────────────────────────────────────────────
export function MeasurementRings({ measurements, goalMeasurements }: MeasurementRingsProps) {
  const fields: RingField[] = [
    { key:"waist",  label:"Waist",  color:"#D8798F", track:"#F7E3E8" },
    { key:"hips",   label:"Hips",   color:"#D8798F", track:"#F7E3E8" },
    { key:"bust",   label:"Bust",   color:"#D8798F", track:"#F7E3E8" },
    { key:"glutes", label:"Glutes", color:"#D8798F", track:"#F7E3E8" },
    { key:"thighs", label:"Thighs", color:"#D8798F", track:"#F7E3E8" },
    { key:"arms",   label:"Arms",   color:"#D8798F", track:"#F7E3E8" },
  ];
  const sz=72, cx=36, cy=36, r=28, circ=2*Math.PI*r;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,padding:"4px 0"}}>
      {fields.map(f => {
        const cur = parseFloat(String(measurements[f.key])) || 0;
        const goal = parseFloat(String(goalMeasurements?.[f.key])) || 0;
        const pct = goal > 0 ? Math.min(cur/goal, 1) : cur > 0 ? 1 : 0;
        const dash = pct * circ;
        return (
          <div key={f.key} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{position:"relative",width:sz,height:sz}}>
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={f.track} strokeWidth={6}/>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={cur>0?f.color:f.track} strokeWidth={6}
                  strokeDasharray={cur>0?`${dash} ${circ}`:`0 ${circ}`}
                  strokeDashoffset={circ/4} strokeLinecap="round"
                  style={{transition:"stroke-dasharray .6s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,fontWeight:600,color:cur>0?C.accentInk:C.textSoft,textAlign:"center",lineHeight:1.2}}>
                  {cur>0?`${cur}cm`:"—"}
                </span>
              </div>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:C.textMid}}>{f.label}</span>
            {goal>0&&<span style={{fontSize:9,color:C.textSoft,fontWeight:600}}>goal {goal}cm</span>}
          </div>
        );
      })}
    </div>
  );
}
