import { pool } from "../db";

export type OrderItem = {
  id: number;
  order_id: number;
  product_sku: string;
  quantity: number;
  unit_price_cents: number;
};

export type OrderItemInput = {
  order_id: number;
  product_sku: string;
  quantity: number;
  unit_price_cents: number;
};

export async function listOrderItems(): Promise<OrderItem[]> {
  const { rows } = await pool.query<OrderItem>(
    "SELECT id, order_id, product_sku, quantity, unit_price_cents FROM order_items ORDER BY id",
  );
  return rows;
}

export async function listOrderItemsByOrderId(
  orderId: number,
): Promise<OrderItem[]> {
  const { rows } = await pool.query<OrderItem>(
    "SELECT id, order_id, product_sku, quantity, unit_price_cents FROM order_items WHERE order_id = $1 ORDER BY id",
    [orderId],
  );
  return rows;
}

export async function findOrderItemById(
  id: number,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    "SELECT id, order_id, product_sku, quantity, unit_price_cents FROM order_items WHERE id = $1",
    [id],
  );
  return rows[0];
}

export async function createOrderItem(
  input: OrderItemInput,
): Promise<OrderItem> {
  const { rows } = await pool.query<OrderItem>(
    "INSERT INTO order_items (order_id, product_sku, quantity, unit_price_cents) VALUES ($1, $2, $3, $4) RETURNING id, order_id, product_sku, quantity, unit_price_cents",
    [input.order_id, input.product_sku, input.quantity, input.unit_price_cents],
  );
  return rows[0];
}

export async function updateOrderItem(
  id: number,
  input: OrderItemInput,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    "UPDATE order_items SET order_id = $1, product_sku = $2, quantity = $3, unit_price_cents = $4 WHERE id = $5 RETURNING id, order_id, product_sku, quantity, unit_price_cents",
    [
      input.order_id,
      input.product_sku,
      input.quantity,
      input.unit_price_cents,
      id,
    ],
  );
  return rows[0];
}

export async function patchOrderItem(
  id: number,
  input: Partial<OrderItemInput>,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    `UPDATE order_items
     SET order_id = COALESCE($1, order_id),
         product_sku = COALESCE($2, product_sku),
         quantity = COALESCE($3, quantity),
         unit_price_cents = COALESCE($4, unit_price_cents)
     WHERE id = $5
     RETURNING id, order_id, product_sku, quantity, unit_price_cents`,
    [
      input.order_id ?? null,
      input.product_sku ?? null,
      input.quantity ?? null,
      input.unit_price_cents ?? null,
      id,
    ],
  );
  return rows[0];
}

export async function deleteOrderItem(
  id: number,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    "DELETE FROM order_items WHERE id = $1 RETURNING id, order_id, product_sku, quantity, unit_price_cents",
    [id],
  );
  return rows[0];
}
