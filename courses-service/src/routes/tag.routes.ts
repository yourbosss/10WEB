import { Router } from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tag.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authorizeRoles } from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', getTags);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  createTag
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteTag
);

export default router;
