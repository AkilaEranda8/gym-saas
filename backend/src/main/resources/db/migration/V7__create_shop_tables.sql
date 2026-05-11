-- ──────────────────────────────────────────────────────────────
-- V7: Shop — products, shop_orders, order_items
-- ──────────────────────────────────────────────────────────────

CREATE TABLE products (
    id             UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id         UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name           VARCHAR(100)  NOT NULL,
    description    TEXT,
    price          NUMERIC(10,2) NOT NULL,
    stock_quantity INT           NOT NULL DEFAULT 0,
    category       VARCHAR(30)   NOT NULL,
    image_url      VARCHAR(500),
    sku            VARCHAR(50),
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_gym_id   ON products(gym_id);
CREATE INDEX idx_products_category ON products(gym_id, category);

CREATE TABLE shop_orders (
    id               UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id           UUID          NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id        UUID          NOT NULL REFERENCES members(id),
    total_amount     NUMERIC(10,2) NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    delivery_type    VARCHAR(20)   NOT NULL DEFAULT 'PICKUP',
    delivery_address VARCHAR(255),
    payment_id       UUID,
    notes            TEXT,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_orders_gym_id    ON shop_orders(gym_id);
CREATE INDEX idx_shop_orders_member_id ON shop_orders(gym_id, member_id);
CREATE INDEX idx_shop_orders_status    ON shop_orders(gym_id, status);

CREATE TABLE order_items (
    id           UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id     UUID          NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id   UUID          NOT NULL REFERENCES products(id),
    product_name VARCHAR(100)  NOT NULL,
    quantity     INT           NOT NULL,
    unit_price   NUMERIC(10,2) NOT NULL,
    subtotal     NUMERIC(10,2) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
