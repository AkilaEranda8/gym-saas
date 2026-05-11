-- ──────────────────────────────────────────────────────────────
-- V9: Notifications
-- ──────────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id     UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id    VARCHAR(100) NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT         NOT NULL,
    type       VARCHAR(20)  NOT NULL DEFAULT 'INFO',
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    action_url VARCHAR(300),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_gym_user ON notifications(gym_id, user_id);
CREATE INDEX idx_notifications_unread   ON notifications(gym_id, user_id, is_read) WHERE is_read = FALSE;
