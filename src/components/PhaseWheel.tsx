import { C } from "../theme";
import type { CycleInfo, PhaseId } from "../types";

interface PhaseWheelProps {
  cycleInfo: CycleInfo | null;
  size?: number;
}

export function PhaseWheel({ cycleInfo, size=200 }: PhaseWheelProps) {
  const cx=size/2,cy=size/2,r=size*.36,innerR=size*.22;
  const phases: {id:PhaseId;label:string;color:string;start:number;end:number}[]=[{id:"menstrual",label:"🌙",color:"#F5A0A0",start:0,end:5},{id:"follicular",label:"🌱",color:"#90D0A0",start:5,end:13},{id:"ovulation",label:"☀️",color:"#F0C040",start:13,end:16},{id:"luteal",label:"🍂",color:"#C8A0E8",start:16,end:28}];
  const total=28;
  const toAngle=(day: number)=>(day/total)*2*Math.PI-Math.PI/2;
  const arcPath=(s: number,e: number,outerR: number,innerRad: number)=>{const a1=toAngle(s),a2=toAngle(e-.1),x1=cx+outerR*Math.cos(a1),y1=cy+outerR*Math.sin(a1),x2=cx+outerR*Math.cos(a2),y2=cy+outerR*Math.sin(a2),x3=cx+innerRad*Math.cos(a2),y3=cy+innerRad*Math.sin(a2),x4=cx+innerRad*Math.cos(a1),y4=cy+innerRad*Math.sin(a1),large=(e-s)/total>.5?1:0;return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRad} ${innerRad} 0 ${large} 0 ${x4} ${y4} Z`;};
  const currentDay=cycleInfo?.dayOfCycle||1;
  const dotAngle=toAngle(currentDay-.5);
  const dotX=cx+(r+innerR)/2*Math.cos(dotAngle),dotY=cy+(r+innerR)/2*Math.sin(dotAngle);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {phases.map(p=><path key={p.id} d={arcPath(p.start,p.end,r,innerR)} fill={p.color} opacity={cycleInfo?.phase?.id===p.id?1:.35}/>)}
      {phases.map(p=>{const a=toAngle((p.start+p.end)/2),labelR=(r+innerR)/2;return <text key={p.id} x={cx+labelR*Math.cos(a)} y={cy+labelR*Math.sin(a)+5} textAnchor="middle" fontSize={size*.09} fontFamily="Nunito">{p.label}</text>;})}
      {cycleInfo&&<circle cx={dotX} cy={dotY} r={size*.045} fill={cycleInfo.phase.color} stroke="white" strokeWidth={2} className="pulse-dot" style={{transformOrigin:`${dotX}px ${dotY}px`}}/>}
      <text x={cx} y={cy-8} textAnchor="middle" fill={C.textMid} fontSize={size*.09} fontWeight={800} fontFamily="Nunito">{cycleInfo?`Day ${cycleInfo.dayOfCycle}`:"Log"}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill={C.textSoft} fontSize={size*.07} fontFamily="Nunito">{cycleInfo?"of cycle":"period"}</text>
    </svg>
  );
}
