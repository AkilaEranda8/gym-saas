-- ──────────────────────────────────────────────────────────────
-- V19b: Global Food Database Seed (60 items)
-- gym_id = NULL (global), is_custom = false, is_verified = true
-- ──────────────────────────────────────────────────────────────

INSERT INTO food_items (name, brand, category, serving_size_g, serving_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_custom, is_verified) VALUES

-- PROTEIN (10)
('Chicken Breast',      NULL, 'PROTEIN',      100, 'g', 165, 31.0, 0.0,  3.6,  0.0, false, true),
('Eggs (whole)',        NULL, 'PROTEIN',       60, 'g', 155, 13.0, 1.1, 11.0,  0.0, false, true),
('Canned Tuna',         NULL, 'PROTEIN',       85, 'g', 116, 26.0, 0.0,  0.8,  0.0, false, true),
('Whey Protein Powder', NULL, 'SUPPLEMENTS',   30, 'g', 370, 75.0, 8.0,  5.0,  0.0, false, true),
('Tempeh',              NULL, 'PROTEIN',      100, 'g', 193, 19.0, 9.0, 11.0,  0.0, false, true),
('Lentils (cooked)',    NULL, 'PROTEIN',      100, 'g', 116,  9.0,20.0,  0.4,  8.0, false, true),
('Tofu (firm)',         NULL, 'PROTEIN',      100, 'g',  76,  8.0, 2.0,  4.0,  0.0, false, true),
('Salmon',              NULL, 'PROTEIN',      100, 'g', 208, 20.0, 0.0, 13.0,  0.0, false, true),
('Greek Yogurt',        NULL, 'DAIRY',        170, 'g',  59, 10.0, 3.6,  0.4,  0.0, false, true),
('Cottage Cheese',      NULL, 'DAIRY',        100, 'g',  98, 11.0, 3.4,  4.3,  0.0, false, true),

-- CARBS (10)
('White Rice (cooked)', NULL, 'CARBS',        100, 'g', 130,  2.7,28.2,  0.3,  0.4, false, true),
('Red Rice (cooked)',   NULL, 'CARBS',        100, 'g', 126,  2.6,27.0,  0.9,  0.5, false, true),
('Oats',                NULL, 'GRAINS',        40, 'g', 389, 16.9,66.3,  6.9, 10.6, false, true),
('Sweet Potato',        NULL, 'CARBS',        100, 'g',  86,  1.6,20.1,  0.1,  3.0, false, true),
('Whole Wheat Bread',   NULL, 'GRAINS',        30, 'g', 247, 13.0,41.3,  3.4,  6.0, false, true),
('Banana',              NULL, 'FRUITS',       100, 'g',  89,  1.1,22.8,  0.3,  2.6, false, true),
('Quinoa (cooked)',     NULL, 'GRAINS',       100, 'g', 120,  4.4,21.3,  1.9,  2.8, false, true),
('White Bread',         NULL, 'GRAINS',        30, 'g', 265,  8.9,49.2,  3.2,  2.4, false, true),
('Pasta (cooked)',      NULL, 'CARBS',        100, 'g', 131,  5.0,25.1,  1.1,  1.8, false, true),
('Hopper (plain)',      NULL, 'GRAINS',        50, 'g',  85,  2.0,17.0,  1.0,  0.5, false, true),

-- VEGETABLES (10)
('Spinach',             NULL, 'VEGETABLES',   100, 'g',  23,  2.9, 3.6,  0.4,  2.2, false, true),
('Broccoli',            NULL, 'VEGETABLES',   100, 'g',  34,  2.8, 6.6,  0.4,  2.6, false, true),
('Carrot',              NULL, 'VEGETABLES',   100, 'g',  41,  0.9, 9.6,  0.2,  2.8, false, true),
('Tomato',              NULL, 'VEGETABLES',   100, 'g',  18,  0.9, 3.9,  0.2,  1.2, false, true),
('Cucumber',            NULL, 'VEGETABLES',   100, 'g',  15,  0.7, 3.6,  0.1,  0.5, false, true),
('Cabbage',             NULL, 'VEGETABLES',   100, 'g',  25,  1.3, 5.8,  0.1,  2.5, false, true),
('Leeks',               NULL, 'VEGETABLES',   100, 'g',  61,  1.5,14.2,  0.3,  1.8, false, true),
('Green Beans',         NULL, 'VEGETABLES',   100, 'g',  31,  1.8, 7.1,  0.1,  2.7, false, true),
('Bell Pepper',         NULL, 'VEGETABLES',   100, 'g',  31,  1.0, 6.0,  0.3,  2.1, false, true),
('Eggplant',            NULL, 'VEGETABLES',   100, 'g',  25,  1.0, 5.9,  0.2,  3.0, false, true),

-- FRUITS (5)
('Apple',               NULL, 'FRUITS',       150, 'g',  52,  0.3,13.8,  0.2,  2.4, false, true),
('Mango',               NULL, 'FRUITS',       100, 'g',  60,  0.8,15.0,  0.4,  1.6, false, true),
('Pineapple',           NULL, 'FRUITS',       100, 'g',  50,  0.5,13.1,  0.1,  1.4, false, true),
('Papaya',              NULL, 'FRUITS',       100, 'g',  43,  0.5,11.0,  0.3,  1.7, false, true),
('Watermelon',          NULL, 'FRUITS',       200, 'g',  30,  0.6, 7.6,  0.2,  0.4, false, true),

-- DAIRY (5)
('Full Fat Milk',       NULL, 'DAIRY',        240, 'ml',  61,  3.2, 4.8,  3.3,  0.0, false, true),
('Low Fat Milk',        NULL, 'DAIRY',        240, 'ml',  42,  3.4, 4.9,  1.0,  0.0, false, true),
('Cheddar Cheese',      NULL, 'DAIRY',         30, 'g', 403, 24.9, 1.3, 33.1,  0.0, false, true),
('Butter',              NULL, 'FATS',          14, 'g', 717,  0.9, 0.1, 81.1,  0.0, false, true),
('Yogurt (plain)',      NULL, 'DAIRY',        200, 'g',  59,  3.5, 7.0,  1.5,  0.0, false, true),

-- FATS (5)
('Coconut Oil',         NULL, 'FATS',          14, 'ml', 862,  0.0, 0.0,100.0,  0.0, false, true),
('Olive Oil',           NULL, 'FATS',          14, 'ml', 884,  0.0, 0.0,100.0,  0.0, false, true),
('Almonds',             NULL, 'FATS',           28, 'g', 579, 21.2,21.7, 49.9, 12.5, false, true),
('Peanut Butter',       NULL, 'FATS',           32, 'g', 588, 25.1,20.1, 50.4,  6.0, false, true),
('Avocado',             NULL, 'FATS',          100, 'g', 160,  2.0, 8.5, 14.7,  6.7, false, true),

-- SUPPLEMENTS (5)
('Creatine Monohydrate',NULL, 'SUPPLEMENTS',    5, 'g',   0,  0.0, 0.0,  0.0,  0.0, false, true),
('BCAA Powder',         NULL, 'SUPPLEMENTS',   10, 'g',  20,  5.0, 0.0,  0.0,  0.0, false, true),
('Pre-Workout',         NULL, 'SUPPLEMENTS',   10, 'g',  15,  0.0, 3.0,  0.0,  0.0, false, true),
('Protein Bar',         NULL, 'SUPPLEMENTS',   60, 'g', 350, 20.0,25.0,  7.0,  3.0, false, true),
('Mass Gainer',         NULL, 'SUPPLEMENTS',  100, 'g', 380, 25.0,65.0,  5.0,  2.0, false, true),

-- GRAINS / LOCAL (5)
('Roti (plain)',        NULL, 'GRAINS',         40, 'g', 297,  8.7,61.2,  2.0,  2.4, false, true),
('Dhal (cooked)',       NULL, 'GRAINS',        100, 'g', 116,  9.0,20.0,  0.4,  8.0, false, true),
('String Hoppers',      NULL, 'GRAINS',         60, 'g', 145,  3.0,31.0,  0.5,  1.0, false, true),
('Pittu',               NULL, 'GRAINS',        100, 'g', 120,  3.0,26.0,  0.4,  1.2, false, true),
('Bread (kottu style)', NULL, 'GRAINS',        100, 'g', 180,  5.0,35.0,  3.0,  2.0, false, true);
