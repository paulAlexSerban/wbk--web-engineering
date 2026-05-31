import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { tags } from "../db/schema";
import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { parseId } from "../lib/parse-id";

export const tagsRouter = Router();

tagsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const allTags = await db.select().from(tags);
    res.json(allTags);
  }),
);

tagsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid tag id");

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
      with: { taskTags: { with: { task: true } } },
    });

    if (!tag) throw new HttpError(404, "Tag not found");
    res.json(tag);
  }),
);

tagsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, color } = req.body ?? {};
    if (typeof name !== "string") {
      throw new HttpError(400, "name is required");
    }

    const [tag] = await db
      .insert(tags)
      .values({
        name,
        color: typeof color === "string" ? color : undefined,
      })
      .returning();

    res.status(201).json(tag);
  }),
);

tagsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid tag id");

    const { name, color } = req.body ?? {};
    const updates: Partial<{ name: string; color: string }> = {};

    if (name !== undefined) {
      if (typeof name !== "string") throw new HttpError(400, "name must be a string");
      updates.name = name;
    }
    if (color !== undefined) {
      if (typeof color !== "string") throw new HttpError(400, "color must be a string");
      updates.color = color;
    }
    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const [tag] = await db
      .update(tags)
      .set(updates)
      .where(eq(tags.id, id))
      .returning();

    if (!tag) throw new HttpError(404, "Tag not found");
    res.json(tag);
  }),
);

tagsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid tag id");

    const [tag] = await db.delete(tags).where(eq(tags.id, id)).returning();
    if (!tag) throw new HttpError(404, "Tag not found");
    res.status(204).send();
  }),
);
