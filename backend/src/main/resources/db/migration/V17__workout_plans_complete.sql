-- ──────────────────────────────────────────────────────────────
-- V17: Complete Workout Plans Module
-- Drops legacy V6 workout tables, creates comprehensive schema
-- ──────────────────────────────────────────────────────────────

-- Remove FK reference on members before dropping
ALTER TABLE members DROP COLUMN IF EXISTS workout_plan_id;

-- Drop legacy tables
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workout_plans     CASCADE;

-- ── 1. workout_plans ─────────────────────────────────────────
CREATE TABLE workout_plans (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_by       VARCHAR(100),
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    goal             VARCHAR(30) NOT NULL CHECK (goal IN (
                         'WEIGHT_LOSS','MUSCLE_GAIN','STRENGTH','ENDURANCE',
                         'FLEXIBILITY','GENERAL_FITNESS','REHABILITATION','ATHLETIC')),
    level            VARCHAR(20) NOT NULL DEFAULT 'BEGINNER' CHECK (level IN (
                         'BEGINNER','INTERMEDIATE','ADVANCED','ALL_LEVELS')),
    days_per_week    INTEGER     NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
    duration_weeks   INTEGER     NOT NULL DEFAULT 4,
    duration_minutes INTEGER     NOT NULL DEFAULT 60,
    is_template      BOOLEAN     DEFAULT false,
    is_active        BOOLEAN     DEFAULT true,
    tags             TEXT[],
    equipment_needed TEXT[],
    notes            TEXT,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    deleted_at       TIMESTAMP
);

CREATE INDEX idx_wp_gym_goal    ON workout_plans(gym_id, goal, level);
CREATE INDEX idx_wp_template    ON workout_plans(gym_id, is_template);
CREATE INDEX idx_wp_deleted     ON workout_plans(deleted_at);

-- ── 2. workout_days ──────────────────────────────────────────
CREATE TABLE workout_days (
    id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id            UUID    NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id           UUID    NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number        INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    name              VARCHAR(50),
    focus             VARCHAR(50),
    notes             TEXT,
    estimated_minutes INTEGER DEFAULT 60,
    created_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE (plan_id, day_number)
);

CREATE INDEX idx_wd_plan ON workout_days(plan_id, day_number);

-- ── 3. exercises (global library + gym-custom) ───────────────
CREATE TABLE exercises (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id        UUID    REFERENCES gyms(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    category      VARCHAR(30) NOT NULL CHECK (category IN (
                      'CHEST','BACK','SHOULDERS','ARMS','LEGS',
                      'CORE','CARDIO','FULL_BODY','FLEXIBILITY','OTHER')),
    muscle_groups TEXT[],
    equipment     VARCHAR(30) CHECK (equipment IN (
                      'BARBELL','DUMBBELL','MACHINE','CABLE','BODYWEIGHT',
                      'RESISTANCE_BAND','KETTLEBELL','OTHER','NONE')),
    difficulty    VARCHAR(20) DEFAULT 'BEGINNER' CHECK (difficulty IN (
                      'BEGINNER','INTERMEDIATE','ADVANCED')),
    instructions  TEXT,
    tips          TEXT,
    video_url     VARCHAR(255),
    image_url     VARCHAR(255),
    is_custom     BOOLEAN DEFAULT false,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP,
    deleted_at    TIMESTAMP
);

CREATE INDEX idx_ex_gym_cat  ON exercises(gym_id, category);
CREATE INDEX idx_ex_gym_eq   ON exercises(gym_id, equipment);
CREATE INDEX idx_ex_global   ON exercises(is_custom, gym_id);

-- ── 4. workout_exercises ─────────────────────────────────────
CREATE TABLE workout_exercises (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id              UUID    NOT NULL REFERENCES gyms(id)   ON DELETE CASCADE,
    day_id              UUID    NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    exercise_id         UUID    NOT NULL REFERENCES exercises(id),
    order_index         INTEGER NOT NULL DEFAULT 0,
    sets                INTEGER,
    reps                VARCHAR(20),
    duration_seconds    INTEGER,
    rest_seconds        INTEGER DEFAULT 60,
    weight_note         VARCHAR(50),
    tempo               VARCHAR(20),
    rpe                 INTEGER CHECK (rpe BETWEEN 1 AND 10),
    notes               TEXT,
    is_superset         BOOLEAN DEFAULT false,
    superset_group      INTEGER,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_we_day_order ON workout_exercises(day_id, order_index);

-- ── 5. member_workout_assignments ────────────────────────────
CREATE TABLE member_workout_assignments (
    id           UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID   NOT NULL REFERENCES gyms(id)         ON DELETE CASCADE,
    member_id    UUID   NOT NULL REFERENCES members(id)      ON DELETE CASCADE,
    plan_id      UUID   NOT NULL REFERENCES workout_plans(id),
    assigned_by  VARCHAR(100),
    start_date   DATE   NOT NULL,
    end_date     DATE,
    status       VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
                     'ACTIVE','COMPLETED','PAUSED','CANCELLED')),
    current_week INTEGER DEFAULT 1,
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP
);

CREATE INDEX idx_mwa_member_status ON member_workout_assignments(gym_id, member_id, status);
CREATE INDEX idx_mwa_plan          ON member_workout_assignments(gym_id, plan_id);

-- ── 6. workout_logs ──────────────────────────────────────────
CREATE TABLE workout_logs (
    id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id          UUID  NOT NULL REFERENCES gyms(id)    ON DELETE CASCADE,
    member_id       UUID  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    assignment_id   UUID  REFERENCES member_workout_assignments(id),
    plan_id         UUID  REFERENCES workout_plans(id),
    day_id          UUID  REFERENCES workout_days(id),
    log_date        DATE  NOT NULL DEFAULT CURRENT_DATE,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    duration_minutes INTEGER,
    status          VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED','SKIPPED','PARTIAL')),
    overall_feeling INTEGER CHECK (overall_feeling BETWEEN 1 AND 5),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wl_member_date ON workout_logs(gym_id, member_id, log_date DESC);
CREATE INDEX idx_wl_assignment  ON workout_logs(assignment_id);

-- ── 7. workout_set_logs ──────────────────────────────────────
CREATE TABLE workout_set_logs (
    id                    UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id                UUID  NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    workout_log_id        UUID  NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    workout_exercise_id   UUID  NOT NULL REFERENCES workout_exercises(id),
    exercise_id           UUID  NOT NULL REFERENCES exercises(id),
    set_number            INTEGER NOT NULL,
    reps_completed        INTEGER,
    weight_kg             DECIMAL(6,2),
    duration_seconds      INTEGER,
    rpe_actual            INTEGER CHECK (rpe_actual BETWEEN 1 AND 10),
    notes                 TEXT,
    created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wsl_log ON workout_set_logs(workout_log_id);

-- ── 8. personal_records ──────────────────────────────────────
CREATE TABLE personal_records (
    id            UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id        UUID   NOT NULL REFERENCES gyms(id)      ON DELETE CASCADE,
    member_id     UUID   NOT NULL REFERENCES members(id)   ON DELETE CASCADE,
    exercise_id   UUID   NOT NULL REFERENCES exercises(id),
    record_type   VARCHAR(20) NOT NULL CHECK (record_type IN (
                      'ONE_REP_MAX','MAX_REPS','MAX_WEIGHT','BEST_TIME')),
    value         DECIMAL(8,2) NOT NULL,
    unit          VARCHAR(10),
    achieved_date DATE   NOT NULL,
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (member_id, exercise_id, record_type)
);

CREATE INDEX idx_pr_member_ex ON personal_records(member_id, exercise_id);
