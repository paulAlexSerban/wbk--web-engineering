import { pool } from "../db";

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
};

export type OrderItemInput = {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
};

const ORDER_ITEM_COLUMNS =
  "id, order_id, product_id, quantity, unit_price_cents";

export async function listOrderItems(): Promise<OrderItem[]> {
  const { rows } = await pool.query<OrderItem>(
    `SELECT ${ORDER_ITEM_COLUMNS} FROM order_items ORDER BY id`,
  );
  return rows;
}

export async function listOrderItemsByOrderId(
  orderId: number,
): Promise<OrderItem[]> {
  const { rows } = await pool.query<OrderItem>(
    `SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE order_id = $1 ORDER BY id`,
    [orderId],
  );
  return rows;
}

export async function findOrderItemById(
  id: number,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    `SELECT ${ORDER_ITEM_COLUMNS} FROM order_items WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function createOrderItem(
  input: OrderItemInput,
): Promise<OrderItem> {
  const { rows } = await pool.query<OrderItem>(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4) RETURNING ${ORDER_ITEM_COLUMNS}`,
    [input.order_id, input.product_id, input.quantity, input.unit_price_cents],
  );
  return rows[0];
}

export async function updateOrderItem(
  id: number,
  input: OrderItemInput,
): Promise<OrderItem | undefined> {
  const { rows } = await pool.query<OrderItem>(
    `UPDATE order_items SET order_id = $1, product_id = $2, quantity = $3, unit_price_cents = $4 WHERE id = $5 RETURNING ${ORDER_ITEM_COLUMNS}`,
    [
      input.order_id,
      input.product_id,
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
         product_id = COALESCE($2, product_id),
         quantity = COALESCE($3, quantity),
         unit_price_cents = COALESCE($4, unit_price_cents)
     WHERE id = $5
     RETURNING ${ORDER_ITEM_COLUMNS}`,
    [
      input.order_id ?? null,
      input.product_id ?? null,
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
    `DELETE FROM order_items WHERE id = $1 RETURNING ${ORDER_ITEM_COLUMNS}`,
    [id],
  );
  return rows[0];
}
