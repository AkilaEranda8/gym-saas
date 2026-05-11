-- ──────────────────────────────────────────────────────────────
-- V10: Member enhancements — add columns, body_metrics, attendance
-- ──────────────────────────────────────────────────────────────

-- Add missing columns to members table
ALTER TABLE members
    ADD COLUMN IF NOT EXISTS nic             VARCHAR(20),
    ADD COLUMN IF NOT EXISTS photo_url       VARCHAR(500),
    ADD COLUMN IF NOT EXISTS expiry_date     DATE,
    ADD COLUMN IF NOT EXISTS locker_id       UUID,
    ADD COLUMN IF NOT EXISTS workout_plan_id UUID,
    ADD COLUMN IF NOT EXISTS nutrition_plan_id UUID,
    ADD COLUMN IF NOT EXISTS deleted_at      TIMESTAMP;

-- Update status check to include EXPIRING
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE members ADD CONSTRAINT members_status_check
    CHECK (status IN ('ACTIVE','EXPIRING','EXPIRED','SUSPENDED','INACTIVE'));

CREATE INDEX IF NOT EXISTS idx_members_nic         ON members(gym_id, nic);
CREATE INDEX IF NOT EXISTS idx_members_phone       ON members(gym_id, phone);
CREATE INDEX IF NOT EXISTS idx_members_expiry      ON members(gym_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_deleted     ON members(deleted_at);

-- ── body_metrics ─────────────────────────────────────────────

CREATE TABLE body_metrics (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id       UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    weight_kg       DECIMAL(5,2),
    height_cm       DECIMAL(5,2),
    bmi             DECIMAL(4,2),
    body_fat_pct    DECIMAL(4,2),
    muscle_mass_kg  DECIMAL(5,2),
    chest_cm        DECIMAL(5,2),
    waist_cm        DECIMAL(5,2),
    hip_cm          DECIMAL(5,2),
    recorded_by     VARCHAR(100),
    recorded_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_metrics_member  ON body_metrics(member_id, recorded_date DESC);
CREATE INDEX idx_body_metrics_gym     ON body_metrics(gym_id);

-- ── attendance ───────────────────────────────────────────────

CREATE TABLE attendance (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id        UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    branch_id        UUID         REFERENCES branches(id),
    check_in_time    TIMESTAMP    NOT NULL DEFAULT NOW(),
    check_out_time   TIMESTAMP,
    check_in_method  VARCHAR(20)  NOT NULL DEFAULT 'MANUAL'
                     CHECK (check_in_method IN ('QR','MANUAL','FINGERPRINT')),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_gym_member ON attendance(gym_id, member_id);
CREATE INDEX idx_attendance_checkin    ON attendance(check_in_time DESC);
CREATE INDEX idx_attendance_gym_date   ON attendance(gym_id, check_in_time);
