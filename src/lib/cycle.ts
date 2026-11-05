import type { CycleInfo, PeriodEntry, Phase, PhaseId } from "../types";
import { localDateKey } from "./date";

// ─── Cycle engine ─────────────────────────────────────────────────────────────
export const PHASES: Record<PhaseId, Phase> = {
  menstrual:{id:"menstrual",label:"Menstrual",emoji:"🌙",days:"Days 1-5",color:"#F4BBC6",bg:"#FDF1F3",textColor:"#A33D5A",tagline:"Rest, restore, be gentle with yourself",body:"Oestrogen and progesterone are at their lowest. Energy dips, cramps may appear, and inflammation can rise. Your body is doing real work right now. Honour it.",workouts:["Gentle yoga or stretching","Short walks","Light pilates","Rest days are productive days"],foods:["Iron-rich foods: lentils, spinach, red meat","Anti-inflammatory options: ginger, turmeric, berries","Dark chocolate (magnesium!)","Warm cooked foods: soups, stews"],avoid:["High-intensity cardio when you're cramping","Excess caffeine (can worsen cramps)","Salty processed foods (increases bloating)"],weight:"Weight may be at its lowest as bloating eases. Any remaining water retention is normal and will pass.",energy:"Low, rising by day 4-5. Follow your body's lead.",moodNote:"You may feel inward and reflective. That's your nervous system asking for stillness."},
  follicular:{id:"follicular",label:"Follicular",emoji:"🌱",days:"Days 6-13",color:"#C2E2CB",bg:"#F3FAF5",textColor:"#336B43",tagline:"Energy rising. A great time to start new things.",body:"Oestrogen climbs steadily. Your brain feels sharper, motivation builds, and your body recovers faster from workouts. This is your window for new challenges.",workouts:["Higher intensity strength training","Try a new class or routine","Running, cycling, HIIT","Progressive overload this week"],foods:["Complex carbs for fuel: oats, sweet potato, quinoa","Lean protein to support muscle building","Fermented foods: yoghurt, kefir","Plenty of vegetables"],avoid:[],weight:"Weight often stabilises or trends lower as oestrogen rises and water retention drops.",energy:"Rising steadily. Many women feel their best in this phase.",moodNote:"More social, motivated, and optimistic. Great time to schedule things you've been putting off."},
  ovulation:{id:"ovulation",label:"Ovulation",emoji:"☀️",days:"Days 14-16",color:"#F5DE9C",bg:"#FFFAEE",textColor:"#7E5C10",tagline:"Peak energy. Your strongest window of the cycle.",body:"Oestrogen peaks and testosterone surges briefly. Strength, coordination, and pain tolerance are at their highest. You may feel your most confident and social.",workouts:["Heavy lifting: great time for personal bests","High-intensity intervals","Competitive sports","Dance, Zumba, anything fun and energetic"],foods:["Antioxidant-rich foods: berries, leafy greens","Zinc: pumpkin seeds, chickpeas","Light fresh foods: salads, smoothies","Stay well hydrated"],avoid:["Overdoing it (ligament laxity is slightly higher during ovulation)"],weight:"You may notice a very slight temporary rise mid-cycle. This is a normal fluid shift, not fat gain.",energy:"Peak. This is your superpower window.",moodNote:"Outgoing, confident, articulate. Great for presentations, social plans, hard conversations."},
  luteal:{id:"luteal",label:"Luteal",emoji:"🍂",days:"Days 17-28",color:"#DDD3F1",bg:"#F8F5FC",textColor:"#5E4592",tagline:"Slow down. Your body is working hard right now.",body:"Progesterone rises and your body runs hotter, uses more energy at rest, and is more sensitive to blood sugar. This is why cravings, bloating, and fatigue happen. Not weakness. Just physiology.",workouts:["Moderate strength training: maintain, don't push for PRs","Pilates, barre, yoga","Swimming","Walking (especially helpful for mood)","Ease off intensity in the last few days"],foods:["Magnesium: dark chocolate, pumpkin seeds, almonds","B6: chickpeas, salmon, bananas","Complex carbs: don't restrict them, your body needs them right now","Calcium-rich foods (can reduce PMS severity)"],avoid:["High sodium (worsens water retention and bloating)","Refined sugar and alcohol (can amplify mood swings)","Excess caffeine (can increase anxiety and breast tenderness)"],weight:"Weight typically rises 1-3 kg due to water retention from progesterone. This is not fat gain. It will pass at the start of your next period.",energy:"Gradually declining. Honour slower days. Your basal metabolic rate is actually higher during this phase.",moodNote:"More sensitive, inward, easily overwhelmed. Reduce your schedule where you can. Rest is not laziness."},
};

const DAY_MS = 1000*60*60*24;

/** Supported cycle lengths (days); values outside this range are clamped. */
export const MIN_CYCLE_LENGTH = 21;
export const MAX_CYCLE_LENGTH = 40;
/** Days past the expected start that count as "late" before Formly assumes a period just wasn't logged. */
export const LATE_GRACE_DAYS = 10;

/** Supported period lengths (bleeding days). */
export const MIN_PERIOD_LENGTH = 2;
export const MAX_PERIOD_LENGTH = 10;

export function clampCycleLength(value: number): number {
  if (!Number.isFinite(value)) return 28;
  return Math.min(MAX_CYCLE_LENGTH, Math.max(MIN_CYCLE_LENGTH, Math.round(value)));
}

export function clampPeriodLength(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(MAX_PERIOD_LENGTH, Math.max(MIN_PERIOD_LENGTH, Math.round(value)));
}

/**
 * Phase for a 1-based cycle day. The luteal phase is fairly constant at ~14 days, so
 * ovulation sits ~14 days before the next period: days L-14..L-12 (14-16 in a 28-day cycle).
 * The period itself lasts `periodLength` days; the follicular phase fills the gap.
 */
export function phaseOfDay(day: number, cycleLength=28, periodLength=5): PhaseId {
  const ovulation=clampCycleLength(cycleLength)-14;
  return day<=clampPeriodLength(periodLength)?"menstrual":day<ovulation?"follicular":day<=ovulation+2?"ovulation":"luteal";
}

/** Phase boundaries as [start, end) day offsets (0-based), e.g. for drawing the phase wheel. */
export function phaseRanges(cycleLength=28, periodLength=5): {id:PhaseId;start:number;end:number}[] {
  const L=clampCycleLength(cycleLength), ov=L-14, P=Math.min(clampPeriodLength(periodLength),ov-1);
  return [{id:"menstrual",start:0,end:P},{id:"follicular",start:P,end:Math.max(P,ov-1)},{id:"ovulation",start:ov-1,end:ov+2},{id:"luteal",start:ov+2,end:L}];
}

const toDate=(key: string)=>new Date(key+"T12:00:00");
const daysBetween=(a: Date, b: Date)=>Math.round((b.getTime()-a.getTime())/DAY_MS);

/**
 * Works out where `today` falls in the cycle that started on `periodStart` (YYYY-MM-DD).
 * Returns null when there is no start date, or when it is in the future or more than
 * two cycle lengths ago. Up to LATE_GRACE_DAYS past the expected start it reports the
 * period as late (still luteal, countdown 0); after that it assumes a period was missed
 * in the log and continues in the next cycle.
 */
export function getCycleInfo(periodStart: string, rawCycleLength=28, rawPeriodLength=5): CycleInfo | null {
  if (!periodStart) return null;
  // Guards against out-of-range values saved by older versions of the input.
  const cycleLength=clampCycleLength(rawCycleLength), periodLength=clampPeriodLength(rawPeriodLength);
  const start=toDate(periodStart), today=new Date();
  // Corrupted or hand-edited storage shouldn't crash the app: treat it as "not set".
  if (Number.isNaN(start.getTime())) return null;
  today.setHours(12,0,0,0);
  const dayOfCycle=Math.floor((today.getTime()-start.getTime())/DAY_MS)+1;
  if (dayOfCycle<1||dayOfCycle>cycleLength*2) return null;
  if (dayOfCycle>cycleLength&&dayOfCycle<=cycleLength+LATE_GRACE_DAYS) {
    const expected=new Date(start);
    expected.setDate(start.getDate()+cycleLength);
    return {phase:PHASES.luteal,dayOfCycle,cycleLength,periodLength,daysUntilNext:0,nextPeriodDate:localDateKey(expected),daysLate:dayOfCycle-cycleLength};
  }
  const d=((dayOfCycle-1)%cycleLength)+1;
  // Count from the start of the current cycle (the displayed day wraps after cycleLength
  // days), so the countdown keeps working in the second cycle instead of going negative.
  const cycleIndex=Math.floor((dayOfCycle-1)/cycleLength);
  const nextPeriod=new Date(start);
  nextPeriod.setDate(start.getDate()+(cycleIndex+1)*cycleLength);
  const daysUntilNext=Math.ceil((nextPeriod.getTime()-today.getTime())/DAY_MS);
  return {phase:PHASES[phaseOfDay(d,cycleLength,periodLength)],dayOfCycle:d,cycleLength,periodLength,daysUntilNext,nextPeriodDate:localDateKey(nextPeriod),daysLate:0};
}

/** All logged period starts (history plus the current start), unique, oldest first. */
export function periodStarts(history: PeriodEntry[], periodStart: string): string[] {
  const all=new Set(history.map(p=>p.date));
  if (periodStart) all.add(periodStart);
  return [...all].filter(d=>!Number.isNaN(toDate(d).getTime())).sort();
}

export interface CycleStats {
  /** Cycle length to predict with. */
  length: number;
  /** Typical +/- days around a prediction. */
  spread: number;
  /** How many complete logged cycles the length is based on (0 = the user's setting). */
  cyclesLogged: number;
}

/**
 * Learns cycle length from the gaps between logged period starts (the last 6 plausible
 * cycles). Gaps longer than 50 days are skipped as probably-unlogged periods. With fewer
 * than one complete cycle it falls back to the user's setting.
 */
export function cycleStats(starts: string[], settingLength=28): CycleStats {
  const gaps: number[]=[];
  for (let i=1;i<starts.length;i++) {
    const gap=daysBetween(toDate(starts[i-1]),toDate(starts[i]));
    if (gap>=MIN_CYCLE_LENGTH-3&&gap<=50) gaps.push(gap);
  }
  const recent=gaps.slice(-6);
  if (!recent.length) return {length:clampCycleLength(settingLength),spread:3,cyclesLogged:0};
  const mean=recent.reduce((a,b)=>a+b,0)/recent.length;
  const sd=Math.sqrt(recent.reduce((a,b)=>a+(b-mean)**2,0)/recent.length);
  const spread=recent.length<2?3:Math.min(7,Math.max(1,Math.round(sd)));
  return {length:clampCycleLength(mean),spread,cyclesLogged:recent.length};
}

/**
 * Typical period length: the average of the last 6 logged periods that have an end day
 * (plausible ones only), else the user's setting.
 */
export function periodLengthFrom(history: PeriodEntry[], setting=5): {length:number;logged:number} {
  const lengths=history
    .filter(p=>p.end&&p.end>=p.date)
    .sort((a,b)=>a.date.localeCompare(b.date))
    .map(p=>daysBetween(toDate(p.date),toDate(p.end as string))+1)
    .filter(n=>n>=1&&n<=14)
    .slice(-6);
  if (!lengths.length) return {length:clampPeriodLength(setting),logged:0};
  return {length:clampPeriodLength(lengths.reduce((a,b)=>a+b,0)/lengths.length),logged:lengths.length};
}

/** The logged period whose start is the latest one on or before `date`, if any. */
export function periodContaining(history: PeriodEntry[], date: string): PeriodEntry | undefined {
  return [...history].filter(p=>p.date<=date).sort((a,b)=>b.date.localeCompare(a.date))[0];
}

export interface CycleDay {
  phase: PhaseId;
  /** 1-based day within its cycle. */
  dayOfCycle: number;
  /** A bleeding day of a logged period (its logged end, else the typical length). */
  loggedPeriod: boolean;
  /** A bleeding day of a predicted (future) period. */
  predictedPeriod: boolean;
  /** True when the day is after today, so phase is a forecast. */
  future: boolean;
}

/**
 * Cycle details for any date, for the monthly cycle calendar. Past cycles use the real
 * gaps between logged starts; after the latest start, cycles are projected with `length`.
 * Returns null before the first logged period.
 */
export function cycleDayOn(date: string, starts: string[], length: number, periodLength=5, ends: Record<string,string>={}): CycleDay | null {
  const day=toDate(date);
  let idx=-1;
  for (let i=0;i<starts.length;i++) if (starts[i]<=date) idx=i;
  if (idx<0) return null;
  const today=new Date(); today.setHours(12,0,0,0);
  const future=day.getTime()>today.getTime();
  const sinceStart=daysBetween(toDate(starts[idx]),day);
  // This logged period's own length when its end was logged, else the typical length.
  const end=ends[starts[idx]];
  const bleed=end?daysBetween(toDate(starts[idx]),toDate(end))+1:periodLength;
  const next=starts[idx+1];
  if (next) {
    const len=daysBetween(toDate(starts[idx]),toDate(next));
    const d=sinceStart+1;
    return {phase:phaseOfDay(d,len,bleed),dayOfCycle:d,loggedPeriod:d<=bleed,predictedPeriod:false,future};
  }
  const d=(sinceStart%length)+1, cycleIndex=Math.floor(sinceStart/length);
  const projected=cycleIndex>0;
  const thisBleed=projected?periodLength:bleed;
  return {phase:phaseOfDay(d,length,thisBleed),dayOfCycle:d,loggedPeriod:!projected&&d<=bleed,predictedPeriod:projected&&d<=periodLength&&future,future};
}
