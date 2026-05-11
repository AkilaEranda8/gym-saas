-- ──────────────────────────────────────────────────────────────
-- V13: Billing Complete — Replaces basic V3 payments table
-- ──────────────────────────────────────────────────────────────

-- Drop old payments table and indexes
DROP TABLE IF EXISTS payments CASCADE;

-- 1. payments ─────────────────────────────────────────────────
CREATE TABLE payments (
    id                UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id         UUID         REFERENCES branches(id),
    member_id         UUID         NOT NULL REFERENCES members(id),
    payment_number    VARCHAR(20)  NOT NULL,
    payment_type      VARCHAR(30)  NOT NULL
        CHECK (payment_type IN ('MEMBERSHIP','PT_SESSION','SHOP_PURCHASE','LOCKER','CLASS_BOOKING','OTHER')),
    amount_lkr        BIGINT       NOT NULL,
    discount_lkr      BIGINT       NOT NULL DEFAULT 0,
    tax_lkr           BIGINT       NOT NULL DEFAULT 0,
    final_amount_lkr  BIGINT       NOT NULL,
    method            VARCHAR(30)  NOT NULL
        CHECK (method IN ('CASH','CARD','ONLINE','BANK_TRANSFER','PAYHERE','EZ_CASH','M_CASH')),
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PAID','PENDING','FAILED','REFUNDED','CANCELLED')),
    reference_no      VARCHAR(100),
    payhere_order_id  VARCHAR(100),
    payhere_status    VARCHAR(50),
    description       TEXT,
    notes             TEXT,
    paid_at           TIMESTAMP,
    due_date          DATE,
    invoice_number    VARCHAR(20)  UNIQUE,
    invoice_url       VARCHAR(255),
    refund_reason     TEXT,
    refunded_at       TIMESTAMP,
    created_by        VARCHAR(100),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP,
    deleted_at        TIMESTAMP,
    CONSTRAINT uq_payment_number UNIQUE (payment_number)
);

-- 2. payment_items ────────────────────────────────────────────
CREATE TABLE payment_items (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    payment_id      UUID         NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    description     VARCHAR(255) NOT NULL,
    quantity        INTEGER      NOT NULL DEFAULT 1,
    unit_price_lkr  BIGINT       NOT NULL,
    total_lkr       BIGINT       NOT NULL,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- 3. invoices ─────────────────────────────────────────────────
CREATE TABLE invoices (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    payment_id      UUID         NOT NULL REFERENCES payments(id),
    invoice_number  VARCHAR(20)  NOT NULL,
    member_id       UUID         NOT NULL REFERENCES members(id),
    subtotal_lkr    BIGINT       NOT NULL,
    discount_lkr    BIGINT       NOT NULL DEFAULT 0,
    tax_lkr         BIGINT       NOT NULL DEFAULT 0,
    total_lkr       BIGINT       NOT NULL,
    notes           TEXT,
    footer_text     TEXT,
    issued_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    due_date        DATE,
    pdf_url         VARCHAR(255),
    created_at      TIMESTAMP    DEFAULT NOW(),
    CONSTRAINT uq_invoice_number UNIQUE (invoice_number)
);

-- 4. payment_reminders ────────────────────────────────────────
CREATE TABLE payment_reminders (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id       UUID         NOT NULL REFERENCES members(id),
    payment_id      UUID         REFERENCES payments(id),
    reminder_type   VARCHAR(30)  NOT NULL
        CHECK (reminder_type IN ('MEMBERSHIP_DUE','PAYMENT_OVERDUE','RENEWAL_REMINDER')),
    sent_at         TIMESTAMP    NOT NULL DEFAULT NOW(),
    channel         VARCHAR(20)  NOT NULL
        CHECK (channel IN ('WHATSAPP','SMS','EMAIL')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'SENT'
        CHECK (status IN ('SENT','FAILED','DELIVERED'))
);

-- 5. discounts ────────────────────────────────────────────────
CREATE TABLE discounts (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    code            VARCHAR(20)  NOT NULL,
    description     VARCHAR(100),
    discount_type   VARCHAR(20)  NOT NULL
        CHECK (discount_type IN ('PERCENTAGE','FIXED')),
    discount_value  BIGINT       NOT NULL,
    max_uses        INTEGER,
    used_count      INTEGER      NOT NULL DEFAULT 0,
    valid_from      DATE         NOT NULL,
    valid_until     DATE,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMP    DEFAULT NOW(),
    deleted_at      TIMESTAMP,
    CONSTRAINT uq_discount_gym_code UNIQUE (gym_id, code)
);

-- 6. payhere_transactions ─────────────────────────────────────
CREATE TABLE payhere_transactions (
    id                UUID           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID           NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    payment_id        UUID           REFERENCES payments(id),
    order_id          VARCHAR(100)   NOT NULL,
    payhere_amount    DECIMAL(10,2)  NOT NULL,
    payhere_currency  VARCHAR(10)    NOT NULL DEFAULT 'LKR',
    status_code       VARCHAR(10),
    status_message    VARCHAR(100),
    method            VARCHAR(50),
    card_holder       VARCHAR(100),
    card_no           VARCHAR(20),
    raw_response      JSONB,
    verified          BOOLEAN        NOT NULL DEFAULT false,
    received_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- 7. expense_categories ───────────────────────────────────────
CREATE TABLE expense_categories (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id      UUID        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name        VARCHAR(50) NOT NULL,
    color       VARCHAR(7),
    created_at  TIMESTAMP   DEFAULT NOW()
);

-- 8. expenses ─────────────────────────────────────────────────
CREATE TABLE expenses (
    id           UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id       UUID         NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id    UUID         REFERENCES branches(id),
    category_id  UUID         REFERENCES expense_categories(id),
    description  VARCHAR(255) NOT NULL,
    amount_lkr   BIGINT       NOT NULL,
    expense_date DATE         NOT NULL,
    receipt_url  VARCHAR(255),
    paid_by      VARCHAR(100),
    notes        TEXT,
    created_at   TIMESTAMP    DEFAULT NOW(),
    deleted_at   TIMESTAMP
);

-- Indexes ─────────────────────────────────────────────────────
CREATE INDEX idx_payments_gym_status       ON payments(gym_id, status);
CREATE INDEX idx_payments_gym_member       ON payments(gym_id, member_id);
CREATE INDEX idx_payments_gym_paid_at      ON payments(gym_id, paid_at);
CREATE INDEX idx_payments_number           ON payments(payment_number);
CREATE INDEX idx_payments_payhere_order    ON payments(payhere_order_id);
CREATE INDEX idx_invoices_gym_number       ON invoices(gym_id, invoice_number);
CREATE INDEX idx_expenses_gym_date         ON expenses(gym_id, expense_date);
CREATE INDEX idx_discounts_gym_code        ON discounts(gym_id, code);
CREATE INDEX idx_payment_items_payment     ON payment_items(payment_id);
CREATE INDEX idx_payhere_txn_order         ON payhere_transactions(order_id);
CREATE INDEX idx_reminders_gym_member      ON payment_reminders(gym_id, member_id);
