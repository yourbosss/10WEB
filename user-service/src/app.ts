import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

export default app;
