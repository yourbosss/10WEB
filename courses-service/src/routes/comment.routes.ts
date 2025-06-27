import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();
const commentController = new CommentController();

router.get('/', commentController.getComments);

// Создавать комментарии могут авторизованные пользователи (все роли)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher', 'student'),
  commentController.createComment
);

// Удалять комментарии могут автор и админ
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher', 'student'), // проверка в контроллере по авторству
  commentController.deleteComment
);

export default router;
