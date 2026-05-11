-- ──────────────────────────────────────────────────────────────
-- V19: Nutrition Module — Complete Schema (replaces V6 nutrition)
-- ──────────────────────────────────────────────────────────────

-- Drop old nutrition tables from V6
DROP TABLE IF EXISTS nutrition_items CASCADE;
DROP TABLE IF EXISTS nutrition_plans  CASCADE;

-- ── 1. nutrition_plans ─────────────────────────────────────────
CREATE TABLE nutrition_plans (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_by       VARCHAR(100),
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    goal             VARCHAR(30)  NOT NULL
                     CHECK (goal IN ('WEIGHT_LOSS','MUSCLE_GAIN','MAINTENANCE',
                                     'LEAN_BULK','ENDURANCE','GENERAL_HEALTH',
                                     'REHABILITATION','VEGAN','VEGETARIAN',
                                     'KETO','DIABETIC_FRIENDLY')),
    calories_per_day INTEGER      NOT NULL,
    protein_g        INTEGER      NOT NULL,
    carbs_g          INTEGER      NOT NULL,
    fat_g            INTEGER      NOT NULL,
    fiber_g          INTEGER,
    water_ml         INTEGER      DEFAULT 2000,
    meals_per_day    INTEGER      NOT NULL DEFAULT 3,
    duration_weeks   INTEGER      DEFAULT 4,
    is_template      BOOLEAN      DEFAULT false,
    is_active        BOOLEAN      DEFAULT true,
    tags             TEXT[],
    allergens        TEXT[],
    notes            TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    deleted_at       TIMESTAMP
);

CREATE INDEX idx_nutrition_plans_gym_goal     ON nutrition_plans(gym_id, goal);
CREATE INDEX idx_nutrition_plans_gym_template ON nutrition_plans(gym_id, is_template);

-- ── 2. meal_templates ──────────────────────────────────────────
CREATE TABLE meal_templates (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id            UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id           UUID        NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    meal_number       INTEGER     NOT NULL,
    name              VARCHAR(100) NOT NULL,
    time_of_day       VARCHAR(20)  NOT NULL
                      CHECK (time_of_day IN ('EARLY_MORNING','BREAKFAST','MID_MORNING',
                                             'LUNCH','AFTERNOON_SNACK','PRE_WORKOUT',
                                             'POST_WORKOUT','DINNER','BEFORE_BED')),
    calories          INTEGER,
    protein_g         DECIMAL(6,2),
    carbs_g           DECIMAL(6,2),
    fat_g             DECIMAL(6,2),
    description       TEXT,
    preparation_notes TEXT,
    created_at        TIMESTAMP   DEFAULT NOW(),
    UNIQUE (plan_id, meal_number)
);

CREATE INDEX idx_meal_templates_plan ON meal_templates(plan_id, meal_number);

-- ── 3. food_items ──────────────────────────────────────────────
CREATE TABLE food_items (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id            UUID         REFERENCES gyms(id) ON DELETE CASCADE,
    name              VARCHAR(100) NOT NULL,
    brand             VARCHAR(50),
    category          VARCHAR(30)  NOT NULL
                      CHECK (category IN ('PROTEIN','CARBS','FATS','VEGETABLES',
                                          'FRUITS','DAIRY','GRAINS','BEVERAGES',
                                          'SUPPLEMENTS','CONDIMENTS','OTHER')),
    serving_size_g    DECIMAL(8,2) NOT NULL DEFAULT 100,
    serving_unit      VARCHAR(20)  DEFAULT 'g',
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_per_100g  DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_per_100g    DECIMAL(8,2) NOT NULL DEFAULT 0,
    fat_per_100g      DECIMAL(8,2) NOT NULL DEFAULT 0,
    fiber_per_100g    DECIMAL(8,2) DEFAULT 0,
    sugar_per_100g    DECIMAL(8,2) DEFAULT 0,
    sodium_per_100g   DECIMAL(8,2) DEFAULT 0,
    is_custom         BOOLEAN      DEFAULT false,
    is_verified       BOOLEAN      DEFAULT false,
    created_at        TIMESTAMP    DEFAULT NOW(),
    updated_at        TIMESTAMP,
    deleted_at        TIMESTAMP
);

CREATE INDEX idx_food_items_gym_category ON food_items(gym_id, category);
CREATE INDEX idx_food_items_name         ON food_items(name);

-- ── 4. meal_food_items ─────────────────────────────────────────
CREATE TABLE meal_food_items (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    meal_id      UUID         NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
    food_item_id UUID         NOT NULL REFERENCES food_items(id),
    quantity_g   DECIMAL(8,2) NOT NULL,
    order_index  INTEGER      DEFAULT 0,
    notes        VARCHAR(100),
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ── 5. member_nutrition_assignments ───────────────────────────
CREATE TABLE member_nutrition_assignments (
    id               UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID       NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id        UUID       NOT NULL REFERENCES members(id),
    plan_id          UUID       NOT NULL REFERENCES nutrition_plans(id),
    assigned_by      VARCHAR(100),
    start_date       DATE       NOT NULL,
    end_date         DATE,
    status           VARCHAR(20) DEFAULT 'ACTIVE'
                     CHECK (status IN ('ACTIVE','COMPLETED','PAUSED','CANCELLED')),
    target_calories  INTEGER,
    target_protein_g INTEGER,
    target_carbs_g   INTEGER,
    target_fat_g     INTEGER,
    notes            TEXT,
    created_at       TIMESTAMP  DEFAULT NOW(),
    updated_at       TIMESTAMP
);

CREATE INDEX idx_nutrition_assignments_member_status ON member_nutrition_assignments(gym_id, member_id, status);
CREATE INDEX idx_nutrition_assignments_plan          ON member_nutrition_assignments(gym_id, plan_id);

-- ── 6. nutrition_logs ──────────────────────────────────────────
CREATE TABLE nutrition_logs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id       UUID         NOT NULL REFERENCES members(id),
    assignment_id   UUID         REFERENCES member_nutrition_assignments(id),
    log_date        DATE         NOT NULL DEFAULT CURRENT_DATE,
    total_calories  INTEGER      DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0,
    total_carbs_g   DECIMAL(6,2) DEFAULT 0,
    total_fat_g     DECIMAL(6,2) DEFAULT 0,
    total_fiber_g   DECIMAL(6,2) DEFAULT 0,
    water_ml        INTEGER      DEFAULT 0,
    overall_feeling INTEGER      CHECK (overall_feeling BETWEEN 1 AND 5),
    energy_level    INTEGER      CHECK (energy_level BETWEEN 1 AND 5),
    notes           TEXT,
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP,
    UNIQUE (member_id, log_date)
);

CREATE INDEX idx_nutrition_logs_member_date ON nutrition_logs(member_id, log_date DESC);
CREATE INDEX idx_nutrition_logs_assignment  ON nutrition_logs(assignment_id);

-- ── 7. nutrition_log_meals ─────────────────────────────────────
CREATE TABLE nutrition_log_meals (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    nutrition_log_id UUID         NOT NULL REFERENCES nutrition_logs(id) ON DELETE CASCADE,
    meal_name        VARCHAR(100) NOT NULL,
    time_of_day      VARCHAR(30),
    logged_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    calories         INTEGER      DEFAULT 0,
    protein_g        DECIMAL(6,2) DEFAULT 0,
    carbs_g          DECIMAL(6,2) DEFAULT 0,
    fat_g            DECIMAL(6,2) DEFAULT 0,
    notes            TEXT
);

CREATE INDEX idx_log_meals_nutrition_log ON nutrition_log_meals(nutrition_log_id);

-- ── 8. nutrition_log_food_items ────────────────────────────────
CREATE TABLE nutrition_log_food_items (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    log_meal_id  UUID         NOT NULL REFERENCES nutrition_log_meals(id) ON DELETE CASCADE,
    food_item_id UUID         REFERENCES food_items(id),
    food_name    VARCHAR(100) NOT NULL,
    quantity_g   DECIMAL(8,2) NOT NULL,
    calories     DECIMAL(8,2) NOT NULL,
    protein_g    DECIMAL(6,2) DEFAULT 0,
    carbs_g      DECIMAL(6,2) DEFAULT 0,
    fat_g        DECIMAL(6,2) DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ── 9. water_logs ──────────────────────────────────────────────
CREATE TABLE water_logs (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id     UUID      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id  UUID      NOT NULL REFERENCES members(id),
    log_date   DATE      NOT NULL DEFAULT CURRENT_DATE,
    amount_ml  INTEGER   NOT NULL,
    logged_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_water_logs_member_date ON water_logs(member_id, log_date DESC);

-- ── 10. supplement_schedules ───────────────────────────────────
CREATE TABLE supplement_schedules (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id        UUID         NOT NULL REFERENCES members(id),
    assignment_id    UUID         REFERENCES member_nutrition_assignments(id),
    supplement_name  VARCHAR(100) NOT NULL,
    dosage           VARCHAR(50),
    timing           VARCHAR(30)
                     CHECK (timing IN ('MORNING','PRE_WORKOUT','POST_WORKOUT',
                                       'WITH_MEAL','BEFORE_BED','OTHER')),
    notes            TEXT,
    is_active        BOOLEAN      DEFAULT true,
    created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_supplement_schedules_member_active ON supplement_schedules(member_id, is_active);
