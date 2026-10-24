import { C } from "../theme";
import type { CycleInfo, WeightEntry } from "../types";

interface WeightChartProps {
  history: WeightEntry[];
  cycleInfo: CycleInfo | null;
}

// ─── Weight line chart ────────────────────────────────────────────────────────
export function WeightChart({ history, cycleInfo }: WeightChartProps) {
  if (!history||history.length<2) return <div style={{textAlign:"center",padding:"24px 0",color:C.textSoft,fontSize:12,fontWeight:600}}>Log at least 2 weigh-ins to see your trend 📈</div>;
  const pts = history.slice(-14);
  const vals = pts.map(h=>h.weight);
  const rawMin=Math.min(...vals), rawMax=Math.max(...vals);
  const pad=Math.max((rawMax-rawMin)*.3,.5);
  const minV=rawMin-pad, maxV=rawMax+pad;
  const W=320,H=110,PL=32,PR=10,PT=12,PB=28;
  const cW=W-PL-PR, cH=H-PT-PB;
  const xOf=(i: number)=>PL+(i/(pts.length-1))*cW;
  const yOf=(v: number)=>PT+cH-((v-minV)/(maxV-minV))*cH;
  const line=pts.map((p,i)=>`${i===0?"M":"L"} ${xOf(i).toFixed(1)} ${yOf(p.weight).toFixed(1)}`).join(" ");
  const area=`${line} L ${xOf(pts.length-1).toFixed(1)} ${(PT+cH).toFixed(1)} L ${PL} ${(PT+cH).toFixed(1)} Z`;
  const latest=pts[pts.length-1], prev=pts[pts.length-2];
  const diff=latest&&prev?(latest.weight-prev.weight).toFixed(1):null;
  return (
    <div>
      <div className="row-between" style={{marginBottom:8}}>
        <div><span style={{fontWeight:900,fontSize:22,color:C.text}}>{latest?.weight}</span><span style={{fontSize:12,color:C.textSoft,marginLeft:4,fontWeight:600}}>kg now</span></div>
        {diff!==null&&<div style={{fontSize:13,fontWeight:800,color:parseFloat(diff)>0?"#E05050":"#40A050"}}>{parseFloat(diff)>0?"+":""}{diff} kg</div>}
        {cycleInfo&&<div style={{fontSize:11,fontWeight:700,color:cycleInfo.phase.textColor,background:cycleInfo.phase.bg,padding:"3px 8px",borderRadius:99}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label}</div>}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.lavenderDeep} stopOpacity=".35"/><stop offset="100%" stopColor={C.lavenderDeep} stopOpacity=".02"/></linearGradient></defs>
        {[rawMin,(rawMin+rawMax)/2,rawMax].map((v,i)=>{const y=yOf(v);return(<g key={i}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke={C.border} strokeWidth={1} strokeDasharray="3 3"/><text x={PL-4} y={y+4} textAnchor="end" fontSize={8} fill={C.textSoft} fontFamily="Nunito" fontWeight={600}>{parseFloat(v.toFixed(1))}</text></g>);})}
        <path d={area} fill="url(#wGrad)"/>
        <path d={line} fill="none" stroke={C.lavenderDeep} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>{const x=xOf(i),y=yOf(p.weight),isL=i===pts.length-1;return(<g key={i}><circle cx={x} cy={y} r={isL?5:3} fill={isL?C.lavenderDeep:C.white} stroke={C.lavenderDeep} strokeWidth={2}/>{(isL||i===0||pts.length<=5)&&<text x={x} y={y-8} textAnchor="middle" fontSize={8.5} fill={isL?"#7050B0":C.textSoft} fontFamily="Nunito" fontWeight={isL?800:600}>{p.weight}</text>}{(pts.length<=7||i%2===0)&&<text x={x} y={H-4} textAnchor="middle" fontSize={7.5} fill={C.textSoft} fontFamily="Nunito" fontWeight={600}>{p.date?.slice(5)}</text>}</g>);})}
      </svg>
      {cycleInfo&&<div style={{marginTop:8,fontSize:11,color:cycleInfo.phase.textColor,fontWeight:600,background:cycleInfo.phase.bg,borderRadius:10,padding:"7px 10px",lineHeight:1.5}}>{cycleInfo.phase.emoji} {cycleInfo.phase.weight}</div>}
    </div>
  );
}
