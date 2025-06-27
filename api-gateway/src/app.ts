import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { authenticateToken } from './middlewares/authenticateToken';
import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(morgan('dev'));

app.use(authenticateToken);

app.use('/api/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: { '^/api/courses': '' },
}));

app.use('/api/lessons', createProxyMiddleware({
  target: process.env.LESSON_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: { '^/api/lessons': '' },
}));

app.use('/api/comments', createProxyMiddleware({
  target: process.env.COMMENT_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: { '^/api/comments': '' },
}));

app.use('/api/enrollments', createProxyMiddleware({
  target: process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
  pathRewrite: { '^/api/enrollments': '' },
}));

app.use('/api/tags', createProxyMiddleware({
  target: process.env.TAG_SERVICE_URL || 'http://localhost:5006',
  changeOrigin: true,
  pathRewrite: { '^/api/tags': '' },
}));

app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
}));

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway worked' });
});

app.use(errorHandler);

export default app;
