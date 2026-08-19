import { pool } from "../db";

export type Customer = {
  id: number;
  email: string;
  created_at: Date;
};

export type CustomerInput = {
  email: string;
};

export async function listCustomers(): Promise<Customer[]> {
  const { rows } = await pool.query<Customer>(
    "SELECT id, email, created_at FROM customers ORDER BY id",
  );
  return rows;
}

export async function findCustomerById(
  id: number,
): Promise<Customer | undefined> {
  const { rows } = await pool.query<Customer>(
    "SELECT id, email, created_at FROM customers WHERE id = $1",
    [id],
  );
  return rows[0];
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const { rows } = await pool.query<Customer>(
    "INSERT INTO customers (email) VALUES ($1) RETURNING id, email, created_at",
    [input.email],
  );
  return rows[0];
}

export async function updateCustomer(
  id: number,
  input: CustomerInput,
): Promise<Customer | undefined> {
  const { rows } = await pool.query<Customer>(
    "UPDATE customers SET email = $1 WHERE id = $2 RETURNING id, email, created_at",
    [input.email, id],
  );
  return rows[0];
}

export async function patchCustomer(
  id: number,
  input: Partial<CustomerInput>,
): Promise<Customer | undefined> {
  const { rows } = await pool.query<Customer>(
    `UPDATE customers
     SET email = COALESCE($1, email)
     WHERE id = $2
     RETURNING id, email, created_at`,
    [input.email ?? null, id],
  );
  return rows[0];
}

export async function deleteCustomer(
  id: number,
): Promise<Customer | undefined> {
  const { rows } = await pool.query<Customer>(
    "DELETE FROM customers WHERE id = $1 RETURNING id, email, created_at",
    [id],
  );
  return rows[0];
}
