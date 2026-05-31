import express from "express";
import { usersRouter } from "./routes/users";
import { projectsRouter } from "./routes/projects";
import { tasksRouter } from "./routes/tasks";
import { tagsRouter } from "./routes/tags";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/users", usersRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/tags", tagsRouter);

  app.use(errorHandler);

  return app;
}
