import type { PhaseId } from "../types";

// ─── More on each "Foods to focus on" / "Ease off on" item, shown when it's tapped ──
// Keyed by phase, then by the item's `food` name in CYCLE_FOODS (./nutrition.ts).

export interface FocusFoodDetail {
  /** Why it helps, a little deeper than the one-line reason. */
  reasons: string[];
  /** Foods that count. */
  examples: string[];
  /** Easy ways to eat it. */
  ideas: string[];
}

export interface EaseFoodDetail {
  /** Why to go easy on it this phase. */
  reasons: string[];
  /** What to have instead. */
  swaps: string[];
  /** A kind, realistic note: nothing is banned. */
  note: string;
}

export const FOCUS_DETAILS: Record<PhaseId, Record<string, FocusFoodDetail>> = {
  menstrual: {
    "Iron-rich foods": {
      reasons: [
        "Bleeding uses up iron, and low iron is a common reason for feeling tired, cold or short of breath on your period.",
        "Iron carries oxygen to your muscles, so topping it up helps your energy come back sooner.",
        "Plant iron is absorbed better with vitamin C, so pair it with peppers, citrus, tomatoes or berries.",
      ],
      examples: ["Lean red meat", "Lentils", "Spinach", "Tofu", "Chickpeas", "Kidney beans", "Pumpkin seeds", "Fortified cereal", "Eggs"],
      ideas: ["Lentil and spinach dahl with a squeeze of lemon", "Beef or tofu stir-fry with red peppers", "Fortified cereal with strawberries"],
    },
    "Omega-3 rich foods": {
      reasons: [
        "Omega-3 fats help calm the inflammation (prostaglandins) that drives period cramps.",
        "They're linked with steadier mood, which helps on low days.",
        "Two portions of oily fish a week, or a daily spoon of seeds, is plenty.",
      ],
      examples: ["Salmon", "Sardines", "Mackerel", "Trout", "Walnuts", "Ground flaxseed", "Chia seeds", "Hemp seeds"],
      ideas: ["Baked salmon with rice and greens", "Overnight oats with chia and berries", "A handful of walnuts as a snack"],
    },
    "Dark chocolate": {
      reasons: [
        "Magnesium helps muscles relax, including the uterus, which can ease cramps.",
        "It also supports mood and sleep, which both dip for many people on their period.",
        "70% cocoa or higher gives the most magnesium for the least sugar.",
      ],
      examples: ["70%+ dark chocolate", "Cacao nibs", "Unsweetened cocoa powder", "Chocolate-dipped strawberries"],
      ideas: ["Two or three squares after dinner", "Hot cocoa made with milk and a little honey", "Cacao nibs on yoghurt"],
    },
    "Warm herbal teas": {
      reasons: [
        "Ginger has been shown to ease period pain for some people, close to what mild painkillers do.",
        "Chamomile is soothing and can help you fall asleep.",
        "Warm drinks keep you hydrated, which also helps with bloating.",
      ],
      examples: ["Ginger tea", "Chamomile", "Peppermint", "Raspberry leaf", "Rooibos", "Fresh ginger and lemon"],
      ideas: ["Fresh ginger slices in hot water with honey", "Chamomile before bed", "Peppermint after meals for bloating"],
    },
    "Warm cooked meals": {
      reasons: [
        "Cooked food is easier to digest when your gut is sensitive on your period.",
        "Soups and stews are an easy way to fit in iron, protein and veg when you don't feel like cooking much.",
        "Warm, comforting food can help when you feel low or crampy.",
      ],
      examples: ["Soups", "Stews", "Curries", "Porridge", "Congee", "Roasted veg", "Bone broth"],
      ideas: ["Big batch of chicken and veg soup for the week", "Lentil curry with rice", "Porridge with banana and nut butter"],
    },
  },
  follicular: {
    "Cruciferous vegetables": {
      reasons: [
        "They contain compounds that help your liver process and clear used oestrogen.",
        "They're full of fibre, which keeps digestion regular and helps carry oestrogen out of the body.",
        "They're filling and nutrient-dense while your appetite is usually lower this phase.",
      ],
      examples: ["Broccoli", "Cauliflower", "Brussels sprouts", "Kale", "Cabbage", "Pak choi", "Rocket"],
      ideas: ["Roasted broccoli and chickpeas with tahini", "Slaw with red cabbage and carrot", "Cauliflower rice stir-fry"],
    },
    "Complex carbohydrates": {
      reasons: [
        "Your energy and training drive go up now, and carbs are what fuel harder sessions.",
        "Slow-release carbs keep your blood sugar steady, so energy lasts through the day.",
        "Your body handles carbs well in this phase, so there's no need to cut them.",
      ],
      examples: ["Oats", "Quinoa", "Sweet potato", "Brown rice", "Wholegrain bread", "Buckwheat", "Barley"],
      ideas: ["Oats with fruit before a morning workout", "Quinoa bowl with veg and eggs", "Sweet potato wedges with lunch"],
    },
    "Lean protein": {
      reasons: [
        "This is the best phase to build strength, and protein is what muscles repair and grow from.",
        "Spreading it across meals works better than one big serving.",
        "Protein also keeps you full and helps steady your appetite.",
      ],
      examples: ["Eggs", "Chicken", "Turkey", "White fish", "Greek yoghurt", "Lentils", "Tofu", "Tempeh"],
      ideas: ["Eggs on wholegrain toast", "Chicken and quinoa salad", "Greek yoghurt with berries after training"],
    },
    "Fermented foods": {
      reasons: [
        "A healthy gut helps your body balance oestrogen (the gut has its own oestrogen-processing bacteria).",
        "Fermented foods bring in friendly bacteria and can help digestion.",
        "Small daily amounts work better than a lot at once.",
      ],
      examples: ["Yoghurt", "Kefir", "Kimchi", "Sauerkraut", "Miso", "Tempeh", "Kombucha"],
      ideas: ["Kefir smoothie with banana", "A spoon of kimchi on rice or eggs", "Miso soup with tofu"],
    },
    "Fresh salads and raw veg": {
      reasons: [
        "Digestion tends to feel easiest in this phase, so it's a good time for raw, crunchy food.",
        "Raw veg keeps vitamin C and folate that cooking can reduce.",
        "Light, fresh meals suit the rising energy many people feel now.",
      ],
      examples: ["Leafy greens", "Cucumber", "Peppers", "Carrots", "Tomatoes", "Sprouts", "Radishes", "Fresh herbs"],
      ideas: ["Big salad with chicken or chickpeas", "Veg sticks with hummus", "Fresh spring rolls"],
    },
  },
  ovulation: {
    "Zinc-rich foods": {
      reasons: [
        "Zinc supports healthy ovulation and egg quality.",
        "It helps your immune system and skin, which can flare around ovulation.",
        "Your body doesn't store much zinc, so a little every day is best.",
      ],
      examples: ["Pumpkin seeds", "Chickpeas", "Beef", "Cashews", "Oysters", "Lentils", "Oats", "Cheese"],
      ideas: ["Pumpkin seeds on salads or porridge", "Chickpea curry", "Beef and veg tacos"],
    },
    "Antioxidant-rich foods": {
      reasons: [
        "Ovulation is a busy time for your cells, and antioxidants help protect them.",
        "Colourful fruit and veg also bring fibre, which helps your body clear the oestrogen peak.",
        "The more colours on your plate, the wider the mix of antioxidants.",
      ],
      examples: ["Berries", "Spinach", "Kale", "Tomatoes", "Red peppers", "Beetroot", "Green tea", "Pomegranate"],
      ideas: ["Berry smoothie bowl", "Tomato and pepper shakshuka", "Green tea in the afternoon"],
    },
    "Hydrating foods": {
      reasons: [
        "Your body temperature rises slightly after ovulation, so you lose a bit more water.",
        "Energy is high and you may train harder, which means more sweat.",
        "Water-rich foods count towards your daily fluids, and bring electrolytes too.",
      ],
      examples: ["Cucumber", "Watermelon", "Coconut water", "Oranges", "Strawberries", "Celery", "Lettuce", "Courgette"],
      ideas: ["Watermelon and feta salad", "Coconut water after a workout", "Cucumber and mint water"],
    },
    "Light proteins": {
      reasons: [
        "Your energy and strength are often at their highest, so muscles need protein to recover.",
        "Lighter proteins are easy to digest before and after harder training.",
        "Pairing protein with carbs after a workout speeds up recovery.",
      ],
      examples: ["White fish", "Salmon", "Eggs", "Prawns", "Tofu", "Edamame", "Cottage cheese", "Legumes"],
      ideas: ["Prawn and veg rice bowl", "Omelette with spinach", "Edamame as a snack"],
    },
  },
  luteal: {
    "Magnesium-rich foods": {
      reasons: [
        "Magnesium levels can dip before your period, and low magnesium is linked with cramps, headaches and poor sleep.",
        "It helps muscles relax and may ease PMS mood dips and water retention.",
        "Chocolate cravings in this phase are partly your body asking for magnesium.",
      ],
      examples: ["Dark chocolate", "Pumpkin seeds", "Almonds", "Spinach", "Avocado", "Black beans", "Cashews", "Bananas"],
      ideas: ["Trail mix with almonds, pumpkin seeds and dark chocolate", "Avocado on toast", "Black bean chilli"],
    },
    "B6-rich foods": {
      reasons: [
        "Vitamin B6 helps make serotonin and dopamine, the brain chemicals that steady mood.",
        "Studies suggest it can ease PMS symptoms like irritability, bloating and breast tenderness.",
        "It's found in everyday foods, so a varied diet usually covers it.",
      ],
      examples: ["Salmon", "Chicken", "Bananas", "Chickpeas", "Potatoes", "Tuna", "Pistachios", "Sunflower seeds"],
      ideas: ["Baked potato with tuna and sweetcorn", "Banana with peanut butter", "Hummus and veg wrap"],
    },
    "Complex carbohydrates": {
      reasons: [
        "Your body burns a bit more energy at rest in this phase, so you genuinely need more food.",
        "Carbs help your brain make serotonin, which can lift low mood and ease cravings.",
        "Slow-release carbs avoid the sugar crashes that make PMS worse.",
      ],
      examples: ["Oats", "Brown rice", "Sweet potato", "Wholegrain pasta", "Quinoa", "Lentils", "Rye bread"],
      ideas: ["Porridge with cinnamon and apple", "Sweet potato and black bean bowl", "Wholegrain pasta with veg sauce"],
    },
    "Calcium-rich foods": {
      reasons: [
        "Getting enough calcium has been shown to reduce PMS symptoms, including mood swings, cramps and bloating.",
        "Calcium and vitamin D work together, so get some daylight too.",
        "It also keeps bones strong, which matters at every age.",
      ],
      examples: ["Milk", "Yoghurt", "Cheese", "Fortified plant milk", "Tofu (calcium-set)", "Kale", "Almonds", "Sardines"],
      ideas: ["Yoghurt with granola", "Latte or a glass of fortified oat milk", "Tofu and greens stir-fry"],
    },
    "Anti-inflammatory foods": {
      reasons: [
        "Inflammation builds before your period and feeds cramps, bloating and aches.",
        "Ginger and turmeric have natural anti-inflammatory compounds.",
        "Berries and leafy greens add antioxidants that help calm inflammation too.",
      ],
      examples: ["Turmeric", "Ginger", "Berries", "Leafy greens", "Olive oil", "Oily fish", "Walnuts", "Cherries"],
      ideas: ["Golden milk (turmeric latte)", "Salmon with greens and olive oil", "Mixed berries with yoghurt"],
    },
  },
};

export const EASE_DETAILS: Record<PhaseId, Record<string, EaseFoodDetail>> = {
  menstrual: {
    "Caffeine": {
      reasons: [
        "Caffeine narrows blood vessels, which can make cramps feel worse for some people.",
        "It can add to anxiety and broken sleep when you're already tired.",
        "It also makes it harder to absorb iron when drunk with meals.",
      ],
      swaps: ["Decaf coffee", "Ginger tea", "Rooibos", "Hot cocoa", "Chicory coffee"],
      note: "One coffee is usually fine. Try having it away from meals so it doesn't block iron.",
    },
    "Alcohol": {
      reasons: [
        "Alcohol raises inflammation, which can make cramps and aches worse.",
        "It disrupts deep sleep, so you wake up more tired.",
        "It can make bloating and low mood worse the next day.",
      ],
      swaps: ["Sparkling water with lime", "Kombucha", "Alcohol-free beer or wine", "Warm spiced apple juice"],
      note: "If you do drink, keep it to one and have water alongside.",
    },
    "Salty processed foods": {
      reasons: [
        "Lots of salt makes your body hold on to water, adding to period bloating.",
        "Processed snacks tend to crowd out the iron-rich foods you need now.",
      ],
      swaps: ["Salted nuts in a small handful", "Popcorn you make yourself", "Homemade soup", "Herbs and lemon for flavour"],
      note: "Cravings are normal. Having some is fine, just add water and fresh food alongside.",
    },
  },
  follicular: {
    "Ultra-processed foods": {
      reasons: [
        "They're low in the fibre your gut uses to clear used oestrogen.",
        "They can cause energy spikes and dips just as your energy is naturally rising.",
        "Swapping some for whole foods leaves room for the protein and veg that fuel training now.",
      ],
      swaps: ["Homemade wraps or bowls", "Fruit and nut butter", "Oatcakes with hummus", "Plain yoghurt with fruit"],
      note: "It's about balance, not perfection. Most of your plate from whole foods is a great goal.",
    },
  },
  ovulation: {
    "Heavy fried foods": {
      reasons: [
        "Greasy food is slow to digest, which can leave you sluggish when your energy should be high.",
        "Fried oils can add to inflammation and skin breakouts around ovulation.",
      ],
      swaps: ["Oven-baked chips", "Air-fried chicken", "Grilled fish", "Roasted veg with olive oil"],
      note: "An occasional takeaway is fine. Pair it with some veg and plenty of water.",
    },
  },
  luteal: {
    "High sodium foods": {
      reasons: [
        "Progesterone already makes you hold on to water. Extra salt adds to that puffiness.",
        "Bloating can make the scale jump 1 to 3 kg, which is water, not fat.",
        "Potassium-rich foods like bananas and potatoes help balance salt out.",
      ],
      swaps: ["Herbs, garlic and lemon for flavour", "Unsalted nuts", "Homemade soups", "Fresh rather than cured meats"],
      note: "You don't need to cut salt out. Just watch the very salty foods like crisps, ramen and takeaways.",
    },
    "Refined sugar": {
      reasons: [
        "You're more sensitive to blood sugar in this phase, so sugary foods give bigger crashes.",
        "Those crashes can feed irritability, low mood and more cravings.",
        "Pairing sweet things with protein or fibre slows the spike down.",
      ],
      swaps: ["Dark chocolate", "Fruit with nut butter", "Dates with almonds", "Yoghurt with honey and berries"],
      note: "Cravings are real and normal in this phase. Have the treat, and add some protein with it.",
    },
    "Alcohol": {
      reasons: [
        "Alcohol can deepen PMS anxiety and low mood.",
        "It disrupts sleep, which is often lighter already before your period.",
        "It can make breast tenderness and bloating worse.",
      ],
      swaps: ["Sparkling water with fruit", "Alcohol-free drinks", "Kombucha", "Chamomile or a warm drink at night"],
      note: "If you're having a drink, one with food is gentler than several on an empty stomach.",
    },
    "Excess caffeine": {
      reasons: [
        "Caffeine can make PMS anxiety and jitteriness worse.",
        "It's linked with more breast tenderness for some people.",
        "Too much late in the day makes it harder to sleep well.",
      ],
      swaps: ["Half-caf coffee", "Green tea (less caffeine)", "Decaf", "Rooibos or peppermint tea"],
      note: "One or two coffees before midday is usually fine. Cut back later in the day first.",
    },
  },
};
