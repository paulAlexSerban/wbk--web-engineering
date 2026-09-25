import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger, stripSerializedErr } from './logger.js';
import routes from './routes/index.js';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/index.js';
import { register, httpMetrics } from './metrics.js';
const routeTemplate = (req) => {
  if (!req.route) return undefined;
  const path = req.route.path ?? '';
  if (path === '/' || path === '') return req.baseUrl || '/';
  return `${req.baseUrl}${path}`;
};

const app = express();

app.use(httpMetrics(routeTemplate));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id']?.toString() || randomUUID(),
  autoLogging: {
    ignore: (req) =>
      req.path === '/health' ||
      req.path === '/health/' ||
      req.path === '/metrics',
  },
  serializers: {
    err: stripSerializedErr,
  },
  // attributes here become structured fields, not string concatenation
  customProps: (req, res) => {
    const props = {};
    const route = res.locals?.route || routeTemplate(req);
    if (route) props.route = route;
    if (res.locals?.reason) props.reason = res.locals.reason;
    return props;
  },
  customErrorMessage: (_req, res) =>
    res.statusCode >= 500 ? 'request errored' : 'request rejected',
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/health', healthRouter);

app.use('/api', routes);
app.use(errorHandler);

export default app;
