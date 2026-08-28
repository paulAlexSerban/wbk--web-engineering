import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import healthRouter from './routes/health';
import { errorHandler } from './middleware';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/health', healthRouter);

app.use('/api', routes);
app.use(errorHandler);

export default app;
