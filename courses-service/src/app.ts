import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import courseRoutes from './routes/course.routes';
import lessonRoutes from './routes/lesson.routes';
import commentRoutes from './routes/comment.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import tagRoutes from './routes/tag.routes';

import { errorHandler } from './middlewares/errorHandler';
import { loggingMiddleware } from './middlewares/loggingMiddleware';

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
