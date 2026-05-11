-- ─────────────────────────────────────────────────────────────────────────────
-- V20: Equipment & Maintenance — Complete Schema
-- Drops old V8 equipment tables and recreates with full schema
-- ─────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS equipment_maintenance CASCADE;
DROP TABLE IF EXISTS equipment             CASCADE;

-- ── 1. Equipment Categories ──────────────────────────────────────────────────
CREATE TABLE equipment_categories (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id      UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name        VARCHAR(50)  NOT NULL,
    icon        VARCHAR(10),
    color       VARCHAR(7),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP,
    UNIQUE (gym_id, name)
);

CREATE INDEX idx_eq_cat_gym ON equipment_categories(gym_id);

-- ── 2. Equipment ─────────────────────────────────────────────────────────────
CREATE TABLE equipment (
    id                     UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id                 UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id              UUID         REFERENCES branches(id),
    category_id            UUID         REFERENCES equipment_categories(id),
    name                   VARCHAR(100) NOT NULL,
    description            TEXT,
    brand                  VARCHAR(50),
    model                  VARCHAR(50),
    serial_number          VARCHAR(100),
    asset_tag              VARCHAR(50),
    location               VARCHAR(100),
    quantity               INTEGER      NOT NULL DEFAULT 1,
    purchase_date          DATE,
    purchase_price_lkr     BIGINT,
    warranty_expiry        DATE,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'OPERATIONAL'
                               CONSTRAINT chk_equip_status
                               CHECK (status IN ('OPERATIONAL','MAINTENANCE',
                                                 'OUT_OF_ORDER','RETIRED','UNDER_INSPECTION')),
    condition              VARCHAR(20)  DEFAULT 'GOOD'
                               CONSTRAINT chk_equip_condition
                               CHECK (condition IN ('EXCELLENT','GOOD','FAIR','POOR')),
    last_service_date      DATE,
    next_service_date      DATE,
    service_interval_days  INTEGER      DEFAULT 90,
    image_url              VARCHAR(255),
    notes                  TEXT,
    qr_code                VARCHAR(50)  UNIQUE,
    created_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP,
    deleted_at             TIMESTAMP
);

CREATE INDEX idx_equip_gym_status   ON equipment(gym_id, status);
CREATE INDEX idx_equip_gym_branch   ON equipment(gym_id, branch_id);
CREATE INDEX idx_equip_gym_category ON equipment(gym_id, category_id);
CREATE INDEX idx_equip_next_service ON equipment(gym_id, next_service_date);
CREATE INDEX idx_equip_serial       ON equipment(serial_number);
CREATE INDEX idx_equip_qr           ON equipment(qr_code);

-- ── 3. Maintenance Requests ───────────────────────────────────────────────────
CREATE TABLE maintenance_requests (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id              UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id           UUID         REFERENCES branches(id),
    equipment_id        UUID         NOT NULL REFERENCES equipment(id),
    request_number      VARCHAR(20)  NOT NULL UNIQUE,
    title               VARCHAR(100) NOT NULL,
    description         TEXT         NOT NULL,
    priority            VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM'
                            CONSTRAINT chk_maint_priority
                            CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status              VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                            CONSTRAINT chk_maint_status
                            CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED','CANCELLED')),
    reported_by         VARCHAR(100) NOT NULL,
    reported_by_name    VARCHAR(100),
    assigned_to         VARCHAR(100),
    assigned_to_name    VARCHAR(100),
    estimated_cost_lkr  BIGINT,
    actual_cost_lkr     BIGINT,
    due_date            DATE,
    started_at          TIMESTAMP,
    resolved_at         TIMESTAMP,
    closed_at           TIMESTAMP,
    resolution_notes    TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,
    deleted_at          TIMESTAMP
);

CREATE INDEX idx_maint_req_gym_status   ON maintenance_requests(gym_id, status);
CREATE INDEX idx_maint_req_gym_priority ON maintenance_requests(gym_id, priority);
CREATE INDEX idx_maint_req_equipment    ON maintenance_requests(equipment_id);
CREATE INDEX idx_maint_req_number       ON maintenance_requests(request_number);

-- ── 4. Maintenance Logs ───────────────────────────────────────────────────────
CREATE TABLE maintenance_logs (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    request_id      UUID         NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    logged_by       VARCHAR(100) NOT NULL,
    logged_by_name  VARCHAR(100),
    action          VARCHAR(30)  NOT NULL
                        CONSTRAINT chk_log_action
                        CHECK (action IN ('STATUS_CHANGE','COMMENT','COST_UPDATE','ASSIGNMENT','RESOLUTION')),
    old_status      VARCHAR(20),
    new_status      VARCHAR(20),
    comment         TEXT,
    cost_lkr        BIGINT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maint_logs_request ON maintenance_logs(request_id, created_at DESC);

-- ── 5. Service Schedules ──────────────────────────────────────────────────────
CREATE TABLE service_schedules (
    id                   UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id               UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id         UUID        NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    service_type         VARCHAR(30) NOT NULL
                             CONSTRAINT chk_svc_type
                             CHECK (service_type IN ('ROUTINE','DEEP_CLEAN','CALIBRATION',
                                                     'INSPECTION','PARTS_REPLACEMENT','OTHER')),
    frequency_days       INTEGER     NOT NULL DEFAULT 90,
    last_service_date    DATE,
    next_service_date    DATE        NOT NULL,
    assigned_to          VARCHAR(100),
    service_provider     VARCHAR(100),
    estimated_cost_lkr   BIGINT,
    notes                TEXT,
    is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP
);

CREATE INDEX idx_svc_sched_equip_date ON service_schedules(equipment_id, next_service_date);

-- ── 6. Service Records ────────────────────────────────────────────────────────
CREATE TABLE service_records (
    id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id      UUID        NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    schedule_id       UUID        REFERENCES service_schedules(id),
    service_type      VARCHAR(30) NOT NULL,
    service_date      DATE        NOT NULL,
    performed_by      VARCHAR(100),
    service_provider  VARCHAR(100),
    cost_lkr          BIGINT,
    duration_hours    DECIMAL(4,1),
    condition_before  VARCHAR(20),
    condition_after   VARCHAR(20),
    parts_replaced    TEXT,
    description       TEXT,
    notes             TEXT,
    next_service_date DATE,
    invoice_url       VARCHAR(255),
    created_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_svc_records_equip_date ON service_records(equipment_id, service_date DESC);

-- ── 7. Equipment Inspections ──────────────────────────────────────────────────
CREATE TABLE equipment_inspections (
    id                   UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id               UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id         UUID        NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    inspected_by         VARCHAR(100) NOT NULL,
    inspected_by_name    VARCHAR(100),
    inspection_date      DATE        NOT NULL DEFAULT CURRENT_DATE,
    overall_rating       INTEGER     NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    is_operational       BOOLEAN     NOT NULL,
    issues_found         TEXT,
    actions_required     TEXT,
    next_inspection_date DATE,
    photos_urls          TEXT,
    created_at           TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insp_equip_date ON equipment_inspections(equipment_id, inspection_date DESC);

-- ── 8. Equipment Usage Logs ───────────────────────────────────────────────────
CREATE TABLE equipment_usage_logs (
    id               UUID      NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID      NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id     UUID      NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    member_id        UUID      REFERENCES members(id),
    usage_date       DATE      NOT NULL DEFAULT CURRENT_DATE,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP,
    duration_minutes INTEGER,
    notes            VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_log_equip_date ON equipment_usage_logs(equipment_id, usage_date DESC);
