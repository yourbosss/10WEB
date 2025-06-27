import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('student'),
  enrollmentController.enrollCourse
);

router.get(
  '/',
  authenticateToken,
  authorizeRoles('student'),
  enrollmentController.getUserEnrollments
);

export default router;
