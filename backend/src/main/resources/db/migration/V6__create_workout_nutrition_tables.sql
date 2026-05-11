-- ──────────────────────────────────────────────────────────────
-- V6: Workout & Nutrition plans
-- ──────────────────────────────────────────────────────────────

CREATE TABLE workout_plans (
    id             UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id         UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id     UUID,
    member_id      UUID         REFERENCES members(id) ON DELETE SET NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    duration_weeks INT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_gym_id    ON workout_plans(gym_id);
CREATE INDEX idx_workout_plans_member_id ON workout_plans(member_id);
CREATE INDEX idx_workout_plans_trainer   ON workout_plans(trainer_id);

CREATE TABLE workout_exercises (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_plan_id  UUID         NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number       INT          NOT NULL,
    name             VARCHAR(100) NOT NULL,
    category         VARCHAR(50),
    sets             INT,
    reps             INT,
    duration_seconds INT,
    rest_seconds     INT,
    weight_kg        DOUBLE PRECISION,
    notes            TEXT,
    video_url        VARCHAR(500),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_plan ON workout_exercises(workout_plan_id);

CREATE TABLE nutrition_plans (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id      UUID,
    member_id       UUID         REFERENCES members(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    goal            VARCHAR(100),
    daily_calories  INT,
    protein_grams   INT,
    carbs_grams     INT,
    fat_grams       INT,
    notes           TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutrition_plans_gym_id    ON nutrition_plans(gym_id);
CREATE INDEX idx_nutrition_plans_member_id ON nutrition_plans(member_id);

CREATE TABLE nutrition_items (
    id               UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nutrition_plan_id UUID         NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    meal_type        VARCHAR(20)   NOT NULL,
    name             VARCHAR(100)  NOT NULL,
    quantity         VARCHAR(30),
    unit             VARCHAR(20),
    calories         INT,
    protein_grams    DOUBLE PRECISION,
    carbs_grams      DOUBLE PRECISION,
    fat_grams        DOUBLE PRECISION,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutrition_items_plan ON nutrition_items(nutrition_plan_id);
