import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { createProjectWithDefaultTasks } from "../db/mutations/project";
import {
  getProjectWithTasks,
  getProjectStats,
} from "../db/queries/projects";
import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { parseId } from "../lib/parse-id";

export const projectsRouter = Router();

projectsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const allProjects = await db.query.projects.findMany({
      with: { owner: { columns: { id: true, name: true, email: true } } },
    });
    res.json(allProjects);
  }),
);

projectsRouter.get(
  "/:id/with-todo-tasks",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid project id");

    const project = await getProjectWithTasks(id);
    if (!project) throw new HttpError(404, "Project not found");
    res.json(project);
  }),
);

projectsRouter.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid project id");

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: { id: true },
    });
    if (!project) throw new HttpError(404, "Project not found");

    const stats = await getProjectStats(id);
    res.json(stats);
  }),
);

projectsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid project id");

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        tasks: true,
      },
    });

    if (!project) throw new HttpError(404, "Project not found");
    res.json(project);
  }),
);

projectsRouter.post(
  "/with-default-tasks",
  asyncHandler(async (req, res) => {
    const { name, ownerId, defaultTasks } = req.body ?? {};
    if (
      typeof name !== "string" ||
      typeof ownerId !== "number" ||
      !Array.isArray(defaultTasks) ||
      !defaultTasks.every((t: unknown) => typeof t === "string")
    ) {
      throw new HttpError(
        400,
        "name (string), ownerId (number), and defaultTasks (string[]) are required",
      );
    }

    const result = await createProjectWithDefaultTasks({
      name,
      ownerId,
      defaultTasks,
    });
    res.status(201).json(result);
  }),
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, description, ownerId } = req.body ?? {};
    if (typeof name !== "string" || typeof ownerId !== "number") {
      throw new HttpError(400, "name (string) and ownerId (number) are required");
    }

    const [project] = await db
      .insert(projects)
      .values({
        name,
        ownerId,
        description: typeof description === "string" ? description : null,
      })
      .returning();

    res.status(201).json(project);
  }),
);

projectsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid project id");

    const { name, description, ownerId } = req.body ?? {};
    const updates: Partial<{
      name: string;
      description: string | null;
      ownerId: number;
    }> = {};

    if (name !== undefined) {
      if (typeof name !== "string") throw new HttpError(400, "name must be a string");
      updates.name = name;
    }
    if (description !== undefined) {
      updates.description =
        description === null || typeof description === "string"
          ? description
          : (() => {
              throw new HttpError(400, "description must be a string or null");
            })();
    }
    if (ownerId !== undefined) {
      if (typeof ownerId !== "number") {
        throw new HttpError(400, "ownerId must be a number");
      }
      updates.ownerId = ownerId;
    }
    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    if (!project) throw new HttpError(404, "Project not found");
    res.json(project);
  }),
);

projectsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid project id");

    const [project] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (!project) throw new HttpError(404, "Project not found");
    res.status(204).send();
  }),
);
