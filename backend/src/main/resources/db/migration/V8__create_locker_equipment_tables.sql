-- ──────────────────────────────────────────────────────────────
-- V8: Lockers & Equipment
-- ──────────────────────────────────────────────────────────────

CREATE TABLE lockers (
    id             UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id         UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id      UUID          REFERENCES branches(id),
    locker_number  VARCHAR(20)   NOT NULL,
    size           VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    monthly_rate   NUMERIC(8,2)  NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'AVAILABLE',
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (locker_number, gym_id)
);

CREATE INDEX idx_lockers_gym_id ON lockers(gym_id);
CREATE INDEX idx_lockers_status ON lockers(gym_id, status);

CREATE TABLE locker_assignments (
    id           UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id       UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    locker_id    UUID          NOT NULL REFERENCES lockers(id),
    member_id    UUID          NOT NULL REFERENCES members(id),
    start_date   DATE          NOT NULL,
    end_date     DATE,
    monthly_rate NUMERIC(8,2)  NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    payment_id   UUID,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locker_assignments_gym_id    ON locker_assignments(gym_id);
CREATE INDEX idx_locker_assignments_member_id ON locker_assignments(member_id);
CREATE INDEX idx_locker_assignments_locker_id ON locker_assignments(locker_id);

CREATE TABLE equipment (
    id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id       UUID          REFERENCES branches(id),
    name            VARCHAR(100)  NOT NULL,
    category        VARCHAR(60),
    manufacturer    VARCHAR(100),
    model           VARCHAR(100),
    serial_number   VARCHAR(100),
    purchase_date   DATE,
    purchase_price  NUMERIC(10,2),
    warranty_expiry DATE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'OPERATIONAL',
    location        VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_gym_id    ON equipment(gym_id);
CREATE INDEX idx_equipment_branch_id ON equipment(branch_id);
CREATE INDEX idx_equipment_status    ON equipment(gym_id, status);

CREATE TABLE equipment_maintenance (
    id             UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id         UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id   UUID          NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    type           VARCHAR(20)   NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'SCHEDULED',
    scheduled_date DATE          NOT NULL,
    completed_date DATE,
    description    TEXT,
    cost           NUMERIC(8,2),
    performed_by   VARCHAR(100),
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_maintenance_gym_id ON equipment_maintenance(gym_id);
CREATE INDEX idx_equipment_maintenance_eq_id  ON equipment_maintenance(equipment_id);
CREATE INDEX idx_equipment_maintenance_status ON equipment_maintenance(gym_id, status);
