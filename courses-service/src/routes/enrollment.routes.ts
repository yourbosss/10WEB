import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const enrollmentController = new EnrollmentController();

// Записаться на курс могут только авторизованные студенты
router.post(
  '/',
  authenticateToken,
  authorizeRoles('student'),
  enrollmentController.enrollCourse
);

// Получить список своих записей могут только авторизованные студенты
router.get(
  '/',
  authenticateToken,
  authorizeRoles('student'),
  enrollmentController.getUserEnrollments
);

export default router;
