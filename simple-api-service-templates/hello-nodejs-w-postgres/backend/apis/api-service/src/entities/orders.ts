import { pool } from "../db";

export type OrderStatus = "pending" | "shipped" | "delivered";

export type Order = {
  id: number;
  customer_id: number;
  status: string;
  created_at: Date;
};

export type OrderInput = {
  customer_id: number;
  status?: OrderStatus;
};

export type PendingOrderTotal = {
  order_id: number;
  email: string;
  status: string;
  total_cents: string;
};

export async function listOrders(): Promise<Order[]> {
  const { rows } = await pool.query<Order>(
    "SELECT id, customer_id, status, created_at FROM orders ORDER BY id",
  );
  return rows;
}

export async function listOrdersByCustomerId(
  customerId: number,
): Promise<Order[]> {
  const { rows } = await pool.query<Order>(
    "SELECT id, customer_id, status, created_at FROM orders WHERE customer_id = $1 ORDER BY id",
    [customerId],
  );
  return rows;
}

export async function findOrderById(id: number): Promise<Order | undefined> {
  const { rows } = await pool.query<Order>(
    "SELECT id, customer_id, status, created_at FROM orders WHERE id = $1",
    [id],
  );
  return rows[0];
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const { rows } = await pool.query<Order>(
    "INSERT INTO orders (customer_id, status) VALUES ($1, $2) RETURNING id, customer_id, status, created_at",
    [input.customer_id, input.status ?? "pending"],
  );
  return rows[0];
}

export async function updateOrder(
  id: number,
  input: OrderInput,
): Promise<Order | undefined> {
  const { rows } = await pool.query<Order>(
    "UPDATE orders SET customer_id = $1, status = $2 WHERE id = $3 RETURNING id, customer_id, status, created_at",
    [input.customer_id, input.status ?? "pending", id],
  );
  return rows[0];
}

export async function patchOrder(
  id: number,
  input: Partial<OrderInput>,
): Promise<Order | undefined> {
  const { rows } = await pool.query<Order>(
    `UPDATE orders
     SET customer_id = COALESCE($1, customer_id),
         status = COALESCE($2, status)
     WHERE id = $3
     RETURNING id, customer_id, status, created_at`,
    [input.customer_id ?? null, input.status ?? null, id],
  );
  return rows[0];
}

export async function deleteOrder(id: number): Promise<Order | undefined> {
  const { rows } = await pool.query<Order>(
    "DELETE FROM orders WHERE id = $1 RETURNING id, customer_id, status, created_at",
    [id],
  );
  return rows[0];
}

export async function listPendingOrderTotals(): Promise<PendingOrderTotal[]> {
  const { rows } = await pool.query<PendingOrderTotal>(`
    SELECT
      o.id AS order_id,
      c.email,
      o.status,
      SUM(oi.quantity * oi.unit_price_cents) AS total_cents
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'pending'
    GROUP BY o.id, c.email, o.status
    ORDER BY o.created_at DESC
    LIMIT 50
  `);
  return rows;
}
