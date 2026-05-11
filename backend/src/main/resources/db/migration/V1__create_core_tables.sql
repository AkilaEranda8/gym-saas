-- ──────────────────────────────────────────────────────────────
-- V1: Core tables — gyms, branches
-- ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE gyms (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,
    subdomain           VARCHAR(100) NOT NULL UNIQUE,
    owner_user_id       VARCHAR(100),
    owner_email         VARCHAR(150) NOT NULL UNIQUE,
    owner_name          VARCHAR(100) NOT NULL,
    phone               VARCHAR(20),
    address             VARCHAR(255),
    logo_url            VARCHAR(500),
    subscription_status VARCHAR(20)  NOT NULL DEFAULT 'TRIAL',
    subscription_plan   VARCHAR(50),
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gyms_slug        ON gyms(slug);
CREATE INDEX idx_gyms_subdomain   ON gyms(subdomain);
CREATE INDEX idx_gyms_owner_email ON gyms(owner_email);

CREATE TABLE branches (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    address         VARCHAR(255),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    open_time       TIME,
    close_time      TIME,
    manager_user_id VARCHAR(100),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_gym_id ON branches(gym_id);
