import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/health', healthRouter);

app.use('/api', routes);
app.use(errorHandler);

export default app;
