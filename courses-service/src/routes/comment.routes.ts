import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const commentController = new CommentController();

router.get('/', commentController.getComments);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher', 'student'),
  commentController.createComment
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher', 'student'), 
  commentController.deleteComment
);

export default router;
