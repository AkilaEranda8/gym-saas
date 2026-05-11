-- ──────────────────────────────────────────────────────────────
-- V17c: Workout Plan Templates (gym_id = NULL = system templates)
-- References exercise IDs from V17b by name lookup
-- ──────────────────────────────────────────────────────────────

DO $$
DECLARE
  plan1_id UUID := gen_random_uuid();
  plan2_id UUID := gen_random_uuid();
  plan3_id UUID := gen_random_uuid();
  plan4_id UUID := gen_random_uuid();

  day1_id UUID; day2_id UUID; day3_id UUID;
  day4_id UUID; day5_id UUID; day6_id UUID;

  ex_squat UUID; ex_bench UUID; ex_row UUID;
  ex_ohp UUID; ex_deadlift UUID; ex_plank UUID;
  ex_treadmill UUID; ex_burpees UUID; ex_jump_rope UUID;
  ex_incline UUID; ex_cable_fly UUID; ex_lat_pd UUID;
  ex_leg_press UUID; ex_rdl UUID; ex_leg_ext UUID;
  ex_pullup UUID; ex_pushup UUID; ex_barbell_curl UUID;
  ex_tricep_pd UUID; ex_lateral_raise UUID;
  ex_elliptical UUID; ex_cycling UUID; ex_rowing_m UUID;
  ex_kb_swing UUID; ex_dumbbell_press UUID;

BEGIN
  -- Look up exercise IDs by name (global, is_custom = false)
  SELECT id INTO ex_squat        FROM exercises WHERE name = 'Squat'               AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_bench        FROM exercises WHERE name = 'Bench Press'          AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_row          FROM exercises WHERE name = 'Barbell Row'          AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_ohp          FROM exercises WHERE name = 'Overhead Press'       AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_deadlift     FROM exercises WHERE name = 'Deadlift'             AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_plank        FROM exercises WHERE name = 'Plank'                AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_treadmill    FROM exercises WHERE name = 'Treadmill Run'        AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_burpees      FROM exercises WHERE name = 'Burpees'              AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_jump_rope    FROM exercises WHERE name = 'Jump Rope'            AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_incline      FROM exercises WHERE name = 'Incline Bench Press'  AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_cable_fly    FROM exercises WHERE name = 'Cable Fly'            AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_lat_pd       FROM exercises WHERE name = 'Lat Pulldown'         AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_leg_press    FROM exercises WHERE name = 'Leg Press'            AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_rdl          FROM exercises WHERE name = 'Romanian Deadlift'    AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_leg_ext      FROM exercises WHERE name = 'Leg Extension'        AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_pullup       FROM exercises WHERE name = 'Pull-Up'              AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_pushup       FROM exercises WHERE name = 'Push-Up'              AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_barbell_curl FROM exercises WHERE name = 'Barbell Curl'         AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_tricep_pd    FROM exercises WHERE name = 'Tricep Pushdown'      AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_lateral_raise FROM exercises WHERE name = 'Dumbbell Lateral Raise' AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_elliptical   FROM exercises WHERE name = 'Elliptical'           AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_cycling      FROM exercises WHERE name = 'Cycling'              AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_rowing_m     FROM exercises WHERE name = 'Rowing Machine'       AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_kb_swing     FROM exercises WHERE name = 'Kettlebell Swing'     AND is_custom = false AND gym_id IS NULL;
  SELECT id INTO ex_dumbbell_press FROM exercises WHERE name = 'Dumbbell Press'     AND is_custom = false AND gym_id IS NULL;

  -- ────────────────────────────────────────────────────────────
  -- TEMPLATE 1: Beginner Full Body (3x/week, 4 weeks)
  -- ────────────────────────────────────────────────────────────
  INSERT INTO workout_plans (id, gym_id, created_by, name, description, goal, level,
      days_per_week, duration_weeks, duration_minutes, is_template, tags, equipment_needed)
  VALUES (plan1_id, NULL, 'SYSTEM', 'Beginner Full Body',
      'A 3-day full body routine designed for beginners. Builds a solid foundation of strength and movement patterns.',
      'GENERAL_FITNESS', 'BEGINNER', 3, 4, 50, true,
      ARRAY['beginner','full-body','3-day'], ARRAY['Barbell','Bodyweight']);

  -- Day 1: Monday - Full Body
  day1_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day1_id, NULL, plan1_id, 1, 'Day 1 - Full Body A', 'Full Body', 50);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day1_id, ex_squat,    0, 3, '5',    120),
         (NULL, day1_id, ex_bench,    1, 3, '5',    120),
         (NULL, day1_id, ex_row,      2, 3, '5',    120),
         (NULL, day1_id, ex_plank,    3, 3, '30s',  60);

  -- Day 2: Wednesday - Full Body
  day2_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day2_id, NULL, plan1_id, 2, 'Day 2 - Full Body B', 'Full Body', 50);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day2_id, ex_deadlift, 0, 1, '5',    180),
         (NULL, day2_id, ex_ohp,      1, 3, '5',    120),
         (NULL, day2_id, ex_pullup,   2, 3, 'AMRAP', 120),
         (NULL, day2_id, ex_plank,    3, 3, '30s',  60);

  -- Day 3: Friday - Full Body
  day3_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day3_id, NULL, plan1_id, 3, 'Day 3 - Full Body C', 'Full Body', 50);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day3_id, ex_squat,    0, 3, '5',    120),
         (NULL, day3_id, ex_incline,  1, 3, '5',    120),
         (NULL, day3_id, ex_lat_pd,   2, 3, '8-10', 90),
         (NULL, day3_id, ex_plank,    3, 3, '30s',  60);

  -- ────────────────────────────────────────────────────────────
  -- TEMPLATE 2: Weight Loss Cardio (4x/week, 8 weeks)
  -- ────────────────────────────────────────────────────────────
  INSERT INTO workout_plans (id, gym_id, created_by, name, description, goal, level,
      days_per_week, duration_weeks, duration_minutes, is_template, tags, equipment_needed)
  VALUES (plan2_id, NULL, 'SYSTEM', 'Weight Loss Cardio Program',
      'A high-frequency cardio and circuit training program for maximum fat burning over 8 weeks.',
      'WEIGHT_LOSS', 'BEGINNER', 4, 8, 45, true,
      ARRAY['weight-loss','cardio','beginner','4-day'], ARRAY['Bodyweight','Machine']);

  -- Day 1: Cardio + Core
  day1_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day1_id, NULL, plan2_id, 1, 'Day 1 - Cardio & Core', 'Cardio + Core', 40);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day1_id, ex_treadmill, 0, 1, '20 min', 0),
         (NULL, day1_id, ex_plank,     1, 4, '30s',    45),
         (NULL, day1_id, ex_burpees,   2, 3, '10',     60);

  -- Day 2: Circuit Training
  day2_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day2_id, NULL, plan2_id, 2, 'Day 2 - Full Body Circuit', 'Full Body', 45);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day2_id, ex_pushup,   0, 4, '15',    30),
         (NULL, day2_id, ex_squat,    1, 4, '20',    30),
         (NULL, day2_id, ex_burpees,  2, 4, '10',    45),
         (NULL, day2_id, ex_jump_rope,3, 4, '1 min', 30);

  -- Day 3: Steady State Cardio
  day3_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day3_id, NULL, plan2_id, 3, 'Day 3 - Steady State Cardio', 'Cardio', 40);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day3_id, ex_cycling,  0, 1, '25 min', 0),
         (NULL, day3_id, ex_rowing_m, 1, 1, '10 min', 120),
         (NULL, day3_id, ex_elliptical, 2, 1, '10 min', 0);

  -- Day 4: HIIT
  day4_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day4_id, NULL, plan2_id, 4, 'Day 4 - HIIT', 'HIIT', 35);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day4_id, ex_jump_rope, 0, 6, '30s on/30s off', 30),
         (NULL, day4_id, ex_burpees,   1, 5, '10',   60),
         (NULL, day4_id, ex_kb_swing,  2, 4, '15',   45);

  -- ────────────────────────────────────────────────────────────
  -- TEMPLATE 3: Push Pull Legs (6x/week, 12 weeks)
  -- ────────────────────────────────────────────────────────────
  INSERT INTO workout_plans (id, gym_id, created_by, name, description, goal, level,
      days_per_week, duration_weeks, duration_minutes, is_template, tags, equipment_needed)
  VALUES (plan3_id, NULL, 'SYSTEM', 'Push Pull Legs (PPL)',
      'Classic 6-day Push/Pull/Legs split for intermediate lifters focused on muscle hypertrophy.',
      'MUSCLE_GAIN', 'INTERMEDIATE', 6, 12, 70, true,
      ARRAY['ppl','muscle-gain','intermediate','6-day'], ARRAY['Barbell','Dumbbell','Cable','Machine']);

  -- Day 1: Push (Chest/Shoulders/Triceps)
  day1_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day1_id, NULL, plan3_id, 1, 'Push Day A', 'Chest / Shoulders / Triceps', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day1_id, ex_bench,       0, 4, '6-8',   180),
         (NULL, day1_id, ex_incline,     1, 3, '8-10',  120),
         (NULL, day1_id, ex_ohp,         2, 3, '8-10',  120),
         (NULL, day1_id, ex_cable_fly,   3, 3, '12-15', 90),
         (NULL, day1_id, ex_lateral_raise,4, 3, '15-20', 60),
         (NULL, day1_id, ex_tricep_pd,   5, 3, '12-15', 60);

  -- Day 2: Pull (Back/Biceps)
  day2_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day2_id, NULL, plan3_id, 2, 'Pull Day A', 'Back / Biceps', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day2_id, ex_deadlift,    0, 3, '5',     180),
         (NULL, day2_id, ex_pullup,      1, 3, '6-8',   120),
         (NULL, day2_id, ex_row,         2, 3, '8-10',  120),
         (NULL, day2_id, ex_lat_pd,      3, 3, '10-12', 90),
         (NULL, day2_id, ex_barbell_curl,4, 3, '10-12', 60);

  -- Day 3: Legs
  day3_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day3_id, NULL, plan3_id, 3, 'Leg Day A', 'Quads / Hamstrings / Calves', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day3_id, ex_squat,    0, 4, '6-8',   180),
         (NULL, day3_id, ex_leg_press, 1, 3, '10-12', 120),
         (NULL, day3_id, ex_rdl,      2, 3, '8-10',  120),
         (NULL, day3_id, ex_leg_ext,  3, 3, '12-15', 90),
         (NULL, day3_id, ex_plank,    4, 3, '45s',   60);

  -- Days 4-6 mirror Days 1-3 (different day_number)
  day4_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day4_id, NULL, plan3_id, 4, 'Push Day B', 'Chest / Shoulders / Triceps', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day4_id, ex_dumbbell_press,0, 4, '8-10',  120),
         (NULL, day4_id, ex_incline,     1, 3, '10-12', 90),
         (NULL, day4_id, ex_ohp,         2, 3, '8-10',  120),
         (NULL, day4_id, ex_cable_fly,   3, 4, '12-15', 60),
         (NULL, day4_id, ex_lateral_raise,4, 4, '15-20', 45),
         (NULL, day4_id, ex_tricep_pd,   5, 4, '12-15', 45);

  day5_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day5_id, NULL, plan3_id, 5, 'Pull Day B', 'Back / Biceps', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day5_id, ex_pullup,      0, 4, 'AMRAP', 120),
         (NULL, day5_id, ex_row,         1, 4, '8-10',  120),
         (NULL, day5_id, ex_lat_pd,      2, 3, '10-12', 90),
         (NULL, day5_id, ex_barbell_curl,3, 4, '10-12', 60);

  day6_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day6_id, NULL, plan3_id, 6, 'Leg Day B', 'Quads / Hamstrings / Calves', 70);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds)
  VALUES (NULL, day6_id, ex_squat,    0, 4, '8-10',  180),
         (NULL, day6_id, ex_leg_press, 1, 4, '12-15', 90),
         (NULL, day6_id, ex_rdl,      2, 3, '10-12', 90),
         (NULL, day6_id, ex_leg_ext,  3, 4, '15',    60);

  -- ────────────────────────────────────────────────────────────
  -- TEMPLATE 4: Strength Program 5x5 (5x/week, 12 weeks)
  -- ────────────────────────────────────────────────────────────
  INSERT INTO workout_plans (id, gym_id, created_by, name, description, goal, level,
      days_per_week, duration_weeks, duration_minutes, is_template, tags, equipment_needed)
  VALUES (plan4_id, NULL, 'SYSTEM', 'Strength Program (5x5)',
      'A classic 5-day strength program based on 5x5 linear progression. Best for intermediate-advanced lifters chasing strength.',
      'STRENGTH', 'ADVANCED', 5, 12, 60, true,
      ARRAY['strength','5x5','advanced','5-day','powerlifting'], ARRAY['Barbell']);

  -- Day 1: Squat + Press
  day1_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day1_id, NULL, plan4_id, 1, 'Day 1 - Squat + Press', 'Legs + Push', 60);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds, weight_note)
  VALUES (NULL, day1_id, ex_squat, 0, 5, '5', 300, 'Add 2.5kg each session'),
         (NULL, day1_id, ex_bench, 1, 5, '5', 180, 'Add 2.5kg each session'),
         (NULL, day1_id, ex_row,   2, 5, '5', 180, 'Add 2.5kg each session');

  -- Day 2: Squat + OHP
  day2_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day2_id, NULL, plan4_id, 2, 'Day 2 - Squat + OHP', 'Legs + Shoulders', 60);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds, weight_note)
  VALUES (NULL, day2_id, ex_squat,    0, 5, '5', 300, 'Add 2.5kg each session'),
         (NULL, day2_id, ex_ohp,      1, 5, '5', 180, 'Add 2.5kg each session'),
         (NULL, day2_id, ex_deadlift, 2, 1, '5', 300, 'Add 5kg each session');

  -- Day 3: Squat + Press
  day3_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day3_id, NULL, plan4_id, 3, 'Day 3 - Squat + Press', 'Legs + Push', 60);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds, weight_note)
  VALUES (NULL, day3_id, ex_squat, 0, 5, '5', 300, 'Add 2.5kg each session'),
         (NULL, day3_id, ex_bench, 1, 5, '5', 180, 'Add 2.5kg each session'),
         (NULL, day3_id, ex_row,   2, 5, '5', 180, 'Add 2.5kg each session');

  -- Day 4: Squat + OHP
  day4_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day4_id, NULL, plan4_id, 4, 'Day 4 - Squat + OHP', 'Legs + Shoulders', 60);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds, weight_note)
  VALUES (NULL, day4_id, ex_squat, 0, 5, '5', 300, 'Add 2.5kg each session'),
         (NULL, day4_id, ex_ohp,   1, 5, '5', 180, 'Add 2.5kg each session'),
         (NULL, day4_id, ex_row,   2, 5, '5', 180, 'Add 2.5kg each session');

  -- Day 5: Deadlift Focus
  day5_id := gen_random_uuid();
  INSERT INTO workout_days (id, gym_id, plan_id, day_number, name, focus, estimated_minutes)
  VALUES (day5_id, NULL, plan4_id, 5, 'Day 5 - Deadlift Day', 'Posterior Chain', 60);
  INSERT INTO workout_exercises (gym_id, day_id, exercise_id, order_index, sets, reps, rest_seconds, weight_note)
  VALUES (NULL, day5_id, ex_deadlift, 0, 5, '5', 300, 'Add 5kg each session'),
         (NULL, day5_id, ex_squat,    1, 2, '5', 240, '80% of working weight'),
         (NULL, day5_id, ex_pullup,   2, 3, 'AMRAP', 120, 'Bodyweight');

END $$;
