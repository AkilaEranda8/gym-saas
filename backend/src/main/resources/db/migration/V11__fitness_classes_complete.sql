-- ──────────────────────────────────────────────────────────────
-- V11: Complete Fitness Classes — drop old schema, create new
-- ──────────────────────────────────────────────────────────────

-- Drop old tables (order: dependents first)
DROP TABLE IF EXISTS class_bookings CASCADE;
DROP TABLE IF EXISTS fitness_classes CASCADE;

-- ── fitness_classes ───────────────────────────────────────────

CREATE TABLE fitness_classes (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id        UUID         REFERENCES branches(id),
    trainer_id       UUID,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    type             VARCHAR(30)  NOT NULL
                     CHECK (type IN ('YOGA','HIIT','ZUMBA','PILATES','BOXING',
                                     'SPINNING','STRENGTH','MEDITATION',
                                     'DANCE','CARDIO','CROSSFIT','OTHER')),
    room             VARCHAR(50),
    capacity         INTEGER      NOT NULL DEFAULT 20,
    duration_minutes INTEGER      NOT NULL DEFAULT 60,
    difficulty       VARCHAR(20)  NOT NULL DEFAULT 'ALL_LEVELS'
                     CHECK (difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED','ALL_LEVELS')),
    color            VARCHAR(7),
    is_recurring     BOOLEAN      NOT NULL DEFAULT true,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMP
);

CREATE INDEX idx_fc_gym_type       ON fitness_classes(gym_id, type);
CREATE INDEX idx_fc_gym_trainer    ON fitness_classes(gym_id, trainer_id);
CREATE INDEX idx_fc_deleted        ON fitness_classes(deleted_at);

-- ── class_schedules ───────────────────────────────────────────

CREATE TABLE class_schedules (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    class_id         UUID        NOT NULL REFERENCES fitness_classes(id) ON DELETE CASCADE,
    day_of_week      INTEGER     NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time       TIME        NOT NULL,
    end_time         TIME        NOT NULL,
    max_capacity     INTEGER     NOT NULL,
    is_active        BOOLEAN     NOT NULL DEFAULT true,
    effective_from   DATE        NOT NULL DEFAULT CURRENT_DATE,
    effective_until  DATE,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cs_class_day ON class_schedules(class_id, day_of_week);
CREATE INDEX idx_cs_gym       ON class_schedules(gym_id);

-- ── class_sessions ────────────────────────────────────────────

CREATE TABLE class_sessions (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    class_id         UUID        NOT NULL REFERENCES fitness_classes(id),
    schedule_id      UUID        REFERENCES class_schedules(id),
    trainer_id       UUID,
    session_date     DATE        NOT NULL,
    start_time       TIME        NOT NULL,
    end_time         TIME        NOT NULL,
    actual_capacity  INTEGER     NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                     CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
    notes            TEXT,
    cancel_reason    TEXT,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_csess_gym_date     ON class_sessions(gym_id, session_date);
CREATE INDEX idx_csess_class_date   ON class_sessions(class_id, session_date);
CREATE INDEX idx_csess_date_status  ON class_sessions(session_date, status);

-- ── class_bookings ────────────────────────────────────────────

CREATE TABLE class_bookings (
    id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    session_id        UUID        NOT NULL REFERENCES class_sessions(id),
    member_id         UUID        NOT NULL REFERENCES members(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'BOOKED'
                      CHECK (status IN ('BOOKED','ATTENDED','CANCELLED','NO_SHOW','WAITLISTED')),
    booked_at         TIMESTAMP   NOT NULL DEFAULT NOW(),
    cancelled_at      TIMESTAMP,
    cancel_reason     TEXT,
    waitlist_position INTEGER,
    attended_at       TIMESTAMP,
    created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, member_id)
);

CREATE INDEX idx_cb_session_status  ON class_bookings(session_id, status);
CREATE INDEX idx_cb_member_status   ON class_bookings(member_id, status);
CREATE INDEX idx_cb_gym_member      ON class_bookings(gym_id, member_id);

-- ── class_waitlist ────────────────────────────────────────────

CREATE TABLE class_waitlist (
    id           UUID      NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id       UUID      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    session_id   UUID      NOT NULL REFERENCES class_sessions(id),
    member_id    UUID      NOT NULL REFERENCES members(id),
    position     INTEGER   NOT NULL,
    joined_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    notified_at  TIMESTAMP,
    UNIQUE (session_id, member_id)
);

CREATE INDEX idx_cw_session_pos ON class_waitlist(session_id, position);
