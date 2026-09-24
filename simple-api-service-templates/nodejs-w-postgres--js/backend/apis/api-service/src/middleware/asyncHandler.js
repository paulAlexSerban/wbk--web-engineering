export const rememberRoute = (req, res) => {
  if (!req.route || res.locals.route) return;
  const path = req.route.path ?? "";
  res.locals.route =
    path === "/" || path === "" ? req.baseUrl || "/" : `${req.baseUrl}${path}`;
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    rememberRoute(req, res);
    fn(req, res, next).catch(next);
  };
};

export const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};
