-- V23b: Settings seed data notes
-- Default KV settings, membership plans, operating hours,
-- feature flags and Sri Lankan holidays are seeded programmatically
-- by SettingsInitializerService when a new gym registers.
-- This file intentionally left minimal — schema is in V23.

-- Ensure operating_hours_config handles NULL branch_id in UNIQUE constraint
-- PostgreSQL treats NULL as distinct in unique constraints, which is the desired behaviour:
-- (gym_id, NULL, day_of_week) is unique per gym (gym-level schedule)
-- (gym_id, branch_id, day_of_week) is unique per branch
-- No additional SQL needed.
SELECT 1;
