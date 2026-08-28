import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger, SeverityNumber } from '../telemetry/otel';

interface CustomError extends Error {
    statusCode?: number;
    value?: string;
    errors?: Record<string, { message: string }>;
    code?: number;
}

export const errorHandler: ErrorRequestHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: err.message,
        attributes: {
            level: 'error',
            method: req.method,
            path: req.originalUrl,
        },
    });
    res.json(err);
};
