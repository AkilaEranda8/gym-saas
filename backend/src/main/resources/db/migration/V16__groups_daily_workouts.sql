-- Member Groups
CREATE TABLE member_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id      UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    color       VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_member_groups_gym_id ON member_groups(gym_id);

-- Group Memberships (junction)
CREATE TABLE member_group_memberships (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id   UUID NOT NULL REFERENCES member_groups(id) ON DELETE CASCADE,
    member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    joined_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_group_member UNIQUE (group_id, member_id)
);
CREATE INDEX idx_mgm_group_id  ON member_group_memberships(group_id);
CREATE INDEX idx_mgm_member_id ON member_group_memberships(member_id);

-- Daily Workout of the Day (WOD)
CREATE TABLE daily_workouts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id        UUID REFERENCES branches(id),
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    workout_date     DATE NOT NULL,
    difficulty       VARCHAR(20),
    duration_minutes INTEGER,
    exercises        TEXT NOT NULL DEFAULT '[]',
    notes            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_gym_date UNIQUE (gym_id, workout_date)
);
CREATE INDEX idx_daily_workouts_gym_date ON daily_workouts(gym_id, workout_date DESC);
