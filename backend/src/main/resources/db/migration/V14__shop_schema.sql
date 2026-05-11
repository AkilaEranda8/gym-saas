-- ──────────────────────────────────────────────────────────────
-- V14: Complete Shop POS Schema
-- Drops V7 basic shop tables and replaces with full POS schema
-- ──────────────────────────────────────────────────────────────

-- 1. Drop old V7 tables (reverse FK order)
DROP TABLE IF EXISTS order_items      CASCADE;
DROP TABLE IF EXISTS shop_orders      CASCADE;
DROP TABLE IF EXISTS products         CASCADE;

-- 2. product_categories
CREATE TABLE product_categories (
    id           UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id       UUID         NOT NULL REFERENCES gyms(id),
    name         VARCHAR(50)  NOT NULL,
    description  TEXT,
    icon         VARCHAR(10),
    color        VARCHAR(7),
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP,
    UNIQUE (gym_id, name)
);

-- 3. products
CREATE TABLE products (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id),
    branch_id       UUID         REFERENCES branches(id),
    category_id     UUID         REFERENCES product_categories(id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    brand           VARCHAR(50),
    sku             VARCHAR(50),
    barcode         VARCHAR(50),
    unit            VARCHAR(20)  NOT NULL DEFAULT 'UNIT'
                    CHECK (unit IN ('UNIT','KG','LITRE','PACK','BOX','BOTTLE')),
    price_lkr       BIGINT       NOT NULL,
    cost_price_lkr  BIGINT,
    stock_qty       INTEGER      NOT NULL DEFAULT 0,
    min_stock_qty   INTEGER      NOT NULL DEFAULT 5,
    max_stock_qty   INTEGER,
    image_url       VARCHAR(255),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    is_featured     BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

-- 4. stock_movements
CREATE TABLE stock_movements (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID        NOT NULL REFERENCES gyms(id),
    product_id       UUID        NOT NULL REFERENCES products(id),
    movement_type    VARCHAR(20) NOT NULL
                     CHECK (movement_type IN ('IN','OUT','ADJUSTMENT','RETURN')),
    quantity         INTEGER     NOT NULL,
    previous_stock   INTEGER     NOT NULL,
    new_stock        INTEGER     NOT NULL,
    reference_type   VARCHAR(30)
                     CHECK (reference_type IN ('PURCHASE','SALE','RETURN','ADJUSTMENT','DAMAGE')),
    reference_id     UUID,
    notes            TEXT,
    created_by       VARCHAR(100),
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 5. shop_orders
CREATE TABLE shop_orders (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID        NOT NULL REFERENCES gyms(id),
    branch_id        UUID        REFERENCES branches(id),
    member_id        UUID        REFERENCES members(id),
    order_number     VARCHAR(20) NOT NULL UNIQUE,
    status           VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'
                     CHECK (status IN ('PENDING','COMPLETED','CANCELLED','REFUNDED')),
    subtotal_lkr     BIGINT      NOT NULL,
    discount_lkr     BIGINT      NOT NULL DEFAULT 0,
    tax_lkr          BIGINT      NOT NULL DEFAULT 0,
    total_lkr        BIGINT      NOT NULL,
    payment_method   VARCHAR(30) NOT NULL
                     CHECK (payment_method IN ('CASH','CARD','ONLINE','BANK_TRANSFER','PAYHERE','EZ_CASH','M_CASH')),
    payment_status   VARCHAR(20) NOT NULL DEFAULT 'PAID'
                     CHECK (payment_status IN ('PAID','PENDING','FAILED')),
    discount_code    VARCHAR(20),
    notes            TEXT,
    receipt_url      VARCHAR(255),
    created_by       VARCHAR(100),
    refund_reason    TEXT,
    refunded_at      TIMESTAMP,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMP
);

-- 6. order_items
CREATE TABLE order_items (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id          UUID         NOT NULL REFERENCES gyms(id),
    order_id        UUID         NOT NULL REFERENCES shop_orders(id),
    product_id      UUID         NOT NULL REFERENCES products(id),
    product_name    VARCHAR(100) NOT NULL,
    product_sku     VARCHAR(50),
    unit_price_lkr  BIGINT       NOT NULL,
    quantity        INTEGER      NOT NULL,
    discount_lkr    BIGINT       NOT NULL DEFAULT 0,
    total_lkr       BIGINT       NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 7. purchase_orders
CREATE TABLE purchase_orders (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID         NOT NULL REFERENCES gyms(id),
    branch_id        UUID         REFERENCES branches(id),
    po_number        VARCHAR(20)  NOT NULL UNIQUE,
    supplier_name    VARCHAR(100),
    supplier_phone   VARCHAR(20),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','RECEIVED','CANCELLED')),
    total_lkr        BIGINT       NOT NULL DEFAULT 0,
    notes            TEXT,
    ordered_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    received_at      TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 8. purchase_order_items
CREATE TABLE purchase_order_items (
    id                UUID    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id            UUID    NOT NULL REFERENCES gyms(id),
    po_id             UUID    NOT NULL REFERENCES purchase_orders(id),
    product_id        UUID    NOT NULL REFERENCES products(id),
    quantity_ordered  INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    unit_cost_lkr     BIGINT  NOT NULL,
    total_cost_lkr    BIGINT  NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. Indexes
CREATE INDEX idx_products_gym_category   ON products(gym_id, category_id);
CREATE INDEX idx_products_gym_active     ON products(gym_id, is_active);
CREATE INDEX idx_products_gym_stock      ON products(gym_id, stock_qty);
CREATE INDEX idx_products_barcode        ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_sku            ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_shop_orders_gym_date    ON shop_orders(gym_id, created_at DESC);
CREATE INDEX idx_shop_orders_gym_member  ON shop_orders(gym_id, member_id);
CREATE INDEX idx_shop_orders_number      ON shop_orders(order_number);
CREATE INDEX idx_order_items_order       ON order_items(order_id);
CREATE INDEX idx_order_items_product     ON order_items(product_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_purchase_orders_status  ON purchase_orders(gym_id, status);
