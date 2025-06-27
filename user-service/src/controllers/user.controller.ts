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
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('-password').populate('favoriteCourseIds');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
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
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted' });
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
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
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
      message: index === -1 ? 'Course added to favorites' : 'Course removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};