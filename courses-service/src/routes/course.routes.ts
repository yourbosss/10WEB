import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const courseController = new CourseController();

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  courseController.createCourse
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  courseController.deleteCourse
);

export default router;