import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from './logger.js';
import routes from './routes/index.js';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/index.js';

const app = express();

app.use(pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id']?.toString() || randomUUID(),
  // attributes here become structured fields, not string concatenation
  customProps: req => ({ route: req.route?.path }),
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/health', healthRouter);

app.use('/api', routes);
app.use(errorHandler);

export default app;
