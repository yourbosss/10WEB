import { Request, Response, NextFunction } from 'express';

export const checkAuthentication = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Неавторизованный' });
  }
  next();
};
