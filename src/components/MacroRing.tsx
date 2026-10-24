import { C } from "../theme";
import type { Goals, NutritionTotals } from "../types";

interface MacroRingCellProps {
  emoji: string;
  label: string;
  current: number;
  goal: number;
  unit: string;
  ringColor: string;
  trackColor: string;
  textColor: string;
}

// ─── Macro ring cell ──────────────────────────────────────────────────────────
export function MacroRingCell({ emoji, label, current, goal, unit, ringColor, trackColor, textColor }: MacroRingCellProps) {
  const pct = Math.min((current||0)/(goal||1),1);
  const sz=86, cx=43, cy=43, r=32, circ=2*Math.PI*r;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:sz,height:sz}}>
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={7}/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={7}
            strokeDasharray={`${pct*circ} ${circ}`} strokeDashoffset={circ/4}
            strokeLinecap="round" style={{transition:"stroke-dasharray .55s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{emoji}</div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:800,color:textColor}}>{label}</div>
        <div style={{fontSize:11,fontWeight:700,color:C.text}}>{current||0}<span style={{color:C.textSoft}}>/{goal||0}{unit}</span></div>
        <div style={{fontSize:10,fontWeight:700,color:textColor}}>{Math.round(pct*100)}%</div>
      </div>
    </div>
  );
}

interface MacroRingGridProps {
  nutrition: NutritionTotals;
  goals: Goals;
}

export function MacroRingGrid({ nutrition, goals }: MacroRingGridProps) {
  const cal = Math.round((nutrition.protein||0)*4+(nutrition.carbs||0)*4+(nutrition.fats||0)*9);
  const cells = [
    {key:"calories",emoji:"🔥",label:"Calories",current:cal,goal:goals.calories||2000,unit:"kcal",ringColor:"#FFB347",trackColor:"#FFF0D6",textColor:"#B06010"},
    {key:"protein",emoji:"🥩",label:"Protein",current:nutrition.protein,goal:goals.protein||150,unit:"g",ringColor:"#60C8F0",trackColor:"#D6F0FA",textColor:"#1070A0"},
    {key:"carbs",emoji:"🌾",label:"Carbs",current:nutrition.carbs,goal:goals.carbs||200,unit:"g",ringColor:"#FFB347",trackColor:"#FFF0D6",textColor:"#9A7010"},
    {key:"fats",emoji:"🥑",label:"Fats",current:nutrition.fats,goal:goals.fats||65,unit:"g",ringColor:"#C8A0F0",trackColor:"#EDE0FA",textColor:"#7050B0"},
    {key:"sugar",emoji:"🍓",label:"Sugar",current:nutrition.sugar,goal:goals.sugar||50,unit:"g",ringColor:"#F08090",trackColor:"#FAE0E4",textColor:"#B04060"},
    {key:"fiber",emoji:"🥦",label:"Fiber",current:nutrition.fiber,goal:goals.fiber||28,unit:"g",ringColor:"#60C890",trackColor:"#D6F5E6",textColor:"#208050"},
  ];
  return <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px 8px",padding:"4px 0"}}>{cells.map(({key,...c})=><MacroRingCell key={key} {...c}/>)}</div>;
}
