import type { FocusArea, OptionCard } from "../types";

// ─── AI COACH ─────────────────────────────────────────────────────────────────
// NOTE: these module-level lists were never used in the original App.jsx: AICoachPanel
// declares its own local copies (with slightly different `sub` texts for ACTIVITY_OPTIONS).
// They are kept here unchanged for completeness.
export const GOAL_CARDS: OptionCard[]=[{id:"lose-fat",emoji:"🔥",label:"Lose Fat",sub:"Caloric deficit + cardio focus"},{id:"build-muscle",emoji:"💪",label:"Build Muscle",sub:"Caloric surplus + progressive overload"},{id:"tone-define",emoji:"✨",label:"Tone & Define",sub:"Slight deficit + strength training"},{id:"endurance",emoji:"🏃",label:"Endurance",sub:"Cardio base + light resistance"},{id:"maintain",emoji:"🌸",label:"Maintain",sub:"Maintenance calories + balanced training"}];
export const ACTIVITY_OPTIONS: OptionCard[]=[{id:"sedentary",emoji:"🪑",label:"Sedentary",sub:"Desk job, little exercise"},{id:"light",emoji:"🚶",label:"Light",sub:"1-3 days/week exercise"},{id:"moderate",emoji:"🏃",label:"Moderate",sub:"3-5 days/week exercise"},{id:"active",emoji:"⚡",label:"Active",sub:"6-7 days/week exercise"},{id:"very-active",emoji:"🔥",label:"Very Active",sub:"Physical job or 2x/day training"}];
export const FOCUS_AREAS: FocusArea[]=[{id:"chest",emoji:"💪",label:"Chest"},{id:"back",emoji:"🦅",label:"Back"},{id:"legs",emoji:"🦵",label:"Legs"},{id:"arms",emoji:"💪",label:"Arms"},{id:"shoulders",emoji:"🏋️",label:"Shoulders"},{id:"core",emoji:"🔥",label:"Core"},{id:"cardio",emoji:"🏃",label:"Cardio"},{id:"glutes",emoji:"🍑",label:"Glutes"}];
