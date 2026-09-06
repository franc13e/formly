import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#FDF6EE", bgDeep:"#F5EDE0", card:"#FFFAF5",
  lavender:"#EDE6F8", lavenderDeep:"#D4C8F0",
  rose:"#FDE8E8", roseDeep:"#F5C8C8",
  sage:"#DFF0DA", sageDeep:"#B8DDB0",
  butter:"#FFF6D0", butterDeep:"#FFE89A",
  peach:"#FFE8D6", peachDeep:"#FFCBA4",
  sky:"#D6EDFF", skyDeep:"#A8D4F5",
  text:"#3D2C1E", textMid:"#7A6055", textSoft:"#B09A8A",
  border:"#EAD9C8", shadow:"rgba(120,80,40,0.08)", white:"#FFFDF9",
};
const ACCENT = {
  protein:{text:"#C05070"}, carbs:{text:"#9A7010"}, fats:{text:"#B05020"},
  sugar:{text:"#7050B0"}, fiber:{text:"#3A7A30"}, water:{text:"#2060A0", deep:C.skyDeep},
};

// ─── Backend helper ───────────────────────────────────────────────────────────
const API = "http://localhost:8000";
async function callAI(endpoint, prompt) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }
    return (await res.json()).result;
  } catch(e) {
    console.error("callAI error:", endpoint, e.message);
    throw new Error(e.message || "Request failed");
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const load = (k, d) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── Toast hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => { setMsg(m); setTimeout(()=>setMsg(null),2200); },[]);
  return [msg, show];
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body,#root{height:100%;background:#E8DDD0;font-family:'Nunito',sans-serif;color:${C.text};}
  ::-webkit-scrollbar{display:none;}
  .shell{max-width:430px;min-height:100dvh;margin:0 auto;background:${C.bg};display:flex;flex-direction:column;overflow:hidden;}
  .scroll{flex:1;overflow-y:auto;padding-bottom:90px;}
  .card{background:${C.card};border-radius:22px;box-shadow:0 2px 12px ${C.shadow};padding:18px;border:1.5px solid ${C.border};}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;transition:transform .1s;border-radius:50px;}
  .btn:active{transform:scale(.96);}
  .btn-primary{background:${C.lavenderDeep};color:#5040A0;padding:12px 22px;font-size:14px;box-shadow:0 3px 10px rgba(130,100,200,.25);}
  .btn-ghost{background:${C.white};color:${C.textMid};padding:10px 18px;font-size:13px;border:1.5px solid ${C.border};}
  .btn-sm{padding:8px 16px;font-size:12px;}
  .input{width:100%;background:${C.bgDeep};border:1.5px solid ${C.border};border-radius:14px;padding:11px 14px;color:${C.text};font-size:14px;font-family:'Nunito',sans-serif;font-weight:600;outline:none;transition:border-color .15s;}
  .input:focus{border-color:${C.lavenderDeep};background:${C.white};}
  .input::placeholder{color:${C.textSoft};font-weight:500;}
  select.input{appearance:none;}
  .label{font-size:12px;font-weight:700;color:${C.textMid};margin-bottom:5px;display:block;}
  .chip{padding:7px 14px;border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid ${C.border};background:${C.white};color:${C.textMid};transition:all .15s;font-family:'Nunito',sans-serif;}
  .row{display:flex;align-items:center;gap:8px;}
  .row-between{display:flex;align-items:center;justify-content:space-between;}
  .sec-title{font-size:14px;font-weight:800;color:${C.textMid};margin-bottom:10px;}
  .pill-track{background:${C.bgDeep};border-radius:99px;height:8px;overflow:hidden;}
  .pill-fill{height:100%;border-radius:99px;transition:width .5s cubic-bezier(.34,1.2,.64,1);}
  .modal-overlay{position:fixed;inset:0;background:rgba(60,30,10,.35);display:flex;align-items:flex-end;justify-content:center;z-index:100;backdrop-filter:blur(6px);animation:fadeIn .2s ease;}
  .modal{background:${C.bg};border-radius:28px 28px 0 0;padding:24px 22px max(24px,env(safe-area-inset-bottom));width:100%;max-width:430px;max-height:88dvh;overflow-y:auto;animation:slideUp .25s cubic-bezier(.34,1.3,.64,1);}
  .modal-handle{width:36px;height:4px;background:${C.border};border-radius:99px;margin:0 auto 20px;}
  .modal-title{font-size:20px;font-weight:900;margin-bottom:18px;}
  .toast{position:fixed;top:60px;left:50%;transform:translateX(-50%);background:${C.text};color:${C.white};padding:10px 20px;border-radius:99px;font-size:13px;font-weight:700;z-index:200;white-space:nowrap;animation:toastIn .25s cubic-bezier(.34,1.3,.64,1);}
  .spin{width:18px;height:18px;border:2.5px solid ${C.border};border-top-color:#7050B0;border-radius:50%;animation:spinning .7s linear infinite;}
  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${C.white};border-top:1.5px solid ${C.border};display:flex;padding:8px 0 max(8px,env(safe-area-inset-bottom));z-index:50;}
  .nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;transition:transform .1s;}
  .nav-tab:active{transform:scale(.9);}
  .nav-icon-wrap{width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;transition:background .2s;}
  .nav-icon-wrap.active{background:${C.lavender};}
  .nav-label{font-size:10px;font-weight:700;color:${C.textSoft};}
  .nav-label.active{color:#7050B0;}
  .workout-card{background:${C.card};border-radius:18px;border:1.5px solid ${C.border};padding:14px;display:flex;flex-direction:column;gap:8px;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(60px);opacity:.5}to{transform:translateY(0);opacity:1}}
  @keyframes toastIn{from{transform:translateX(-50%) translateY(-16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
  @keyframes spinning{to{transform:rotate(360deg)}}
`;

// ─── Macro ring cell ──────────────────────────────────────────────────────────
function MacroRingCell({ emoji, label, current, goal, unit, ringColor, trackColor, textColor }) {
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
function MacroRingGrid({ nutrition, goals }) {
  const cal = Math.round((nutrition.protein||0)*4+(nutrition.carbs||0)*4+(nutrition.fats||0)*9);
  const cells = [
    {key:"calories",emoji:"🔥",label:"Calories",current:cal,goal:goals.calories||2000,unit:"kcal",ringColor:"#FFB347",trackColor:"#FFF0D6",textColor:"#B06010"},
    {key:"protein",emoji:"🥩",label:"Protein",current:nutrition.protein,goal:goals.protein||150,unit:"g",ringColor:"#60C8F0",trackColor:"#D6F0FA",textColor:"#1070A0"},
    {key:"carbs",emoji:"🌾",label:"Carbs",current:nutrition.carbs,goal:goals.carbs||200,unit:"g",ringColor:"#FFB347",trackColor:"#FFF0D6",textColor:"#9A7010"},
    {key:"fats",emoji:"🥑",label:"Fats",current:nutrition.fats,goal:goals.fats||65,unit:"g",ringColor:"#C8A0F0",trackColor:"#EDE0FA",textColor:"#7050B0"},
    {key:"sugar",emoji:"🍓",label:"Sugar",current:nutrition.sugar,goal:goals.sugar||50,unit:"g",ringColor:"#F08090",trackColor:"#FAE0E4",textColor:"#B04060"},
    {key:"fiber",emoji:"🥦",label:"Fiber",current:nutrition.fiber,goal:goals.fiber||28,unit:"g",ringColor:"#60C890",trackColor:"#D6F5E6",textColor:"#208050"},
  ];
  return <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px 8px",padding:"4px 0"}}>{cells.map(c=><MacroRingCell key={c.key} {...c}/>)}</div>;
}

// ─── Weight line chart ────────────────────────────────────────────────────────
function WeightChart({ history, cycleInfo }) {
  if (!history||history.length<2) return <div style={{textAlign:"center",padding:"24px 0",color:C.textSoft,fontSize:12,fontWeight:600}}>Log at least 2 weigh-ins to see your trend 📈</div>;
  const pts = history.slice(-14);
  const vals = pts.map(h=>h.weight);
  const rawMin=Math.min(...vals), rawMax=Math.max(...vals);
  const pad=Math.max((rawMax-rawMin)*.3,.5);
  const minV=rawMin-pad, maxV=rawMax+pad;
  const W=320,H=110,PL=32,PR=10,PT=12,PB=28;
  const cW=W-PL-PR, cH=H-PT-PB;
  const xOf=i=>PL+(i/(pts.length-1))*cW;
  const yOf=v=>PT+cH-((v-minV)/(maxV-minV))*cH;
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

// ─── Week calendar ────────────────────────────────────────────────────────────
function WeekCalendar({ schedule, setSchedule, workoutPlan }) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);
  const days = Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return{date:d.toISOString().slice(0,10),label:["Su","Mo","Tu","We","Th","Fr","Sa"][i],num:d.getDate()};});
  const [picking,setPicking]=useState(null);
  return (
    <div>
      <div style={{display:"flex",gap:4}}>
        {days.map(d=>(
          <div key={d.date} onClick={()=>setPicking(picking===d.date?null:d.date)} style={{flex:1,borderRadius:12,padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",border:`1.5px solid ${d.date===todayStr?"#9070D0":schedule[d.date]?.length?C.lavenderDeep:C.border}`,background:schedule[d.date]?.length?C.lavender:"transparent",transition:"all .15s"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.textSoft}}>{d.label}</div>
            <div style={{fontSize:13,fontWeight:800,color:C.text}}>{d.num}</div>
            {schedule[d.date]?.length>0&&<div style={{width:5,height:5,borderRadius:"50%",background:"#9070D0"}}/>}
          </div>
        ))}
      </div>
      {picking&&(
        <div style={{marginTop:10,background:C.lavender,borderRadius:14,padding:"10px 12px"}}>
          <div style={{fontSize:12,fontWeight:800,color:"#7050B0",marginBottom:8}}>Schedule for {picking}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {workoutPlan.map(w=>{const on=schedule[picking]?.includes(w.id);return(<button key={w.id} className={`chip${on?" on":""}`} style={on?{background:C.lavenderDeep,borderColor:"transparent",color:"#5040A0"}:{}} onClick={()=>setSchedule(s=>{const cur=s[picking]||[];return{...s,[picking]:on?cur.filter(x=>x!==w.id):[...cur,w.id]};})}>{w.emoji} {w.name}</button>);})}
            {workoutPlan.length===0&&<span style={{fontSize:12,color:C.textSoft}}>Add workouts first in the Workouts tab</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Body visualizer ──────────────────────────────────────────────────────────
function MeasurementRings({ measurements, goalMeasurements }) {
  const fields = [
    { key:"waist",  label:"Waist",  color:"#FFB347", track:"#FFF0D6" },
    { key:"hips",   label:"Hips",   color:"#C8A0F0", track:"#EDE0FA" },
    { key:"bust",   label:"Bust",   color:"#F08090", track:"#FAE0E4" },
    { key:"glutes", label:"Glutes", color:"#90D0A0", track:"#D6F5E6" },
    { key:"thighs", label:"Thighs", color:"#60C8F0", track:"#D6F0FA" },
    { key:"arms",   label:"Arms",   color:"#F0C040", track:"#FFFBEC" },
  ];
  const sz=72, cx=36, cy=36, r=28, circ=2*Math.PI*r;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,padding:"4px 0"}}>
      {fields.map(f => {
        const cur = parseFloat(measurements[f.key]) || 0;
        const goal = parseFloat(goalMeasurements?.[f.key]) || 0;
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
                <span style={{fontSize:10,fontWeight:800,color:cur>0?f.color:C.border,textAlign:"center",lineHeight:1.2}}>
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


// ─── Cycle engine ─────────────────────────────────────────────────────────────
const PHASES = {
  menstrual:{id:"menstrual",label:"Menstrual",emoji:"🌙",days:"Days 1-5",color:"#F5A0A0",bg:"#FEF0F0",textColor:"#A03040",tagline:"Rest, restore, be gentle with yourself",body:"Oestrogen and progesterone are at their lowest. Energy dips, cramps may appear, and inflammation can rise. Your body is doing real work right now. Honour it.",workouts:["Gentle yoga or stretching","Short walks","Light pilates","Rest days are productive days"],foods:["Iron-rich foods: lentils, spinach, red meat","Anti-inflammatory options: ginger, turmeric, berries","Dark chocolate (magnesium!)","Warm cooked foods: soups, stews"],avoid:["High-intensity cardio when you're cramping","Excess caffeine (can worsen cramps)","Salty processed foods (increases bloating)"],weight:"Weight may be at its lowest as bloating eases. Any remaining water retention is normal and will pass.",energy:"Low, rising by day 4-5. Follow your body's lead.",moodNote:"You may feel inward and reflective. That's your nervous system asking for stillness."},
  follicular:{id:"follicular",label:"Follicular",emoji:"🌱",days:"Days 6-13",color:"#90D0A0",bg:"#F0FAF2",textColor:"#306040",tagline:"Energy rising. A great time to start new things.",body:"Oestrogen climbs steadily. Your brain feels sharper, motivation builds, and your body recovers faster from workouts. This is your window for new challenges.",workouts:["Higher intensity strength training","Try a new class or routine","Running, cycling, HIIT","Progressive overload this week"],foods:["Complex carbs for fuel: oats, sweet potato, quinoa","Lean protein to support muscle building","Fermented foods: yoghurt, kefir","Plenty of vegetables"],avoid:[],weight:"Weight often stabilises or trends lower as oestrogen rises and water retention drops.",energy:"Rising steadily. Many women feel their best in this phase.",moodNote:"More social, motivated, and optimistic. Great time to schedule things you've been putting off."},
  ovulation:{id:"ovulation",label:"Ovulation",emoji:"☀️",days:"Days 14-16",color:"#F0C040",bg:"#FFFBEC",textColor:"#805010",tagline:"Peak energy. Your strongest window of the cycle.",body:"Oestrogen peaks and testosterone surges briefly. Strength, coordination, and pain tolerance are at their highest. You may feel your most confident and social.",workouts:["Heavy lifting: great time for personal bests","High-intensity intervals","Competitive sports","Dance, Zumba, anything fun and energetic"],foods:["Antioxidant-rich foods: berries, leafy greens","Zinc: pumpkin seeds, chickpeas","Light fresh foods: salads, smoothies","Stay well hydrated"],avoid:["Overdoing it (ligament laxity is slightly higher during ovulation)"],weight:"You may notice a very slight temporary rise mid-cycle. This is a normal fluid shift, not fat gain.",energy:"Peak. This is your superpower window.",moodNote:"Outgoing, confident, articulate. Great for presentations, social plans, hard conversations."},
  luteal:{id:"luteal",label:"Luteal",emoji:"🍂",days:"Days 17-28",color:"#C8A0E8",bg:"#F5EFFE",textColor:"#603090",tagline:"Slow down. Your body is working hard right now.",body:"Progesterone rises and your body runs hotter, uses more energy at rest, and is more sensitive to blood sugar. This is why cravings, bloating, and fatigue happen. Not weakness. Just physiology.",workouts:["Moderate strength training: maintain, don't push for PRs","Pilates, barre, yoga","Swimming","Walking (especially helpful for mood)","Ease off intensity in the last few days"],foods:["Magnesium: dark chocolate, pumpkin seeds, almonds","B6: chickpeas, salmon, bananas","Complex carbs: don't restrict them, your body needs them right now","Calcium-rich foods (can reduce PMS severity)"],avoid:["High sodium (worsens water retention and bloating)","Refined sugar and alcohol (can amplify mood swings)","Excess caffeine (can increase anxiety and breast tenderness)"],weight:"Weight typically rises 1-3 kg due to water retention from progesterone. This is not fat gain. It will pass at the start of your next period.",energy:"Gradually declining. Honour slower days. Your basal metabolic rate is actually higher during this phase.",moodNote:"More sensitive, inward, easily overwhelmed. Reduce your schedule where you can. Rest is not laziness."},
};

function getCycleInfo(periodStart, cycleLength=28) {
  if (!periodStart) return null;
  const start=new Date(periodStart+"T12:00:00"), today=new Date();
  today.setHours(12,0,0,0);
  const dayOfCycle=Math.floor((today-start)/(1000*60*60*24))+1;
  if (dayOfCycle<1||dayOfCycle>cycleLength*2) return null;
  const d=((dayOfCycle-1)%cycleLength)+1;
  let phase=d<=5?"menstrual":d<=13?"follicular":d<=16?"ovulation":"luteal";
  const nextPeriod=new Date(start);
  nextPeriod.setDate(start.getDate()+cycleLength);
  const daysUntilNext=Math.ceil((nextPeriod-today)/(1000*60*60*24));
  return {phase:PHASES[phase],dayOfCycle:d,cycleLength,daysUntilNext,nextPeriodDate:nextPeriod.toISOString().slice(0,10)};
}

function PhaseWheel({ cycleInfo, size=200 }) {
  const cx=size/2,cy=size/2,r=size*.36,innerR=size*.22;
  const phases=[{id:"menstrual",label:"🌙",color:"#F5A0A0",start:0,end:5},{id:"follicular",label:"🌱",color:"#90D0A0",start:5,end:13},{id:"ovulation",label:"☀️",color:"#F0C040",start:13,end:16},{id:"luteal",label:"🍂",color:"#C8A0E8",start:16,end:28}];
  const total=28;
  const toAngle=day=>(day/total)*2*Math.PI-Math.PI/2;
  const arcPath=(s,e,outerR,innerRad)=>{const a1=toAngle(s),a2=toAngle(e-.1),x1=cx+outerR*Math.cos(a1),y1=cy+outerR*Math.sin(a1),x2=cx+outerR*Math.cos(a2),y2=cy+outerR*Math.sin(a2),x3=cx+innerRad*Math.cos(a2),y3=cy+innerRad*Math.sin(a2),x4=cx+innerRad*Math.cos(a1),y4=cy+innerRad*Math.sin(a1),large=(e-s)/total>.5?1:0;return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRad} ${innerRad} 0 ${large} 0 ${x4} ${y4} Z`;};
  const currentDay=cycleInfo?.dayOfCycle||1;
  const dotAngle=toAngle(currentDay-.5);
  const dotX=cx+(r+innerR)/2*Math.cos(dotAngle),dotY=cy+(r+innerR)/2*Math.sin(dotAngle);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {phases.map(p=><path key={p.id} d={arcPath(p.start,p.end,r,innerR)} fill={p.color} opacity={cycleInfo?.phase?.id===p.id?1:.35}/>)}
      {phases.map(p=>{const a=toAngle((p.start+p.end)/2),labelR=(r+innerR)/2;return <text key={p.id} x={cx+labelR*Math.cos(a)} y={cy+labelR*Math.sin(a)+5} textAnchor="middle" fontSize={size*.09} fontFamily="Nunito">{p.label}</text>;})}
      {cycleInfo&&<circle cx={dotX} cy={dotY} r={size*.045} fill={cycleInfo.phase.color} stroke="white" strokeWidth={2}/>}
      <text x={cx} y={cy-8} textAnchor="middle" fill={C.textMid} fontSize={size*.09} fontWeight={800} fontFamily="Nunito">{cycleInfo?`Day ${cycleInfo.dayOfCycle}`:"Log"}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fill={C.textSoft} fontSize={size*.07} fontFamily="Nunito">{cycleInfo?"of cycle":"period"}</text>
    </svg>
  );
}

function PhaseBadge({ cycleInfo, compact=false }) {
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

// ─── Workout data ─────────────────────────────────────────────────────────────
const ALL_WORKOUTS = [
  {id:1,name:"Push-Up Progression",emoji:"💪",muscle:"Chest",difficulty:"Beginner",duration:"20 min",tags:["bodyweight","chest","triceps"],achieve:"Builds chest strength, shoulder stability and tricep endurance."},
  {id:2,name:"Barbell Squat",emoji:"🏋️",muscle:"Legs",difficulty:"Intermediate",duration:"35 min",tags:["compound","quads","glutes"],achieve:"Develops overall leg strength, builds quad and glute mass."},
  {id:3,name:"Glute Bridge Circuit",emoji:"🍑",muscle:"Glutes",difficulty:"Beginner",duration:"25 min",tags:["glutes","hip hinge"],achieve:"Activates and lifts glutes, improves hip mobility, reduces lower back tension."},
  {id:4,name:"HIIT Cardio Blast",emoji:"🔥",muscle:"Cardio",difficulty:"Intermediate",duration:"30 min",tags:["cardio","fat burn"],achieve:"Improves cardiovascular fitness and endurance in less time."},
  {id:5,name:"Pull Day",emoji:"🏃",muscle:"Back",difficulty:"Intermediate",duration:"45 min",tags:["pull","lats","biceps"],achieve:"Builds a stronger back, improves posture and develops bicep definition."},
  {id:6,name:"Yoga Flow",emoji:"🧘",muscle:"Recovery",difficulty:"Beginner",duration:"40 min",tags:["flexibility","mobility"],achieve:"Improves flexibility, reduces muscle soreness and supports recovery."},
  {id:7,name:"Shoulder Sculpt",emoji:"🎯",muscle:"Shoulders",difficulty:"Intermediate",duration:"30 min",tags:["delts","press"],achieve:"Creates defined shoulder shape and improves upper body strength."},
  {id:8,name:"Core Destroyer",emoji:"⚡",muscle:"Core",difficulty:"Advanced",duration:"20 min",tags:["abs","planks"],achieve:"Builds core stability, strengthens abs and supports better posture."},
  {id:9,name:"Zone 2 Run",emoji:"🏃‍♀️",muscle:"Cardio",difficulty:"Beginner",duration:"45 min",tags:["aerobic","endurance"],achieve:"Builds aerobic base, improves fat burning and boosts energy levels."},
  {id:10,name:"Hip Thrust",emoji:"✨",muscle:"Glutes",difficulty:"Intermediate",duration:"30 min",tags:["glutes","strength"],achieve:"The most effective exercise for glute growth and hip strength."},
  {id:11,name:"Romanian Deadlift",emoji:"🦵",muscle:"Legs",difficulty:"Intermediate",duration:"30 min",tags:["hamstrings","glutes"],achieve:"Strengthens hamstrings and glutes, improves posture and hip hinge mechanics."},
  {id:12,name:"Pilates Core",emoji:"🌸",muscle:"Core",difficulty:"Beginner",duration:"35 min",tags:["core","stability"],achieve:"Builds deep core strength, improves posture and body awareness."},
];
const MUSCLES=["All","Chest","Back","Legs","Glutes","Shoulders","Core","Cardio","Recovery"];
const DIFF_COLOR={Beginner:{bg:C.sage,text:ACCENT.fiber.text},Intermediate:{bg:C.butter,text:ACCENT.carbs.text},Advanced:{bg:C.rose,text:ACCENT.protein.text}};


// ══════════════════════════════════════════════════════════════════════════════
// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function OnboardingFlow({ onDone }) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [pStart,setPStart]=useState("");
  const [cLen,setCLen]=useState(28);
  const [trackCycle,setTrackCycle]=useState(null);

  const next=()=>{
    if(step===0){setStep(1);return;}
    if(step===1){setStep(2);return;}
    if(step===2){if(trackCycle===false){setStep(4);}else if(trackCycle===true){setStep(3);}return;}
    if(step===3){setStep(4);return;}
    if(step===4){onDone(name,trackCycle?pStart:"",cLen);return;}
  };
  const canNext=()=>{if(step===1&&!name.trim())return false;if(step===2&&trackCycle===null)return false;return true;};

  const STEPS=[
    {emoji:"🌸",title:"Welcome to Formly",sub:"A fitness app built around how your body actually works."},
    {emoji:"👋",title:"What should we call you?",sub:"Just your first name is fine."},
    {emoji:"🌙",title:"Would you like to track your cycle?",sub:"Formly uses your cycle phase to give context to your weight, energy, and mood, and to personalise workout and nutrition suggestions. Your data never leaves your device."},
    {emoji:"📅",title:"When did your last period start?",sub:"An estimate is fine. You can always update this later."},
    {emoji:"✨",title:"You're all set!",sub:"Formly will guide you through each phase, help you understand your body's patterns, and suggest workouts and nutrition that fit where you are."},
  ];
  const progressMap=trackCycle===false?[0,1,2,4]:[0,1,2,3,4];
  const curIdx=progressMap.indexOf(step);
  const s=STEPS[step];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",padding:"0 24px",background:C.bg}}>
      <div style={{padding:"52px 0 0"}}>
        <div style={{height:4,background:C.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:C.lavenderDeep,width:`${(curIdx/(progressMap.length-1))*100}%`,transition:"width .4s ease"}}/>
        </div>
        <div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginTop:6}}>Step {curIdx+1} of {progressMap.length}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:24}}>
        <div style={{fontSize:56,textAlign:"center"}}>{s.emoji}</div>
        <div>
          <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:26,color:C.text,textAlign:"center",lineHeight:1.2,marginBottom:12}}>{s.title}</div>
          <div style={{fontSize:14,color:C.textSoft,fontWeight:500,textAlign:"center",lineHeight:1.7}}>{s.sub}</div>
        </div>
        {step===1&&<input className="input" placeholder="Your name" value={name} autoFocus onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canNext()&&next()} style={{fontSize:16,textAlign:"center",padding:"14px"}}/>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{val:true,emoji:"🌸",label:"Yes, track my cycle",sub:"Get phase-aware insights, workouts and nutrition"},{val:false,emoji:"✦",label:"No thanks, skip this",sub:"You can always enable it later in the Body tab"}].map(opt=>(
            <button key={String(opt.val)} onClick={()=>setTrackCycle(opt.val)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:16,border:`2px solid ${trackCycle===opt.val?C.lavenderDeep:C.border}`,background:trackCycle===opt.val?C.lavender:C.white,cursor:"pointer",fontFamily:"Nunito",textAlign:"left",transition:"all .15s"}}>
              <span style={{fontSize:24}}>{opt.emoji}</span>
              <div><div style={{fontWeight:800,fontSize:14,color:trackCycle===opt.val?"#5040A0":C.text}}>{opt.label}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginTop:2}}>{opt.sub}</div></div>
              <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",border:`2px solid ${trackCycle===opt.val?"#7050B0":C.border}`,background:trackCycle===opt.val?"#7050B0":"transparent",flexShrink:0}}/>
            </button>
          ))}
        </div>}
        {step===3&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label className="label">First day of your last period</label><input className="input" type="date" value={pStart} onChange={e=>setPStart(e.target.value)} style={{fontSize:15}}/></div>
          <div><label className="label">Average cycle length (days)</label><input className="input" type="number" min="21" max="40" value={cLen} onChange={e=>setCLen(parseInt(e.target.value)||28)}/><div style={{fontSize:11,color:C.textSoft,marginTop:5,fontWeight:600}}>Most cycles are 21-35 days. The average is 28.</div></div>
          <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start"}} onClick={()=>setStep(4)}>Skip for now</button>
        </div>}
        {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{emoji:"🥗",text:"Log meals by name and let AI fill in the macros"},{emoji:"🏋️",text:"Track workouts and log your sets, reps, and weights"},{emoji:trackCycle?"🌙":"📏",text:trackCycle?"See what phase you're in and why your body feels the way it does":"Track your measurements and weight over time"},{emoji:"✨",text:"Get an AI-generated plan tailored to your goals"+(trackCycle?" and cycle phase":"")}].map((item,i)=>(
            <div key={i} className="row" style={{background:C.card,borderRadius:14,padding:"12px 14px",gap:12,border:`1px solid ${C.border}`}}><span style={{fontSize:22}}>{item.emoji}</span><span style={{fontSize:13,fontWeight:600,color:C.textMid}}>{item.text}</span></div>
          ))}
        </div>}
      </div>
      <div style={{paddingBottom:"max(32px,env(safe-area-inset-bottom))",paddingTop:16}}>
        <button className="btn btn-primary" style={{width:"100%",fontSize:16,padding:16}} onClick={next} disabled={!canNext()}>
          {step===4?`Let's go, ${name||"you"} 🌸`:"Continue →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ nutrition, goals, measurements, workoutPlan, schedule, weightHistory, cycleInfo, workoutLog, userName }) {
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const todayStr = new Date().toISOString().slice(0,10);
  const todaySchedule = schedule[todayStr]||[];
  const todayWorkouts = workoutPlan.filter(w=>todaySchedule.includes(w.id));
  const completedToday = (workoutLog||[]).filter(e=>e.date===todayStr).length;
  const greet=()=>{const h=new Date().getHours();return h<12?"Good morning ☀️":h<17?"Good afternoon 🌤️":"Good evening 🌙";};

  return (
    <div className="scroll" style={{padding:"52px 16px 90px"}}>
      <div style={{marginBottom:cycleInfo?12:20}}>
        <div style={{fontSize:22,fontWeight:900,color:C.text}}>{greet()}{userName?`, ${userName}`:""}</div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginTop:2}}>{today}</div>
      </div>
      {cycleInfo&&<PhaseBadge cycleInfo={cycleInfo}/>}
      {cycleInfo && (
        <div className="card" style={{marginBottom:14,background:cycleInfo.phase.bg,border:`1.5px solid ${cycleInfo.phase.color}`}}>
          <div style={{fontWeight:800,fontSize:13,color:cycleInfo.phase.textColor,marginBottom:8}}>
            {cycleInfo.phase.emoji} What to eat this phase
          </div>
          {CYCLE_FOODS[cycleInfo.phase.id].eat.slice(0,3).map((item,i)=>(
            <div key={i} className="row" style={{gap:8,padding:"4px 0",alignItems:"flex-start"}}>
              <span style={{fontSize:14,flexShrink:0}}>{item.emoji}</span>
              <span style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:600,opacity:.9}}>{item.food}</span>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:11,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.7}}>See Nutrition for the full breakdown</div>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div className="row-between" style={{marginBottom:12}}>
          <div className="sec-title" style={{margin:0}}>Today's workouts</div>
          {completedToday>0&&<span style={{fontSize:12,fontWeight:700,color:ACCENT.fiber.text,background:C.sage,padding:"3px 10px",borderRadius:99}}>✓ {completedToday} done</span>}
        </div>
        {todayWorkouts.length===0
          ?<div style={{textAlign:"center",padding:"16px 0",color:C.textSoft,fontSize:13,fontWeight:600}}>Nothing scheduled today 🌿<br/><span style={{fontSize:12}}>Head to Workouts to build your plan</span></div>
          :todayWorkouts.map(w=><div key={w.id} className="row" style={{padding:"8px 0",borderTop:`1px solid ${C.border}`}}><span style={{fontSize:22}}>{w.emoji}</span><div><div style={{fontWeight:700,fontSize:14}}>{w.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{w.muscle} · {w.duration}</div></div></div>)}
      </div>
      {weightHistory&&weightHistory.length>0&&<div className="card"><div className="sec-title">Weight this week</div><WeightChart history={weightHistory} cycleInfo={cycleInfo}/></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── NUTRITION ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ─── Goal suggestion form ─────────────────────────────────────────────────────
// ── Food Insights Page ────────────────────────────────────────────────────────
const CYCLE_FOODS = {
  menstrual: {
    eat: [
      { emoji: "🥩", food: "Iron-rich foods", why: "You lose iron during your period. Red meat, lentils, spinach, tofu." },
      { emoji: "🫚", food: "Omega-3 rich foods", why: "Reduces inflammation and cramps. Salmon, walnuts, flaxseeds, chia." },
      { emoji: "🍫", food: "Dark chocolate", why: "High in magnesium which helps with cramps and mood." },
      { emoji: "🍵", food: "Warm herbal teas", why: "Ginger and chamomile help reduce bloating and discomfort." },
      { emoji: "🥣", food: "Warm cooked meals", why: "Soups and stews are easier to digest when energy is low." },
    ],
    ease: [
      { food: "Caffeine", why: "Can worsen cramps and increase anxiety during this phase." },
      { food: "Alcohol", why: "Worsens inflammation and disrupts sleep quality." },
      { food: "Salty processed foods", why: "Increases water retention and bloating." },
    ],
  },
  follicular: {
    eat: [
      { emoji: "🥦", food: "Cruciferous vegetables", why: "Support oestrogen metabolism. Broccoli, cauliflower, Brussels sprouts." },
      { emoji: "🌾", food: "Complex carbohydrates", why: "Fuel rising energy levels. Oats, quinoa, sweet potato, brown rice." },
      { emoji: "🥚", food: "Lean protein", why: "Supports muscle building as strength increases. Eggs, chicken, legumes." },
      { emoji: "🫐", food: "Fermented foods", why: "Support gut health and oestrogen balance. Yoghurt, kefir, kimchi." },
      { emoji: "🥗", food: "Fresh salads and raw veg", why: "Your digestion is strongest now — make the most of it." },
    ],
    ease: [
      { food: "Ultra-processed foods", why: "Disrupt the oestrogen balance you're building this phase." },
    ],
  },
  ovulation: {
    eat: [
      { emoji: "🫘", food: "Zinc-rich foods", why: "Supports ovulation and immune function. Pumpkin seeds, chickpeas, beef." },
      { emoji: "🍓", food: "Antioxidant-rich foods", why: "Protect cells during ovulation. Berries, leafy greens, tomatoes." },
      { emoji: "💧", food: "Hydrating foods", why: "Energy peaks but so does temperature. Cucumber, watermelon, coconut water." },
      { emoji: "🐟", food: "Light proteins", why: "Support your peak performance. Fish, eggs, legumes." },
    ],
    ease: [
      { food: "Heavy fried foods", why: "Can cause sluggishness when your energy should be at its peak." },
    ],
  },
  luteal: {
    eat: [
      { emoji: "🎯", food: "Magnesium-rich foods", why: "Reduces cramps, bloating, and mood dips. Dark chocolate, pumpkin seeds, almonds, spinach." },
      { emoji: "🐟", food: "B6-rich foods", why: "Directly reduces PMS symptoms. Salmon, bananas, chickpeas, potatoes." },
      { emoji: "🌾", food: "Complex carbohydrates", why: "Your body craves them for a reason — progesterone raises your metabolic rate. Oats, brown rice, sweet potato." },
      { emoji: "🥛", food: "Calcium-rich foods", why: "Reduces PMS severity. Dairy, fortified plant milks, leafy greens." },
      { emoji: "🫚", food: "Anti-inflammatory foods", why: "Reduces the inflammation that drives cramps and bloating. Turmeric, ginger, berries." },
    ],
    ease: [
      { food: "High sodium foods", why: "Makes water retention and bloating significantly worse." },
      { food: "Refined sugar", why: "Blood sugar swings amplify mood dips during this phase." },
      { food: "Alcohol", why: "Worsens anxiety, breast tenderness, and disrupts sleep." },
      { food: "Excess caffeine", why: "Increases anxiety and breast tenderness." },
    ],
  },
};

const GOAL_FOODS = {
  "Build muscle and strength": {
    focus: ["Protein at every meal — aim for a palm-sized portion", "Complex carbs before training for fuel", "Healthy fats for hormone support", "Leucine-rich foods post-workout: eggs, dairy, meat, tofu"],
    examples: ["Chicken, eggs, Greek yoghurt, tofu, legumes", "Oats, sweet potato, rice, quinoa", "Avocado, olive oil, nuts, seeds"],
  },
  "Build glutes and reduce belly fat": {
    focus: ["High protein to support glute growth", "Fibre-rich foods to support gut health and reduce bloating", "Anti-inflammatory foods to manage cortisol", "Avoid refined sugar which promotes fat storage around the midsection"],
    examples: ["Eggs, salmon, chicken, legumes, Greek yoghurt", "Leafy greens, cruciferous veg, berries", "Oats, sweet potato, brown rice for pre-workout fuel"],
  },
  "Reduce body fat": {
    focus: ["Protein at every meal to preserve muscle while in deficit", "High fibre foods to stay full longer", "Prioritise volume — foods that fill you up without high energy density", "Adequate healthy fats for hormone health"],
    examples: ["Lean proteins: chicken, fish, eggs, legumes", "High-volume veg: leafy greens, courgette, cucumber, peppers", "Berries, apples, pears for fibre-rich sweetness"],
  },
  "Improve endurance": {
    focus: ["Complex carbohydrates as primary fuel source", "Electrolytes — especially sodium, potassium, magnesium", "Iron-rich foods to support oxygen transport", "Consistent protein to support muscle repair"],
    examples: ["Oats, bananas, pasta, rice, sweet potato", "Spinach, lentils, red meat for iron", "Coconut water, salted snacks around training"],
  },
  "Tone up generally": {
    focus: ["Balanced protein intake to maintain muscle", "Plenty of vegetables for micronutrients", "Complex carbs timed around workouts", "Limit ultra-processed foods"],
    examples: ["Eggs, fish, legumes, Greek yoghurt", "A wide variety of colourful vegetables", "Oats, sweet potato, brown rice"],
  },
  "Maintain and feel good": {
    focus: ["Eat intuitively and focus on variety", "Whole foods as the base of your diet", "Stay hydrated", "Prioritise foods that make you feel energised"],
    examples: ["Whatever you enjoy from each food group", "Seasonal vegetables and fruits", "Quality protein sources you like"],
  },
};

function NutritionPage({ cycleInfo, showToast }) {
  const [subTab, setSubTab] = useState("cycle");
  const [selectedGoal, setSelectedGoal] = useState(() => load("food-goal", ""));
  const [foodLog, setFoodLog] = useState(() => load("food-diary", []));
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => { save("food-diary", foodLog); }, [foodLog]);
  useEffect(() => { save("food-goal", selectedGoal); }, [selectedGoal]);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    setFoodLog(l => [{ text: newEntry.trim(), time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}), date: new Date().toISOString().slice(0,10), id: Date.now() }, ...l]);
    setNewEntry("");
    showToast("Added to diary");
  };

  const phase = cycleInfo?.phase;
  const phaseFoods = phase ? CYCLE_FOODS[phase.id] : null;
  const goalFoods = selectedGoal ? GOAL_FOODS[selectedGoal] : null;

  const SubTabs = () => (
    <div style={{display:"flex",borderBottom:`2px solid ${C.border}`}}>
      {[["cycle","This Phase"],["goals","My Goal"],["diary","Diary"]].map(([v,l]) => (
        <button key={v} onClick={() => setSubTab(v)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",cursor:"pointer",fontFamily:"Nunito",fontWeight:800,fontSize:14,color:subTab===v?"#7050B0":C.textSoft,borderBottom:subTab===v?"2px solid #7050B0":"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );

  return (
    <div className="scroll" style={{paddingBottom:90}}>
      <div style={{padding:"52px 18px 0",background:C.bg}}>
        <div className="row" style={{marginBottom:2}}><span style={{fontSize:26}}>🥗</span><div style={{fontSize:24,fontWeight:900,color:C.text,marginLeft:8}}>Nutrition</div></div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:14}}>Food insights for your cycle and goals</div>
        <SubTabs/>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* CYCLE TAB */}
        {subTab==="cycle" && (
          <div>
            {!phase ? (
              <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
                <div style={{fontSize:36,marginBottom:10}}>🌸</div>
                <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>Log your cycle first</div>
                <div style={{fontSize:13,color:C.textSoft,lineHeight:1.6}}>Head to the Body tab and log your last period date to get personalised food insights for each phase of your cycle.</div>
              </div>
            ) : (
              <div>
                <div style={{background:phase.bg,borderRadius:18,padding:"16px",marginBottom:14,border:`1.5px solid ${phase.color}`}}>
                  <div style={{fontWeight:900,fontSize:16,color:phase.textColor,marginBottom:4}}>{phase.emoji} {phase.label} phase</div>
                  <div style={{fontSize:13,color:phase.textColor,fontWeight:500,opacity:.9,lineHeight:1.6}}>Day {cycleInfo.dayOfCycle} of your cycle. Here is what your body benefits most from right now.</div>
                </div>

                <div className="card" style={{marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>Foods to focus on</div>
                  {phaseFoods.eat.map((item, i) => (
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderTop:i>0?`1px solid ${C.border}`:"none",alignItems:"flex-start"}}>
                      <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:13,marginBottom:2}}>{item.food}</div>
                        <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.5}}>{item.why}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {phaseFoods.ease.length > 0 && (
                  <div className="card" style={{marginBottom:14,background:C.rose,border:"none"}}>
                    <div style={{fontWeight:800,fontSize:14,color:ACCENT.protein.text,marginBottom:12}}>Ease off on</div>
                    {phaseFoods.ease.map((item, i) => (
                      <div key={i} style={{padding:"8px 0",borderTop:i>0?`1px solid ${C.roseDeep}`:"none"}}>
                        <div style={{fontWeight:700,fontSize:13,color:ACCENT.protein.text}}>{item.food}</div>
                        <div style={{fontSize:12,color:ACCENT.protein.text,fontWeight:500,opacity:.8,marginTop:2}}>{item.why}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GOAL TAB */}
        {subTab==="goals" && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>What is your main goal?</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {Object.keys(GOAL_FOODS).map(g => {
                  const sel = selectedGoal === g;
                  return (
                    <button key={g} onClick={() => setSelectedGoal(g)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:14,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,background:sel?C.lavender:C.bgDeep,cursor:"pointer",fontFamily:"Nunito",textAlign:"left",transition:"all .15s"}}>
                      <span style={{fontWeight:700,fontSize:13,color:sel?"#5040A0":C.text}}>{g}</span>
                      <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
                    </button>
                  );
                })}
              </div>
            </div>

            {goalFoods && (
              <div>
                <div className="card" style={{marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:12}}>What to focus on</div>
                  {goalFoods.focus.map((f,i) => (
                    <div key={i} className="row" style={{gap:8,padding:"6px 0",borderTop:i>0?`1px solid ${C.border}`:"none",alignItems:"flex-start"}}>
                      <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:3}}>•</span>
                      <span style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{marginBottom:14,background:C.sage,border:"none"}}>
                  <div style={{fontWeight:800,fontSize:14,color:ACCENT.fiber.text,marginBottom:10}}>Great foods to include</div>
                  {goalFoods.examples.map((ex,i) => (
                    <div key={i} className="row" style={{gap:8,padding:"4px 0",alignItems:"flex-start"}}>
                      <span style={{color:ACCENT.fiber.text,fontWeight:900,flexShrink:0}}>•</span>
                      <span style={{fontSize:13,color:"#2A5A28",fontWeight:500,lineHeight:1.5}}>{ex}</span>
                    </div>
                  ))}
                </div>
                {cycleInfo && (
                  <div style={{background:cycleInfo.phase.bg,borderRadius:16,padding:"14px 16px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
                    <div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>{cycleInfo.phase.emoji} Combined with your {cycleInfo.phase.label.toLowerCase()} phase</div>
                    <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>
                      Your cycle phase affects how your body uses nutrients. Right now your body benefits from: {CYCLE_FOODS[cycleInfo.phase.id].eat.slice(0,2).map(f=>f.food.toLowerCase()).join(" and ")}.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DIARY TAB */}
        {subTab==="diary" && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:4}}>Food diary</div>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginBottom:12,lineHeight:1.5}}>A simple log of what you ate. No numbers, no tracking. Just awareness.</div>
              <div className="row" style={{gap:8}}>
                <input className="input" placeholder="What did you eat?" value={newEntry} onChange={e=>setNewEntry(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEntry()} style={{fontSize:13}}/>
                <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={addEntry}>Add</button>
              </div>
            </div>
            {foodLog.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 0",color:C.textSoft}}>
                <div style={{fontSize:32,marginBottom:8}}>🌿</div>
                <div style={{fontWeight:700}}>Nothing logged yet</div>
                <div style={{fontSize:12,marginTop:4}}>Add what you ate above</div>
              </div>
            ) : (
              Object.entries(foodLog.reduce((acc,e)=>{const d=e.date||"Today";if(!acc[d])acc[d]=[];acc[d].push(e);return acc;},{})).sort(([a],[b])=>b.localeCompare(a)).map(([date,entries])=>(
                <div key={date} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:8}}>
                    {date===new Date().toISOString().slice(0,10)?"Today":new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                  </div>
                  {entries.map(e=>(
                    <div key={e.id} className="card" style={{marginBottom:8,padding:"10px 14px"}}>
                      <div className="row-between">
                        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{e.text}</span>
                        <span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>{e.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function BodyPage({ measurements, setMeasurements, weightHistory, setWeightHistory, cycleInfo, periodStart, setPeriodStart, periodHistory, setPeriodHistory, cycleLength, setCycleLength, showToast }) {
  const [subTab,setSubTab]=useState("cycle");
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [aiInsight,setAiInsight]=useState(()=>load("body-insight",""));
  const [aiLoading,setAiLoading]=useState(false);

  const fields=[{k:"weight",label:"Weight",unit:"kg"},{k:"height",label:"Height",unit:"cm"},{k:"waist",label:"Waist",unit:"cm"},{k:"hips",label:"Hips",unit:"cm"},{k:"bust",label:"Bust / Chest",unit:"cm"},{k:"glutes",label:"Glutes",unit:"cm"},{k:"thighs",label:"Thighs",unit:"cm"},{k:"arms",label:"Arms",unit:"cm"}];

  const save_m=()=>{
    setMeasurements(form);
    if(form.weight){setWeightHistory(h=>{const today=new Date().toISOString().slice(0,10);return [...h.filter(x=>x.date!==today),{date:today,weight:parseFloat(form.weight)}].sort((a,b)=>a.date.localeCompare(b.date));});}
    setModal(null);showToast("Measurements saved ✓");
  };

  const generateInsight=async()=>{
    setAiLoading(true);
    const phaseCtx=cycleInfo?`Currently in ${cycleInfo.phase.label} phase (Day ${cycleInfo.dayOfCycle}).`:"No cycle data logged.";
    const mStr=fields.filter(f=>measurements[f.k]).map(f=>`${f.label}: ${measurements[f.k]}${f.unit}`).join(", ");
    const weightTrend=weightHistory.length>=2?`Weight: ${weightHistory[weightHistory.length-2]?.weight}kg to ${weightHistory[weightHistory.length-1]?.weight}kg`:"";
    try{
      const result=await callAI("/api/body-insight",`My measurements: ${mStr||"not yet logged"}. ${weightTrend}. ${phaseCtx} Give me a warm explanation of what I'm seeing in my body right now, factoring in my cycle phase. Reassure me about any fluctuations.`);
      const cleaned=result.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").trim();
      setAiInsight(cleaned);save("body-insight",cleaned);
    }catch{showToast("Could not get insight. Is the backend running?");}
    setAiLoading(false);
  };

  const bmi=measurements.weight&&measurements.height?(measurements.weight/((measurements.height/100)**2)).toFixed(1):null;
  const latestWeight=weightHistory.length?weightHistory[weightHistory.length-1]?.weight:null;
  const prevWeight=weightHistory.length>1?weightHistory[weightHistory.length-2]?.weight:null;
  const weightDiff=latestWeight&&prevWeight?(latestWeight-prevWeight).toFixed(1):null;

  const SubTabs=()=>(
    <div style={{display:"flex",borderBottom:`2px solid ${C.border}`}}>
      {[["cycle","Cycle"],["measurements","Body"],["insights","Insights"]].map(([v,l])=>(
        <button key={v} onClick={()=>setSubTab(v)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",cursor:"pointer",fontFamily:"Nunito",fontWeight:800,fontSize:14,color:subTab===v?"#7050B0":C.textSoft,borderBottom:subTab===v?"2px solid #7050B0":"2px solid transparent",marginBottom:-2,transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );

  return (
    <div className="scroll" style={{paddingBottom:90}}>
      <div style={{padding:"52px 18px 0",background:C.bg}}>
        <div className="row" style={{marginBottom:2}}><span style={{fontSize:26}}>🌸</span><div style={{fontSize:24,fontWeight:900,color:C.text}}>Body</div></div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:14}}>Your body, your cycle, your context</div>
        <SubTabs/>
      </div>
      <div style={{padding:"16px 16px 0"}}>

        {subTab==="cycle"&&<div>
          {!periodStart?<div className="card" style={{textAlign:"center",padding:"28px 20px",marginBottom:14}}>
            <div style={{fontSize:40,marginBottom:10}}>🌸</div>
            <div style={{fontWeight:900,fontSize:16,marginBottom:6}}>Track your cycle</div>
            <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:18}}>Log when your last period started and we'll tell you what phase you're in, what to expect, and how to work with your body.</div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>setModal("cycle-setup")}>Log my last period</button>
          </div>:<>
            <div className="card" style={{marginBottom:14,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <PhaseWheel cycleInfo={cycleInfo} size={200}/>
              {cycleInfo&&<div style={{width:"100%",background:cycleInfo.phase.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
                <div style={{fontWeight:900,fontSize:15,color:cycleInfo.phase.textColor,marginBottom:4}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase</div>
                <div style={{fontSize:13,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.body}</div>
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  <div style={{flex:1,background:"white",borderRadius:10,padding:"8px 10px",opacity:.85}}><div style={{fontSize:10,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:2}}>ENERGY</div><div style={{fontSize:11,color:C.textMid,fontWeight:600,lineHeight:1.4}}>{cycleInfo.phase.energy}</div></div>
                  <div style={{flex:1,background:"white",borderRadius:10,padding:"8px 10px",opacity:.85}}><div style={{fontSize:10,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:2}}>NEXT PERIOD</div><div style={{fontSize:11,color:C.textMid,fontWeight:600}}>{cycleInfo.daysUntilNext>0?`~${cycleInfo.daysUntilNext} days`:"very soon"}</div></div>
                </div>
              </div>}
            </div>
            {weightDiff&&cycleInfo&&<div className="card" style={{marginBottom:14,background:cycleInfo.phase.bg,border:`1.5px solid ${cycleInfo.phase.color}`}}>
              <div style={{fontWeight:800,fontSize:13,color:cycleInfo.phase.textColor,marginBottom:6}}>⚖️ About your weight right now</div>
              <div style={{fontSize:13,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.weight}</div>
              {Math.abs(weightDiff)>=.5&&<div style={{marginTop:8,fontSize:12,fontWeight:700,color:cycleInfo.phase.textColor,opacity:.75}}>Your log shows a {weightDiff>0?"+":""}{weightDiff} kg change since your last entry.</div>}
            </div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}><div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:6}}>💭 Mood and mind</div><div style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{cycleInfo.phase.moodNote}</div></div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🏋️ Workouts this phase</div>
              {cycleInfo.phase.workouts.map((w,i)=><div key={i} className="row" style={{padding:"5px 0",gap:8}}><span style={{color:cycleInfo.phase.color,fontWeight:900,flexShrink:0}}>→</span><span style={{fontSize:13,color:C.textMid,fontWeight:600}}>{w}</span></div>)}
              {cycleInfo.phase.avoid.length>0&&<div style={{marginTop:10,padding:"10px 12px",background:C.bgDeep,borderRadius:10}}><div style={{fontSize:11,fontWeight:800,color:C.textSoft,marginBottom:6}}>EASE OFF ON</div>{cycleInfo.phase.avoid.map((a,i)=><div key={i} style={{fontSize:12,color:C.textSoft,fontWeight:600,padding:"2px 0"}}>· {a}</div>)}</div>}
            </div>}
            {cycleInfo&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🥗 Nutrients to prioritise</div>
              {cycleInfo.phase.foods.map((f,i)=><div key={i} className="row" style={{padding:"5px 0",gap:8}}><span style={{color:cycleInfo.phase.color,fontWeight:900,flexShrink:0}}>→</span><span style={{fontSize:13,color:C.textMid,fontWeight:600}}>{f}</span></div>)}
            </div>}
            {periodHistory&&periodHistory.length>1&&<div className="card" style={{marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,color:C.textMid,marginBottom:10}}>🗓 Period history</div>
              {periodHistory.slice(0,6).map((p,i,arr)=>{const next=arr[i+1];const len=next?Math.round((new Date(p.date)-new Date(next.date))/(1000*60*60*24)):null;return(<div key={p.date} className="row-between" style={{padding:"6px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}><span style={{fontSize:13,fontWeight:600,color:C.textMid}}>{new Date(p.date+"T12:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>{len&&<span style={{fontSize:11,color:C.textSoft,fontWeight:600}}>{len}d cycle</span>}</div>);})}
            </div>}
            <button className="btn btn-ghost" style={{width:"100%",marginBottom:14}} onClick={()=>setModal("cycle-setup")}>✏️ Update period date or cycle length</button>
          </>}
        </div>}

        {subTab==="measurements"&&<div>
          {/* Measurement rings */}
          <div className="card" style={{marginBottom:14}}>
            <div className="row-between" style={{marginBottom:14}}>
              <div className="sec-title" style={{margin:0}}>Measurements</div>
              <button className="btn btn-primary btn-sm" onClick={()=>{setForm({...measurements});setModal("update");}}>Update</button>
            </div>
            <MeasurementRings measurements={measurements} goalMeasurements={{}}/>
          </div>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[{k:"weight",label:"Weight",unit:"kg"},{k:"height",label:"Height",unit:"cm"}].map(f=>(
              <div key={f.k} className="card" style={{padding:"14px"}}>
                <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:4}}>{f.label}</div>
                <div style={{fontSize:24,fontWeight:900,color:C.text}}>{measurements[f.k]||"—"}<span style={{fontSize:12,color:C.textSoft,marginLeft:3}}>{measurements[f.k]?f.unit:""}</span></div>
              </div>
            ))}
          </div>
          {bmi&&<div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginBottom:14,padding:"6px 10px",background:C.bgDeep,borderRadius:10}}>
            BMI {bmi} · BMI is one of many indicators and doesn't account for muscle, cycle phase, or body composition. Use it as context, not a verdict.
          </div>}
          {/* Weight chart */}
          <div className="card" style={{marginBottom:14}}><div className="sec-title">Weight history</div><WeightChart history={weightHistory} cycleInfo={cycleInfo}/></div>
          {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:18,padding:"14px 16px",border:`1.5px solid ${cycleInfo.phase.color}`,marginBottom:14}}><div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase context</div><div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{cycleInfo.phase.weight}</div></div>}
        </div>}

        {subTab==="insights"&&<div>
          {cycleInfo&&<PhaseBadge cycleInfo={cycleInfo}/>}
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontWeight:800,fontSize:14,color:C.textMid,marginBottom:4}}>✨ AI body insight</div>
            <div style={{fontSize:12,color:C.textSoft,fontWeight:500,marginBottom:14,lineHeight:1.5}}>Get a warm, personalised explanation of what's going on in your body right now, taking into account your cycle phase, weight trend, and measurements.</div>
            <button className="btn btn-primary" style={{width:"100%"}} onClick={generateInsight} disabled={aiLoading}>{aiLoading?<><div className="spin"/>Thinking about your body...</>:"✨ Get my insight"}</button>
            {aiInsight&&<div style={{marginTop:14,background:C.lavender,borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7050B0",marginBottom:8}}>YOUR INSIGHT</div>
              <div style={{fontSize:13,lineHeight:1.7,color:"#4030A0",fontWeight:500}}>{aiInsight}</div>
              <button style={{marginTop:10,background:"none",border:"none",fontSize:11,color:"#9070C0",fontWeight:700,cursor:"pointer",padding:0,fontFamily:"Nunito"}} onClick={()=>{setAiInsight("");save("body-insight","");}}>Clear</button>
            </div>}
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:10}}>UNDERSTANDING YOUR CYCLE</div>
            {Object.values(PHASES).map(p=><div key={p.id} style={{background:p.bg,borderRadius:18,padding:"14px 16px",marginBottom:10,border:`1.5px solid ${p.color}`,opacity:cycleInfo?.phase?.id===p.id?1:.7}}><div style={{fontWeight:900,fontSize:14,color:p.textColor,marginBottom:4}}>{p.emoji} {p.label} · {p.days}</div><div style={{fontSize:12,color:p.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>{p.body}</div></div>)}
          </div>
        </div>}
      </div>

      {modal==="cycle-setup"&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="modal">
        <div className="modal-handle"/><div className="modal-title">🌸 Your cycle</div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:18}}>We only need two things. Your data stays on your device and is never shared.</div>
        <div style={{marginBottom:14}}><label className="label">First day of your last period</label><input className="input" type="date" value={periodStart||""} onChange={e=>setPeriodStart(e.target.value)}/></div>
        <div style={{marginBottom:20}}><label className="label">Average cycle length (days)</label><input className="input" type="number" min="21" max="40" value={cycleLength||28} onChange={e=>setCycleLength(parseInt(e.target.value)||28)}/><div style={{fontSize:11,color:C.textSoft,marginTop:5,fontWeight:600}}>Most cycles are 21-35 days. The average is 28.</div></div>
        <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>{if(periodStart){setPeriodHistory(h=>{const already=h.find(x=>x.date===periodStart);if(already)return h;return[...h,{date:periodStart}].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);});}setModal(null);showToast("Cycle logged 🌸");}}>Save</button>
      </div></div>}

      {modal==="update"&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="modal">
        <div className="modal-handle"/><div className="modal-title">Update measurements 📏</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {fields.map(f=><div key={f.k}><label className="label">{f.label} ({f.unit})</label><input className="input" type="number" value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}/></div>)}
        </div>
        <div className="row" style={{gap:10,marginTop:16}}><button className="btn btn-ghost" style={{flex:1}} onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" style={{flex:2}} onClick={save_m}>Save</button></div>
      </div></div>}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
function WorkoutsPage({ workoutPlan, setWorkoutPlan, schedule, setSchedule, workoutLog, setWorkoutLog, aiPlan, measurements, goals, cycleInfo, showToast }) {
  const [tab, setTab] = useState("schedule");
  const [logModal, setLogModal] = useState(null);
  const [logForm, setLogForm] = useState({ sets:"", reps:"", weight:"", notes:"", duration:"" });
  const [customInput, setCustomInput] = useState("");
  const [pickingDay, setPickingDay] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = new Set((workoutLog||[]).filter(e=>e.date===todayStr).map(e=>e.name));

  const DAYS = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
    return { date: d.toISOString().slice(0,10), label:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i], num: d.getDate() };
  });

  const addToDay = (date, item) => setSchedule(s => ({ ...s, [date]: [...(s[date]||[]), item] }));
  const removeFromDay = (date, idx) => setSchedule(s => ({ ...s, [date]: (s[date]||[]).filter((_,i)=>i!==idx) }));

  const logWorkout = () => {
    if (!logModal) return;
    const entry = { workoutId: logModal.id||logModal.name, name: logModal.name, emoji: logModal.emoji||"🏋️", muscle: logModal.muscle||"", date: todayStr, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), sets:logForm.sets, reps:logForm.reps, weight:logForm.weight, duration:logForm.duration||logModal.duration||"", notes:logForm.notes, id:Date.now() };
    setWorkoutLog(l=>[entry,...(l||[])]);
    setLogModal(null); setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});
    showToast(`${logModal.emoji||"🏋️"} Workout logged!`);
  };

  const TabRow = () => (
    <div className="row" style={{gap:6,marginBottom:16,background:C.bgDeep,borderRadius:14,padding:5}}>
      {[["schedule","Schedule"],["browse","Browse"],["ai","AI Coach"],["history","History"]].map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"7px 0",borderRadius:10,border:"none",cursor:"pointer",background:tab===v?C.white:"transparent",color:tab===v?"#7050B0":C.textSoft,fontWeight:800,fontSize:13,fontFamily:"Nunito",boxShadow:tab===v?`0 1px 6px ${C.shadow}`:"none",transition:"all .15s"}}>{l}</button>
      ))}
    </div>
  );

  return (
    <div className="scroll" style={{padding:"52px 16px 90px"}}>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:16}}>Workouts</div>
      <TabRow/>

      {tab==="schedule" && (
        <div>
          {aiPlan && (
            <div style={{background:`linear-gradient(135deg,${C.lavender},${C.rose})`,borderRadius:16,padding:"12px 14px",marginBottom:14,border:`1.5px solid ${C.lavenderDeep}`}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7050B0",marginBottom:2}}>✨ AI plan active</div>
              <div style={{fontSize:12,color:C.textMid,fontWeight:500}}>Tap any day to add workouts to your schedule.</div>
            </div>
          )}

          {/* Calendar grid header */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
            {["S","M","T","W","T","F","S"].map((d,i)=>(
              <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:800,color:C.textSoft,padding:"4px 0"}}>{d}</div>
            ))}
          </div>

          {/* Calendar day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
            {DAYS.map(day => {
              const items = schedule[day.date] || [];
              const isToday = day.date === todayStr;
              const isPicking = pickingDay === day.date;
              return (
                <div key={day.date} onClick={()=>setPickingDay(isPicking?null:day.date)} style={{
                  borderRadius:12, padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  cursor:"pointer", border:`1.5px solid ${isPicking?"#9070D0":isToday?C.lavenderDeep:items.length?C.lavenderDeep:C.border}`,
                  background:isPicking?"#9070D0":isToday?C.lavender:items.length?C.lavender+"60":C.white,
                  transition:"all .15s",
                }}>
                  <div style={{fontSize:11,fontWeight:900,color:isPicking?"white":isToday?"#7050B0":C.text}}>{day.num}</div>
                  {items.length>0 && (
                    <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>
                      {items.slice(0,3).map((_,i)=>(
                        <div key={i} style={{width:5,height:5,borderRadius:"50%",background:isPicking?"white":"#9070D0"}}/>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected day detail panel */}
          {pickingDay && (()=>{
            const day = DAYS.find(d=>d.date===pickingDay);
            const items = schedule[pickingDay]||[];
            const isToday = pickingDay===todayStr;
            return (
              <div className="card" style={{marginBottom:14}}>
                <div className="row-between" style={{marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:900,fontSize:16,color:C.text}}>{day?.label}, {new Date(pickingDay+"T12:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}</div>
                    {isToday&&<div style={{fontSize:11,fontWeight:700,color:"#9070D0"}}>Today</div>}
                  </div>
                  <span style={{fontSize:13,color:C.textSoft,fontWeight:600}}>{items.length?`${items.length} workout${items.length>1?"s":""}` : "Rest day"}</span>
                </div>

                {/* Workouts for this day */}
                {items.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bgDeep,borderRadius:12,marginBottom:8}}>
                    <span style={{fontSize:20}}>{item.emoji||"🏋️"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.name}</div>
                      {item.detail&&<div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{item.detail}</div>}
                    </div>
                    <div className="row" style={{gap:6}}>
                      {isToday&&<button className="btn btn-sm" style={{background:completedToday.has(item.name)?C.sage:C.butter,color:completedToday.has(item.name)?ACCENT.fiber.text:ACCENT.carbs.text,border:"none",fontSize:11}} onClick={()=>{setLogModal(item);setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});}}>
                        {completedToday.has(item.name)?"✓ Done":"Log"}
                      </button>}
                      <button style={{background:"none",border:"none",color:C.textSoft,cursor:"pointer",fontSize:16}} onClick={()=>removeFromDay(pickingDay,idx)}>×</button>
                    </div>
                  </div>
                ))}

                {/* Add workout */}
                <div style={{marginTop:8}}>
                  {workoutPlan.length>0&&(
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:C.textSoft,fontWeight:700,marginBottom:6}}>Quick add from your plan:</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {workoutPlan.map(w=>(
                          <button key={w.id} onClick={()=>{addToDay(pickingDay,{name:w.name,emoji:w.emoji,detail:`${w.muscle} · ${w.duration}`});showToast("Added ✓");}} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${C.lavenderDeep}`,background:C.lavender,color:"#5040A0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"Nunito"}}>
                            {w.emoji} {w.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="row" style={{gap:8}}>
                    <input className="input" placeholder="Type a workout name..." value={customInput} onChange={e=>setCustomInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&customInput.trim()){addToDay(pickingDay,{name:customInput.trim(),emoji:"🏋️"});setCustomInput("");showToast("Added ✓");}}}
                      style={{fontSize:13}}/>
                    <button className="btn btn-primary btn-sm" style={{flexShrink:0}} onClick={()=>{if(customInput.trim()){addToDay(pickingDay,{name:customInput.trim(),emoji:"🏋️"});setCustomInput("");showToast("Added ✓");}}}>Add</button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab==="browse" && (
        <div>
          {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:14,padding:"10px 14px",marginBottom:14,border:`1.5px solid ${cycleInfo.phase.color}`}}>
            <div style={{fontSize:11,fontWeight:800,color:cycleInfo.phase.textColor,marginBottom:4}}>{cycleInfo.phase.emoji} Best for your {cycleInfo.phase.label.toLowerCase()} phase</div>
            <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,opacity:.9}}>{cycleInfo.phase.workouts[0]} · {cycleInfo.phase.workouts[1]}</div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ALL_WORKOUTS.map(w=>{
              const dc=DIFF_COLOR[w.difficulty];
              const inPlan=workoutPlan.some(p=>p.id===w.id);
              return(
                <div key={w.id} className="workout-card">
                  <div className="row-between">
                    <div className="row"><span style={{fontSize:24}}>{w.emoji}</span><div><div style={{fontWeight:800,fontSize:15}}>{w.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{w.muscle} · {w.duration}</div></div></div>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:dc.bg,color:dc.text}}>{w.difficulty}</span>
                  </div>
                  {w.achieve&&<div style={{fontSize:12,color:C.textMid,fontWeight:500,lineHeight:1.5,background:C.bgDeep,borderRadius:10,padding:"6px 10px"}}>{w.achieve}</div>}
                  <div className="row" style={{gap:8}}>
                    <button className={`btn btn-sm ${inPlan?"btn-ghost":"btn-primary"}`} style={{flex:1}} onClick={()=>{if(inPlan){setWorkoutPlan(p=>p.filter(x=>x.id!==w.id));showToast("Removed");}else{setWorkoutPlan(p=>[...p,w]);showToast(`${w.emoji} Added!`);}}}>
                      {inPlan?"✓ In plan":"+ Add to plan"}
                    </button>
                    <button className="btn btn-sm" style={{flex:1,background:C.butter,color:ACCENT.carbs.text,border:"none"}} onClick={()=>{setLogModal(w);setLogForm({sets:"",reps:"",weight:"",notes:"",duration:""});}}>Log workout</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="history" && (
        <div>
          {(!workoutLog||workoutLog.length===0)
            ?<div style={{textAlign:"center",padding:"40px 0",color:C.textSoft}}><div style={{fontSize:36,marginBottom:10}}>🏋️</div><div style={{fontWeight:700}}>No workouts logged yet</div><div style={{fontSize:13,marginTop:4}}>Tap Log on any workout to get started</div></div>
            :Object.entries((workoutLog||[]).reduce((acc,e)=>{if(!acc[e.date])acc[e.date]=[];acc[e.date].push(e);return acc;},{})).sort(([a],[b])=>b.localeCompare(a)).map(([date,entries])=>(
              <div key={date} style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:800,color:C.textMid,marginBottom:8}}>
                  {date===todayStr?"Today":new Date(date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                  <span style={{fontWeight:600,color:C.textSoft,marginLeft:8}}>{entries.length} workout{entries.length>1?"s":""}</span>
                </div>
                {entries.map(e=>(
                  <div key={e.id} className="card" style={{marginBottom:8,padding:"12px 14px"}}>
                    <div className="row" style={{gap:10}}>
                      <span style={{fontSize:22}}>{e.emoji||"🏋️"}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14}}>{e.name}</div>
                        <div style={{fontSize:11,color:C.textSoft,marginTop:3}}>{e.duration}{e.sets?` · ${e.sets} sets`:""}{e.reps?` x ${e.reps} reps`:""}{e.weight?` @ ${e.weight}kg`:""}</div>
                        {e.notes&&<div style={{fontSize:11,color:C.textMid,marginTop:4,fontStyle:"italic"}}>{e.notes}</div>}
                      </div>
                      <span style={{fontSize:10,color:C.textSoft,fontWeight:600}}>{e.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}


      {tab==="ai" && <AICoachPanel measurements={measurements} goals={goals} workoutPlan={workoutPlan} cycleInfo={cycleInfo} showToast={showToast}/>}

      {logModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setLogModal(null)}><div className="modal">
        <div className="modal-handle"/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:28}}>{logModal.emoji||"🏋️"}</span>
          <div><div className="modal-title" style={{marginBottom:0}}>{logModal.name}</div><div style={{fontSize:12,color:C.textSoft,fontWeight:500}}>{logModal.muscle||""}{logModal.duration?` · ${logModal.duration}`:""}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[["sets","Sets","e.g. 3"],["reps","Reps","e.g. 12"],["weight","Weight (kg)","e.g. 40"],["duration","Duration","e.g. 30 min"]].map(([k,lbl,ph])=>(
            <div key={k}><label className="label">{lbl}</label><input className="input" placeholder={ph} value={logForm[k]} onChange={e=>setLogForm(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
        </div>
        <div style={{marginBottom:14}}><label className="label">Notes (optional)</label><input className="input" placeholder="How did it feel? Any PRs?" value={logForm.notes} onChange={e=>setLogForm(p=>({...p,notes:e.target.value}))}/></div>
        {cycleInfo&&<div style={{background:cycleInfo.phase.bg,borderRadius:12,padding:"8px 12px",marginBottom:14,fontSize:12,fontWeight:600,color:cycleInfo.phase.textColor}}>{cycleInfo.phase.emoji} {cycleInfo.phase.label} phase: {cycleInfo.phase.workouts[0]}</div>}
        <div className="row" style={{gap:10}}><button className="btn btn-ghost" style={{flex:1}} onClick={()=>setLogModal(null)}>Cancel</button><button className="btn btn-primary" style={{flex:2}} onClick={logWorkout}>Save workout ✓</button></div>
      </div></div>}
    </div>
  );
}


// ─── AI Coach Panel (embedded in Workouts tab) ────────────────────────────────
function AICoachPanel({ measurements, goals, workoutPlan, cycleInfo, showToast }) {
  const [goalId, setGoalId] = useState(() => load("ai-goal", ""));
  const [activityId, setActivityId] = useState(() => load("ai-activity", ""));
  const [focusAreas, setFocusAreas] = useState(() => load("ai-focus", []));
  const [age, setAge] = useState(() => load("ai-age", ""));
  const [sex, setSex] = useState(() => load("ai-sex", "Female"));
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(() => load("ai-wpw", "4"));
  const [customNote, setCustomNote] = useState("");
  const [plan, setPlan] = useState(() => load("ai-plan", null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { save("ai-goal", goalId); }, [goalId]);
  useEffect(() => { save("ai-activity", activityId); }, [activityId]);
  useEffect(() => { save("ai-focus", focusAreas); }, [focusAreas]);
  useEffect(() => { save("ai-age", age); }, [age]);

  const toggleFocus = id => setFocusAreas(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const GOAL_CARDS = [
    {id:"lose-fat",emoji:"🔥",label:"Lose Fat",sub:"Caloric deficit + cardio focus"},
    {id:"build-muscle",emoji:"💪",label:"Build Muscle",sub:"Caloric surplus + progressive overload"},
    {id:"tone-define",emoji:"✨",label:"Tone & Define",sub:"Slight deficit + strength training"},
    {id:"endurance",emoji:"🏃",label:"Endurance",sub:"Cardio base + light resistance"},
    {id:"maintain",emoji:"🌸",label:"Maintain",sub:"Maintenance calories + balanced training"},
  ];
  const ACTIVITY_OPTIONS = [
    {id:"sedentary",emoji:"🪑",label:"Sedentary",sub:"Desk job, little exercise"},
    {id:"light",emoji:"🚶",label:"Light",sub:"1-3 days/week"},
    {id:"moderate",emoji:"🏃",label:"Moderate",sub:"3-5 days/week"},
    {id:"active",emoji:"⚡",label:"Active",sub:"6-7 days/week"},
    {id:"very-active",emoji:"🔥",label:"Very Active",sub:"Physical job or 2x/day"},
  ];
  const FOCUS_AREAS = [
    {id:"chest",emoji:"💪",label:"Chest"},{id:"back",emoji:"🦅",label:"Back"},
    {id:"legs",emoji:"🦵",label:"Legs"},{id:"arms",emoji:"💪",label:"Arms"},
    {id:"shoulders",emoji:"🏋️",label:"Shoulders"},{id:"core",emoji:"🔥",label:"Core"},
    {id:"cardio",emoji:"🏃",label:"Cardio"},{id:"glutes",emoji:"🍑",label:"Glutes"},
  ];

  const generate = async () => {
    if (!goalId || !activityId) { setError("Pick a goal and activity level to continue."); return; }
    setLoading(true); setPlan(null); setError("");
    const goalLabel = GOAL_CARDS.find(g => g.id === goalId)?.label || goalId;
    const actLabel = ACTIVITY_OPTIONS.find(a => a.id === activityId)?.label || activityId;
    const phaseCtx = cycleInfo ? `Currently in ${cycleInfo.phase.label} phase (Day ${cycleInfo.dayOfCycle}). ${cycleInfo.phase.tagline}.` : "";
    const ctx = [
      age && `Age: ${age}`,
      sex && `Sex: ${sex}`,
      measurements?.height && `Height: ${measurements.height}cm`,
      measurements?.weight && `Weight: ${measurements.weight}kg`,
      `Goal: ${goalLabel}`,
      `Activity: ${actLabel}`,
      workoutsPerWeek && `Workouts/week: ${workoutsPerWeek}`,
      focusAreas.length && `Focus: ${focusAreas.join(", ")}`,
      phaseCtx,
      customNote && `Extra context: ${customNote}`,
    ].filter(Boolean).join(". ");
    try {
      const result = await callAI("/api/ai-plan", `My profile: ${ctx}

Build me a personalised weekly workout structure and daily nutrition targets. Give practical food suggestions. End with what I will achieve and a motivating note.`);
      const cleaned = result.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
      setPlan(cleaned); save("ai-plan", cleaned);
      showToast("Your plan is ready! ✨");
    } catch(e) { setError("Could not generate plan. Make sure the backend is running."); }
    setLoading(false);
  };

  const clean = t => t.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/^#+\s*/gm,"").trim();

  const formatPlan = text => {
    if (!text) return null;
    const stripped = clean(text);

    // Split into major sections by ALL-CAPS headers
    const sectionColors = {
      "WEEKLY WORKOUT PLAN": C.lavender,
      "DAILY NUTRITION TARGETS": C.butter,
      "FOODS TO FOCUS ON": C.sage,
      "WHAT YOU WILL ACHIEVE": C.rose,
      "COACH": C.peach,
    };
    const defaultColors = [C.lavender, C.butter, C.sage, C.rose, C.peach, C.sky];

    const sections = stripped.split(/\n(?=[A-Z][A-Z\s']+:)/);

    return sections.map((section, i) => {
      const lines = section.split("\n").filter(l => l.trim());
      if (!lines.length) return null;
      const firstLine = lines[0];
      const isHeader = /^[A-Z][A-Z\s']+:/.test(firstLine);
      const headerKey = isHeader ? Object.keys(sectionColors).find(k => firstLine.toUpperCase().includes(k)) : null;
      const bg = headerKey ? sectionColors[headerKey] : defaultColors[i % defaultColors.length];
      const headerLabel = isHeader ? firstLine.replace(/:$/, "").trim() : null;
      const bodyLines = isHeader ? lines.slice(1) : lines;

      // Parse day blocks within workout plan section
      const isDayBlock = bodyLines.some(l => /^-?\s*Day\s+\d/i.test(l));

      return (
        <div key={i} style={{marginBottom:12}}>
          {headerLabel && (
            <div style={{fontSize:11,fontWeight:900,color:C.textMid,letterSpacing:"1px",marginBottom:8,paddingLeft:2}}>
              {headerLabel.toUpperCase()}
            </div>
          )}
          {isDayBlock ? (
            // Render each day as its own card
            bodyLines.reduce((acc, line) => {
              if (/^-?\s*Day\s+\d/i.test(line)) {
                acc.push({ title: line.replace(/^-\s*/, "").trim(), items: [] });
              } else if (acc.length > 0 && line.trim()) {
                acc[acc.length - 1].items.push(line.replace(/^\s*-\s*/, "").trim());
              }
              return acc;
            }, []).map((day, di) => (
              <div key={di} style={{background:bg,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:6}}>{day.title}</div>
                {day.items.map((item, ii) => (
                  <div key={ii} className="row" style={{gap:6,padding:"2px 0",alignItems:"flex-start"}}>
                    <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:2}}>·</span>
                    <span style={{fontSize:12.5,color:C.textMid,fontWeight:500,lineHeight:1.6}}>{item}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div style={{background:bg,borderRadius:14,padding:"12px 14px"}}>
              {bodyLines.map((line, li) => (
                <div key={li} className="row" style={{gap:6,padding:"2px 0",alignItems:"flex-start"}}>
                  {line.startsWith("-") && <span style={{color:C.lavenderDeep,fontWeight:900,flexShrink:0,marginTop:2}}>·</span>}
                  <span style={{fontSize:13,color:C.text,fontWeight:line.startsWith("-")?500:600,lineHeight:1.7}}>{line.replace(/^-\s*/,"")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div>
      {cycleInfo && (
        <div style={{marginBottom:14}}>
          <PhaseBadge cycleInfo={cycleInfo} compact/>
          <div style={{marginTop:10,background:cycleInfo.phase.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${cycleInfo.phase.color}`}}>
            <div style={{fontWeight:800,fontSize:12,color:cycleInfo.phase.textColor,marginBottom:6}}>
              How this phase affects your plan
            </div>
            <div style={{fontSize:12,color:cycleInfo.phase.textColor,fontWeight:500,lineHeight:1.6,opacity:.9}}>
              {cycleInfo.phase.body}
            </div>
            <div style={{marginTop:8,fontSize:11,fontWeight:700,color:cycleInfo.phase.textColor,opacity:.8}}>
              Best workouts right now: {cycleInfo.phase.workouts.slice(0,2).join(", ")}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Your goal</div>
        {GOAL_CARDS.map(g => { const sel = goalId === g.id; return (
          <button key={g.id} onClick={() => setGoalId(g.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:sel?C.lavender:C.bgDeep,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:14,padding:"11px 14px",marginBottom:7,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
            <span style={{fontSize:20}}>{g.emoji}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:sel?"#5040A0":C.text}}>{g.label}</div><div style={{fontSize:11,color:C.textSoft,fontWeight:500}}>{g.sub}</div></div>
            <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
          </button>
        );})}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Activity level</div>
        {ACTIVITY_OPTIONS.map(a => { const sel = activityId === a.id; return (
          <button key={a.id} onClick={() => setActivityId(a.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:sel?C.lavender:C.bgDeep,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:12,padding:"10px 12px",marginBottom:6,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
            <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
            <span style={{fontSize:16}}>{a.emoji}</span>
            <div><span style={{fontWeight:800,fontSize:13,color:sel?"#5040A0":C.text}}>{a.label}</span><span style={{fontSize:11,color:C.textSoft}}> · {a.sub}</span></div>
          </button>
        );})}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Stats</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label className="label">Age</label><input className="input" type="number" placeholder="e.g. 26" value={age} onChange={e=>setAge(e.target.value)}/></div>
          <div><label className="label">Workouts/week</label><input className="input" type="number" min="1" max="7" placeholder="4" value={workoutsPerWeek} onChange={e=>setWorkoutsPerWeek(e.target.value)}/></div>
        </div>
        <div><label className="label">Sex</label><select className="input" value={sex} onChange={e=>setSex(e.target.value)}><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
        <div style={{fontSize:11,color:C.textSoft,marginTop:6,fontWeight:600}}>Height and weight pull from your Body tab automatically.</div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Focus areas <span style={{fontWeight:500,color:C.textSoft,fontSize:12}}>(optional)</span></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {FOCUS_AREAS.map(f => { const on = focusAreas.includes(f.id); return (
            <button key={f.id} onClick={() => toggleFocus(f.id)} className={`chip${on?" on":""}`} style={on?{background:C.lavenderDeep,borderColor:"transparent",color:"#5040A0"}:{}}>{f.emoji} {f.label}</button>
          );})}
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Anything else? <span style={{fontWeight:500,color:C.textSoft,fontSize:12}}>(optional)</span></div>
        <textarea className="input" rows={3} placeholder="e.g. I have a bad knee, I prefer home workouts, I don't eat meat..." value={customNote} onChange={e=>setCustomNote(e.target.value)} style={{resize:"none",lineHeight:1.6}}/>
      </div>

      {error && <div style={{fontSize:13,color:"#C05070",fontWeight:700,marginBottom:12,padding:"10px 14px",background:C.rose,borderRadius:12}}>{error}</div>}
      <button className="btn btn-primary" style={{width:"100%",fontSize:15,padding:"14px",marginBottom:16}} onClick={generate} disabled={loading}>
        {loading ? <><div className="spin"/>Crafting your plan...</> : "✨ Generate my plan"}
      </button>

      {plan && (
        <div style={{marginBottom:16}}>
          {formatPlan(plan)}
          <div style={{fontSize:11,color:C.textSoft,textAlign:"center",marginTop:8,lineHeight:1.6}}>Suggestions only. Adjust based on how you feel your body knows best.</div>
          <button className="btn btn-ghost" style={{width:"100%",marginTop:10}} onClick={()=>{setPlan(null);save("ai-plan",null);}}>Clear and start over</button>
        </div>
      )}
    </div>
  );
}


// ─── AI COACH ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const GOAL_CARDS=[{id:"lose-fat",emoji:"🔥",label:"Lose Fat",sub:"Caloric deficit + cardio focus"},{id:"build-muscle",emoji:"💪",label:"Build Muscle",sub:"Caloric surplus + progressive overload"},{id:"tone-define",emoji:"✨",label:"Tone & Define",sub:"Slight deficit + strength training"},{id:"endurance",emoji:"🏃",label:"Endurance",sub:"Cardio base + light resistance"},{id:"maintain",emoji:"🌸",label:"Maintain",sub:"Maintenance calories + balanced training"}];
const ACTIVITY_OPTIONS=[{id:"sedentary",emoji:"🪑",label:"Sedentary",sub:"Desk job, little exercise"},{id:"light",emoji:"🚶",label:"Light",sub:"1-3 days/week exercise"},{id:"moderate",emoji:"🏃",label:"Moderate",sub:"3-5 days/week exercise"},{id:"active",emoji:"⚡",label:"Active",sub:"6-7 days/week exercise"},{id:"very-active",emoji:"🔥",label:"Very Active",sub:"Physical job or 2x/day training"}];
const FOCUS_AREAS=[{id:"chest",emoji:"💪",label:"Chest"},{id:"back",emoji:"🦅",label:"Back"},{id:"legs",emoji:"🦵",label:"Legs"},{id:"arms",emoji:"💪",label:"Arms"},{id:"shoulders",emoji:"🏋️",label:"Shoulders"},{id:"core",emoji:"🔥",label:"Core"},{id:"cardio",emoji:"🏃",label:"Cardio"},{id:"glutes",emoji:"🍑",label:"Glutes"}];

function AIPage({ measurements, goals, workoutPlan, cycleInfo, showToast }) {
  const [goalId,setGoalId]=useState(()=>load("ai-goal",""));
  const [activityId,setActivityId]=useState(()=>load("ai-activity",""));
  const [focusAreas,setFocusAreas]=useState(()=>load("ai-focus",[]));
  const [age,setAge]=useState(()=>load("ai-age",""));
  const [sex,setSex]=useState(()=>load("ai-sex","Female"));
  const [workoutsPerWeek,setWorkoutsPerWeek]=useState(()=>load("ai-wpw","4"));
  const [customNote,setCustomNote]=useState("");
  const [plan,setPlan]=useState(()=>load("ai-plan",null));
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{save("ai-goal",goalId);},[goalId]);
  useEffect(()=>{save("ai-activity",activityId);},[activityId]);
  useEffect(()=>{save("ai-focus",focusAreas);},[focusAreas]);
  useEffect(()=>{save("ai-age",age);},[age]);
  useEffect(()=>{save("ai-sex",sex);},[sex]);
  useEffect(()=>{save("ai-wpw",workoutsPerWeek);},[workoutsPerWeek]);

  const toggleFocus=id=>setFocusAreas(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);

  const generate=async()=>{
    if(!goalId||!activityId){setError("Pick a goal and activity level to continue.");return;}
    setLoading(true);setPlan(null);setError("");
    const goalLabel=GOAL_CARDS.find(g=>g.id===goalId)?.label||goalId;
    const actLabel=ACTIVITY_OPTIONS.find(a=>a.id===activityId)?.label||activityId;
    const focusLabel=focusAreas.length?focusAreas.join(", "):"general";
    const phaseCtx=cycleInfo?`Currently in ${cycleInfo.phase.label} phase of cycle (Day ${cycleInfo.dayOfCycle}). ${cycleInfo.phase.tagline}.`:"";
    const ctx=[age&&`Age: ${age}`,sex&&`Sex: ${sex}`,measurements.height&&`Height: ${measurements.height}cm`,measurements.weight&&`Weight: ${measurements.weight}kg`,`Goal: ${goalLabel}`,`Activity: ${actLabel}`,workoutsPerWeek&&`Workouts per week: ${workoutsPerWeek} days`,focusAreas.length&&`Focus areas: ${focusLabel}`,phaseCtx&&phaseCtx,customNote&&`Extra context: ${customNote}`].filter(Boolean).join(". ");
    try{
      const result=await callAI("/api/ai-plan",`My profile: ${ctx}\n\nBuild me a personalised weekly workout structure and daily nutrition targets to reach my goal. Give me practical food suggestions (not a strict diet plan). End with a short motivating note.`);
      setPlan(result);save("ai-plan",result);showToast("Your plan is ready! ✨");
    }catch(e){setError("Could not generate plan. Make sure the backend server is running.");}
    setLoading(false);
  };

  const stripMd=t=>t.replace(/\*\*(.*?)\*\*/g,"$1").replace(/\*(.*?)\*/g,"$1").replace(/^#+\s/gm,"").trim();
  const formatPlan=text=>{
    if(!text)return null;
    const colors=[C.lavender,C.butter,C.sage,C.rose];
    return text.split(/\n(?=[A-Z']+[\w\s']*:)/).map((s,i)=>{
      const lines=s.split("\n"),head=lines[0],body=lines.slice(1).join("\n").trim();
      const isHeader=/^[A-Z']+[\w\s']*:/.test(head);
      return <div key={i} style={{background:colors[i%colors.length],borderRadius:18,padding:"14px 16px",marginBottom:10}}>
        {isHeader&&<div style={{fontSize:11,fontWeight:900,color:C.textMid,letterSpacing:".5px",marginBottom:8}}>{head.replace(/:$/,"").toUpperCase()}</div>}
        <div style={{fontSize:13.5,lineHeight:1.7,color:C.text,fontWeight:500,whiteSpace:"pre-wrap"}}>{isHeader?stripMd(body):stripMd(s)}</div>
      </div>;
    });
  };

  return (
    <div className="scroll" style={{padding:"0 0 90px"}}>
      <div style={{padding:"52px 20px 16px",background:`linear-gradient(160deg,${C.lavender} 0%,${C.bg} 100%)`}}>
        <div style={{fontSize:11,fontWeight:800,color:"#9070D0",letterSpacing:".5px",marginBottom:4}}>✨ AI COACH</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1.2}}>Tell me your goals and get a personalised plan</div>
      </div>
      <div style={{padding:"0 16px"}}>
        <div style={{marginBottom:22}}>
          {GOAL_CARDS.map(g=>{const sel=goalId===g.id;return(
            <button key={g.id} onClick={()=>setGoalId(g.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,background:sel?C.lavender:C.card,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:16,padding:"14px 16px",marginBottom:8,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
              <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:sel?C.lavenderDeep:C.bgDeep,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{g.emoji}</div>
              <div><div style={{fontWeight:800,fontSize:15,color:sel?"#5040A0":C.text}}>{g.label}</div><div style={{fontSize:12,color:sel?"#7060B0":C.textSoft,fontWeight:500,marginTop:1}}>{g.sub}</div></div>
              <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
            </button>
          );})}
        </div>

        <div style={{marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textMid,letterSpacing:".5px",marginBottom:12}}>YOUR STATS 📊</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label className="label">🎂 Age (years)</label><input className="input" type="number" placeholder="e.g. 26" value={age} onChange={e=>setAge(e.target.value)}/></div>
            <div><label className="label">📅 Workouts/week</label><input className="input" type="number" min="1" max="7" placeholder="4" value={workoutsPerWeek} onChange={e=>setWorkoutsPerWeek(e.target.value)}/></div>
            <div><label className="label">📏 Height (cm)</label><input className="input" type="number" value={measurements.height||""} readOnly style={{opacity:.7}} placeholder="from Body tab"/></div>
            <div><label className="label">⚖️ Weight (kg)</label><input className="input" type="number" value={measurements.weight||""} readOnly style={{opacity:.7}} placeholder="from Body tab"/></div>
          </div>
          <div><label className="label">👤 Sex</label><select className="input" value={sex} onChange={e=>setSex(e.target.value)}><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
          <div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginTop:6}}>Height and weight pull from your Body tab. Update them there if needed.</div>
        </div>

        <div style={{marginBottom:22,marginTop:20}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textMid,letterSpacing:".5px",marginBottom:12}}>ACTIVITY LEVEL 🏃</div>
          {ACTIVITY_OPTIONS.map(a=>{const sel=activityId===a.id;return(
            <button key={a.id} onClick={()=>setActivityId(a.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:sel?C.lavender:C.card,border:`1.5px solid ${sel?C.lavenderDeep:C.border}`,borderRadius:14,padding:"12px 14px",marginBottom:7,cursor:"pointer",textAlign:"left",fontFamily:"Nunito",transition:"all .15s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${sel?"#7050B0":C.border}`,background:sel?"#7050B0":"transparent",flexShrink:0}}/>
              <span style={{fontSize:18}}>{a.emoji}</span>
              <div><span style={{fontWeight:800,fontSize:14,color:sel?"#5040A0":C.text}}>{a.label} </span><span style={{fontSize:12,color:C.textSoft,fontWeight:500}}>— {a.sub}</span></div>
            </button>
          );})}
        </div>

        <div style={{marginBottom:22}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textMid,letterSpacing:".5px",marginBottom:4}}>FOCUS AREAS <span style={{fontWeight:500,color:C.textSoft}}>(optional)</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
            {FOCUS_AREAS.map(f=>{const on=focusAreas.includes(f.id);return(<button key={f.id} onClick={()=>toggleFocus(f.id)} className={`chip${on?" on":""}`} style={on?{background:C.lavenderDeep,borderColor:"transparent",color:"#5040A0"}:{}}>{f.emoji} {f.label}</button>);})}
          </div>
        </div>

        <div style={{marginBottom:22}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textMid,letterSpacing:".5px",marginBottom:8}}>ANYTHING ELSE? <span style={{fontWeight:500,color:C.textSoft}}>(optional)</span></div>
          <textarea className="input" rows={3} placeholder="e.g. I have a bad knee so no high-impact jumping. I prefer home workouts. I don't eat meat..." value={customNote} onChange={e=>setCustomNote(e.target.value)} style={{resize:"none",lineHeight:1.6}}/>
        </div>

        {cycleInfo&&<div style={{marginBottom:14}}><PhaseBadge cycleInfo={cycleInfo} compact/><div style={{fontSize:11,color:C.textSoft,fontWeight:600,marginTop:6}}>Your plan will be tailored to your {cycleInfo.phase.label.toLowerCase()} phase ✨</div></div>}
        <div style={{background:C.sage,borderRadius:12,padding:"8px 14px",marginBottom:12,fontSize:12,fontWeight:700,color:ACCENT.fiber.text}}>✓ AI ready. Make sure the backend server is running.</div>
        {error&&<div style={{fontSize:13,color:"#C05070",fontWeight:700,marginBottom:12,padding:"10px 14px",background:C.rose,borderRadius:12}}>{error}</div>}
        <button className="btn btn-primary" style={{width:"100%",fontSize:16,padding:"16px",marginBottom:24}} onClick={generate} disabled={loading}>
          {loading?<><div className="spin"/>Crafting your plan...</>:"✨ Generate my plan!"}
        </button>

        {plan&&<div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:800,color:C.textMid,letterSpacing:".5px",marginBottom:12}}>YOUR PLAN ✨</div>
          {formatPlan(plan)}
          <div style={{fontSize:11,color:C.textSoft,fontWeight:600,textAlign:"center",marginTop:10,lineHeight:1.6}}>Suggestions only, not medical or dietary advice. Talk to a professional for personalised health guidance.</div>
          <button className="btn btn-ghost" style={{width:"100%",marginTop:12}} onClick={()=>{setPlan(null);save("ai-plan",null);}}>Clear and start over</button>
        </div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── SETTINGS ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ userName, setUserName, showToast }) {
  const [localName, setLocalName] = useState(userName || "");

  return (
    <div className="scroll" style={{padding:"52px 16px 90px"}}>
      <div style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:4}}>Profile</div>
      <div style={{fontSize:13,color:C.textSoft,fontWeight:500,marginBottom:20}}>Your details and about Formly</div>

      {/* Name */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">Your name</div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <label className="label">Display name</label>
            <input className="input" placeholder="e.g. Sofia" value={localName} onChange={e=>setLocalName(e.target.value)}/>
          </div>
          <button className="btn btn-primary btn-sm" style={{flexShrink:0,marginBottom:1}} onClick={()=>{setUserName(localName);save("user-name",localName);showToast("Name saved ✓");}}>Save</button>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{marginBottom:14,background:`linear-gradient(135deg,${C.lavender},${C.rose})`,border:"none"}}>
        <div style={{fontSize:18,fontWeight:900,color:C.text,marginBottom:8}}>🌸 About Formly</div>
        <div style={{fontSize:13,color:C.textMid,fontWeight:500,lineHeight:1.8}}>
          Formly is a fitness app built around how women's bodies actually work not a one-size-fits-all tracker.
        </div>
      </div>

      {/* What it does */}
      <div className="card" style={{marginBottom:14}}>
        <div className="sec-title">What Formly does</div>
        {[
          {emoji:"🌙",title:"Cycle-aware fitness",desc:"Tracks your menstrual cycle and uses it to contextualise your energy, mood, weight fluctuations, and workout capacity. Because 1-3kg of water retention in luteal phase is not failure it's just physiology."},
          {emoji:"🥗",title:"Nutrition guidance",desc:"Log meals by name and let AI estimate the macros. Get personalised macro suggestions based on your goals, height, weight, and age framed as starting points to experiment from, not rules."},
          {emoji:"🏋️",title:"Workout planning",desc:"Browse workouts, build a weekly schedule, and get an AI-generated plan tailored to your goal and current cycle phase. Log your sets, reps, and weights to track progress over time."},
          {emoji:"📏",title:"Body tracking",desc:"Track measurements over time and see trends. Weight naturally fluctuates throughout the month Formly helps you understand why rather than reacting to every number."},
          {emoji:"✨",title:"AI Coach",desc:"Generates personalised workout and nutrition plans that account for your cycle phase, fitness goal, activity level, and any personal context you share like injuries or preferences."},
        ].map(f=>(
          <div key={f.title} className="row" style={{padding:"12px 0",borderTop:`1px solid ${C.border}`,alignItems:"flex-start",gap:12}}>
            <span style={{fontSize:22,flexShrink:0}}>{f.emoji}</span>
            <div>
              <div style={{fontWeight:800,fontSize:14,marginBottom:3}}>{f.title}</div>
              <div style={{fontSize:12,color:C.textSoft,fontWeight:500,lineHeight:1.6}}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Philosophy */}
      <div className="card" style={{marginBottom:14,background:C.sage,border:"none"}}>
        <div style={{fontSize:13,fontWeight:700,color:ACCENT.fiber.text,marginBottom:6}}>Our approach</div>
        <div style={{fontSize:13,color:"#2A5A28",fontWeight:500,lineHeight:1.7}}>
          Formly is not about being smaller. It's about understanding your body, working with your cycle, hitting your goals, and feeling capable not guilty. Numbers are context, not verdicts.
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="sec-title">Data and privacy</div>
        <div style={{fontSize:13,color:C.textSoft,fontWeight:500,lineHeight:1.6,marginBottom:14}}>Everything is stored locally in your browser. Nothing leaves your device except prompts sent to the AI backend when you use AI features.</div>
        <button className="btn btn-ghost btn-sm" style={{color:"#C05070",borderColor:C.roseDeep}} onClick={()=>{if(window.confirm("Clear all app data? This cannot be undone.")){localStorage.clear();window.location.reload();}}}>Clear all data</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const TABS=[{id:"home",icon:"🏠",label:"Home"},{id:"nutrition",icon:"🥗",label:"Nutrition"},{id:"body",icon:"🌸",label:"Body"},{id:"workouts",icon:"🏋️",label:"Workouts"},{id:"settings",icon:"👤",label:"Profile"}];

export default function App() {
  const [tab,setTab]=useState("home");
  const [onboarded,setOnboarded]=useState(()=>load("onboarded",false));
  const [userName,setUserName]=useState(()=>load("user-name",""));
  const todayKey=new Date().toISOString().slice(0,10);
  const [nutrition,setNutrition]=useState(()=>load("nutrition-"+new Date().toISOString().slice(0,10),{protein:0,carbs:0,fats:0,sugar:0,fiber:0}));
  const [goals,setGoals]=useState(()=>load("goals",{protein:150,carbs:200,fats:65,sugar:30,fiber:25,calories:2000}));
  const [measurements,setMeasurements]=useState(()=>load("measurements",{}));
  const [workoutPlan,setWorkoutPlan]=useState(()=>load("workout-plan",[]));
  const [schedule,setSchedule]=useState(()=>load("schedule",{}));
  const [workoutLog,setWorkoutLog]=useState(()=>load("workout-log",[]));
  const [weightHistory,setWeightHistory]=useState(()=>load("weight-history",[]));
  const [periodStart,setPeriodStart]=useState(()=>load("period-start",""));
  const [periodHistory,setPeriodHistory]=useState(()=>load("period-history",[]));
  const [cycleLength,setCycleLength]=useState(()=>load("cycle-length",28));
  const [toast,showToast]=useToast();

  const cycleInfo=getCycleInfo(periodStart,cycleLength);

  useEffect(()=>{save("onboarded",onboarded);},[onboarded]);
  useEffect(()=>{save("user-name",userName);},[userName]);
  useEffect(()=>{save("nutrition-"+todayKey,nutrition);},[nutrition,todayKey]);
  useEffect(()=>{save("goals",goals);},[goals]);
  useEffect(()=>{save("measurements",measurements);},[measurements]);
  useEffect(()=>{save("workout-plan",workoutPlan);},[workoutPlan]);
  useEffect(()=>{save("schedule",schedule);},[schedule]);
  useEffect(()=>{save("workout-log",workoutLog);},[workoutLog]);
  useEffect(()=>{save("weight-history",weightHistory);},[weightHistory]);
  useEffect(()=>{save("period-start",periodStart);},[periodStart]);
  useEffect(()=>{save("period-history",periodHistory);},[periodHistory]);
  useEffect(()=>{save("cycle-length",cycleLength);},[cycleLength]);

  const finishOnboard=(name,pStart,cLen)=>{
    if(name){setUserName(name);save("user-name",name);}
    if(pStart){setPeriodStart(pStart);save("period-start",pStart);}
    if(cLen){setCycleLength(cLen);save("cycle-length",cLen);}
    setOnboarded(true);
  };

  if(!onboarded) return <><style>{CSS}</style><div className="shell"><OnboardingFlow onDone={finishOnboard}/></div></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {toast&&<div className="toast">{toast}</div>}
        {tab==="home"&&<Dashboard nutrition={nutrition} goals={goals} measurements={measurements} workoutPlan={workoutPlan} schedule={schedule} weightHistory={weightHistory} cycleInfo={cycleInfo} workoutLog={workoutLog} userName={userName}/>}
        {tab==="nutrition"&&<NutritionPage cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="body"&&<BodyPage measurements={measurements} setMeasurements={setMeasurements} weightHistory={weightHistory} setWeightHistory={setWeightHistory} cycleInfo={cycleInfo} periodStart={periodStart} setPeriodStart={setPeriodStart} periodHistory={periodHistory} setPeriodHistory={setPeriodHistory} cycleLength={cycleLength} setCycleLength={setCycleLength} showToast={showToast}/>}
        {tab==="workouts"&&<WorkoutsPage workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan} schedule={schedule} setSchedule={setSchedule} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} aiPlan={load("ai-plan",null)} measurements={measurements} goals={goals} cycleInfo={cycleInfo} showToast={showToast}/>}
        {tab==="settings"&&<SettingsPage userName={userName} setUserName={setUserName} showToast={showToast}/>}
        <nav className="bottom-nav">
          {TABS.map(t=>(
            <div key={t.id} className="nav-tab" onClick={()=>setTab(t.id)}>
              <div className={`nav-icon-wrap${tab===t.id?" active":""}`}>{t.icon}</div>
              <span className={`nav-label${tab===t.id?" active":""}`}>{t.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}