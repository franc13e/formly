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
  // Glutes
  {id:13,name:"Bulgarian Split Squat",emoji:"🍑",muscle:"Glutes",difficulty:"Intermediate",duration:"30 min",tags:["glutes","quads","single leg"],achieve:"Builds glute and quad strength one leg at a time and evens out side-to-side differences."},
  {id:14,name:"Cable Kickback",emoji:"🍑",muscle:"Glutes",difficulty:"Beginner",duration:"20 min",tags:["glutes","cable","isolation"],achieve:"Targets the glutes directly to build shape and hip extension strength."},
  {id:15,name:"Sumo Squat",emoji:"🏋️",muscle:"Glutes",difficulty:"Beginner",duration:"25 min",tags:["glutes","inner thighs","dumbbell"],achieve:"Works glutes and inner thighs with a wide, hip-friendly stance."},
  {id:16,name:"Step-Ups",emoji:"🦵",muscle:"Glutes",difficulty:"Beginner",duration:"25 min",tags:["glutes","quads","single leg"],achieve:"Strengthens glutes and legs while improving balance and stair-climbing power."},
  // Legs
  {id:17,name:"Goblet Squat",emoji:"🏋️",muscle:"Legs",difficulty:"Beginner",duration:"25 min",tags:["quads","glutes","dumbbell"],achieve:"Teaches a confident, upright squat and builds quad and glute strength."},
  {id:18,name:"Walking Lunges",emoji:"🦵",muscle:"Legs",difficulty:"Intermediate",duration:"25 min",tags:["quads","glutes","single leg"],achieve:"Builds leg strength, balance and coordination with every step."},
  {id:19,name:"Leg Press",emoji:"🦵",muscle:"Legs",difficulty:"Beginner",duration:"30 min",tags:["quads","glutes","machine"],achieve:"Lets you load the legs heavily with back support, building quad and glute strength."},
  {id:20,name:"Calf Raise",emoji:"🦵",muscle:"Legs",difficulty:"Beginner",duration:"15 min",tags:["calves","ankles"],achieve:"Strengthens calves and ankles for running, jumping and everyday stability."},
  // Back
  {id:21,name:"Lat Pulldown",emoji:"💪",muscle:"Back",difficulty:"Beginner",duration:"30 min",tags:["pull","lats","machine"],achieve:"Builds the lats and upper back and is the stepping stone to your first pull-up."},
  {id:22,name:"Seated Cable Row",emoji:"💪",muscle:"Back",difficulty:"Beginner",duration:"30 min",tags:["pull","mid back","cable"],achieve:"Strengthens the mid back and rear shoulders for better posture."},
  {id:23,name:"Dumbbell Row",emoji:"🏋️",muscle:"Back",difficulty:"Beginner",duration:"25 min",tags:["pull","lats","dumbbell"],achieve:"Builds a strong, balanced back one side at a time."},
  {id:24,name:"Back Extension",emoji:"💪",muscle:"Back",difficulty:"Beginner",duration:"20 min",tags:["lower back","glutes","hip hinge"],achieve:"Strengthens the lower back, glutes and hamstrings to support your spine."},
  // Chest
  {id:25,name:"Dumbbell Bench Press",emoji:"🏋️",muscle:"Chest",difficulty:"Beginner",duration:"35 min",tags:["press","chest","dumbbell"],achieve:"Builds chest, shoulder and tricep strength with a natural range for each arm."},
  {id:26,name:"Incline Dumbbell Press",emoji:"🏋️",muscle:"Chest",difficulty:"Intermediate",duration:"30 min",tags:["press","upper chest","dumbbell"],achieve:"Develops the upper chest and front shoulders."},
  {id:27,name:"Chest Fly",emoji:"💪",muscle:"Chest",difficulty:"Beginner",duration:"20 min",tags:["chest","isolation","dumbbell"],achieve:"Isolates the chest muscles to build shape and control through a wide range."},
  {id:28,name:"Dumbbell Floor Press",emoji:"🏋️",muscle:"Chest",difficulty:"Beginner",duration:"25 min",tags:["press","chest","triceps"],achieve:"A shoulder-friendly press that builds chest and tricep strength with no bench needed."},
  // Shoulders
  {id:29,name:"Lateral Raise",emoji:"🎯",muscle:"Shoulders",difficulty:"Beginner",duration:"20 min",tags:["delts","dumbbell","isolation"],achieve:"Builds the side delts for broader, rounder shoulders."},
  {id:30,name:"Arnold Press",emoji:"🎯",muscle:"Shoulders",difficulty:"Intermediate",duration:"25 min",tags:["delts","press","dumbbell"],achieve:"Works all three heads of the shoulder through a long, rotating press."},
  {id:31,name:"Face Pull",emoji:"🎯",muscle:"Shoulders",difficulty:"Beginner",duration:"20 min",tags:["rear delts","posture","cable"],achieve:"Strengthens the rear shoulders and upper back to balance pressing and improve posture."},
  {id:32,name:"Front Raise",emoji:"🎯",muscle:"Shoulders",difficulty:"Beginner",duration:"15 min",tags:["delts","dumbbell","isolation"],achieve:"Strengthens the front of the shoulders for lifting and reaching overhead."},
  // Arms
  {id:33,name:"Bicep Curl",emoji:"💪",muscle:"Arms",difficulty:"Beginner",duration:"20 min",tags:["biceps","dumbbell","isolation"],achieve:"Builds bicep strength and definition for everyday lifting and carrying."},
  {id:34,name:"Tricep Dip",emoji:"💪",muscle:"Arms",difficulty:"Intermediate",duration:"20 min",tags:["triceps","bodyweight","push"],achieve:"Strengthens the triceps using your own bodyweight."},
  {id:35,name:"Hammer Curl",emoji:"💪",muscle:"Arms",difficulty:"Beginner",duration:"20 min",tags:["biceps","forearms","dumbbell"],achieve:"Builds biceps and forearms together for stronger grip and fuller arms."},
  {id:36,name:"Tricep Pushdown",emoji:"💪",muscle:"Arms",difficulty:"Beginner",duration:"20 min",tags:["triceps","cable","isolation"],achieve:"Isolates the triceps for toned, strong arms and better pressing power."},
  {id:37,name:"Overhead Tricep Extension",emoji:"💪",muscle:"Arms",difficulty:"Beginner",duration:"20 min",tags:["triceps","dumbbell","isolation"],achieve:"Works the long head of the triceps through a full stretch."},
  // Core
  {id:38,name:"Dead Bug",emoji:"⚡",muscle:"Core",difficulty:"Beginner",duration:"15 min",tags:["abs","anti-extension","bodyweight"],achieve:"Teaches your core to keep your lower back steady while your arms and legs move."},
  {id:39,name:"Russian Twist",emoji:"🌀",muscle:"Core",difficulty:"Intermediate",duration:"15 min",tags:["obliques","abs","rotation"],achieve:"Strengthens the obliques and rotational control."},
  {id:40,name:"Side Plank",emoji:"⚡",muscle:"Core",difficulty:"Intermediate",duration:"15 min",tags:["obliques","planks","stability"],achieve:"Builds side-core and hip stability that protects your lower back."},
  {id:41,name:"Bird Dog",emoji:"⚡",muscle:"Core",difficulty:"Beginner",duration:"15 min",tags:["core","balance","back health"],achieve:"Builds deep core and back stability with very little strain on the spine."},
  // Cardio
  {id:42,name:"Cycling Intervals",emoji:"🚴",muscle:"Cardio",difficulty:"Intermediate",duration:"35 min",tags:["cardio","intervals","low impact"],achieve:"Boosts fitness and leg endurance with low-impact bursts of effort."},
  {id:43,name:"Jump Rope",emoji:"⏱️",muscle:"Cardio",difficulty:"Intermediate",duration:"20 min",tags:["cardio","coordination","calves"],achieve:"Raises your heart rate fast while improving coordination and footwork."},
  {id:44,name:"Incline Walk",emoji:"⛰️",muscle:"Cardio",difficulty:"Beginner",duration:"35 min",tags:["cardio","low impact","treadmill"],achieve:"Steady, low-impact cardio that works glutes and calves and builds endurance."},
  {id:45,name:"Rowing Machine",emoji:"🚣",muscle:"Cardio",difficulty:"Intermediate",duration:"30 min",tags:["cardio","full body","low impact"],achieve:"Full-body, low-impact cardio that builds endurance in your legs, back and arms."},
  // Recovery
  {id:46,name:"Mobility Flow",emoji:"🤸",muscle:"Recovery",difficulty:"Beginner",duration:"20 min",tags:["mobility","joints","flexibility"],achieve:"Keeps hips, spine and shoulders moving freely so training feels better."},
  {id:47,name:"Foam Rolling",emoji:"🌀",muscle:"Recovery",difficulty:"Beginner",duration:"15 min",tags:["recovery","soreness","mobility"],achieve:"Eases muscle tightness and soreness and helps you feel looser after training."},
  {id:48,name:"Gentle Walk",emoji:"🚶",muscle:"Recovery",difficulty:"Beginner",duration:"30 min",tags:["walking","low impact","mood"],achieve:"Light movement that aids recovery, lifts mood and can ease cramps and bloating."},
  {id:49,name:"Stretch & Breathe",emoji:"🌬️",muscle:"Recovery",difficulty:"Beginner",duration:"20 min",tags:["stretching","breathing","relaxation"],achieve:"Calms your nervous system, releases tension and helps you unwind."},
];
export const MUSCLES: string[]=["All","Glutes","Legs","Back","Chest","Shoulders","Arms","Core","Cardio","Recovery"];
export const DIFF_COLOR: Record<Difficulty, {bg:string;text:string}>={Beginner:{bg:C.sage,text:ACCENT.fiber.text},Intermediate:{bg:C.butter,text:ACCENT.carbs.text},Advanced:{bg:C.rose,text:ACCENT.protein.text}};

/** Muscle groups offered when creating your own workout. */
export const WORKOUT_MUSCLE_GROUPS: string[]=["Full body","Chest","Back","Legs","Glutes","Arms","Shoulders","Core","Cardio","Recovery"];
/** Icons (stored as emoji, drawn by `Glyph`) offered in the custom workout icon picker. */
export const WORKOUT_ICONS: [emoji: string, label: string][]=[
  ["🏋️","Weights"],["💪","Strength"],["🏃","Running"],["🚶","Walking"],["🦵","Legs"],["🍑","Glutes"],["⚡","Core"],["🔥","HIIT"],
  ["🧘","Yoga"],["🎯","Shoulders"],["🚴","Cycling"],["🏊","Swimming"],["🥊","Boxing"],["🤸","Gymnastics"],["⛰️","Hiking"],["❤️","Cardio"],
];
