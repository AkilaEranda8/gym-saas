-- V23: Settings & Configuration Module

-- 1. gym_settings
CREATE TABLE gym_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID NOT NULL REFERENCES gyms(id) UNIQUE,
    gym_name         VARCHAR(100) NOT NULL,
    tagline          VARCHAR(200),
    description      TEXT,
    logo_url         VARCHAR(255),
    cover_image_url  VARCHAR(255),
    phone            VARCHAR(20),
    email            VARCHAR(100),
    website          VARCHAR(255),
    whatsapp_number  VARCHAR(20),
    address_line1    VARCHAR(200),
    address_line2    VARCHAR(200),
    city             VARCHAR(50),
    district         VARCHAR(50),
    postal_code      VARCHAR(10),
    google_maps_url  VARCHAR(500),
    business_reg_no  VARCHAR(50),
    tax_no           VARCHAR(50),
    operating_hours  JSONB,
    primary_color    VARCHAR(7) DEFAULT '#f59e0b',
    secondary_color  VARCHAR(7) DEFAULT '#1e293b',
    timezone         VARCHAR(50) DEFAULT 'Asia/Colombo',
    currency         VARCHAR(10) DEFAULT 'LKR',
    language         VARCHAR(5) DEFAULT 'en',
    date_format      VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    invoice_prefix   VARCHAR(10) DEFAULT 'INV',
    invoice_footer   TEXT,
    invoice_terms    TEXT,
    facebook_url     VARCHAR(255),
    instagram_url    VARCHAR(255),
    youtube_url      VARCHAR(255),
    tiktok_url       VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP
);

-- 2. gym_settings_kv
CREATE TABLE gym_settings_kv (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID NOT NULL REFERENCES gyms(id),
    key          VARCHAR(100) NOT NULL,
    value        TEXT,
    value_type   VARCHAR(20) DEFAULT 'STRING'
                 CHECK (value_type IN ('STRING','BOOLEAN','INTEGER','JSON','COLOR','URL')),
    category     VARCHAR(50) NOT NULL
                 CHECK (category IN ('GENERAL','BILLING','NOTIFICATIONS',
                                     'INTEGRATIONS','SECURITY',
                                     'MEMBERSHIP','FEATURES',
                                     'APPEARANCE','OPERATIONS')),
    description  VARCHAR(255),
    is_sensitive BOOLEAN DEFAULT false,
    updated_at   TIMESTAMP DEFAULT NOW(),
    updated_by   VARCHAR(100),
    UNIQUE(gym_id, key)
);

-- 3. integration_settings
CREATE TABLE integration_settings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id            UUID NOT NULL REFERENCES gyms(id),
    provider          VARCHAR(30) NOT NULL
                      CHECK (provider IN ('PAYHERE','DIALOG_SMS','DIALOG_WHATSAPP',
                                          'TWILIO','SENDGRID','CLOUDFLARE_R2',
                                          'GOOGLE_MAPS','SENTRY','STRIPE',
                                          'CUSTOM_WEBHOOK')),
    is_enabled        BOOLEAN DEFAULT false,
    config_json       JSONB NOT NULL DEFAULT '{}',
    test_mode         BOOLEAN DEFAULT true,
    last_tested_at    TIMESTAMP,
    last_test_status  VARCHAR(20)
                      CHECK (last_test_status IN ('SUCCESS','FAILED','UNTESTED')),
    last_test_message TEXT,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP,
    UNIQUE(gym_id, provider)
);

-- 4. membership_plan_configs
CREATE TABLE membership_plan_configs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id                UUID NOT NULL REFERENCES gyms(id),
    plan_name             VARCHAR(20) NOT NULL
                          CHECK (plan_name IN ('STANDARD','PREMIUM','ELITE','CUSTOM')),
    display_name          VARCHAR(50) NOT NULL,
    price_lkr             BIGINT NOT NULL,
    duration_days         INTEGER NOT NULL DEFAULT 30,
    color                 VARCHAR(7),
    description           TEXT,
    features              JSONB,
    max_classes_per_week  INTEGER DEFAULT -1,
    max_pt_sessions       INTEGER DEFAULT 0,
    locker_included       BOOLEAN DEFAULT false,
    guest_passes          INTEGER DEFAULT 0,
    discount_pct          DECIMAL(5,2) DEFAULT 0,
    is_active             BOOLEAN DEFAULT true,
    sort_order            INTEGER DEFAULT 0,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP
);

-- 5. operating_hours_config
CREATE TABLE operating_hours_config (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id      UUID NOT NULL REFERENCES gyms(id),
    branch_id   UUID REFERENCES branches(id),
    day_of_week INTEGER NOT NULL,
    is_open     BOOLEAN DEFAULT true,
    open_time   TIME,
    close_time  TIME,
    notes       VARCHAR(100),
    UNIQUE(gym_id, branch_id, day_of_week)
);

-- 6. holiday_configs
CREATE TABLE holiday_configs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id       UUID NOT NULL REFERENCES gyms(id),
    name         VARCHAR(100) NOT NULL,
    holiday_date DATE NOT NULL,
    is_closed    BOOLEAN DEFAULT true,
    open_time    TIME,
    close_time   TIME,
    notes        TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- 7. feature_flags
CREATE TABLE feature_flags (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id            UUID NOT NULL REFERENCES gyms(id),
    feature_key       VARCHAR(50) NOT NULL
                      CHECK (feature_key IN ('SHOP_POS','CLASS_BOOKING',
                                             'WORKOUT_PLANS','NUTRITION_PLANS',
                                             'TRAINER_PORTAL','MEMBER_PORTAL',
                                             'LEAD_MANAGEMENT','CHAT',
                                             'QR_CHECKIN','MULTI_BRANCH',
                                             'ADVANCED_REPORTS','API_ACCESS')),
    is_enabled        BOOLEAN DEFAULT true,
    enabled_by_plan   BOOLEAN DEFAULT false,
    override_by_admin BOOLEAN DEFAULT false,
    notes             TEXT,
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(gym_id, feature_key)
);

-- 8. audit_settings
CREATE TABLE audit_settings (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id                 UUID NOT NULL REFERENCES gyms(id) UNIQUE,
    retain_days            INTEGER DEFAULT 90,
    log_logins             BOOLEAN DEFAULT true,
    log_data_exports       BOOLEAN DEFAULT true,
    log_payment_actions    BOOLEAN DEFAULT true,
    ip_restriction_enabled BOOLEAN DEFAULT false,
    allowed_ips            TEXT[],
    updated_at             TIMESTAMP DEFAULT NOW()
);

-- 9. login_history
CREATE TABLE login_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id         UUID NOT NULL REFERENCES gyms(id),
    user_id        VARCHAR(100) NOT NULL,
    user_email     VARCHAR(100),
    user_role      VARCHAR(30),
    ip_address     VARCHAR(45),
    user_agent     VARCHAR(255),
    device_type    VARCHAR(20)
                   CHECK (device_type IN ('DESKTOP','MOBILE','TABLET','API')),
    location       VARCHAR(100),
    status         VARCHAR(20) NOT NULL
                   CHECK (status IN ('SUCCESS','FAILED','BLOCKED')),
    failure_reason VARCHAR(100),
    logged_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gym_settings_gym_id ON gym_settings(gym_id);
CREATE INDEX idx_gym_settings_kv_gym_cat ON gym_settings_kv(gym_id, category);
CREATE INDEX idx_gym_settings_kv_gym_key ON gym_settings_kv(gym_id, key);
CREATE INDEX idx_integration_settings_gym_prov ON integration_settings(gym_id, provider);
CREATE INDEX idx_membership_plan_configs_gym_active ON membership_plan_configs(gym_id, is_active);
CREATE INDEX idx_operating_hours_gym_branch ON operating_hours_config(gym_id, branch_id);
CREATE INDEX idx_feature_flags_gym_key ON feature_flags(gym_id, feature_key);
CREATE INDEX idx_login_history_gym_user ON login_history(gym_id, user_id);
CREATE INDEX idx_login_history_gym_date ON login_history(gym_id, logged_at DESC);
CREATE INDEX idx_login_history_ip ON login_history(ip_address);
