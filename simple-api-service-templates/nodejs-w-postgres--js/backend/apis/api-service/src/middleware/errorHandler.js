export const errorHandler = (err, req, res, _next) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: err.message,
        method: req.method,
        path: req.originalUrl,
    }));
    res.json(err);
};
