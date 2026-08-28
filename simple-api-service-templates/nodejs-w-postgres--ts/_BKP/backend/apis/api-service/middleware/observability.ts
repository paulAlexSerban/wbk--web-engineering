import { Request, Response, NextFunction, RequestHandler } from 'express';
import { meter, logger, SeverityNumber } from '../telemetry/otel';

const httpRequestDuration = meter.createHistogram('http_request_duration_seconds', {
    description: 'Duration of HTTP requests in seconds',
    unit: 's',
    advice: {
        explicitBucketBoundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    },
});

const isObservabilityPath = (path: string) => path === '/health';

export const observabilityMiddleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (isObservabilityPath(req.path)) {
        return next();
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const route = req.route?.path
            ? `${req.baseUrl}${req.route.path}`
            : req.path;

        httpRequestDuration.record(durationMs / 1000, {
            method: req.method,
            route,
            status_code: String(res.statusCode),
        });

        logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: `${req.method} ${req.originalUrl} ${res.statusCode}`,
            attributes: {
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                duration_ms: Math.round(durationMs * 100) / 100,
            },
        });
    });

    next();
};

export const healthHandler = (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
};
