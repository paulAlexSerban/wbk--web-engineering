export const errorHandler = (err, req, res, _next) => {
  res.err = err;
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
};