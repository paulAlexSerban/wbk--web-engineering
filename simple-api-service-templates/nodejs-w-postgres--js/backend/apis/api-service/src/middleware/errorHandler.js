export const errorHandler = (err, req, res, _next) => {
  res.log.error({ err }, err.message);
  res.status(500).json({ error: "Internal server error" });
};
