DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM seeder_log WHERE script_name = 'seed.sql') THEN

        INSERT INTO users (username, password) VALUES
            ('alice', 'password123'),
            ('bob', 'password123'),
            ('carol', 'password123');

        INSERT INTO customers (email) VALUES
            ('alice@example.com'),
            ('bob@example.com'),
            ('carol@example.com');

        INSERT INTO orders (customer_id, status) VALUES
            (1, 'pending'),
            (1, 'shipped'),
            (2, 'delivered'),
            (3, 'pending');

        INSERT INTO order_items (order_id, product_sku, quantity, unit_price_cents) VALUES
            (1, 'SKU-WIDGET-001', 2, 1299),
            (1, 'SKU-GADGET-014', 1, 4599),
            (2, 'SKU-WIDGET-001', 4, 1299),
            (3, 'SKU-CABLE-009', 3, 499),
            (3, 'SKU-GADGET-014', 1, 4599),
            (4, 'SKU-WIDGET-001', 1, 1299),
            (4, 'SKU-CABLE-009', 2, 499),
            (4, 'SKU-CASE-003', 1, 1999);

        INSERT INTO seeder_log (script_name) VALUES ('seed.sql');
    END IF;
END $$;
