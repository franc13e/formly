import type { CycleInfo, Phase, PhaseId } from "../types";

// ─── Cycle engine ─────────────────────────────────────────────────────────────
export const PHASES: Record<PhaseId, Phase> = {
  menstrual:{id:"menstrual",label:"Menstrual",emoji:"🌙",days:"Days 1-5",color:"#F5A0A0",bg:"#FEF0F0",textColor:"#A03040",tagline:"Rest, restore, be gentle with yourself",body:"Oestrogen and progesterone are at their lowest. Energy dips, cramps may appear, and inflammation can rise. Your body is doing real work right now. Honour it.",workouts:["Gentle yoga or stretching","Short walks","Light pilates","Rest days are productive days"],foods:["Iron-rich foods: lentils, spinach, red meat","Anti-inflammatory options: ginger, turmeric, berries","Dark chocolate (magnesium!)","Warm cooked foods: soups, stews"],avoid:["High-intensity cardio when you're cramping","Excess caffeine (can worsen cramps)","Salty processed foods (increases bloating)"],weight:"Weight may be at its lowest as bloating eases. Any remaining water retention is normal and will pass.",energy:"Low, rising by day 4-5. Follow your body's lead.",moodNote:"You may feel inward and reflective. That's your nervous system asking for stillness."},
  follicular:{id:"follicular",label:"Follicular",emoji:"🌱",days:"Days 6-13",color:"#90D0A0",bg:"#F0FAF2",textColor:"#306040",tagline:"Energy rising. A great time to start new things.",body:"Oestrogen climbs steadily. Your brain feels sharper, motivation builds, and your body recovers faster from workouts. This is your window for new challenges.",workouts:["Higher intensity strength training","Try a new class or routine","Running, cycling, HIIT","Progressive overload this week"],foods:["Complex carbs for fuel: oats, sweet potato, quinoa","Lean protein to support muscle building","Fermented foods: yoghurt, kefir","Plenty of vegetables"],avoid:[],weight:"Weight often stabilises or trends lower as oestrogen rises and water retention drops.",energy:"Rising steadily. Many women feel their best in this phase.",moodNote:"More social, motivated, and optimistic. Great time to schedule things you've been putting off."},
  ovulation:{id:"ovulation",label:"Ovulation",emoji:"☀️",days:"Days 14-16",color:"#F0C040",bg:"#FFFBEC",textColor:"#805010",tagline:"Peak energy. Your strongest window of the cycle.",body:"Oestrogen peaks and testosterone surges briefly. Strength, coordination, and pain tolerance are at their highest. You may feel your most confident and social.",workouts:["Heavy lifting: great time for personal bests","High-intensity intervals","Competitive sports","Dance, Zumba, anything fun and energetic"],foods:["Antioxidant-rich foods: berries, leafy greens","Zinc: pumpkin seeds, chickpeas","Light fresh foods: salads, smoothies","Stay well hydrated"],avoid:["Overdoing it (ligament laxity is slightly higher during ovulation)"],weight:"You may notice a very slight temporary rise mid-cycle. This is a normal fluid shift, not fat gain.",energy:"Peak. This is your superpower window.",moodNote:"Outgoing, confident, articulate. Great for presentations, social plans, hard conversations."},
  luteal:{id:"luteal",label:"Luteal",emoji:"🍂",days:"Days 17-28",color:"#C8A0E8",bg:"#F5EFFE",textColor:"#603090",tagline:"Slow down. Your body is working hard right now.",body:"Progesterone rises and your body runs hotter, uses more energy at rest, and is more sensitive to blood sugar. This is why cravings, bloating, and fatigue happen. Not weakness. Just physiology.",workouts:["Moderate strength training: maintain, don't push for PRs","Pilates, barre, yoga","Swimming","Walking (especially helpful for mood)","Ease off intensity in the last few days"],foods:["Magnesium: dark chocolate, pumpkin seeds, almonds","B6: chickpeas, salmon, bananas","Complex carbs: don't restrict them, your body needs them right now","Calcium-rich foods (can reduce PMS severity)"],avoid:["High sodium (worsens water retention and bloating)","Refined sugar and alcohol (can amplify mood swings)","Excess caffeine (can increase anxiety and breast tenderness)"],weight:"Weight typically rises 1-3 kg due to water retention from progesterone. This is not fat gain. It will pass at the start of your next period.",energy:"Gradually declining. Honour slower days. Your basal metabolic rate is actually higher during this phase.",moodNote:"More sensitive, inward, easily overwhelmed. Reduce your schedule where you can. Rest is not laziness."},
};

const DAY_MS = 1000*60*60*24;

/**
 * Works out where `today` falls in the cycle that started on `periodStart` (YYYY-MM-DD).
 * Returns null when there is no start date, or when it is in the future or more than
 * two cycle lengths ago.
 */
export function getCycleInfo(periodStart: string, cycleLength=28): CycleInfo | null {
  if (!periodStart) return null;
  const start=new Date(periodStart+"T12:00:00"), today=new Date();
  // Corrupted or hand-edited storage shouldn't crash the app: treat it as "not set".
  if (Number.isNaN(start.getTime())) return null;
  today.setHours(12,0,0,0);
  const dayOfCycle=Math.floor((today.getTime()-start.getTime())/DAY_MS)+1;
  if (dayOfCycle<1||dayOfCycle>cycleLength*2) return null;
  const d=((dayOfCycle-1)%cycleLength)+1;
  const phase: PhaseId=d<=5?"menstrual":d<=13?"follicular":d<=16?"ovulation":"luteal";
  const nextPeriod=new Date(start);
  nextPeriod.setDate(start.getDate()+cycleLength);
  const daysUntilNext=Math.ceil((nextPeriod.getTime()-today.getTime())/DAY_MS);
  return {phase:PHASES[phase],dayOfCycle:d,cycleLength,daysUntilNext,nextPeriodDate:nextPeriod.toISOString().slice(0,10)};
}
