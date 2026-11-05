import { C } from "../theme";
import type { CycleInfo, PhaseId } from "../types";
import { phaseRanges } from "../lib/cycle";
import { glyphFor } from "./glyphs";

interface PhaseWheelProps {
  cycleInfo: CycleInfo | null;
  size?: number;
}

export function PhaseWheel({ cycleInfo, size=200 }: PhaseWheelProps) {
  const cx=size/2,cy=size/2,r=size*.36,innerR=size*.22;
  // Boundaries follow the cycle length (ovulation ~14 days before the next period).
  const total=cycleInfo?.cycleLength??28;
  const look: Record<PhaseId,{label:string;color:string}>={menstrual:{label:"🌙",color:"#F6B7C4"},follicular:{label:"🌱",color:"#BFE3C8"},ovulation:{label:"☀️",color:"#F8D57E"},luteal:{label:"🍂",color:"#DCD3F1"}};
  const phases=phaseRanges(total,cycleInfo?.periodLength??5).map(r=>({...r,...look[r.id]}));
  const toAngle=(day: number)=>(day/total)*2*Math.PI-Math.PI/2;
  const arcPath=(s: number,e: number,outerR: number,innerRad: number)=>{const a1=toAngle(s),a2=toAngle(e-.1),x1=cx+outerR*Math.cos(a1),y1=cy+outerR*Math.sin(a1),x2=cx+outerR*Math.cos(a2),y2=cy+outerR*Math.sin(a2),x3=cx+innerRad*Math.cos(a2),y3=cy+innerRad*Math.sin(a2),x4=cx+innerRad*Math.cos(a1),y4=cy+innerRad*Math.sin(a1),large=(e-s)/total>.5?1:0;return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRad} ${innerRad} 0 ${large} 0 ${x4} ${y4} Z`;};
  const currentDay=cycleInfo?.dayOfCycle||1;
  const dotAngle=toAngle(currentDay-.5);
  const dotX=cx+(r+innerR)/2*Math.cos(dotAngle),dotY=cy+(r+innerR)/2*Math.sin(dotAngle);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {phases.map(p=><path key={p.id} d={arcPath(p.start,p.end,r,innerR)} fill={p.color} opacity={cycleInfo?.phase?.id===p.id?1:.35}/>)}
      {phases.map(p=>{const a=toAngle((p.start+p.end)/2),labelR=(r+innerR)/2,s=size*.09,[PhaseIcon]=glyphFor(p.label);return <PhaseIcon key={p.id} x={cx+labelR*Math.cos(a)-s/2} y={cy+labelR*Math.sin(a)-s/2} size={s} color={C.text} strokeWidth={2} aria-hidden="true"/>;})}
      {cycleInfo&&<circle cx={dotX} cy={dotY} r={size*.045} fill={cycleInfo.phase.color} stroke="white" strokeWidth={2} className="pulse-dot" style={{transformOrigin:`${dotX}px ${dotY}px`}}/>}
      <text x={cx} y={cy-8} textAnchor="middle" fill={C.textMid} fontSize={size*.09} fontWeight={800} fontFamily="Nunito">{cycleInfo?`Day ${cycleInfo.dayOfCycle}`:"Log"}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill={C.textSoft} fontSize={size*.07} fontFamily="Nunito">{cycleInfo?"of cycle":"period"}</text>
    </svg>
  );
}
