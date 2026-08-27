import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

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
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: err.message,
        method: req.method,
        path: req.originalUrl,
    }));
    res.json(err);
};
