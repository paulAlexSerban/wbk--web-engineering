import { db } from "../index";
import { tasks, projects } from "../schema";
import { eq, desc, sql, count, avg } from "drizzle-orm";

export async function getProjectWithTasks(projectId: number) {
  return db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      tasks: {
        where: eq(tasks.status, "todo"),
        orderBy: [desc(tasks.priority)],
        with: {
          assignee: {
            columns: { id: true, name: true },
          },
          taskTags: {
            with: {
              tag: true,
            },
          },
        },
      },
    },
  });
}

export async function getProjectStats(projectId: number) {
  const [stats] = await db
    .select({
      total: count(tasks.id),
      completed: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
      avgPriority: avg(tasks.priority),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  return {
    total: stats.total,
    completed: stats.completed ?? 0,
    completionRate: stats.total > 0 ? (stats.completed ?? 0) / stats.total : 0,
    avgPriority: stats.avgPriority,
  };
}
