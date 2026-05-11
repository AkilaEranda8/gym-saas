-- ──────────────────────────────────────────────────────────────
-- V19c: Nutrition Plan Templates Seed
-- gym_id = NULL, is_template = true
-- ──────────────────────────────────────────────────────────────

DO $$
DECLARE
    plan1_id UUID := gen_random_uuid();
    plan2_id UUID := gen_random_uuid();
    plan3_id UUID := gen_random_uuid();
    plan4_id UUID := gen_random_uuid();

    m1_id UUID; m2_id UUID; m3_id UUID; m4_id UUID; m5_id UUID;
    m6_id UUID; m7_id UUID; m8_id UUID; m9_id UUID; m10_id UUID;
    m11_id UUID; m12_id UUID; m13_id UUID; m14_id UUID; m15_id UUID;
    m16_id UUID; m17_id UUID; m18_id UUID; m19_id UUID; m20_id UUID;

    fi_chicken UUID; fi_eggs UUID; fi_milk UUID; fi_oats UUID;
    fi_banana UUID; fi_rice UUID; fi_salmon UUID; fi_pb UUID;
    fi_mass UUID; fi_protein_bar UUID; fi_whey UUID; fi_tempeh UUID;
    fi_lentils UUID; fi_tofu UUID; fi_quinoa UUID; fi_sweet_potato UUID;
    fi_broccoli UUID; fi_spinach UUID; fi_almonds UUID; fi_bread UUID;
    fi_dhal UUID; fi_string_hoppers UUID; fi_avocado UUID;
BEGIN

    -- Lookup food item IDs
    SELECT id INTO fi_chicken       FROM food_items WHERE name = 'Chicken Breast'      AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_eggs          FROM food_items WHERE name = 'Eggs (whole)'        AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_milk          FROM food_items WHERE name = 'Full Fat Milk'       AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_oats          FROM food_items WHERE name = 'Oats'                AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_banana        FROM food_items WHERE name = 'Banana'              AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_rice          FROM food_items WHERE name = 'White Rice (cooked)' AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_salmon        FROM food_items WHERE name = 'Salmon'              AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_pb            FROM food_items WHERE name = 'Peanut Butter'       AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_mass          FROM food_items WHERE name = 'Mass Gainer'         AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_protein_bar   FROM food_items WHERE name = 'Protein Bar'         AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_whey          FROM food_items WHERE name = 'Whey Protein Powder' AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_tempeh        FROM food_items WHERE name = 'Tempeh'              AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_lentils       FROM food_items WHERE name = 'Lentils (cooked)'    AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_tofu          FROM food_items WHERE name = 'Tofu (firm)'         AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_quinoa        FROM food_items WHERE name = 'Quinoa (cooked)'     AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_sweet_potato  FROM food_items WHERE name = 'Sweet Potato'        AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_broccoli      FROM food_items WHERE name = 'Broccoli'            AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_spinach       FROM food_items WHERE name = 'Spinach'             AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_almonds       FROM food_items WHERE name = 'Almonds'             AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_bread         FROM food_items WHERE name = 'Whole Wheat Bread'   AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_dhal          FROM food_items WHERE name = 'Dhal (cooked)'       AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_string_hoppers FROM food_items WHERE name = 'String Hoppers'     AND gym_id IS NULL LIMIT 1;
    SELECT id INTO fi_avocado       FROM food_items WHERE name = 'Avocado'             AND gym_id IS NULL LIMIT 1;

    -- ── TEMPLATE 1: Weight Loss Cut ─────────────────────────────
    INSERT INTO nutrition_plans (id, gym_id, name, description, goal, calories_per_day, protein_g, carbs_g, fat_g, fiber_g, water_ml, meals_per_day, duration_weeks, is_template, is_active, tags, notes)
    VALUES (plan1_id, NULL, 'Weight Loss Cut', 'Calorie deficit plan focused on fat loss while preserving muscle mass.', 'WEIGHT_LOSS', 1800, 150, 150, 60, 25, 2500, 5, 8, true, true,
            ARRAY['cut','fat-loss','deficit'], 'High protein to preserve muscle. Moderate carbs for energy. Low fat.');

    m1_id := gen_random_uuid(); m2_id := gen_random_uuid(); m3_id := gen_random_uuid(); m4_id := gen_random_uuid(); m5_id := gen_random_uuid();

    INSERT INTO meal_templates (id, gym_id, plan_id, meal_number, name, time_of_day, calories, protein_g, carbs_g, fat_g, description)
    VALUES
      (m1_id, NULL, plan1_id, 1, 'Breakfast',    'BREAKFAST',    380, 30.0, 40.0, 8.0,  'Oats with eggs and milk'),
      (m2_id, NULL, plan1_id, 2, 'Mid-Morning',  'MID_MORNING',  200, 15.0, 20.0, 6.0,  'Fruit and almonds'),
      (m3_id, NULL, plan1_id, 3, 'Lunch',        'LUNCH',        500, 45.0, 40.0, 12.0, 'Chicken with rice and salad'),
      (m4_id, NULL, plan1_id, 4, 'Post-Workout', 'POST_WORKOUT', 250, 30.0, 25.0, 3.0,  'Protein shake'),
      (m5_id, NULL, plan1_id, 5, 'Dinner',       'DINNER',       470, 35.0, 25.0, 18.0, 'Salmon with vegetables');

    INSERT INTO meal_food_items (gym_id, meal_id, food_item_id, quantity_g, order_index)
    VALUES
      (NULL, m1_id, fi_oats, 80, 0), (NULL, m1_id, fi_eggs, 120, 1), (NULL, m1_id, fi_milk, 200, 2),
      (NULL, m2_id, fi_banana, 100, 0), (NULL, m2_id, fi_almonds, 28, 1),
      (NULL, m3_id, fi_chicken, 200, 0), (NULL, m3_id, fi_rice, 150, 1), (NULL, m3_id, fi_broccoli, 100, 2),
      (NULL, m4_id, fi_whey, 30, 0),
      (NULL, m5_id, fi_salmon, 180, 0), (NULL, m5_id, fi_spinach, 150, 1), (NULL, m5_id, fi_broccoli, 100, 2);

    -- ── TEMPLATE 2: Muscle Gain Bulk ────────────────────────────
    INSERT INTO nutrition_plans (id, gym_id, name, description, goal, calories_per_day, protein_g, carbs_g, fat_g, fiber_g, water_ml, meals_per_day, duration_weeks, is_template, is_active, tags, notes)
    VALUES (plan2_id, NULL, 'Muscle Gain Bulk', 'High calorie surplus plan to maximize muscle hypertrophy.', 'MUSCLE_GAIN', 3200, 200, 350, 90, 30, 3000, 6, 12, true, true,
            ARRAY['bulk','muscle','mass-gain'], 'Calorie surplus with high protein and carbs. Essential for muscle growth.');

    m6_id := gen_random_uuid(); m7_id := gen_random_uuid(); m8_id := gen_random_uuid();
    m9_id := gen_random_uuid(); m10_id := gen_random_uuid(); m11_id := gen_random_uuid();

    INSERT INTO meal_templates (id, gym_id, plan_id, meal_number, name, time_of_day, calories, protein_g, carbs_g, fat_g, description)
    VALUES
      (m6_id,  NULL, plan2_id, 1, 'Breakfast',    'BREAKFAST',    650, 35.0, 80.0, 18.0, 'Rice with eggs, banana and milk'),
      (m7_id,  NULL, plan2_id, 2, 'Mid-Morning',  'MID_MORNING',  420, 28.0, 45.0, 12.0, 'Peanut butter toast and protein'),
      (m8_id,  NULL, plan2_id, 3, 'Lunch',        'LUNCH',        800, 55.0, 90.0, 20.0, 'Large chicken rice with dal'),
      (m9_id,  NULL, plan2_id, 4, 'Pre-Workout',  'PRE_WORKOUT',  330, 15.0, 60.0,  5.0, 'Banana and oats'),
      (m10_id, NULL, plan2_id, 5, 'Post-Workout', 'POST_WORKOUT', 480, 42.0, 55.0,  8.0, 'Protein shake with mass gainer'),
      (m11_id, NULL, plan2_id, 6, 'Dinner',       'DINNER',       520, 45.0, 50.0, 15.0, 'Chicken with rice and vegetables');

    INSERT INTO meal_food_items (gym_id, meal_id, food_item_id, quantity_g, order_index)
    VALUES
      (NULL, m6_id, fi_rice, 200, 0), (NULL, m6_id, fi_eggs, 240, 1), (NULL, m6_id, fi_banana, 100, 2), (NULL, m6_id, fi_milk, 240, 3),
      (NULL, m7_id, fi_bread, 90, 0), (NULL, m7_id, fi_pb, 32, 1), (NULL, m7_id, fi_whey, 30, 2),
      (NULL, m8_id, fi_chicken, 250, 0), (NULL, m8_id, fi_rice, 300, 1), (NULL, m8_id, fi_dhal, 150, 2),
      (NULL, m9_id, fi_banana, 150, 0), (NULL, m9_id, fi_oats, 80, 1),
      (NULL, m10_id, fi_whey, 30, 0), (NULL, m10_id, fi_mass, 100, 1),
      (NULL, m11_id, fi_chicken, 200, 0), (NULL, m11_id, fi_rice, 200, 1), (NULL, m11_id, fi_broccoli, 100, 2);

    -- ── TEMPLATE 3: Lean Maintenance ────────────────────────────
    INSERT INTO nutrition_plans (id, gym_id, name, description, goal, calories_per_day, protein_g, carbs_g, fat_g, fiber_g, water_ml, meals_per_day, duration_weeks, is_template, is_active, tags, notes)
    VALUES (plan3_id, NULL, 'Lean Maintenance', 'Balanced Sri Lankan diet plan for maintaining current physique.', 'MAINTENANCE', 2400, 170, 250, 70, 28, 2500, 5, 8, true, true,
            ARRAY['maintenance','balanced','local'], 'Local Sri Lankan foods included. Balanced macros for body recomposition.');

    m12_id := gen_random_uuid(); m13_id := gen_random_uuid(); m14_id := gen_random_uuid(); m15_id := gen_random_uuid(); m16_id := gen_random_uuid();

    INSERT INTO meal_templates (id, gym_id, plan_id, meal_number, name, time_of_day, calories, protein_g, carbs_g, fat_g, description)
    VALUES
      (m12_id, NULL, plan3_id, 1, 'Breakfast',    'BREAKFAST',    450, 28.0, 55.0, 12.0, 'String hoppers with egg curry'),
      (m13_id, NULL, plan3_id, 2, 'Mid-Morning',  'MID_MORNING',  220, 15.0, 22.0,  7.0, 'Yogurt and banana'),
      (m14_id, NULL, plan3_id, 3, 'Lunch',        'LUNCH',        700, 50.0, 75.0, 18.0, 'Red rice with chicken and dhal'),
      (m15_id, NULL, plan3_id, 4, 'Pre-Workout',  'PRE_WORKOUT',  350, 20.0, 45.0,  8.0, 'Sweet potato and protein shake'),
      (m16_id, NULL, plan3_id, 5, 'Dinner',       'DINNER',       680, 57.0, 50.0, 25.0, 'Salmon with vegetables');

    INSERT INTO meal_food_items (gym_id, meal_id, food_item_id, quantity_g, order_index)
    VALUES
      (NULL, m12_id, fi_string_hoppers, 180, 0), (NULL, m12_id, fi_eggs, 120, 1),
      (NULL, m13_id, fi_banana, 100, 0),
      (NULL, m14_id, fi_rice, 250, 0), (NULL, m14_id, fi_chicken, 200, 1), (NULL, m14_id, fi_dhal, 100, 2),
      (NULL, m15_id, fi_sweet_potato, 150, 0), (NULL, m15_id, fi_whey, 30, 1),
      (NULL, m16_id, fi_salmon, 200, 0), (NULL, m16_id, fi_spinach, 100, 1), (NULL, m16_id, fi_broccoli, 100, 2);

    -- ── TEMPLATE 4: Vegan Performance ───────────────────────────
    INSERT INTO nutrition_plans (id, gym_id, name, description, goal, calories_per_day, protein_g, carbs_g, fat_g, fiber_g, water_ml, meals_per_day, duration_weeks, is_template, is_active, tags, allergens, notes)
    VALUES (plan4_id, NULL, 'Vegan Performance', 'High-performance plant-based nutrition plan for active athletes.', 'VEGAN', 2200, 140, 280, 65, 35, 2800, 5, 8, true, true,
            ARRAY['vegan','plant-based','performance'], ARRAY['soy','nuts'],
            'All plant-based ingredients. Tempeh, lentils, tofu and quinoa as primary protein sources.');

    m17_id := gen_random_uuid(); m18_id := gen_random_uuid(); m19_id := gen_random_uuid(); m20_id := gen_random_uuid();

    INSERT INTO meal_templates (id, gym_id, plan_id, meal_number, name, time_of_day, calories, protein_g, carbs_g, fat_g, description)
    VALUES
      (m17_id, NULL, plan4_id, 1, 'Breakfast',    'BREAKFAST',    430, 25.0, 60.0, 10.0, 'Oats with tempeh scramble and banana'),
      (m18_id, NULL, plan4_id, 2, 'Lunch',        'LUNCH',        620, 38.0, 70.0, 18.0, 'Quinoa with tofu and lentils'),
      (m19_id, NULL, plan4_id, 3, 'Pre-Workout',  'PRE_WORKOUT',  340, 18.0, 55.0,  7.0, 'Banana with peanut butter and oats'),
      (m20_id, NULL, plan4_id, 4, 'Post-Workout', 'POST_WORKOUT', 290, 28.0, 40.0,  5.0, 'BCAA and lentil soup'),
      ((gen_random_uuid()), NULL, plan4_id, 5, 'Dinner', 'DINNER', 520, 40.0, 55.0, 18.0, 'Tempeh stir fry with quinoa and vegetables');

    INSERT INTO meal_food_items (gym_id, meal_id, food_item_id, quantity_g, order_index)
    VALUES
      (NULL, m17_id, fi_oats, 80, 0), (NULL, m17_id, fi_tempeh, 100, 1), (NULL, m17_id, fi_banana, 100, 2),
      (NULL, m18_id, fi_quinoa, 200, 0), (NULL, m18_id, fi_tofu, 150, 1), (NULL, m18_id, fi_lentils, 100, 2),
      (NULL, m19_id, fi_banana, 150, 0), (NULL, m19_id, fi_pb, 32, 1), (NULL, m19_id, fi_oats, 60, 2),
      (NULL, m20_id, fi_lentils, 200, 0);

END $$;
