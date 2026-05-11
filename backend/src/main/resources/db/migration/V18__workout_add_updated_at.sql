-- ──────────────────────────────────────────────────────────────
-- V18: Add missing updated_at columns to V17 workout tables
-- BaseEntity @LastModifiedDate maps to updated_at (nullable=false)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE workout_days
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE workout_exercises
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE workout_logs
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE workout_set_logs
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE personal_records
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
