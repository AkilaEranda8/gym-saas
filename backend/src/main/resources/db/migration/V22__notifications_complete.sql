-- ─────────────────────────────────────────────────────────────────────────────
-- V22: Complete Notifications System (replaces V9 basic notifications)
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old basic notifications table (no FKs reference it from other tables)
DROP TABLE IF EXISTS notifications CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. notifications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    recipient_id     VARCHAR(100) NOT NULL,
    recipient_type   VARCHAR(20)  NOT NULL
                     CHECK (recipient_type IN ('MEMBER','TRAINER','MANAGER',
                            'GYM_OWNER','ALL_MEMBERS','ALL_TRAINERS','ALL_STAFF')),
    type             VARCHAR(50)  NOT NULL
                     CHECK (type IN (
                         'MEMBERSHIP_EXPIRY','PAYMENT_DUE','PAYMENT_RECEIVED',
                         'PAYMENT_FAILED','CLASS_BOOKING','CLASS_CANCELLED',
                         'CLASS_REMINDER','WORKOUT_ASSIGNED','NUTRITION_ASSIGNED',
                         'TRAINER_ASSIGNED','PT_SESSION','MAINTENANCE_ALERT',
                         'SERVICE_DUE','LOW_STOCK','ANNOUNCEMENT',
                         'LEAD_FOLLOWUP','GENERAL')),
    title            VARCHAR(150) NOT NULL,
    message          TEXT         NOT NULL,
    data_json        JSONB,
    channels         TEXT[],
    is_read          BOOLEAN      NOT NULL DEFAULT false,
    read_at          TIMESTAMP,
    is_sent          BOOLEAN      NOT NULL DEFAULT false,
    sent_at          TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. notification_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notification_logs (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    notification_id  UUID         REFERENCES notifications(id) ON DELETE SET NULL,
    channel          VARCHAR(20)  NOT NULL
                     CHECK (channel IN ('PUSH','WHATSAPP','SMS','EMAIL')),
    recipient        VARCHAR(100) NOT NULL,
    status           VARCHAR(20)  NOT NULL
                     CHECK (status IN ('QUEUED','SENT','DELIVERED','FAILED','BOUNCED')),
    provider_ref     VARCHAR(100),
    error_message    TEXT,
    sent_at          TIMESTAMP,
    delivered_at     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. notification_templates
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notification_templates (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         REFERENCES gyms(id) ON DELETE CASCADE,
    type             VARCHAR(50)  NOT NULL,
    channel          VARCHAR(20)  NOT NULL,
    language         VARCHAR(5)   NOT NULL DEFAULT 'en'
                     CHECK (language IN ('en','si','ta')),
    subject          VARCHAR(150),
    body_template    TEXT         NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    is_custom        BOOLEAN      NOT NULL DEFAULT false,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (gym_id, type, channel, language)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. push_tokens
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE push_tokens (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id          VARCHAR(100) NOT NULL,
    token            VARCHAR(255) NOT NULL,
    platform         VARCHAR(10)  NOT NULL
                     CHECK (platform IN ('IOS','ANDROID','WEB')),
    device_name      VARCHAR(100),
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    last_used_at     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, token)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. notification_preferences
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notification_preferences (
    id                UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id           VARCHAR(100) NOT NULL,
    notification_type VARCHAR(50)  NOT NULL,
    push_enabled      BOOLEAN      NOT NULL DEFAULT true,
    whatsapp_enabled  BOOLEAN      NOT NULL DEFAULT true,
    sms_enabled       BOOLEAN      NOT NULL DEFAULT false,
    email_enabled     BOOLEAN      NOT NULL DEFAULT true,
    quiet_hours_start TIME                  DEFAULT '22:00',
    quiet_hours_end   TIME                  DEFAULT '07:00',
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notification_type)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. bulk_notification_jobs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE bulk_notification_jobs (
    id                UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    title             VARCHAR(150) NOT NULL,
    message           TEXT         NOT NULL,
    target_audience   VARCHAR(30)  NOT NULL
                      CHECK (target_audience IN (
                          'ALL_MEMBERS','ACTIVE_MEMBERS','EXPIRING_MEMBERS',
                          'SPECIFIC_PLAN','ALL_TRAINERS','ALL_STAFF','CUSTOM_LIST')),
    target_plan       VARCHAR(20),
    target_ids        TEXT[],
    channels          TEXT[],
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED')),
    total_recipients  INTEGER      NOT NULL DEFAULT 0,
    sent_count        INTEGER      NOT NULL DEFAULT 0,
    failed_count      INTEGER      NOT NULL DEFAULT 0,
    scheduled_at      TIMESTAMP,
    started_at        TIMESTAMP,
    completed_at      TIMESTAMP,
    created_by        VARCHAR(100),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_notifications_gym_recipient       ON notifications(gym_id, recipient_id, is_read);
CREATE INDEX idx_notifications_gym_type_date       ON notifications(gym_id, type, created_at DESC);
CREATE INDEX idx_notifications_gym_unsent          ON notifications(gym_id, is_sent) WHERE is_sent = false;

CREATE INDEX idx_notif_logs_notification           ON notification_logs(notification_id);
CREATE INDEX idx_notif_logs_channel_status         ON notification_logs(channel, status);
CREATE INDEX idx_notif_logs_created_at             ON notification_logs(created_at DESC);

CREATE INDEX idx_notif_templates_type_channel_lang ON notification_templates(type, channel, language);

CREATE INDEX idx_push_tokens_user_active           ON push_tokens(user_id, is_active) WHERE is_active = true;

CREATE INDEX idx_notif_prefs_user                  ON notification_preferences(user_id);

CREATE INDEX idx_bulk_jobs_gym_status              ON bulk_notification_jobs(gym_id, status);
CREATE INDEX idx_bulk_jobs_scheduled_at            ON bulk_notification_jobs(scheduled_at)
    WHERE status = 'PENDING';
