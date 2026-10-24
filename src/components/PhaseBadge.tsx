import type { CycleInfo } from "../types";

interface PhaseBadgeProps {
  cycleInfo: CycleInfo | null;
  compact?: boolean;
}

export function PhaseBadge({ cycleInfo, compact=false }: PhaseBadgeProps) {
  if (!cycleInfo) return null;
  const p=cycleInfo.phase;
  if (compact) return <div style={{display:"inline-flex",alignItems:"center",gap:6,background:p.bg,borderRadius:99,padding:"5px 12px",border:`1.5px solid ${p.color}`}}><span style={{fontSize:14}}>{p.emoji}</span><span style={{fontSize:12,fontWeight:800,color:p.textColor}}>{p.label} phase · Day {cycleInfo.dayOfCycle}</span></div>;
  return (
    <div style={{background:p.bg,borderRadius:20,padding:"16px",border:`1.5px solid ${p.color}`,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:22}}>{p.emoji}</span>
        <div><div style={{fontWeight:900,fontSize:15,color:p.textColor}}>{p.label} phase</div><div style={{fontSize:11,color:p.textColor,opacity:.8,fontWeight:600}}>{p.days} · Day {cycleInfo.dayOfCycle}</div></div>
        <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:10,fontWeight:700,color:p.textColor,opacity:.7}}>Next period</div><div style={{fontSize:12,fontWeight:800,color:p.textColor}}>{cycleInfo.daysUntilNext>0?`in ${cycleInfo.daysUntilNext}d`:"soon"}</div></div>
      </div>
      <div style={{fontSize:13,color:p.textColor,fontWeight:600,fontStyle:"italic",opacity:.85}}>"{p.tagline}"</div>
    </div>
  );
}
