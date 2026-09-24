const CONFLICTS = {
  "23505": "unique_violation",
  "23503": "foreign_key_violation",
};

export const errorHandler = (err, req, res, _next) => {
  const reason = CONFLICTS[err?.code];
  res.err = err;

  if (reason) {
    res.locals.reason = reason;
    if (res.headersSent) return;
    res.status(409).json({ error: "Conflict", reason });
    return;
  }

  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
};