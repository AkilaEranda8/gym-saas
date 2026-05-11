-- ──────────────────────────────────────────────────────────────
-- V5: Trainers — trainers, trainer_assignments
-- ──────────────────────────────────────────────────────────────

CREATE TABLE trainers (
    id                 UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id             UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id          UUID         REFERENCES branches(id),
    keycloak_user_id   VARCHAR(100),
    first_name         VARCHAR(60)  NOT NULL,
    last_name          VARCHAR(60)  NOT NULL,
    email              VARCHAR(150) NOT NULL,
    phone              VARCHAR(20),
    specialization     VARCHAR(200),
    bio                TEXT,
    profile_photo      VARCHAR(500),
    active             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainers_gym_id    ON trainers(gym_id);
CREATE INDEX idx_trainers_branch_id ON trainers(branch_id);

CREATE TABLE trainer_assignments (
    id         UUID      NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id     UUID      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id UUID      NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    member_id  UUID      NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    start_date DATE      NOT NULL,
    end_date   DATE,
    notes      TEXT,
    active     BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainer_assignments_gym_id     ON trainer_assignments(gym_id);
CREATE INDEX idx_trainer_assignments_trainer_id ON trainer_assignments(trainer_id);
CREATE INDEX idx_trainer_assignments_member_id  ON trainer_assignments(member_id);
