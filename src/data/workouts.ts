import { C, ACCENT } from "../theme";
import type { Difficulty, Workout } from "../types";

// ─── Workout data ─────────────────────────────────────────────────────────────
export const ALL_WORKOUTS: Workout[] = [
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
export const MUSCLES: string[]=["All","Chest","Back","Legs","Glutes","Shoulders","Core","Cardio","Recovery"];
export const DIFF_COLOR: Record<Difficulty, {bg:string;text:string}>={Beginner:{bg:C.sage,text:ACCENT.fiber.text},Intermediate:{bg:C.butter,text:ACCENT.carbs.text},Advanced:{bg:C.rose,text:ACCENT.protein.text}};
