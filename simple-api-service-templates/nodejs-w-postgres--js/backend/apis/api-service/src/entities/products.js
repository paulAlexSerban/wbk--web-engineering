import { pool } from "../db/index.js";

const PRODUCT_COLUMNS = "id, sku, name, unit_price_cents, created_at";

export async function listProducts() {
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY id`,
  );
  return rows;
}

export async function findProductById(
  id,
) {
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function createProduct(input) {
  const { rows } = await pool.query(
    `INSERT INTO products (sku, name, unit_price_cents) VALUES ($1, $2, $3) RETURNING ${PRODUCT_COLUMNS}`,
    [input.sku, input.name, input.unit_price_cents],
  );
  return rows[0];
}

export async function updateProduct(
  id,
  input,
) {
  const { rows } = await pool.query(
    `UPDATE products SET sku = $1, name = $2, unit_price_cents = $3 WHERE id = $4 RETURNING ${PRODUCT_COLUMNS}`,
    [input.sku, input.name, input.unit_price_cents, id],
  );
  return rows[0];
}

export async function patchProduct(
  id,
  input,
) {
  const { rows } = await pool.query(
    `UPDATE products
     SET sku = COALESCE($1, sku),
         name = COALESCE($2, name),
         unit_price_cents = COALESCE($3, unit_price_cents)
     WHERE id = $4
     RETURNING ${PRODUCT_COLUMNS}`,
    [input.sku ?? null, input.name ?? null, input.unit_price_cents ?? null, id],
  );
  return rows[0];
}

export async function deleteProduct(
  id,
) {
  const { rows } = await pool.query(
    `DELETE FROM products WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`,
    [id],
  );
  return rows[0];
}

export async function countOrderItemsByProductId(
  productId,
) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::text AS count FROM order_items WHERE product_id = $1",
    [productId],
  );
  return Number(rows[0]?.count ?? 0);
}
