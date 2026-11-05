import type { PhaseId } from "../types";

// ─── Workout kinds, phase fit and workout food ───────────────────────────────

export type WorkoutKind = "strength" | "cardio" | "recovery";

// Low-intensity, restorative work. Pilates counts here: it is controlled, low-impact
// work that suits any phase, even though it builds core strength.
const RECOVERY = /\b(yoga|pilates|stretch(es|ing)?|mobility|recovery|restorative|walk(s|ing)?|foam roll(ing)?|flexibility|breath(work|ing)?|tai chi|meditation)\b/i;
// "row" alone is left out so "Barbell row" stays strength.
const CARDIO = /\b(run(s|ning)?|jog(s|ging)?|hiit|cardio|cycl(e|es|ing)|bike|biking|spin(ning)?|swim(s|ming)?|rowing|rower|erg|aerobic|zumba|dance|dancing|boxing|kickboxing|sprints?|skipping|jump rope|hik(e|es|ing)|elliptical|stair ?master|intervals?|zone ?2)\b/i;

function classify(text: string): WorkoutKind | null {
  if (RECOVERY.test(text)) return "recovery";
  if (CARDIO.test(text)) return "cardio";
  return null;
}

/** Classifies a workout (built-in, custom or typed into the schedule) from its name, muscle group and tags. */
export function workoutKind(w: { name: string; muscle?: string; tags?: string[] }): WorkoutKind {
  // The name says the most about what was done, then the muscle group, then the tags.
  return classify(w.name) ?? classify(w.muscle ?? "") ?? classify((w.tags ?? []).join(" ")) ?? "strength";
}

const FIT: Record<WorkoutKind, Record<PhaseId, string>> = {
  strength: {
    menstrual: "Keep strength work lighter this week and let your energy set the pace. Fewer sets or lighter weights still count.",
    follicular: "Rising oestrogen supports strength gains and quicker recovery, so this is a good week to progress your weights.",
    ovulation: "Energy and strength tend to peak now, a great time to go for a heavier set. Warm up well and keep your form tidy.",
    luteal: "Steady, moderate strength work fits well here. Aim to maintain rather than chase personal bests, especially late in the phase.",
  },
  cardio: {
    menstrual: "Gentle, steady cardio like an easy jog or bike ride can ease cramps. Skip the hard intervals if you feel drained.",
    follicular: "Your body recovers faster now, so it's a good time for intervals, longer runs or trying a new class.",
    ovulation: "Energy is high, so harder efforts and fun, fast sessions feel good now. Hydrate well and enjoy it.",
    luteal: "Steady, moderate cardio suits this phase. Your body temperature runs a little higher, so hydrate well and ease off if it feels hard.",
  },
  recovery: {
    menstrual: "A perfect match: gentle movement can ease cramps and lift your mood while your body rests.",
    follicular: "Recovery fits any phase. A mobility session now helps you get more out of this high-energy week.",
    ovulation: "Recovery fits any phase. Gentle stretching helps balance harder training while your energy is high.",
    luteal: "A great fit: calm, low-intensity movement can help with bloating, tension and low mood before your period.",
  },
};

const GENERAL_FIT: Record<WorkoutKind, string> = {
  strength: "Strength work builds muscle and bone health. Progress gradually and let your energy guide the weights.",
  cardio: "Cardio supports your heart, mood and stamina. Mix easier and harder sessions through the week.",
  recovery: "Recovery sessions fit any day. They help your body adapt to training and keep you moving well.",
};

/** One line on how this kind of workout fits the given phase (or a general line when no phase). */
export function phaseFit(kind: WorkoutKind, phase: PhaseId | null): string {
  return phase ? FIT[kind][phase] : GENERAL_FIT[kind];
}

export interface FoodTip {
  /** e.g. "1–2 hours before" or "Within an hour after" */
  when: string;
  foods: string[];
  why: string;
}

type Meal = { before: FoodTip; after: FoodTip };

const GENERAL_FOOD: Record<WorkoutKind, Meal> = {
  strength: {
    before: { when: "1–2 hours before", foods: ["Oats with banana", "Wholegrain toast with peanut butter", "Greek yoghurt with berries"], why: "Carbs give you energy to lift and a little protein gets your muscles ready." },
    after: { when: "Within an hour or two after", foods: ["Eggs on wholegrain toast", "Chicken with rice and veg", "Greek yoghurt with granola", "Tofu stir-fry"], why: "Protein helps your muscles repair, and carbs refill your energy stores." },
  },
  cardio: {
    before: { when: "1–2 hours before", foods: ["Banana", "Toast with honey", "Small bowl of oats", "Rice cakes with jam"], why: "Easy-to-digest carbs fuel your effort without sitting heavy in your stomach." },
    after: { when: "Within an hour after", foods: ["Glass of water or milk", "Wrap with chicken or hummus", "Smoothie with fruit and yoghurt", "Rice with salmon"], why: "Rehydrate first, then carbs and some protein help you recover." },
  },
  recovery: {
    before: { when: "Up to an hour before", foods: ["Piece of fruit", "Handful of nuts", "Cup of herbal tea"], why: "Something light keeps you comfortable while you stretch and move." },
    after: { when: "Whenever you're next hungry", foods: ["Vegetable soup with bread", "Yoghurt with fruit", "Wholegrain wrap with salad", "Glass of water"], why: "A balanced meal and plenty of water support recovery without needing extra fuel." },
  },
};

const PHASE_FOOD: Record<PhaseId, Record<WorkoutKind, Meal>> = {
  menstrual: {
    strength: {
      before: { when: "1–2 hours before", foods: ["Porridge with raisins", "Wholegrain toast with egg", "Warm milk or a hot chocolate"], why: "Warm, gentle carbs give steady energy when your energy is lower." },
      after: { when: "Within an hour or two after", foods: ["Lentil or beef stew", "Eggs with spinach", "Chickpea curry with rice", "Dark chocolate square"], why: "Iron-rich foods help replace what you lose on your period, and protein helps your muscles repair." },
    },
    cardio: {
      before: { when: "1–2 hours before", foods: ["Banana", "Toast with honey", "Ginger tea", "Small bowl of warm oats"], why: "Light carbs fuel you, and ginger can help settle cramps." },
      after: { when: "Within an hour after", foods: ["Lentil soup", "Spinach and feta omelette", "Water with a pinch of salt or a sports drink", "Beef or bean chilli"], why: "Rehydrate, and pick iron-rich, warming foods to support your energy." },
    },
    recovery: {
      before: { when: "Up to an hour before", foods: ["Ginger or peppermint tea", "Handful of almonds", "A few dates"], why: "Light and warming, so you stay comfortable while you move gently." },
      after: { when: "Whenever you're next hungry", foods: ["Warm lentil soup", "Salmon with greens", "Dark chocolate square", "Yoghurt with berries"], why: "Iron, omega-3 and magnesium can ease tiredness and cramps." },
    },
  },
  follicular: {
    strength: {
      before: { when: "1–2 hours before", foods: ["Oats with berries", "Sweet potato toast with egg", "Wholegrain wrap with chicken"], why: "Complex carbs fuel heavier lifts while your energy is rising." },
      after: { when: "Within an hour or two after", foods: ["Chicken with quinoa and veg", "Greek yoghurt with granola", "Tuna on wholegrain toast", "Kefir smoothie"], why: "Lean protein supports the strength gains this phase is good for." },
    },
    cardio: {
      before: { when: "1–2 hours before", foods: ["Banana with a little peanut butter", "Bowl of oats", "Rice cakes with honey"], why: "Complex and simple carbs together give you energy for harder efforts." },
      after: { when: "Within an hour after", foods: ["Quinoa salad with chicken", "Smoothie with kefir and fruit", "Salmon with sweet potato", "Water"], why: "Refill your energy with carbs and add lean protein for recovery." },
    },
    recovery: {
      before: { when: "Up to an hour before", foods: ["Apple", "Handful of mixed nuts", "Glass of water"], why: "A light snack is plenty for gentle movement." },
      after: { when: "Whenever you're next hungry", foods: ["Yoghurt with fruit", "Veg-packed omelette", "Wholegrain sandwich with salad", "Sauerkraut or kimchi on the side"], why: "Fermented foods and plenty of veg support your gut while oestrogen rises." },
    },
  },
  ovulation: {
    strength: {
      before: { when: "1–2 hours before", foods: ["Greek yoghurt with berries", "Toast with avocado and egg", "Fruit smoothie"], why: "Lighter, fresh options fuel a strong session without feeling heavy." },
      after: { when: "Within an hour or two after", foods: ["Grilled chicken salad with chickpeas", "Salmon with greens and rice", "Cottage cheese with fruit", "Pumpkin seeds"], why: "Protein helps repair, and leafy greens and seeds add antioxidants and zinc." },
    },
    cardio: {
      before: { when: "1–2 hours before", foods: ["Watermelon or orange slices", "Banana", "Toast with honey"], why: "Juicy fruit and simple carbs keep you fuelled and hydrated." },
      after: { when: "Within an hour after", foods: ["Berry smoothie with yoghurt", "Coconut water or plain water", "Chicken and quinoa salad", "Cucumber and hummus"], why: "Rehydrate, and antioxidant-rich foods help you recover from harder efforts." },
    },
    recovery: {
      before: { when: "Up to an hour before", foods: ["Handful of berries", "Cucumber slices", "Glass of water"], why: "Light and hydrating, so you feel fresh while you move." },
      after: { when: "Whenever you're next hungry", foods: ["Big leafy salad with chickpeas", "Fruit and yoghurt bowl", "Vegetable soup", "Pumpkin seeds"], why: "Fresh, colourful foods bring antioxidants and keep you hydrated." },
    },
  },
  luteal: {
    strength: {
      before: { when: "1–2 hours before", foods: ["Oats with banana", "Sweet potato with cottage cheese", "Wholegrain toast with peanut butter"], why: "Your body uses more energy now, so a little extra complex carb keeps blood sugar steady." },
      after: { when: "Within an hour or two after", foods: ["Salmon with brown rice", "Chickpea and spinach curry", "Greek yoghurt with almonds", "Dark chocolate square"], why: "Protein for repair, plus magnesium and B6 to help with cravings and mood." },
    },
    cardio: {
      before: { when: "1–2 hours before", foods: ["Banana", "Oatcakes with nut butter", "Small bowl of porridge"], why: "Steady carbs help you avoid an energy crash mid-session." },
      after: { when: "Within an hour after", foods: ["Plenty of water", "Wholegrain wrap with turkey or hummus", "Brown rice with salmon", "Pumpkin seeds"], why: "You run warmer in this phase, so rehydrate well. Complex carbs and magnesium keep energy steady." },
    },
    recovery: {
      before: { when: "Up to an hour before", foods: ["Banana", "Handful of almonds", "Chamomile tea"], why: "A light, steady snack keeps blood sugar even and helps you relax." },
      after: { when: "Whenever you're next hungry", foods: ["Sweet potato with beans", "Dark chocolate square", "Yoghurt with seeds", "Lentil soup"], why: "Complex carbs and magnesium support steady energy and can ease PMS." },
    },
  },
};

/** What to eat before and after this kind of workout, adjusted for the phase. */
export function workoutFood(kind: WorkoutKind, phase: PhaseId | null): { before: FoodTip; after: FoodTip } {
  return (phase ? PHASE_FOOD[phase] : GENERAL_FOOD)[kind];
}
