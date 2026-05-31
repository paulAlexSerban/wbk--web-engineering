import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { parseId } from "../lib/parse-id";

export const usersRouter = Router();

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  }),
);

usersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid user id");

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        ownedProjects: true,
        assignedTasks: true,
      },
    });

    if (!user) throw new HttpError(404, "User not found");
    res.json(user);
  }),
);

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, name } = req.body ?? {};
    if (typeof email !== "string" || typeof name !== "string") {
      throw new HttpError(400, "email and name are required strings");
    }

    const [user] = await db.insert(users).values({ email, name }).returning();
    res.status(201).json(user);
  }),
);

usersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid user id");

    const { email, name } = req.body ?? {};
    const updates: Partial<{ email: string; name: string }> = {};
    if (email !== undefined) {
      if (typeof email !== "string") throw new HttpError(400, "email must be a string");
      updates.email = email;
    }
    if (name !== undefined) {
      if (typeof name !== "string") throw new HttpError(400, "name must be a string");
      updates.name = name;
    }
    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new HttpError(404, "User not found");
    res.json(user);
  }),
);

usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid user id");

    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    if (!user) throw new HttpError(404, "User not found");
    res.status(204).send();
  }),
);
