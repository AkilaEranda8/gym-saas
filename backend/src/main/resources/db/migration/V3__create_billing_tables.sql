-- ──────────────────────────────────────────────────────────────
-- V3: Billing — payments
-- ──────────────────────────────────────────────────────────────

CREATE TABLE payments (
    id                       UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id                   UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id                UUID          REFERENCES members(id),
    amount                   NUMERIC(10,2) NOT NULL,
    currency                 VARCHAR(10)   NOT NULL DEFAULT 'LKR',
    type                     VARCHAR(20)   NOT NULL,
    status                   VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    gateway                  VARCHAR(50),
    gateway_order_id         VARCHAR(100),
    gateway_transaction_id   VARCHAR(100),
    payhere_status_code      INT,
    description              VARCHAR(255),
    reference_id             UUID,
    paid_at                  TIMESTAMP,
    created_at               TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_gym_id    ON payments(gym_id);
CREATE INDEX idx_payments_member_id ON payments(gym_id, member_id);
CREATE INDEX idx_payments_status    ON payments(gym_id, status);
CREATE INDEX idx_payments_gateway   ON payments(gateway_order_id);
CREATE INDEX idx_payments_paid_at   ON payments(gym_id, paid_at);
