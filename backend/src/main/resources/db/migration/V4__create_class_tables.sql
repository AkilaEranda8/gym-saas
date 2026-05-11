-- ──────────────────────────────────────────────────────────────
-- V4: Classes — fitness_classes, class_bookings
-- ──────────────────────────────────────────────────────────────

CREATE TABLE fitness_classes (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id        UUID         REFERENCES branches(id),
    trainer_id       UUID,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    capacity         INT          NOT NULL,
    start_time       TIMESTAMP    NOT NULL,
    end_time         TIMESTAMP    NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    recurrence       VARCHAR(50),
    current_bookings INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fitness_classes_gym_id     ON fitness_classes(gym_id);
CREATE INDEX idx_fitness_classes_start_time ON fitness_classes(gym_id, start_time);
CREATE INDEX idx_fitness_classes_trainer    ON fitness_classes(trainer_id);

CREATE TABLE class_bookings (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id      UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    class_id    UUID        NOT NULL REFERENCES fitness_classes(id) ON DELETE CASCADE,
    member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    booked_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (class_id, member_id)
);

CREATE INDEX idx_class_bookings_gym_id    ON class_bookings(gym_id);
CREATE INDEX idx_class_bookings_class_id  ON class_bookings(class_id);
CREATE INDEX idx_class_bookings_member_id ON class_bookings(member_id);
