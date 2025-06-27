// src/middlewares/authorizeRoles.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticateToken';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    next();
  };
};
