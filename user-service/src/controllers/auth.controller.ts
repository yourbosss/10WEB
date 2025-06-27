import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Логин и пароль обязательны' });
      return;
    }

    const existingUser = await User.findOne({ username }).exec() as IUser | null;
    if (existingUser) {
      res.status(400).json({ message: 'Пользователь уже существует' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();

    const userId = user.id;

    const token = generateToken(userId, user.role);
    res.status(201).json({ token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Неизвестная ошибка'));
    }
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Логин и пароль обязательны' });
      return;
    }

    const user = await User.findOne({ username }).exec() as IUser | null;
    if (!user) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    const userId = user.id;

    const token = generateToken(userId, user.role);
    res.status(200).json({ token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Неизвестная ошибка'));
    }
  }
};
