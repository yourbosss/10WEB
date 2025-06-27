import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
  };
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Неавторизованный' });
      return;
    }

    const user = await User.findById(userId).select('-password').populate('favoriteCourseIds');
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Неавторизованный' });
      return;
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const courseId = req.params.courseId;
    if (!userId) {
      res.status(401).json({ message: 'Неавторизованный' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    const index = user.favoriteCourseIds.findIndex(id => id.toString() === courseId);
    if (index === -1) {
      user.favoriteCourseIds.push(new mongoose.Types.ObjectId(courseId));
    } else {
      user.favoriteCourseIds.splice(index, 1);
    }

    await user.save();

    res.json({
      message: index === -1 ? 'Курс добавлен в избранное' : 'Курс удалён из избранного',
    });
  } catch (error) {
    next(error);
  }
};
