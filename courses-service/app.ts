import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import courseRoutes from './src/routes/course.routes';
import lessonRoutes from './src/routes/lesson.routes';
import commentRoutes from './src/routes/comment.routes';
import enrollmentRoutes from './src/routes/enrollment.routes';
import tagRoutes from './src/routes/tag.routes';

import { errorHandler } from './src/middlewares/errorHandler';
import { loggingMiddleware } from './src/middlewares/loggingMiddleware';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(morgan('dev'));

app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/tags', tagRoutes);

app.use(errorHandler);

export default app;
