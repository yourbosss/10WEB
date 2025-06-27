import { Router } from 'express';
import { getUserProfile, deleteUser, toggleFavorite } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.get('/profile', asyncHandler(getUserProfile));
router.delete('/delete', asyncHandler(deleteUser));
router.post('/favorites/:courseId', asyncHandler(toggleFavorite));

export default router;
