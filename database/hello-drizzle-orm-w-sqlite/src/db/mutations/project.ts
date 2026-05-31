import { db } from "../index";
import { projects, tasks, taskTags } from "../schema";
import { eq, inArray } from "drizzle-orm";

export async function createProjectWithDefaultTasks(data: {
  name: string;
  ownerId: number;
  defaultTasks: string[];
}): Promise<{ projectId: number; taskIds: number[] }> {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        name: data.name,
        ownerId: data.ownerId,
      })
      .returning({ id: projects.id });

    if (!project) {
      throw new Error("Failed to create project");
    }

    const insertedTasks = await tx
      .insert(tasks)
      .values(
        data.defaultTasks.map((title, index) => ({
          title,
          projectId: project.id,
          priority: data.defaultTasks.length - index,
        })),
      )
      .returning({ id: tasks.id });

    return {
      projectId: project.id,
      taskIds: insertedTasks.map((t) => t.id),
    };
  });
}

// Nested transactions use savepoints in SQLite
export async function moveTasksToProject(
  taskIds: number[],
  targetProjectId: number,
): Promise<void> {
  await db.transaction(async (tx) => {
    // Verify target project exists within the same transaction
    const target = await tx.query.projects.findFirst({
      where: eq(projects.id, targetProjectId),
    });

    if (!target) {
      tx.rollback(); // Explicit rollback; also triggered automatically by throws
      return;
    }

    await tx
      .update(tasks)
      .set({ projectId: targetProjectId })
      .where(inArray(tasks.id, taskIds));
  });
}
