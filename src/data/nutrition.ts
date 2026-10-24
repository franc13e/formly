import type { CycleFoodGuide, GoalFoodGuide, PhaseId } from "../types";

// ── Food insights ─────────────────────────────────────────────────────────────
export const CYCLE_FOODS: Record<PhaseId, CycleFoodGuide> = {
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

/** Keyed by goal label; indexing with an unknown goal (e.g. stale localStorage) yields undefined. */
export const GOAL_FOODS: Partial<Record<string, GoalFoodGuide>> = {
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
