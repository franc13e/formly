import type { WorkoutGuide } from "../types";

// ─── Form guides for the built-in workouts, keyed by workout id ─────────────
export const WORKOUT_GUIDES: Partial<Record<number, WorkoutGuide>> = {
  1: {
    cues: [
      "Hands just wider than your shoulders, fingers spread.",
      "Keep a straight line from head to heels: squeeze your glutes and brace your belly.",
      "Lower your chest towards the floor with elbows angled back about 45°, then press away.",
    ],
    mistake: "Letting the hips sag or flaring the elbows out wide. Brace your core and tuck your elbows; if you can't keep the line, do them on your knees or with hands on a bench.",
    helps: "Push-ups build strength in your chest, shoulders and triceps while training your core to hold a stable plank. You can do them anywhere, and the incline and knee versions let you progress at your own pace.",
    videoQuery: "push up proper form for beginners",
  },
  2: {
    cues: [
      "Feet about shoulder-width apart, toes turned out slightly, bar resting across your upper back.",
      "Take a big breath and brace, then sit your hips back and down with knees tracking over your toes.",
      "Go as deep as you can with a neutral back, then drive up through your whole foot.",
    ],
    mistake: "Knees caving inwards on the way up. Push your knees out in line with your toes and lighten the bar until you can keep them there.",
    helps: "The squat strengthens your quads, glutes and core together, which carries over to everyday moves like standing up, climbing stairs and lifting. Training it with good form also builds strong bones and joints.",
    videoQuery: "barbell back squat proper form",
  },
  3: {
    cues: [
      "Lie on your back, knees bent, feet flat and hip-width apart close to your glutes.",
      "Press through your heels and squeeze your glutes to lift your hips.",
      "Stop when your body makes a straight line from shoulders to knees; pause, then lower slowly.",
    ],
    mistake: "Arching the lower back to lift higher. Tuck your ribs down and stop at the straight line; the squeeze should be in your glutes, not your back.",
    helps: "Glute bridges wake up and strengthen your glutes and hamstrings with no equipment and little strain on your back. Stronger glutes support your hips and lower back in every other lift and in daily life.",
    videoQuery: "glute bridge proper form",
  },
  4: {
    cues: [
      "Warm up for 5 minutes before the first hard interval.",
      "Land softly with bent knees and keep your chest up through every move.",
      "Work hard but controlled, and use the rest periods fully to breathe and reset.",
    ],
    mistake: "Going so fast that form falls apart, like landing stiff-legged or letting the back round. Slow down or switch to a low-impact version (step instead of jump) and keep quality high.",
    helps: "HIIT raises your heart rate in short bursts, improving cardiovascular fitness and stamina in less time than steady cardio. It's a time-efficient way to feel fitter, as long as you balance it with easier days.",
    videoQuery: "HIIT workout proper form beginners",
  },
  5: {
    cues: [
      "Start each pull by drawing your shoulder blades down and back.",
      "Pull your elbows down towards your ribs, keeping your chest lifted.",
      "Lower all the way under control instead of dropping.",
    ],
    mistake: "Swinging or using momentum to get up. Slow the reps down and use a lat pulldown or an assisted band until you can pull with a still body.",
    helps: "Pulling movements strengthen your lats, upper back and biceps, which balances all the pushing we do and supports good posture. A strong back also makes carrying, lifting and other lifts feel safer.",
    videoQuery: "pull up and lat pulldown proper form",
  },
  6: {
    cues: [
      "Move with your breath: inhale to lengthen, exhale to fold or twist.",
      "Keep a soft bend in your knees and elbows instead of locking them.",
      "Only go as deep into each pose as you can while breathing calmly.",
    ],
    mistake: "Forcing a stretch until it hurts. Ease back to a gentle pull, use blocks or a strap, and let range of motion build over time.",
    helps: "A yoga flow improves flexibility and mobility while calming your nervous system, which helps your body recover between harder sessions. It also builds body awareness and balance that carry into other training.",
    videoQuery: "yoga flow for beginners proper alignment",
  },
  7: {
    cues: [
      "Brace your core and squeeze your glutes so your lower back stays neutral.",
      "Press the weights straight up, finishing with arms by your ears.",
      "Lower slowly to shoulder height with elbows slightly in front of your body.",
    ],
    mistake: "Leaning back and arching the lower back to push the weight up. Choose a lighter weight, keep your ribs down, or press seated with back support.",
    helps: "Shoulder work builds strong, stable delts and upper back muscles that support your posture and protect the shoulder joint. It makes overhead tasks easier and improves your strength in other upper-body lifts.",
    videoQuery: "dumbbell shoulder press proper form",
  },
  8: {
    cues: [
      "Elbows under shoulders and a straight line from head to heels.",
      "Gently pull your belly button in and squeeze your glutes.",
      "Breathe steadily and stop the set when your form starts to slip.",
    ],
    mistake: "Letting the hips drop or piking them high. Hold a shorter plank with good form, or drop to your knees, rather than a long one that sags.",
    helps: "Core training builds the deep muscles that keep your spine steady when you lift, run and carry. A stronger core supports better posture and can make everyday movement feel easier.",
    videoQuery: "plank proper form core workout",
  },
  9: {
    cues: [
      "Run at a pace where you can still hold a conversation.",
      "Take short, light steps with your feet landing under your hips.",
      "Stay tall with relaxed shoulders and an easy arm swing.",
    ],
    mistake: "Running too fast so it turns into a hard effort. Slow down, or take walking breaks, until you can talk in full sentences the whole time.",
    helps: "Zone 2 running builds your aerobic base, helping your heart and muscles use oxygen more efficiently. It improves endurance and energy while being gentle enough to do often.",
    videoQuery: "zone 2 running form beginners",
  },
  10: {
    cues: [
      "Rest your upper back on a bench just below your shoulder blades, feet flat and hip-width apart.",
      "Tuck your chin and keep your ribs down, then drive through your heels to lift your hips.",
      "At the top, shins are vertical and your body is flat from shoulders to knees; squeeze, then lower with control.",
    ],
    mistake: "Over-arching the lower back at the top. Keep your ribs down and finish the move with your glutes, not by bending your spine.",
    helps: "Hip thrusts load the glutes directly through their strongest range, which makes them one of the best moves for glute strength and shape. Strong glutes support your hips, knees and lower back.",
    videoQuery: "barbell hip thrust proper form",
  },
  11: {
    cues: [
      "Stand tall with a soft bend in your knees and the weight close to your legs.",
      "Push your hips back and let the weight slide down your thighs, keeping your back flat.",
      "Stop when you feel a stretch in your hamstrings, then squeeze your glutes to stand up.",
    ],
    mistake: "Rounding the back to reach lower. Only go as low as you can with a flat back; for most people that's around the knees or mid-shin.",
    helps: "The Romanian deadlift strengthens your hamstrings, glutes and back muscles and teaches the hip hinge you use whenever you pick something up. It builds a strong back of the body and supports good posture.",
    videoQuery: "romanian deadlift proper form",
  },
  12: {
    cues: [
      "Find a neutral spine and breathe into the sides and back of your ribs.",
      "Draw your lower belly gently in and up before each movement.",
      "Move slowly and with control; quality matters more than the number of reps.",
    ],
    mistake: "Holding your breath or straining your neck during curls. Keep breathing, rest your head if needed, and lead with your core rather than your chin.",
    helps: "Pilates strengthens the deep core muscles that support your spine and pelvis, improving posture and control. It's low-impact, so it pairs well with harder training and recovery days.",
    videoQuery: "pilates core workout proper form beginners",
  },
};
