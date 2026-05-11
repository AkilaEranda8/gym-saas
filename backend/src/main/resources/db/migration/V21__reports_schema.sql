-- V21: Reports & Analytics Schema

CREATE TABLE report_snapshots (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id        UUID NOT NULL REFERENCES gyms(id),
    report_type   VARCHAR(50) NOT NULL
                  CHECK (report_type IN (
                    'DAILY_SUMMARY','WEEKLY_SUMMARY','MONTHLY_SUMMARY',
                    'MEMBER_GROWTH','REVENUE_SUMMARY','ATTENDANCE_SUMMARY',
                    'TRAINER_PERFORMANCE','EQUIPMENT_STATUS','SHOP_SALES',
                    'NUTRITION_ADHERENCE','WORKOUT_COMPLIANCE','LEAD_CONVERSION'
                  )),
    snapshot_date DATE NOT NULL,
    data_json     JSONB NOT NULL,
    generated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    generated_by  VARCHAR(100),
    UNIQUE (gym_id, report_type, snapshot_date)
);

CREATE TABLE scheduled_reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id           UUID NOT NULL REFERENCES gyms(id),
    name             VARCHAR(100) NOT NULL,
    report_type      VARCHAR(50) NOT NULL,
    frequency        VARCHAR(20) NOT NULL
                     CHECK (frequency IN ('DAILY','WEEKLY','MONTHLY')),
    recipients       TEXT[],
    whatsapp_numbers TEXT[],
    last_sent_at     TIMESTAMP,
    next_send_at     TIMESTAMP NOT NULL,
    is_active        BOOLEAN DEFAULT true,
    config_json      JSONB,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP
);

CREATE TABLE report_exports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id          UUID NOT NULL REFERENCES gyms(id),
    report_type     VARCHAR(50) NOT NULL,
    format          VARCHAR(10) NOT NULL
                    CHECK (format IN ('CSV','PDF','EXCEL')),
    file_url        VARCHAR(255),
    file_size_bytes BIGINT,
    from_date       DATE,
    to_date         DATE,
    generated_by    VARCHAR(100),
    generated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP,
    download_count  INTEGER DEFAULT 0
);

CREATE INDEX idx_report_snapshots_gym_type_date
    ON report_snapshots (gym_id, report_type, snapshot_date);

CREATE INDEX idx_scheduled_reports_gym_next
    ON scheduled_reports (gym_id, next_send_at);

CREATE INDEX idx_report_exports_gym_date
    ON report_exports (gym_id, generated_at DESC);
