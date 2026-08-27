import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Registry, collectDefaultMetrics, Histogram } from '@prometheus-io/client';

const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
});

const isObservabilityPath = (path: string) => path === '/metrics' || path === '/health';

export const observabilityMiddleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (isObservabilityPath(req.path)) {
        return next();
    }

    const start = process.hrtime.bigint();
    const endTimer = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const route = req.route?.path
            ? `${req.baseUrl}${req.route.path}`
            : req.path;

        endTimer({
            method: req.method,
            route,
            status_code: String(res.statusCode),
        });

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration_ms: Math.round(durationMs * 100) / 100,
        }));
    });

    next();
};

export const healthHandler = (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
};

export const metricsHandler = async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};
