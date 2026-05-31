import { db } from "../index";
import { tasks, users, projects } from "../schema";
import { eq, and, desc, gte, isNull, inArray } from "drizzle-orm";

// Insert a task
export async function createTask(data: {
  title: string;
  projectId: number;
  assigneeId?: number;
  priority?: number;
}) {
  const [task] = await db
    .insert(tasks)
    .values({
      title: data.title,
      projectId: data.projectId,
      assigneeId: data.assigneeId ?? null,
      priority: data.priority ?? 0,
    })
    .returning();

  return task;
}

// Update with conditional fields
export async function updateTaskStatus(
  taskId: number,
  status: "todo" | "in_progress" | "done",
) {
  const [updated] = await db
    .update(tasks)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
    })
    .where(eq(tasks.id, taskId))
    .returning();

  return updated;
}

// Filtered query with sorting
export async function getOverdueTasks(projectId: number, asOf: Date) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueDate: tasks.dueDate,
      assigneeName: users.name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.status, "todo"),
        gte(tasks.dueDate, new Date(0)), // dueDate is set
        // tasks where dueDate < asOf
      ),
    )
    .orderBy(desc(tasks.priority));
}

// Delete with cascade (handled by DB constraint)
export async function deleteTask(taskId: number) {
  return db.delete(tasks).where(eq(tasks.id, taskId));
}
