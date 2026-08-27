import { pool } from "../db";

export type Product = {
  id: number;
  sku: string;
  name: string;
  unit_price_cents: number;
  created_at: Date;
};

export type ProductInput = {
  sku: string;
  name: string;
  unit_price_cents: number;
};

const PRODUCT_COLUMNS = "id, sku, name, unit_price_cents, created_at";

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY id`,
  );
  return rows;
}

export async function findProductById(
  id: number,
): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { rows } = await pool.query<Product>(
    `INSERT INTO products (sku, name, unit_price_cents) VALUES ($1, $2, $3) RETURNING ${PRODUCT_COLUMNS}`,
    [input.sku, input.name, input.unit_price_cents],
  );
  return rows[0];
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
    `UPDATE products SET sku = $1, name = $2, unit_price_cents = $3 WHERE id = $4 RETURNING ${PRODUCT_COLUMNS}`,
    [input.sku, input.name, input.unit_price_cents, id],
  );
  return rows[0];
}

export async function patchProduct(
  id: number,
  input: Partial<ProductInput>,
): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
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
  id: number,
): Promise<Product | undefined> {
  const { rows } = await pool.query<Product>(
    `DELETE FROM products WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`,
    [id],
  );
  return rows[0];
}

export async function countOrderItemsByProductId(
  productId: number,
): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM order_items WHERE product_id = $1",
    [productId],
  );
  return Number(rows[0]?.count ?? 0);
}
