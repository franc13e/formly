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
  13: {
    cues: [
      "Rest the top of your back foot on a bench, then step the front foot far enough forward that you can drop straight down.",
      "Keep your chest proud and lower until your back knee hovers just above the floor.",
      "Drive up through the whole front foot, keeping that knee in line with your toes.",
    ],
    mistake: "Standing too close to the bench, so the front heel lifts and the knee shoots forward. Shuffle your front foot out until your shin stays fairly upright, and hold a wall or rack for balance at first.",
    helps: "Split squats build glute and quad strength one leg at a time, which evens out imbalances between sides. They also train balance and hip stability, and need far less weight than a barbell squat to be challenging.",
    videoQuery: "bulgarian split squat proper form",
  },
  14: {
    cues: [
      "Attach an ankle strap at the lowest pulley, hold the frame and hinge forward slightly with a soft standing knee.",
      "Kick the working leg straight back by squeezing your glute, not by arching your back.",
      "Pause briefly at the back, then return slowly without letting the weight stack touch down.",
    ],
    mistake: "Swinging the leg high and arching the lower back to get more range. Use a lighter weight, brace your belly and stop when your hip is fully extended.",
    helps: "Cable kickbacks isolate the glutes with constant tension through the whole movement. They're a great finisher after squats or hip thrusts to build glute shape and strength with little load on your spine.",
    videoQuery: "cable glute kickback proper form",
  },
  15: {
    cues: [
      "Stand with feet wider than your shoulders and toes turned out, holding a dumbbell or kettlebell between your legs.",
      "Push your knees out over your toes as you sit straight down, keeping your chest tall.",
      "Press through your heels and squeeze your glutes to stand back up.",
    ],
    mistake: "Letting the knees cave in towards each other. Turn your toes out a little more, push your knees wide and use a lighter weight until you can keep them tracking.",
    helps: "The wide sumo stance puts more work on your glutes and inner thighs than a regular squat. Many people also find it more comfortable for their hips and easier to keep an upright back.",
    videoQuery: "dumbbell sumo squat proper form",
  },
  16: {
    cues: [
      "Place your whole foot on a sturdy box or bench, about knee height or lower to start.",
      "Lean slightly forward and push through the heel of the top foot to stand up tall.",
      "Lower yourself slowly back down instead of dropping off the box.",
    ],
    mistake: "Pushing off the bottom foot to do the work. Keep the back foot light, as if it's just along for the ride, and lower the box height if you can't step up without bouncing.",
    helps: "Step-ups strengthen your glutes and quads one leg at a time and train balance. They carry over directly to climbing stairs and hills and are easy on the knees when done slowly.",
    videoQuery: "dumbbell step up proper form glutes",
  },
  17: {
    cues: [
      "Hold one dumbbell or kettlebell vertically against your chest, elbows pointing down.",
      "Sit down between your heels with knees tracking over your toes and chest tall.",
      "Let your elbows brush the inside of your knees at the bottom, then drive up through your whole foot.",
    ],
    mistake: "Letting the heels lift or the chest drop forward. Widen your stance slightly, keep the weight close to your chest and only squat as deep as you can with flat feet.",
    helps: "The goblet squat is one of the best ways to learn squatting: holding the weight in front keeps you upright and balanced. It builds quads, glutes and core strength and prepares you for heavier squats.",
    videoQuery: "goblet squat proper form beginners",
  },
  18: {
    cues: [
      "Take a long step forward and lower until both knees are bent to about 90°.",
      "Keep your torso tall and your front knee over your ankle, not past your toes.",
      "Push through your front heel to bring the back foot through into the next step.",
    ],
    mistake: "Taking short steps so the front knee drives far forward and the heel lifts. Lengthen your stride, and do the lunges in place or holding a wall if balance is tricky.",
    helps: "Walking lunges strengthen your quads, glutes and hamstrings while challenging balance and coordination. Training each leg on its own helps even out imbalances and supports healthy knees and hips.",
    videoQuery: "walking lunges proper form",
  },
  19: {
    cues: [
      "Sit with your back and hips flat against the pad, feet hip-width apart in the middle of the platform.",
      "Lower the platform until your knees are bent to about 90°, keeping your lower back on the seat.",
      "Press through your whole foot to straighten your legs without locking the knees.",
    ],
    mistake: "Lowering so deep that your hips curl up off the seat, or snapping the knees straight at the top. Stop where your back stays flat and keep a soft bend at the top.",
    helps: "The leg press lets you train your quads and glutes with heavier weights while your back is supported. It's a beginner-friendly way to build leg strength alongside or instead of barbell squats.",
    videoQuery: "leg press machine proper form",
  },
  20: {
    cues: [
      "Stand with the balls of your feet on a step, heels hanging off, holding a rail for balance.",
      "Rise up as high as you can onto your toes and pause for a second.",
      "Lower slowly until your heels dip just below the step for a gentle stretch.",
    ],
    mistake: "Bouncing quickly through small reps. Slow down, pause at the top and the bottom, and use the full range so the calves do the work.",
    helps: "Calf raises strengthen your calves and the tendons around your ankles, which support running, jumping and walking. Strong calves also help with balance and can reduce the risk of ankle and shin niggles.",
    videoQuery: "calf raise proper form",
  },
  21: {
    cues: [
      "Grip the bar a little wider than your shoulders and tuck your thighs under the pad.",
      "Lean back slightly, lift your chest and pull the bar down to your upper chest by driving your elbows down.",
      "Let the bar rise slowly until your arms are straight and your shoulders stretch upwards.",
    ],
    mistake: "Leaning far back and yanking the bar down with momentum. Choose a weight you can control, keep your torso still and think about pulling with your elbows rather than your hands.",
    helps: "The lat pulldown builds the lats and upper back, which improves posture and makes carrying and lifting easier. It's also the best way to build strength towards your first pull-up.",
    videoQuery: "lat pulldown proper form",
  },
  22: {
    cues: [
      "Sit tall with your feet on the platform, knees slightly bent and arms straight holding the handle.",
      "Pull the handle to your lower ribs, squeezing your shoulder blades together.",
      "Let your arms extend slowly forward again while keeping your chest up.",
    ],
    mistake: "Rocking your whole body back and forth to move the weight. Keep your torso still and upright, and lighten the weight so your back muscles do the pulling.",
    helps: "Seated cable rows strengthen the mid back, rear shoulders and biceps. They counter hours of sitting and screen time by pulling your shoulders back into better posture.",
    videoQuery: "seated cable row proper form",
  },
  23: {
    cues: [
      "Put one hand and knee on a bench, keep your back flat and let the dumbbell hang under your shoulder.",
      "Pull the dumbbell towards your hip, keeping your elbow close to your side.",
      "Lower slowly until your arm is straight, without twisting your torso.",
    ],
    mistake: "Rotating the body and jerking the weight up. Keep your shoulders square to the floor and use a weight you can lift smoothly with a pause at the top.",
    helps: "Dumbbell rows build a strong upper and mid back and help balance out one side against the other. A stronger back supports better posture and protects your shoulders during pressing.",
    videoQuery: "one arm dumbbell row proper form",
  },
  24: {
    cues: [
      "Set the pad just below your hip bones so you can hinge freely, ankles locked under the rollers.",
      "Cross your arms over your chest and lower your upper body by bending at the hips with a neutral back.",
      "Squeeze your glutes to lift until your body is in a straight line, not beyond.",
    ],
    mistake: "Swinging up and over-arching past straight. Stop when your body is in line, move slowly, and think of squeezing your glutes rather than bending your spine.",
    helps: "Back extensions strengthen your lower back, glutes and hamstrings, the muscles that keep you upright and protect your spine when you lift. Done slowly, they're a gentle way to build a resilient back.",
    videoQuery: "back extension hyperextension proper form glutes",
  },
  25: {
    cues: [
      "Lie on a bench with feet flat, shoulder blades pulled back and down, dumbbells above your chest.",
      "Lower the dumbbells to the sides of your chest with elbows at about 45° from your body.",
      "Press up and slightly in until your arms are straight above your shoulders.",
    ],
    mistake: "Flaring the elbows straight out to the sides and letting the shoulders roll forward. Tuck your elbows a little, keep your shoulder blades pinned and choose a weight you can lower with control.",
    helps: "The dumbbell bench press builds chest, shoulder and tricep strength. Using two dumbbells lets each arm move in a natural path and evens out strength between sides.",
    videoQuery: "dumbbell bench press proper form",
  },
  26: {
    cues: [
      "Set the bench to a low incline of about 30° and sit back with your shoulder blades squeezed.",
      "Lower the dumbbells to your upper chest with elbows slightly below shoulder height.",
      "Press up and slightly together, finishing with the weights over your upper chest.",
    ],
    mistake: "Setting the bench too steep so it becomes a shoulder press. Keep the incline low and focus on feeling the upper chest work.",
    helps: "The incline press targets the upper chest and front shoulders, giving the chest a fuller, more balanced look. It also builds pressing strength that carries over to pushing and lifting overhead.",
    videoQuery: "incline dumbbell press proper form",
  },
  27: {
    cues: [
      "Lie on a bench holding dumbbells above your chest, palms facing each other and elbows softly bent.",
      "Open your arms wide in an arc until you feel a stretch across your chest.",
      "Bring the weights back together as if hugging a tree, keeping the same bend in your elbows.",
    ],
    mistake: "Lowering too far or straightening the arms, which strains the shoulders. Keep a fixed soft bend, stop when your elbows are level with the bench and use light weights.",
    helps: "Chest flys isolate the chest muscles through a wide range, building shape and control. They complement presses by working the chest without needing the triceps to keep up.",
    videoQuery: "dumbbell chest fly proper form",
  },
  28: {
    cues: [
      "Lie on the floor with knees bent, feet flat and a dumbbell in each hand above your chest.",
      "Lower until your upper arms gently touch the floor, elbows about 45° from your body.",
      "Pause, then press back up until your arms are straight over your shoulders.",
    ],
    mistake: "Bouncing the elbows off the floor. Lower slowly, let your arms rest for a moment, then press without using momentum.",
    helps: "The floor press builds chest and tricep strength with a shorter range that's kind to the shoulders. It needs no bench, so it's ideal for home workouts.",
    videoQuery: "dumbbell floor press proper form",
  },
  29: {
    cues: [
      "Stand tall with light dumbbells at your sides and a slight bend in your elbows.",
      "Raise your arms out to the sides, leading with your elbows, until they reach shoulder height.",
      "Lower slowly over two to three seconds without letting the weights swing.",
    ],
    mistake: "Using weights that are too heavy, then shrugging and swinging them up. Go lighter than you think, keep your shoulders down away from your ears and stop at shoulder height.",
    helps: "Lateral raises target the side of the shoulders, building width and shape. Strong side delts also support the shoulder joint for pressing and overhead tasks.",
    videoQuery: "dumbbell lateral raise proper form",
  },
  30: {
    cues: [
      "Sit tall with dumbbells in front of your shoulders, palms facing you and elbows in front.",
      "Press up while rotating your palms to face forward, finishing with arms by your ears.",
      "Reverse the rotation as you lower slowly back to the start.",
    ],
    mistake: "Arching the lower back and rushing the rotation. Sit against a backrest, brace your core and move smoothly through the whole turn.",
    helps: "The Arnold press works the front, side and rear of the shoulders in one movement. The longer range builds well-rounded shoulder strength and control.",
    videoQuery: "arnold press proper form",
  },
  31: {
    cues: [
      "Set a rope on a cable at upper chest height or higher and hold the ends with thumbs pointing back.",
      "Pull the rope towards your face, separating the ends and driving your elbows out and back.",
      "Squeeze your shoulder blades together, then let your arms extend slowly.",
    ],
    mistake: "Leaning back and pulling with your lower back or using a heavy weight. Stand tall, keep your ribs down and go light; this move is about control, not load.",
    helps: "Face pulls strengthen the rear shoulders and upper back, which balances out pressing and desk posture. They help keep the shoulders healthy and pulled back.",
    videoQuery: "cable face pull proper form",
  },
  32: {
    cues: [
      "Stand tall holding light dumbbells in front of your thighs, palms facing your body.",
      "Lift one or both arms straight in front of you to shoulder height with a soft elbow.",
      "Lower slowly, keeping your body still the whole time.",
    ],
    mistake: "Swinging the weight up by leaning back. Brace your core, use a lighter weight and stop at shoulder height.",
    helps: "Front raises strengthen the front of the shoulders, which you use when lifting things in front of you and reaching overhead. They add shoulder definition and support pressing strength.",
    videoQuery: "dumbbell front raise proper form",
  },
  33: {
    cues: [
      "Stand tall with dumbbells at your sides, palms facing forward and elbows close to your ribs.",
      "Curl the weights up towards your shoulders without letting your elbows drift forward.",
      "Squeeze at the top, then lower slowly until your arms are straight.",
    ],
    mistake: "Swinging the body to heave the weights up. Keep your elbows pinned and your torso still, and lighten the weight so you can control the way down.",
    helps: "Bicep curls build arm strength and definition that help with carrying shopping, children and anything you lift towards you. Stronger arms also support your pulling exercises.",
    videoQuery: "dumbbell bicep curl proper form",
  },
  34: {
    cues: [
      "Sit on the edge of a sturdy bench or chair, hands next to your hips, fingers pointing forward.",
      "Slide your hips off the edge and lower by bending your elbows straight back to about 90°.",
      "Press through your palms to straighten your arms, keeping your shoulders down.",
    ],
    mistake: "Dipping too low so the shoulders roll forward and pinch. Stop at about 90° at the elbows, keep your chest lifted, and bend your knees to make it easier.",
    helps: "Dips strengthen the triceps, chest and shoulders using just your bodyweight. Bending or straightening your legs makes them easy to adjust as you get stronger.",
    videoQuery: "bench tricep dip proper form",
  },
  35: {
    cues: [
      "Stand tall with dumbbells at your sides, palms facing your body.",
      "Curl the weights up with your thumbs leading, keeping your elbows close to your ribs.",
      "Lower slowly until your arms are straight again.",
    ],
    mistake: "Letting the elbows swing forward and using momentum. Keep your upper arms still and choose a weight you can lower slowly.",
    helps: "Hammer curls work the biceps and the muscles of the forearm together, building grip strength and fuller-looking arms. A strong grip helps in almost every other lift.",
    videoQuery: "hammer curl proper form",
  },
  36: {
    cues: [
      "Stand facing a high cable with a bar or rope, elbows tucked in at your sides.",
      "Push the handle down until your arms are straight, moving only at the elbows.",
      "Let it rise slowly until your forearms are just above parallel, elbows still at your sides.",
    ],
    mistake: "Letting the elbows flare out and leaning over the weight to push it down. Stand tall, pin your elbows and lower the weight until only your forearms move.",
    helps: "Tricep pushdowns isolate the back of the arms, building strength and tone. Stronger triceps help with pushing, pressing and getting up off the floor.",
    videoQuery: "cable tricep pushdown proper form",
  },
  37: {
    cues: [
      "Sit or stand tall holding one dumbbell with both hands straight above your head.",
      "Bend your elbows to lower the weight behind your head, keeping your elbows pointing forward.",
      "Straighten your arms to lift the weight back up without arching your back.",
    ],
    mistake: "Letting the elbows flare wide and the lower back arch. Keep your ribs down, elbows close to your head, and use a lighter weight.",
    helps: "Overhead extensions stretch and strengthen the long head of the triceps, the largest part of the muscle. They build arm strength and shape and support overhead pressing.",
    videoQuery: "dumbbell overhead tricep extension proper form",
  },
  38: {
    cues: [
      "Lie on your back with arms pointing up and knees bent at 90° over your hips.",
      "Press your lower back gently into the floor and breathe out as you lower the opposite arm and leg.",
      "Only go as low as you can without your back lifting, then return and switch sides.",
    ],
    mistake: "Letting the lower back arch off the floor as the leg lowers. Make the movement smaller, keep your knee bent, and slow down.",
    helps: "The dead bug teaches your deep core to keep your spine steady while your arms and legs move, exactly what it needs to do when you lift, run and carry. It's gentle on the back and great for beginners.",
    videoQuery: "dead bug exercise proper form",
  },
  39: {
    cues: [
      "Sit with knees bent and heels on the floor, then lean back slightly with a long, straight spine.",
      "Hold your hands or a light weight at your chest and rotate your ribs to one side.",
      "Return through the centre and rotate to the other side, moving slowly.",
    ],
    mistake: "Rounding the back and just swinging the arms side to side. Keep your chest lifted, turn from your ribs, and keep your feet down until you have the control to lift them.",
    helps: "Russian twists strengthen the obliques and teach controlled rotation, which supports twisting and turning in sport and daily life. Keeping it slow makes it a solid core move without strain.",
    videoQuery: "russian twist proper form",
  },
  40: {
    cues: [
      "Lie on your side with your elbow directly under your shoulder and legs stacked or staggered.",
      "Lift your hips so your body forms a straight line from head to heels.",
      "Hold while breathing steadily, then switch sides.",
    ],
    mistake: "Letting the hips sag towards the floor or roll backwards. Hold for less time with good form, or bend your knees and balance on them to make it easier.",
    helps: "Side planks strengthen the obliques and the hip muscles that keep your pelvis level. They build a stable core that protects your lower back with no equipment.",
    videoQuery: "side plank proper form",
  },
  41: {
    cues: [
      "Start on hands and knees, hands under shoulders and knees under hips, with a flat back.",
      "Reach one arm forward and the opposite leg back until they're level with your body.",
      "Pause without tipping your hips, then return slowly and switch sides.",
    ],
    mistake: "Lifting the leg too high so the lower back arches and the hips twist. Reach long rather than high, and imagine balancing a glass of water on your lower back.",
    helps: "The bird dog builds deep core and back stability and coordination with very little strain on the spine. It's a favourite for healthy backs and a great warm-up before lifting.",
    videoQuery: "bird dog exercise proper form",
  },
  42: {
    cues: [
      "Set the saddle so your knee is just slightly bent at the bottom of each pedal stroke.",
      "Warm up for 5 to 10 minutes at an easy pace before the first hard interval.",
      "During efforts, keep your upper body relaxed and push smoothly rather than bouncing.",
    ],
    mistake: "Setting the saddle too low, which strains the knees. Raise it until your leg is nearly straight at the bottom, and ease off the resistance if your form starts to rock.",
    helps: "Cycling intervals build cardiovascular fitness and leg endurance with very little impact on your joints. Short bursts of effort raise your fitness quickly while easy recoveries keep it manageable.",
    videoQuery: "indoor cycling interval workout bike setup form",
  },
  43: {
    cues: [
      "Hold the handles at hip height with elbows close to your sides.",
      "Turn the rope with your wrists rather than your whole arms.",
      "Jump just high enough to clear the rope and land softly on the balls of your feet.",
    ],
    mistake: "Jumping too high and landing hard on your heels. Keep the jumps small and springy, and start with short rounds and rest so your calves and shins can adapt.",
    helps: "Jump rope raises your heart rate fast and improves coordination, footwork and calf strength. It's a cheap, portable cardio option you can do in short bursts.",
    videoQuery: "jump rope for beginners proper form",
  },
  44: {
    cues: [
      "Start flat for a few minutes, then raise the incline gradually to a level you can sustain.",
      "Walk tall with a slight forward lean from the ankles and a natural arm swing.",
      "Let go of the handrails so your legs and core do the work.",
    ],
    mistake: "Holding on to the rails and leaning back, which takes the work out of your legs. Lower the incline or the speed until you can walk hands-free.",
    helps: "Incline walking raises your heart rate and works your glutes, hamstrings and calves while staying low impact. It's a joint-friendly way to build endurance and suits most fitness levels.",
    videoQuery: "incline treadmill walk proper form",
  },
  45: {
    cues: [
      "Push with your legs first, then lean back slightly, then pull the handle to your lower ribs.",
      "Return in reverse: arms out, lean forward from the hips, then bend your knees.",
      "Keep your back long and your shoulders relaxed throughout the stroke.",
    ],
    mistake: "Pulling mostly with the arms and rounding the back. Follow the order legs, body, arms: most of the power should come from your legs.",
    helps: "Rowing works your legs, back, core and arms together, building endurance with low impact on your joints. It's an efficient way to get fitter and strengthen your posture muscles at the same time.",
    videoQuery: "rowing machine proper technique beginners",
  },
  46: {
    cues: [
      "Move slowly through each joint: hips, spine, shoulders and ankles.",
      "Breathe steadily and stay in a range that feels easy, not forced.",
      "Repeat each movement a few times, letting the range grow a little with each rep.",
    ],
    mistake: "Rushing through the moves or pushing into pain. Mobility is about control: go slower and smaller and let your range build gradually.",
    helps: "A mobility flow keeps your joints moving through their full range, which makes training feel smoother and everyday movement easier. It's a good warm-up or a gentle session on its own.",
    videoQuery: "full body mobility routine beginners",
  },
  47: {
    cues: [
      "Place the roller under the muscle you want to work, such as calves, quads or glutes.",
      "Roll slowly along the muscle and pause for a few breaths on tight spots.",
      "Keep the pressure at a level where you can breathe calmly and relax.",
    ],
    mistake: "Rolling directly on joints, bones or the lower back, or pressing so hard that you tense up. Stay on the muscle, support your weight with your hands and ease off the pressure.",
    helps: "Foam rolling can ease muscle tightness and soreness and help you feel looser after training. It's a simple way to wind down and pay attention to how your body feels.",
    videoQuery: "foam rolling routine for beginners",
  },
  48: {
    cues: [
      "Walk at a relaxed pace where you can chat easily.",
      "Stand tall, relax your shoulders and let your arms swing naturally.",
      "Wear comfortable, supportive shoes and pick a route you enjoy.",
    ],
    mistake: "Turning it into a hard session. Keep the pace easy; the aim is to move gently and feel better afterwards, not to be out of breath.",
    helps: "A gentle walk gets blood flowing, supports recovery and lifts your mood. It can ease cramps and bloating and is a great way to stay active on lower-energy days.",
    videoQuery: "walking posture tips",
  },
  49: {
    cues: [
      "Breathe in through your nose and slowly out through your mouth, making the out-breath longer.",
      "Ease into each stretch until you feel a gentle pull and hold for 20 to 30 seconds.",
      "Let your body soften on each exhale instead of pushing deeper.",
    ],
    mistake: "Bouncing in stretches or holding your breath. Stay still, breathe slowly and back off to a gentle stretch you could hold comfortably.",
    helps: "Gentle stretching with slow breathing helps calm your nervous system, release tension and improve flexibility. It's ideal for winding down in the evening or on rest and period days.",
    videoQuery: "gentle stretching and breathing routine",
  },
};
