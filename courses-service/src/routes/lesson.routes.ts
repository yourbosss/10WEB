import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const lessonController = new LessonController();

router.get('/course/:courseId', lessonController.getLessonsByCourse);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  lessonController.createLesson
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  lessonController.updateLesson
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  lessonController.deleteLesson
);

export default router;
