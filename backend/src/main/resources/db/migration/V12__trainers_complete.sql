-- V12: Complete Trainer Module (replaces basic V5 trainer tables)

-- Drop old tables in safe order
DROP TABLE IF EXISTS trainer_assignments CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;

-- ─── 1. trainers ────────────────────────────────────────────────────────────
CREATE TABLE trainers (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID NOT NULL REFERENCES gyms(id),
    branch_id        UUID REFERENCES branches(id),
    keycloak_id      VARCHAR(100),
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(100),
    phone            VARCHAR(20),
    nic              VARCHAR(20),
    photo_url        VARCHAR(255),
    bio              TEXT,
    specialties      TEXT[],
    certifications   TEXT[],
    experience_years INTEGER DEFAULT 0,
    employment_type  VARCHAR(20) DEFAULT 'FULL_TIME'
                         CHECK (employment_type IN ('FULL_TIME','PART_TIME','CONTRACT')),
    status           VARCHAR(20) DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','INACTIVE','ON_LEAVE')),
    rating           DECIMAL(3,2) DEFAULT 0.00,
    total_reviews    INTEGER DEFAULT 0,
    salary_lkr       BIGINT,
    joined_date      DATE NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    deleted_at       TIMESTAMP
);

-- ─── 2. trainer_specialties ──────────────────────────────────────────────────
CREATE TABLE trainer_specialties (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id      UUID NOT NULL REFERENCES gyms(id),
    trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    specialty   VARCHAR(50) NOT NULL
                    CHECK (specialty IN (
                        'YOGA','HIIT','ZUMBA','PILATES','BOXING',
                        'SPINNING','STRENGTH','NUTRITION',
                        'CARDIO','CROSSFIT','REHABILITATION',
                        'PERSONAL_TRAINING','OTHER')),
    is_primary  BOOLEAN DEFAULT false,
    certified   BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─── 3. trainer_certifications ───────────────────────────────────────────────
CREATE TABLE trainer_certifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id          UUID NOT NULL REFERENCES gyms(id),
    trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    issuing_body    VARCHAR(100),
    issued_date     DATE,
    expiry_date     DATE,
    certificate_url VARCHAR(255),
    is_verified     BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 4. trainer_availability ─────────────────────────────────────────────────
CREATE TABLE trainer_availability (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID NOT NULL REFERENCES gyms(id),
    trainer_id   UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE (trainer_id, day_of_week)
);

-- ─── 5. trainer_assignments ──────────────────────────────────────────────────
CREATE TABLE trainer_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id          UUID NOT NULL REFERENCES gyms(id),
    trainer_id      UUID NOT NULL REFERENCES trainers(id),
    member_id       UUID NOT NULL REFERENCES members(id),
    assignment_type VARCHAR(20) DEFAULT 'PERSONAL_TRAINING'
                        CHECK (assignment_type IN (
                            'PERSONAL_TRAINING','GROUP_CLASS',
                            'NUTRITION','REHABILITATION')),
    status          VARCHAR(20) DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','COMPLETED','CANCELLED')),
    started_date    DATE NOT NULL,
    ended_date      DATE,
    sessions_total  INTEGER DEFAULT 0,
    sessions_used   INTEGER DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP
);

-- ─── 6. trainer_sessions ─────────────────────────────────────────────────────
CREATE TABLE trainer_sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id         UUID NOT NULL REFERENCES gyms(id),
    trainer_id     UUID NOT NULL REFERENCES trainers(id),
    member_id      UUID NOT NULL REFERENCES members(id),
    assignment_id  UUID REFERENCES trainer_assignments(id),
    session_date   DATE NOT NULL,
    start_time     TIME NOT NULL,
    end_time       TIME NOT NULL,
    status         VARCHAR(20) DEFAULT 'SCHEDULED'
                       CHECK (status IN (
                           'SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')),
    notes          TEXT,
    member_feedback TEXT,
    trainer_notes  TEXT,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP
);

-- ─── 7. trainer_reviews ──────────────────────────────────────────────────────
CREATE TABLE trainer_reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID NOT NULL REFERENCES gyms(id),
    trainer_id   UUID NOT NULL REFERENCES trainers(id),
    member_id    UUID NOT NULL REFERENCES members(id),
    rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text  TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE (trainer_id, member_id)
);

-- ─── 8. trainer_leave ────────────────────────────────────────────────────────
CREATE TABLE trainer_leave (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID NOT NULL REFERENCES gyms(id),
    trainer_id   UUID NOT NULL REFERENCES trainers(id),
    leave_type   VARCHAR(20) NOT NULL
                     CHECK (leave_type IN ('ANNUAL','SICK','UNPAID','OTHER')),
    from_date    DATE NOT NULL,
    to_date      DATE NOT NULL,
    reason       TEXT,
    status       VARCHAR(20) DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    approved_by  VARCHAR(100),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_trainers_gym_status         ON trainers(gym_id, status);
CREATE INDEX idx_trainers_gym_branch         ON trainers(gym_id, branch_id);
CREATE INDEX idx_trainer_specialties_trainer ON trainer_specialties(trainer_id);
CREATE INDEX idx_trainer_assignments_trainer ON trainer_assignments(gym_id, trainer_id, status);
CREATE INDEX idx_trainer_assignments_member  ON trainer_assignments(gym_id, member_id, status);
CREATE INDEX idx_trainer_sessions_trainer    ON trainer_sessions(trainer_id, session_date);
CREATE INDEX idx_trainer_sessions_member     ON trainer_sessions(member_id, session_date);
CREATE INDEX idx_trainer_reviews_trainer     ON trainer_reviews(trainer_id);
CREATE INDEX idx_trainer_leave_trainer       ON trainer_leave(trainer_id);
CREATE INDEX idx_trainer_certs_trainer       ON trainer_certifications(trainer_id);
CREATE INDEX idx_trainer_avail_trainer       ON trainer_availability(trainer_id);
