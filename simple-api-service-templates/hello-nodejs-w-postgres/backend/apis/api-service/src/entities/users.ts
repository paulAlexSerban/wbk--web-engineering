import { pool } from "../db";

export type User = {
  id: number;
  username: string;
  password: string;
};

export type UserInput = {
  username: string;
  password: string;
};

export async function listUsers(): Promise<User[]> {
  const { rows } = await pool.query<User>(
    "SELECT id, username, password FROM users ORDER BY id",
  );
  return rows;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const { rows } = await pool.query<User>(
    "SELECT id, username, password FROM users WHERE id = $1",
    [id],
  );
  return rows[0];
}

export async function createUser(input: UserInput): Promise<User> {
  const { rows } = await pool.query<User>(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, password",
    [input.username, input.password],
  );
  return rows[0];
}

export async function updateUser(
  id: number,
  input: UserInput,
): Promise<User | undefined> {
  const { rows } = await pool.query<User>(
    "UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING id, username, password",
    [input.username, input.password, id],
  );
  return rows[0];
}

export async function patchUser(
  id: number,
  input: Partial<UserInput>,
): Promise<User | undefined> {
  const { rows } = await pool.query<User>(
    `UPDATE users
     SET username = COALESCE($1, username),
         password = COALESCE($2, password)
     WHERE id = $3
     RETURNING id, username, password`,
    [input.username ?? null, input.password ?? null, id],
  );
  return rows[0];
}

export async function deleteUser(id: number): Promise<User | undefined> {
  const { rows } = await pool.query<User>(
    "DELETE FROM users WHERE id = $1 RETURNING id, username, password",
    [id],
  );
  return rows[0];
}
