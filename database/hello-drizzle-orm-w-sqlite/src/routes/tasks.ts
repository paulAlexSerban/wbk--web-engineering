import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { projects, tasks, taskTags, tags } from "../db/schema";
import { moveTasksToProject } from "../db/mutations/project";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../db/queries/tasks";
import { getTasksByProject } from "../db/prepared";
import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { parseId } from "../lib/parse-id";

const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    TASK_STATUSES.includes(value as TaskStatus)
  );
}

export const tasksRouter = Router();

tasksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const projectId = req.query.projectId
      ? parseId(String(req.query.projectId))
      : null;

    if (req.query.projectId && projectId === null) {
      throw new HttpError(400, "Invalid projectId query parameter");
    }

    if (projectId !== null) {
      const projectTasks = await getTasksByProject.execute({ projectId });
      res.json(projectTasks);
      return;
    }

    const allTasks = await db.query.tasks.findMany({
      with: {
        project: { columns: { id: true, name: true } },
        assignee: { columns: { id: true, name: true, email: true } },
        taskTags: { with: { tag: true } },
      },
    });
    res.json(allTasks);
  }),
);

tasksRouter.post(
  "/move",
  asyncHandler(async (req, res) => {
    const { taskIds, targetProjectId } = req.body ?? {};
    if (
      !Array.isArray(taskIds) ||
      !taskIds.every((id: unknown) => typeof id === "number") ||
      typeof targetProjectId !== "number"
    ) {
      throw new HttpError(
        400,
        "taskIds (number[]) and targetProjectId (number) are required",
      );
    }

    await moveTasksToProject(taskIds, targetProjectId);
    res.status(204).send();
  }),
);

tasksRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid task id");

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        project: true,
        assignee: { columns: { id: true, name: true, email: true } },
        taskTags: { with: { tag: true } },
      },
    });

    if (!task) throw new HttpError(404, "Task not found");
    res.json(task);
  }),
);

tasksRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, projectId, assigneeId, priority, description, dueDate } =
      req.body ?? {};

    if (typeof title !== "string" || typeof projectId !== "number") {
      throw new HttpError(400, "title (string) and projectId (number) are required");
    }

    const projectExists = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: { id: true },
    });
    if (!projectExists) throw new HttpError(404, "Project not found");

    if (assigneeId !== undefined && typeof assigneeId !== "number") {
      throw new HttpError(400, "assigneeId must be a number");
    }
    if (priority !== undefined && typeof priority !== "number") {
      throw new HttpError(400, "priority must be a number");
    }

    const task = await createTask({
      title,
      projectId,
      assigneeId,
      priority,
    });

    if (description !== undefined || dueDate !== undefined) {
      const extra: Partial<{
        description: string | null;
        dueDate: Date | null;
      }> = {};
      if (description !== undefined) {
        if (description !== null && typeof description !== "string") {
          throw new HttpError(400, "description must be a string or null");
        }
        extra.description = description;
      }
      if (dueDate !== undefined) {
        const parsed = dueDate === null ? null : new Date(dueDate);
        if (parsed !== null && Number.isNaN(parsed.getTime())) {
          throw new HttpError(400, "dueDate must be a valid date");
        }
        extra.dueDate = parsed;
      }

      const [updated] = await db
        .update(tasks)
        .set(extra)
        .where(eq(tasks.id, task.id))
        .returning();
      res.status(201).json(updated);
      return;
    }

    res.status(201).json(task);
  }),
);

tasksRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid task id");

    const { status } = req.body ?? {};
    if (!isTaskStatus(status)) {
      throw new HttpError(400, "status must be todo, in_progress, or done");
    }

    const updated = await updateTaskStatus(id, status);
    if (!updated) throw new HttpError(404, "Task not found");
    res.json(updated);
  }),
);

tasksRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid task id");

    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      projectId,
      dueDate,
    } = req.body ?? {};

    const updates: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: number;
      assigneeId: number | null;
      projectId: number;
      dueDate: Date | null;
      completedAt: Date | null;
    }> = {};

    if (title !== undefined) {
      if (typeof title !== "string") throw new HttpError(400, "title must be a string");
      updates.title = title;
    }
    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        throw new HttpError(400, "description must be a string or null");
      }
      updates.description = description;
    }
    if (status !== undefined) {
      if (!isTaskStatus(status)) {
        throw new HttpError(400, "status must be todo, in_progress, or done");
      }
      updates.status = status;
      updates.completedAt = status === "done" ? new Date() : null;
    }
    if (priority !== undefined) {
      if (typeof priority !== "number") {
        throw new HttpError(400, "priority must be a number");
      }
      updates.priority = priority;
    }
    if (assigneeId !== undefined) {
      if (assigneeId !== null && typeof assigneeId !== "number") {
        throw new HttpError(400, "assigneeId must be a number or null");
      }
      updates.assigneeId = assigneeId;
    }
    if (projectId !== undefined) {
      if (typeof projectId !== "number") {
        throw new HttpError(400, "projectId must be a number");
      }
      updates.projectId = projectId;
    }
    if (dueDate !== undefined) {
      const parsed = dueDate === null ? null : new Date(dueDate);
      if (parsed !== null && Number.isNaN(parsed.getTime())) {
        throw new HttpError(400, "dueDate must be a valid date");
      }
      updates.dueDate = parsed;
    }

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, "No fields to update");
    }

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    if (!task) throw new HttpError(404, "Task not found");
    res.json(task);
  }),
);

tasksRouter.post(
  "/:taskId/tags/:tagId",
  asyncHandler(async (req, res) => {
    const taskId = parseId(req.params.taskId);
    const tagId = parseId(req.params.tagId);
    if (taskId === null || tagId === null) {
      throw new HttpError(400, "Invalid task or tag id");
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true },
    });
    if (!task) throw new HttpError(404, "Task not found");

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, tagId),
      columns: { id: true },
    });
    if (!tag) throw new HttpError(404, "Tag not found");

    await db.insert(taskTags).values({ taskId, tagId });
    res.status(201).json({ taskId, tagId });
  }),
);

tasksRouter.delete(
  "/:taskId/tags/:tagId",
  asyncHandler(async (req, res) => {
    const taskId = parseId(req.params.taskId);
    const tagId = parseId(req.params.tagId);
    if (taskId === null || tagId === null) {
      throw new HttpError(400, "Invalid task or tag id");
    }

    const [link] = await db
      .delete(taskTags)
      .where(and(eq(taskTags.taskId, taskId), eq(taskTags.tagId, tagId)))
      .returning();

    if (!link) throw new HttpError(404, "Task-tag link not found");
    res.status(204).send();
  }),
);

tasksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) throw new HttpError(400, "Invalid task id");

    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      columns: { id: true },
    });
    if (!existing) throw new HttpError(404, "Task not found");

    await deleteTask(id);
    res.status(204).send();
  }),
);
