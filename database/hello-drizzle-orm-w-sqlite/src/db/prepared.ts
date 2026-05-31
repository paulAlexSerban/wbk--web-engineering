import { db } from "./index";
import { tasks } from "./schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Prepare a statement once, execute many times
export const getTasksByProject = db
  .select()
  .from(tasks)
  .where(eq(tasks.projectId, sql.placeholder("projectId")))
  .prepare();

export const getTasksByAssignee = db
  .select({
    id: tasks.id,
    title: tasks.title,
    status: tasks.status,
    dueDate: tasks.dueDate,
  })
  .from(tasks)
  .where(
    and(
      eq(tasks.assigneeId, sql.placeholder("assigneeId")),
      eq(tasks.status, sql.placeholder("status")),
    ),
  )
  .prepare();

// Usage:
// const userTodos = await getTasksByAssignee.execute({
//   assigneeId: 42,
//   status: "todo",
// });