import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import {
    observabilityMiddleware,
    healthHandler,
    errorHandler,
} from './middleware';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(observabilityMiddleware);

app.get('/health', healthHandler);

app.use('/api', routes);
app.use(errorHandler);

export default app;
