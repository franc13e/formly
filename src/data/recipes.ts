import type { AIRecipe, PhaseId, Recipe, RecipeKind } from "../types";

// ── Curated recipes ───────────────────────────────────────────────────────────
// 3 meals + 2 drinks per phase, built around the nutrients in CYCLE_FOODS (./nutrition.ts).
export const RECIPES: Record<PhaseId, Recipe[]> = {
  menstrual: [
    {
      id: "red-lentil-spinach-dal", name: "Red lentil & spinach dal", kind: "meal", emoji: "🫘", time: "30 min",
      why: "Lentils and spinach top up the iron you lose on your period, and a warm, soft dal is easy on low-energy days.",
      ingredients: ["1 cup red lentils, rinsed", "1 onion, finely chopped", "2 garlic cloves, grated", "Thumb of ginger, grated", "1 tsp ground turmeric", "1 tsp ground cumin", "400 ml tin chopped tomatoes", "2 big handfuls spinach", "Juice of 1/2 lemon", "Rice or flatbread, to serve"],
      steps: ["Soften the onion in a little oil for 5 minutes, then add garlic, ginger, turmeric and cumin for 1 minute.", "Add the lentils, tomatoes and 600 ml water. Simmer for 20 minutes, stirring now and then, until thick and creamy.", "Stir in the spinach until wilted and season with salt.", "Finish with lemon juice (its vitamin C helps you absorb the iron) and serve with rice or flatbread."],
    },
    {
      id: "salmon-sweet-potato-greens", name: "Baked salmon, sweet potato & greens", kind: "meal", emoji: "🐟", time: "30 min",
      why: "Salmon's omega-3s help calm the inflammation behind cramps, while greens add iron and magnesium.",
      ingredients: ["2 salmon fillets", "2 sweet potatoes, cut into wedges", "2 handfuls kale or spinach", "1 tbsp olive oil", "1 tsp smoked paprika", "1 lemon", "Salt and pepper"],
      steps: ["Heat the oven to 200°C. Toss the sweet potato with oil, paprika and salt and roast for 15 minutes.", "Add the salmon to the tray, season, and lay lemon slices on top. Roast for 12 more minutes.", "Meanwhile wilt the greens in a pan with a splash of water and a pinch of salt.", "Serve everything together with a squeeze of lemon."],
    },
    {
      id: "beef-broccoli-stir-fry", name: "Beef & broccoli stir-fry", kind: "meal", emoji: "🥩", time: "20 min",
      why: "Beef gives you easily absorbed iron, and the vitamin C in broccoli and peppers helps your body use it.",
      ingredients: ["250 g lean beef strips (or firm tofu)", "1 head broccoli, in small florets", "1 red pepper, sliced", "2 garlic cloves, sliced", "Thumb of ginger, grated", "2 tbsp low-salt soy sauce", "1 tsp honey", "1 tsp cornflour", "Cooked brown rice, to serve"],
      steps: ["Mix the soy sauce, honey, cornflour and 3 tbsp water in a cup.", "Stir-fry the beef in a hot pan with a little oil for 2 minutes, then set aside.", "Stir-fry the broccoli and pepper for 3 minutes, adding garlic and ginger for the last minute.", "Return the beef, pour in the sauce and toss until glossy. Serve over brown rice."],
    },
    {
      id: "ginger-lemon-tea", name: "Fresh ginger & lemon tea", kind: "drink", emoji: "🍵", time: "10 min",
      why: "Ginger has been shown to ease period cramps and bloating, and a warm, caffeine-free mug is soothing.",
      ingredients: ["Thumb of fresh ginger, thinly sliced", "2 slices lemon", "300 ml water", "1 tsp honey (optional)"],
      steps: ["Simmer the ginger in the water for 5 to 8 minutes.", "Pour into a mug over the lemon slices.", "Stir in honey if you like and sip while warm."],
    },
    {
      id: "dark-cacao-hot-chocolate", name: "Dark cacao hot chocolate", kind: "drink", emoji: "🍫", time: "5 min",
      why: "Cacao is rich in magnesium, which helps relax cramping muscles and lift your mood.",
      ingredients: ["250 ml milk or oat milk", "1 heaped tbsp cacao or cocoa powder", "1 tsp maple syrup or honey", "Pinch of cinnamon"],
      steps: ["Warm the milk in a small pan without boiling.", "Whisk in the cacao, sweetener and cinnamon until smooth and frothy.", "Pour into a mug and enjoy."],
    },
  ],
  follicular: [
    {
      id: "kefir-overnight-oats", name: "Berry kefir overnight oats", kind: "meal", emoji: "🌾", time: "5 min + overnight",
      why: "Oats give slow-release carbs for your rising energy, and kefir's live cultures support the gut health that helps balance oestrogen.",
      ingredients: ["1/2 cup rolled oats", "150 ml kefir (or yoghurt thinned with milk)", "1 tbsp chia seeds", "1 handful berries", "1 tsp honey", "1 tbsp chopped nuts"],
      steps: ["Stir the oats, kefir, chia and honey together in a jar.", "Cover and chill overnight (or at least 2 hours).", "Top with berries and nuts in the morning."],
    },
    {
      id: "quinoa-broccoli-chickpea-bowl", name: "Roasted broccoli, chickpea & quinoa bowl", kind: "meal", emoji: "🥦", time: "30 min",
      why: "Broccoli supports healthy oestrogen metabolism, while quinoa and chickpeas bring protein and complex carbs for training.",
      ingredients: ["1/2 cup quinoa", "1 head broccoli, in florets", "400 g tin chickpeas, drained", "1 tbsp olive oil", "1 tsp ground cumin", "2 tbsp tahini", "Juice of 1 lemon", "1 small garlic clove, grated", "Handful of rocket"],
      steps: ["Heat the oven to 210°C. Toss the broccoli and chickpeas with oil, cumin and salt and roast for 20 minutes.", "Cook the quinoa in 1 cup water for about 15 minutes until fluffy.", "Whisk tahini, lemon, garlic and 2 to 3 tbsp water into a pourable dressing.", "Build bowls with quinoa, rocket and the roasted veg, then drizzle with the dressing."],
    },
    {
      id: "kimchi-fried-rice-egg", name: "Kimchi fried rice with a fried egg", kind: "meal", emoji: "🥚", time: "15 min",
      why: "Kimchi adds fermented goodness for your gut, and eggs give lean protein as your strength builds.",
      ingredients: ["2 cups cooked brown rice (leftover is best)", "1/2 cup kimchi, chopped", "1 cup frozen peas or mixed veg", "2 spring onions, sliced", "1 tsp sesame oil", "1 tbsp low-salt soy sauce", "2 eggs"],
      steps: ["Fry the veg in a little oil for 3 minutes.", "Add the rice and kimchi and fry for 4 to 5 minutes until hot and slightly crispy.", "Season with soy sauce and sesame oil, then stir in the spring onions.", "Fry the eggs in a separate pan and serve on top."],
    },
    {
      id: "kefir-berry-smoothie", name: "Kefir berry smoothie", kind: "drink", emoji: "🫐", time: "5 min",
      why: "Kefir's probiotics support your gut and oestrogen balance, and berries add antioxidants and fibre.",
      ingredients: ["200 ml kefir", "1 cup frozen mixed berries", "1/2 banana", "1 tbsp oats", "1 tsp honey (optional)"],
      steps: ["Add everything to a blender.", "Blend until smooth, adding a splash of water if too thick.", "Pour and drink straight away."],
    },
    {
      id: "matcha-oat-latte", name: "Iced matcha oat latte", kind: "drink", emoji: "🍵", time: "5 min",
      why: "Matcha gives a gentle, steady lift for your more energetic days, plus antioxidants.",
      ingredients: ["1 tsp matcha powder", "60 ml hot (not boiling) water", "200 ml oat milk", "1 tsp maple syrup", "Ice"],
      steps: ["Whisk the matcha with the hot water until there are no lumps.", "Fill a glass with ice and oat milk, and stir in the maple syrup.", "Pour the matcha over the top and stir."],
    },
  ],
  ovulation: [
    {
      id: "chicken-quinoa-pumpkin-seed-salad", name: "Chicken, quinoa & pumpkin seed salad", kind: "meal", emoji: "🥗", time: "20 min",
      why: "Pumpkin seeds are packed with zinc for ovulation, and colourful veg bring antioxidants to protect your cells.",
      ingredients: ["2 chicken breasts (or a tin of chickpeas)", "1/2 cup quinoa", "1 cup cherry tomatoes, halved", "1 cucumber, diced", "2 handfuls mixed leaves", "2 tbsp pumpkin seeds", "2 tbsp olive oil", "1 tbsp lemon juice", "1 tsp dried oregano"],
      steps: ["Cook the quinoa in 1 cup water for 15 minutes, then cool slightly.", "Season the chicken with oregano and salt and pan-fry for 5 to 6 minutes per side until cooked through. Slice.", "Toast the pumpkin seeds in a dry pan for 2 minutes.", "Toss leaves, quinoa, tomatoes and cucumber with oil and lemon, then top with chicken and seeds."],
    },
    {
      id: "lemon-herb-cod-chickpea-salad", name: "Lemon-herb cod with tomato & chickpea salad", kind: "meal", emoji: "🐟", time: "20 min",
      why: "White fish is a light protein that keeps you feeling energised at your peak, and chickpeas add zinc.",
      ingredients: ["2 cod fillets", "1 lemon", "2 tbsp chopped parsley or dill", "400 g tin chickpeas, drained", "1 cup cherry tomatoes, halved", "1/2 red onion, finely sliced", "2 tbsp olive oil"],
      steps: ["Heat the oven to 200°C. Put the cod on a lined tray with a drizzle of oil, lemon zest, salt and half the herbs.", "Bake for 10 to 12 minutes until it flakes easily.", "Meanwhile mix the chickpeas, tomatoes, onion, remaining herbs, oil and lemon juice.", "Serve the cod on top of the salad."],
    },
    {
      id: "berry-yoghurt-power-bowl", name: "Berry yoghurt power bowl", kind: "meal", emoji: "🍓", time: "5 min",
      why: "Berries are loaded with antioxidants, and yoghurt plus pumpkin seeds give protein and zinc in minutes.",
      ingredients: ["200 g Greek or plant yoghurt", "1 cup strawberries and blueberries", "2 tbsp granola", "1 tbsp pumpkin seeds", "1 tsp honey"],
      steps: ["Spoon the yoghurt into a bowl.", "Top with the berries, granola and pumpkin seeds.", "Drizzle with honey and eat straight away."],
    },
    {
      id: "watermelon-cucumber-cooler", name: "Watermelon cucumber cooler", kind: "drink", emoji: "💧", time: "5 min",
      why: "Your body temperature rises around ovulation, and watermelon and cucumber hydrate with natural electrolytes.",
      ingredients: ["2 cups watermelon chunks", "1/2 cucumber", "Juice of 1 lime", "A few mint leaves", "Ice"],
      steps: ["Blend the watermelon, cucumber, lime and mint until smooth.", "Strain if you prefer it smooth.", "Pour over ice."],
    },
    {
      id: "coconut-berry-smoothie", name: "Coconut water berry smoothie", kind: "drink", emoji: "🫐", time: "5 min",
      why: "Coconut water replaces fluids and potassium on high-energy days, and berries add antioxidants.",
      ingredients: ["200 ml coconut water", "1 cup frozen berries", "1 handful spinach", "1/2 banana"],
      steps: ["Add everything to a blender.", "Blend until smooth.", "Drink chilled."],
    },
  ],
  luteal: [
    {
      id: "sweet-potato-chickpea-curry", name: "Sweet potato & chickpea curry", kind: "meal", emoji: "🥣", time: "35 min",
      why: "Chickpeas bring B6 to ease PMS, sweet potato gives the complex carbs you crave, and spinach adds magnesium.",
      ingredients: ["1 onion, chopped", "2 garlic cloves, grated", "Thumb of ginger, grated", "2 tbsp mild curry paste", "1 tsp ground turmeric", "1 large sweet potato, cubed", "400 g tin chickpeas, drained", "400 ml tin light coconut milk", "2 handfuls spinach", "Brown rice, to serve"],
      steps: ["Soften the onion in a little oil for 5 minutes, then stir in garlic, ginger, curry paste and turmeric for 1 minute.", "Add the sweet potato, chickpeas, coconut milk and 150 ml water.", "Simmer for 20 minutes until the sweet potato is tender.", "Stir in the spinach until wilted and serve with brown rice."],
    },
    {
      id: "salmon-brown-rice-traybake", name: "Salmon & veg tray bake with brown rice", kind: "meal", emoji: "🐟", time: "30 min",
      why: "Salmon is one of the best sources of B6 and omega-3s, which help with PMS mood dips and inflammation.",
      ingredients: ["2 salmon fillets", "1 courgette, sliced", "1 red pepper, chopped", "1 red onion, in wedges", "1 tbsp olive oil", "1 tsp garlic powder", "1 lemon", "Cooked brown rice, to serve"],
      steps: ["Heat the oven to 200°C. Toss the veg with oil, garlic powder and a little salt and roast for 15 minutes.", "Nestle the salmon among the veg and add lemon slices.", "Roast for 12 more minutes until the salmon is cooked.", "Serve with brown rice and the tray juices."],
    },
    {
      id: "banana-almond-porridge", name: "Banana almond porridge", kind: "meal", emoji: "🌾", time: "10 min",
      why: "Oats and banana steady your blood sugar and give B6, while almonds and pumpkin seeds bring magnesium.",
      ingredients: ["1/2 cup rolled oats", "250 ml milk or fortified plant milk", "1 ripe banana", "1 tbsp almond butter", "1 tbsp pumpkin seeds", "Pinch of cinnamon"],
      steps: ["Simmer the oats and milk with half the banana, mashed, for 5 minutes, stirring.", "Add the cinnamon and a splash more milk if it gets too thick.", "Top with the remaining banana, sliced, almond butter and pumpkin seeds."],
    },
    {
      id: "golden-milk", name: "Golden milk", kind: "drink", emoji: "🥛", time: "5 min",
      why: "Turmeric and ginger are anti-inflammatory, and calcium-rich milk may reduce PMS severity.",
      ingredients: ["250 ml milk or fortified plant milk", "1/2 tsp ground turmeric", "1/4 tsp ground ginger", "Pinch of cinnamon", "Pinch of black pepper", "1 tsp honey"],
      steps: ["Warm the milk gently in a small pan.", "Whisk in the spices and honey and heat for 2 minutes without boiling.", "Pour into a mug and sip before bed."],
    },
    {
      id: "cacao-banana-smoothie", name: "Cacao banana smoothie", kind: "drink", emoji: "🍫", time: "5 min",
      why: "Cacao and almonds are rich in magnesium for cramps and bloating, and banana adds B6 to support mood.",
      ingredients: ["1 frozen banana", "250 ml milk or oat milk", "1 tbsp cacao powder", "1 tbsp almond butter", "Pinch of cinnamon"],
      steps: ["Add everything to a blender.", "Blend until thick and creamy.", "Pour and enjoy as a snack or after a workout."],
    },
  ],
};

export type RecipeFilter = "all" | RecipeKind;

/** The curated recipes for `phase`, optionally only meals or only drinks. */
export function recipesFor(phase: PhaseId, filter: RecipeFilter = "all"): Recipe[] {
  const list = RECIPES[phase];
  return filter === "all" ? list : list.filter((r) => r.kind === filter);
}

// ── AI recipe parsing ─────────────────────────────────────────────────────────

type Section = "title" | "time" | "why" | "ingredients" | "steps";
const HEADER = /^\s*(title|time|why|ingredients|steps|method|instructions)\s*:\s*(.*)$/i;

/**
 * Parses /api/recipe's plain-text reply (TITLE: / TIME: / WHY: / INGREDIENTS: / STEPS:).
 * Returns null when it has no ingredients or no steps, so the caller can show the raw text instead.
 */
export function parseRecipe(text: string): AIRecipe | null {
  const out: AIRecipe = { title: "", time: "", why: "", ingredients: [], steps: [] };
  let section: Section | null = null;
  for (const raw of text.replace(/\*\*/g, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const header = HEADER.exec(line);
    if (header) {
      const name = header[1].toLowerCase();
      section = name === "method" || name === "instructions" ? "steps" : (name as Section);
      const rest = header[2].trim();
      if (!rest) continue;
      if (section === "title" || section === "time" || section === "why") {
        out[section] = rest;
        continue;
      }
      // e.g. "INGREDIENTS: oats, milk" on one line: fall through and treat the rest as an item.
      addItem(out, section, rest);
      continue;
    }
    if (section === "ingredients" || section === "steps") addItem(out, section, line);
    else if (section === "why") out.why = `${out.why} ${line}`.trim();
    else if (section === "title") out.title = `${out.title} ${line}`.trim();
    else if (!out.title) out.title = line;
  }
  if (out.ingredients.length === 0 || out.steps.length === 0) return null;
  if (!out.title) out.title = "Your recipe";
  return out;
}

function addItem(out: AIRecipe, section: "ingredients" | "steps", line: string) {
  const item = line.replace(/^([-*•]|\d+[.)])\s*/, "").trim();
  if (item) out[section].push(item);
}
