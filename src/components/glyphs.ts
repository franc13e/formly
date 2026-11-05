import {
  Accessibility, Armchair, Bean, Beef, BicepsFlexed, Bike, Bird, Brain, CalendarDays, Candy, Carrot, Cherry, Citrus, CloudSun,
  Coffee, Droplet, Dumbbell, Egg, Fish, Flame, Flower2, Footprints, Grape, Hand, HandFist, HeartPulse, Leaf, LeafyGreen, Milk,
  Moon, Mountain, Pencil, PersonStanding, Ruler, Salad, Scale, Soup, Sparkle, Sparkles, Sprout, Sun, Target,
  TreeDeciduous, TrendingUp, Waves, Wheat, Wind, Zap, Plus, type LucideIcon,
} from "lucide-react";
import { C, ACCENT } from "../theme";

// ─── Glyphs: the app's emoji concepts drawn as line icons ────────────────────
// Data (workouts, foods, phases, saved schedules) still stores the emoji, so
// existing localStorage keeps working; the `Glyph` component maps it to an icon.
export type Tone = "lavender" | "rose" | "sage" | "butter" | "peach" | "sky";

export const TONES: Record<Tone, { bg: string; fg: string }> = {
  lavender: { bg: C.lavender, fg: ACCENT.sugar.text },
  rose:     { bg: C.rose,     fg: ACCENT.protein.text },
  sage:     { bg: C.sage,     fg: ACCENT.fiber.text },
  butter:   { bg: C.butter,   fg: ACCENT.carbs.text },
  peach:    { bg: C.peach,    fg: ACCENT.fats.text },
  sky:      { bg: C.sky,      fg: ACCENT.water.text },
};

const GLYPHS: Record<string, [LucideIcon, Tone]> = {
  // goals, activity and muscles
  "🔥": [Flame, "peach"], "💪": [BicepsFlexed, "rose"], "🏃": [Footprints, "sky"], "🚶": [PersonStanding, "sage"],
  "🪑": [Armchair, "butter"], "⚡": [Zap, "butter"], "🦅": [Bird, "sky"], "🦵": [PersonStanding, "peach"],
  "🏋": [Dumbbell, "lavender"], "🍑": [Citrus, "peach"], "🧘": [Wind, "lavender"], "🎯": [Target, "rose"],
  "🚴": [Bike, "sky"], "🏊": [Waves, "sky"], "🥊": [HandFist, "rose"], "🤸": [Accessibility, "peach"],
  "⛰": [Mountain, "sage"], "❤": [HeartPulse, "rose"],
  // cycle and time of day
  "🌙": [Moon, "rose"], "🌱": [Sprout, "sage"], "☀": [Sun, "butter"], "🍂": [TreeDeciduous, "lavender"],
  "🌤": [CloudSun, "butter"], "🌸": [Flower2, "rose"], "🌿": [Leaf, "sage"],
  // food
  "🥩": [Beef, "rose"], "🫚": [Carrot, "peach"], "🍫": [Candy, "butter"], "🍵": [Coffee, "sage"],
  "🥣": [Soup, "peach"], "🥦": [Salad, "sage"], "🌾": [Wheat, "butter"], "🥚": [Egg, "butter"],
  "🫐": [Grape, "lavender"], "🥗": [LeafyGreen, "sage"], "🫘": [Bean, "peach"], "🍓": [Cherry, "rose"],
  "💧": [Droplet, "sky"], "🐟": [Fish, "sky"], "🥛": [Milk, "sky"],
  // app sections and prompts
  "✨": [Sparkles, "lavender"], "✦": [Sparkle, "lavender"], "📈": [TrendingUp, "lavender"], "⚖": [Scale, "lavender"],
  "💭": [Brain, "lavender"], "📅": [CalendarDays, "sky"], "🗓": [CalendarDays, "sky"], "✏": [Pencil, "lavender"],
  "📏": [Ruler, "peach"], "👋": [Hand, "butter"], "➕": [Plus, "rose"],
};

// "🏋️" and "🏃‍♀️" carry a variation selector / gendered suffix; match on the base character
const baseOf = (emoji: string) => emoji.replace(/️/g, "").split("‍")[0];

/** Icon and tone for an emoji; unknown ones (e.g. from old saved data) fall back to a dumbbell. */
export const glyphFor = (emoji: string): [LucideIcon, Tone] => GLYPHS[baseOf(emoji)] ?? [Dumbbell, "lavender"];
