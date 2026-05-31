import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err && typeof err === "object" && "code" in err && err.code === "SQLITE_CONSTRAINT") {
    res.status(409).json({ error: "Database constraint violation" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
