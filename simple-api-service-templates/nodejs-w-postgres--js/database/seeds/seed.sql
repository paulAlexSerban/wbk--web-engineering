DO $seed$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM seeder_log WHERE script_name = 'seed.sql') THEN

        INSERT INTO customers (email, password_hash) VALUES
            ('alice@example.com', '$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa'),
            ('bob@example.com', '$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa'),
            ('carol@example.com', '$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa');

        INSERT INTO products (sku, name, unit_price_cents) VALUES
            ('SKU-WIDGET-001', 'Widget', 1299),
            ('SKU-GADGET-014', 'Gadget', 4599),
            ('SKU-CABLE-009', 'Cable', 499),
            ('SKU-CASE-003', 'Case', 1999);

        INSERT INTO orders (customer_id, status) VALUES
            (1, 'pending'),
            (1, 'shipped'),
            (2, 'delivered'),
            (3, 'pending');

        INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
            (1, 1, 2, 1299),
            (1, 2, 1, 4599),
            (2, 1, 4, 1299),
            (3, 3, 3, 499),
            (3, 2, 1, 4599),
            (4, 1, 1, 1299),
            (4, 3, 2, 499),
            (4, 4, 1, 1999);

        INSERT INTO seeder_log (script_name) VALUES ('seed.sql');
    END IF;
END $seed$;
