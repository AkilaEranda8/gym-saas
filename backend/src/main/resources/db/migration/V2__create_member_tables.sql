-- ──────────────────────────────────────────────────────────────
-- V2: Member tables — members, plans, member_plans
-- ──────────────────────────────────────────────────────────────

CREATE TABLE members (
    id                       UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id                   UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id                UUID         REFERENCES branches(id),
    keycloak_user_id         VARCHAR(100),
    first_name               VARCHAR(60)  NOT NULL,
    last_name                VARCHAR(60)  NOT NULL,
    email                    VARCHAR(150) NOT NULL,
    phone                    VARCHAR(20),
    date_of_birth            DATE,
    gender                   VARCHAR(10),
    address                  VARCHAR(255),
    profile_photo            VARCHAR(500),
    status                   VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    join_date                DATE         NOT NULL DEFAULT CURRENT_DATE,
    notes                    TEXT,
    qr_code                  TEXT,
    emergency_contact_name   VARCHAR(100),
    emergency_contact_phone  VARCHAR(20),
    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (email, gym_id)
);

CREATE INDEX idx_members_gym_id    ON members(gym_id);
CREATE INDEX idx_members_branch_id ON members(branch_id);
CREATE INDEX idx_members_status    ON members(gym_id, status);
CREATE INDEX idx_members_email     ON members(email, gym_id);

CREATE TABLE plans (
    id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL,
    description     TEXT,
    duration_days   INT           NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    features        TEXT,
    max_freeze_days INT           NOT NULL DEFAULT 0,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_gym_id ON plans(gym_id);

CREATE TABLE member_plans (
    id          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id      UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id   UUID          NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id     UUID          NOT NULL REFERENCES plans(id),
    plan_name   VARCHAR(100)  NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE          NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    payment_id  UUID,
    freeze_start DATE,
    freeze_end   DATE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_plans_gym_id    ON member_plans(gym_id);
CREATE INDEX idx_member_plans_member_id ON member_plans(member_id);
CREATE INDEX idx_member_plans_status    ON member_plans(gym_id, status);
