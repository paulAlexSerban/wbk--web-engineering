import { pool } from "../db/index.js";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;





const CUSTOMER_COLUMNS = "id, email, created_at";

export async function listCustomers() {
  const { rows } = await pool.query(
    `SELECT ${CUSTOMER_COLUMNS} FROM customers ORDER BY id`,
  );
  return rows;
}

export async function findCustomerById(
  id
) {
  const { rows } = await pool.query(
    `SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function createCustomer(input) {
  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO customers (email, password_hash) VALUES ($1, $2) RETURNING ${CUSTOMER_COLUMNS}`,
    [input.email, password_hash],
  );
  return rows[0];
}

export async function updateCustomer(
  id,
  input,
) {
  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    `UPDATE customers SET email = $1, password_hash = $2 WHERE id = $3 RETURNING ${CUSTOMER_COLUMNS}`,
    [input.email, password_hash, id],
  );
  return rows[0];
}

export async function patchCustomer(
  id,
  input,
) {
  const password_hash =
    input.password === undefined
      ? null
      : await bcrypt.hash(input.password, BCRYPT_ROUNDS);
      const { rows } = await pool.query(
    `UPDATE customers
     SET email = COALESCE($1, email),
         password_hash = COALESCE($2, password_hash)
     WHERE id = $3
     RETURNING ${CUSTOMER_COLUMNS}`,
    [input.email ?? null, password_hash, id],
  );
  return rows[0];
}

export async function deleteCustomer(
  id,
) {
  const { rows } = await pool.query(
    `DELETE FROM customers WHERE id = $1 RETURNING ${CUSTOMER_COLUMNS}`,
    [id],
  );
  return rows[0];
}
