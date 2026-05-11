-- ──────────────────────────────────────────────────────────────
-- V17b: Global Exercise Library (50 exercises, gym_id = NULL)
-- ──────────────────────────────────────────────────────────────

INSERT INTO exercises (id, gym_id, name, description, category, muscle_groups, equipment, difficulty, instructions, tips, is_custom) VALUES

-- CHEST
(gen_random_uuid(), NULL, 'Bench Press',
 'Classic chest compound movement using a barbell.',
 'CHEST', ARRAY['Chest','Triceps','Front Deltoids'], 'BARBELL', 'INTERMEDIATE',
 'Lie flat on bench. Grip bar slightly wider than shoulder-width. Lower to chest, press up explosively.',
 'Keep shoulder blades retracted. Maintain arch in lower back.', false),

(gen_random_uuid(), NULL, 'Incline Bench Press',
 'Upper chest focused press on an inclined bench.',
 'CHEST', ARRAY['Upper Chest','Triceps','Front Deltoids'], 'BARBELL', 'INTERMEDIATE',
 'Set bench to 30-45 degrees. Lower bar to upper chest, press up.',
 'Do not flare elbows excessively. Control the descent.', false),

(gen_random_uuid(), NULL, 'Push-Up',
 'Foundational bodyweight pressing movement.',
 'CHEST', ARRAY['Chest','Triceps','Core'], 'BODYWEIGHT', 'BEGINNER',
 'Start in plank position. Lower chest to floor, push back up keeping body straight.',
 'Keep core tight. Do not let hips sag.', false),

(gen_random_uuid(), NULL, 'Cable Fly',
 'Isolation movement targeting the chest using cables.',
 'CHEST', ARRAY['Chest','Front Deltoids'], 'CABLE', 'INTERMEDIATE',
 'Set cables at chest height. With slight elbow bend, bring hands together in arc.',
 'Focus on the squeeze at the top. Control the stretch.', false),

(gen_random_uuid(), NULL, 'Dumbbell Press',
 'Chest press with dumbbells allowing greater range of motion.',
 'CHEST', ARRAY['Chest','Triceps','Front Deltoids'], 'DUMBBELL', 'BEGINNER',
 'Hold dumbbells at chest level. Press up until arms are extended, lower with control.',
 'Avoid locking elbows at top. Keep wrists neutral.', false),

-- BACK
(gen_random_uuid(), NULL, 'Deadlift',
 'King of all lifts — full posterior chain compound movement.',
 'BACK', ARRAY['Lower Back','Glutes','Hamstrings','Traps'], 'BARBELL', 'ADVANCED',
 'Grip bar just outside legs. Brace core, push floor away, stand tall. Reverse the movement.',
 'Keep bar close to body. Do not round the lower back.', false),

(gen_random_uuid(), NULL, 'Pull-Up',
 'Bodyweight vertical pulling movement.',
 'BACK', ARRAY['Lats','Biceps','Rear Deltoids'], 'BODYWEIGHT', 'INTERMEDIATE',
 'Hang from bar with overhand grip. Pull chest to bar, lower with control.',
 'Initiate with lats, not arms. Full hang at bottom.', false),

(gen_random_uuid(), NULL, 'Barbell Row',
 'Horizontal pulling movement targeting the entire back.',
 'BACK', ARRAY['Middle Back','Lats','Biceps','Rear Deltoids'], 'BARBELL', 'INTERMEDIATE',
 'Hinge at hips, grip bar. Row bar to lower chest, squeeze back, lower with control.',
 'Keep back parallel to floor. Do not use excessive momentum.', false),

(gen_random_uuid(), NULL, 'Lat Pulldown',
 'Machine-based vertical pull for lat width.',
 'BACK', ARRAY['Lats','Biceps'], 'MACHINE', 'BEGINNER',
 'Sit at machine. Pull bar to upper chest with elbows pointing down.',
 'Lean back slightly. Focus on pulling elbows down.', false),

(gen_random_uuid(), NULL, 'Seated Cable Row',
 'Horizontal pull for back thickness using cable.',
 'BACK', ARRAY['Middle Back','Rhomboids','Biceps'], 'CABLE', 'BEGINNER',
 'Sit upright. Pull handle to abdomen, squeeze back at peak contraction.',
 'Do not lean back excessively. Keep chest up.', false),

-- SHOULDERS
(gen_random_uuid(), NULL, 'Overhead Press',
 'Compound shoulder pressing movement.',
 'SHOULDERS', ARRAY['Front Deltoids','Side Deltoids','Triceps','Upper Chest'], 'BARBELL', 'INTERMEDIATE',
 'Hold bar at shoulder height. Press overhead to lockout, lower with control.',
 'Brace core throughout. Do not hyperextend lower back.', false),

(gen_random_uuid(), NULL, 'Dumbbell Lateral Raise',
 'Isolation movement for side deltoid width.',
 'SHOULDERS', ARRAY['Side Deltoids'], 'DUMBBELL', 'BEGINNER',
 'Hold dumbbells at sides. Raise to shoulder height with slight elbow bend.',
 'Lead with elbows. Avoid shrugging.', false),

(gen_random_uuid(), NULL, 'Face Pull',
 'Rear delt and rotator cuff health exercise.',
 'SHOULDERS', ARRAY['Rear Deltoids','Rotator Cuff','Rhomboids'], 'CABLE', 'BEGINNER',
 'Set cable at face height. Pull to face with external rotation, elbows high.',
 'Great for shoulder health and posture.', false),

(gen_random_uuid(), NULL, 'Arnold Press',
 'Dumbbell press with rotation hitting all three delt heads.',
 'SHOULDERS', ARRAY['Front Deltoids','Side Deltoids','Rear Deltoids'], 'DUMBBELL', 'INTERMEDIATE',
 'Start with palms facing you at chin. Rotate and press overhead simultaneously.',
 'Control the rotation. Full range of motion is key.', false),

(gen_random_uuid(), NULL, 'Shrugs',
 'Trap isolation movement.',
 'SHOULDERS', ARRAY['Trapezius'], 'BARBELL', 'BEGINNER',
 'Hold bar at hip level. Elevate shoulders straight up, hold briefly, lower.',
 'Do not roll shoulders. Straight up and down movement.', false),

-- ARMS
(gen_random_uuid(), NULL, 'Barbell Curl',
 'Classic bicep builder.',
 'ARMS', ARRAY['Biceps','Brachialis'], 'BARBELL', 'BEGINNER',
 'Stand with underhand grip. Curl bar to chin, lower with control. Keep elbows fixed.',
 'Do not swing body. Keep upper arms stationary.', false),

(gen_random_uuid(), NULL, 'Tricep Pushdown',
 'Cable-based tricep isolation.',
 'ARMS', ARRAY['Triceps'], 'CABLE', 'BEGINNER',
 'Stand at cable. Push bar down to hip level, fully extend triceps, control return.',
 'Keep elbows at sides. Full extension at bottom.', false),

(gen_random_uuid(), NULL, 'Hammer Curl',
 'Neutral-grip curl targeting brachialis.',
 'ARMS', ARRAY['Biceps','Brachialis','Brachioradialis'], 'DUMBBELL', 'BEGINNER',
 'Hold dumbbells with neutral grip. Curl up keeping thumbs pointing up.',
 'Great for arm thickness. Keep elbows fixed.', false),

(gen_random_uuid(), NULL, 'Skull Crushers',
 'Lying tricep extension for mass.',
 'ARMS', ARRAY['Triceps'], 'BARBELL', 'INTERMEDIATE',
 'Lie on bench. Hold bar over chest, lower bar toward forehead bending elbows.',
 'Keep upper arms vertical. Control the weight.', false),

(gen_random_uuid(), NULL, 'Concentration Curl',
 'Peak bicep contraction movement.',
 'ARMS', ARRAY['Biceps'], 'DUMBBELL', 'BEGINNER',
 'Sit, brace upper arm on inner thigh. Curl dumbbell to shoulder.',
 'Focus on full squeeze at top. Slow and controlled.', false),

-- LEGS
(gen_random_uuid(), NULL, 'Squat',
 'The king of leg exercises — full lower body compound.',
 'LEGS', ARRAY['Quads','Glutes','Hamstrings','Core'], 'BARBELL', 'INTERMEDIATE',
 'Bar on traps. Break at hips and knees simultaneously. Squat to parallel, drive back up.',
 'Keep chest up and knees tracking over toes.', false),

(gen_random_uuid(), NULL, 'Leg Press',
 'Machine-based quad dominant compound.',
 'LEGS', ARRAY['Quads','Glutes','Hamstrings'], 'MACHINE', 'BEGINNER',
 'Sit in machine. Push platform away until legs are extended, lower with control.',
 'Do not lock knees at top. Control the descent.', false),

(gen_random_uuid(), NULL, 'Romanian Deadlift',
 'Hip-hinge hamstring focused movement.',
 'LEGS', ARRAY['Hamstrings','Glutes','Lower Back'], 'BARBELL', 'INTERMEDIATE',
 'Hold bar at hip level. Hinge forward keeping bar close, feel hamstring stretch, drive hips forward.',
 'Slight knee bend throughout. Keep back flat.', false),

(gen_random_uuid(), NULL, 'Leg Extension',
 'Quad isolation machine exercise.',
 'LEGS', ARRAY['Quads'], 'MACHINE', 'BEGINNER',
 'Sit in machine. Extend legs until straight, hold, lower with control.',
 'Full extension at top. Do not use momentum.', false),

(gen_random_uuid(), NULL, 'Calf Raise',
 'Calf isolation for lower leg development.',
 'LEGS', ARRAY['Gastrocnemius','Soleus'], 'MACHINE', 'BEGINNER',
 'Place balls of feet on platform. Rise on tiptoes fully, lower heel below platform.',
 'Full range of motion. Hold at top for squeeze.', false),

-- CORE
(gen_random_uuid(), NULL, 'Plank',
 'Isometric core stability exercise.',
 'CORE', ARRAY['Core','Transverse Abdominis','Shoulders'], 'BODYWEIGHT', 'BEGINNER',
 'Hold push-up position on forearms. Keep body in straight line from head to heels.',
 'Do not let hips rise or sag. Breathe steadily.', false),

(gen_random_uuid(), NULL, 'Crunches',
 'Basic abdominal crunch movement.',
 'CORE', ARRAY['Rectus Abdominis'], 'BODYWEIGHT', 'BEGINNER',
 'Lie on back, knees bent. Lift shoulders off floor contracting abs, lower with control.',
 'Do not pull neck. Focus on abs doing the work.', false),

(gen_random_uuid(), NULL, 'Russian Twist',
 'Rotational core exercise for obliques.',
 'CORE', ARRAY['Obliques','Core'], 'BODYWEIGHT', 'BEGINNER',
 'Sit at 45 degrees, feet elevated. Rotate torso side to side.',
 'Keep back straight. Add weight for more challenge.', false),

(gen_random_uuid(), NULL, 'Leg Raise',
 'Lower ab focused hanging or lying movement.',
 'CORE', ARRAY['Lower Abs','Hip Flexors'], 'BODYWEIGHT', 'INTERMEDIATE',
 'Lie flat or hang from bar. Raise straight legs to 90 degrees, lower with control.',
 'Do not swing. Control the negative.', false),

(gen_random_uuid(), NULL, 'Cable Crunch',
 'Weighted ab crunch using cable machine.',
 'CORE', ARRAY['Rectus Abdominis'], 'CABLE', 'INTERMEDIATE',
 'Kneel at cable. Pull rope down crunching elbows to knees.',
 'Keep hips stationary. Round the spine.', false),

-- CARDIO
(gen_random_uuid(), NULL, 'Treadmill Run',
 'Cardiovascular running on treadmill.',
 'CARDIO', ARRAY['Cardiovascular System','Legs'], 'NONE', 'BEGINNER',
 'Set desired speed and incline. Maintain upright posture while running.',
 'Land midfoot. Keep arms at 90 degrees.', false),

(gen_random_uuid(), NULL, 'Cycling',
 'Stationary bike cardiovascular exercise.',
 'CARDIO', ARRAY['Cardiovascular System','Quads','Glutes'], 'MACHINE', 'BEGINNER',
 'Adjust seat height. Pedal at target cadence maintaining smooth circular motion.',
 'Adjust resistance to keep cadence in target zone.', false),

(gen_random_uuid(), NULL, 'Jump Rope',
 'High-intensity skipping for cardiovascular fitness.',
 'CARDIO', ARRAY['Cardiovascular System','Calves','Shoulders'], 'NONE', 'BEGINNER',
 'Hold handles at hip level. Spin rope with wrists, jump with both feet.',
 'Land on balls of feet. Keep jumps small and controlled.', false),

(gen_random_uuid(), NULL, 'Rowing Machine',
 'Full-body cardiovascular and strength endurance exercise.',
 'CARDIO', ARRAY['Cardiovascular System','Back','Legs','Core'], 'MACHINE', 'BEGINNER',
 'Drive with legs first, then lean back, then pull arms to lower chest. Reverse in same order.',
 'Legs provide 60% of power. Do not round the back.', false),

(gen_random_uuid(), NULL, 'Elliptical',
 'Low-impact cardiovascular machine exercise.',
 'CARDIO', ARRAY['Cardiovascular System','Legs','Glutes'], 'MACHINE', 'BEGINNER',
 'Stand on pedals. Use natural stride motion pushing handles for upper body.',
 'Great for joint-friendly cardio. Vary resistance and incline.', false),

-- FULL_BODY
(gen_random_uuid(), NULL, 'Burpees',
 'High-intensity full-body explosive movement.',
 'FULL_BODY', ARRAY['Full Body','Cardiovascular System'], 'BODYWEIGHT', 'INTERMEDIATE',
 'From standing: squat, jump feet back to plank, push-up, jump feet forward, leap up with arms overhead.',
 'Scale by removing push-up or jump. Keep core tight throughout.', false),

(gen_random_uuid(), NULL, 'Kettlebell Swing',
 'Hip-hinge power movement with kettlebell.',
 'FULL_BODY', ARRAY['Glutes','Hamstrings','Core','Shoulders'], 'KETTLEBELL', 'INTERMEDIATE',
 'Hinge at hips, swing kettlebell back between legs, drive hips forward to swing to shoulder height.',
 'Power comes from hips. Keep back flat.', false),

(gen_random_uuid(), NULL, 'Clean and Press',
 'Olympic-style full body strength and power movement.',
 'FULL_BODY', ARRAY['Full Body','Shoulders','Traps','Glutes'], 'BARBELL', 'ADVANCED',
 'Deadlift bar, then explosively pull to shoulders (clean), then press overhead.',
 'Learn each phase separately before combining.', false),

(gen_random_uuid(), NULL, 'Box Jump',
 'Explosive plyometric jump for power development.',
 'FULL_BODY', ARRAY['Quads','Glutes','Calves','Cardiovascular System'], 'BODYWEIGHT', 'INTERMEDIATE',
 'Stand facing box. Load hips, jump explosively onto box, land softly with bent knees, step down.',
 'Land softly to protect knees. Step down, do not jump down.', false),

(gen_random_uuid(), NULL, 'Turkish Get-Up',
 'Complex ground-to-standing movement with kettlebell.',
 'FULL_BODY', ARRAY['Core','Shoulders','Glutes','Full Body'], 'KETTLEBELL', 'ADVANCED',
 'Lie holding kettlebell. Follow a series of positions to stand, reverse to return to floor.',
 'Master movement without weight first. Keep eyes on bell throughout.', false),

-- FLEXIBILITY
(gen_random_uuid(), NULL, 'Hip Flexor Stretch',
 'Essential stretch for hip flexor tightness from sitting.',
 'FLEXIBILITY', ARRAY['Hip Flexors','Quads'], 'NONE', 'BEGINNER',
 'Kneel on one knee. Drive hip forward until stretch is felt in front of hip.',
 'Keep torso upright. Hold 30-60 seconds each side.', false),

(gen_random_uuid(), NULL, 'Hamstring Stretch',
 'Posterior chain flexibility for lower back health.',
 'FLEXIBILITY', ARRAY['Hamstrings','Lower Back'], 'NONE', 'BEGINNER',
 'Sit or stand. Extend leg, hinge forward keeping back flat until stretch is felt.',
 'Do not round the back. Breathe into the stretch.', false),

(gen_random_uuid(), NULL, 'Cat-Cow Stretch',
 'Spinal mobility exercise for lower back.',
 'FLEXIBILITY', ARRAY['Spine','Core','Back'], 'NONE', 'BEGINNER',
 'On hands and knees. Alternate between arching back (cat) and dropping belly (cow).',
 'Move with breathing. Great for morning routine.', false),

(gen_random_uuid(), NULL, 'Pigeon Pose',
 'Deep hip opener from yoga.',
 'FLEXIBILITY', ARRAY['Glutes','Hip Rotators','Hip Flexors'], 'NONE', 'BEGINNER',
 'From plank, bring one knee forward behind wrist. Lower hips toward floor.',
 'Use a block if hips do not reach floor. Hold 1-2 minutes.', false),

(gen_random_uuid(), NULL, 'Child''s Pose',
 'Restorative yoga pose for back and hip flexibility.',
 'FLEXIBILITY', ARRAY['Lower Back','Hips','Shoulders'], 'NONE', 'BEGINNER',
 'Kneel and sit back on heels. Extend arms forward on floor, rest forehead down.',
 'Breathe deeply. Great for recovery and stress relief.', false),

-- OTHER
(gen_random_uuid(), NULL, 'Foam Rolling',
 'Self-myofascial release for muscle recovery.',
 'OTHER', ARRAY['Full Body'], 'NONE', 'BEGINNER',
 'Place foam roller under target muscle. Slowly roll finding tender spots, pause 20-30 seconds.',
 'Avoid rolling over joints. Spend more time on tight areas.', false),

(gen_random_uuid(), NULL, 'Band Pull Apart',
 'Shoulder health and posture corrective.',
 'OTHER', ARRAY['Rear Deltoids','Rhomboids','Rotator Cuff'], 'RESISTANCE_BAND', 'BEGINNER',
 'Hold band at shoulder height with arms extended. Pull band apart until hands are at sides.',
 'Keep arms straight. Squeeze shoulder blades together.', false),

(gen_random_uuid(), NULL, 'Face Pulls with Band',
 'Rotator cuff and rear delt strengthening.',
 'OTHER', ARRAY['Rear Deltoids','Rotator Cuff'], 'RESISTANCE_BAND', 'BEGINNER',
 'Anchor band at face height. Pull toward face with external rotation, elbows high.',
 'Great warm-up and rehab movement.', false),

(gen_random_uuid(), NULL, 'Glute Bridge',
 'Glute activation and hip extension exercise.',
 'OTHER', ARRAY['Glutes','Hamstrings','Core'], 'BODYWEIGHT', 'BEGINNER',
 'Lie on back, knees bent. Drive hips up squeezing glutes at top, lower with control.',
 'Squeeze glutes hard at top. Can add weight on hips.', false),

(gen_random_uuid(), NULL, 'Wall Sit',
 'Isometric quad endurance exercise.',
 'OTHER', ARRAY['Quads','Glutes'], 'BODYWEIGHT', 'BEGINNER',
 'Back against wall, lower until thighs are parallel to floor. Hold position.',
 'Keep knees at 90 degrees. Do not let knees cave in.', false);
