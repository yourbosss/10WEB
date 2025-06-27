import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {  // Здесь void, без Response в возвращаемом типе
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Токен не предоставлен' });
    return; // обязательно return после отправки ответа
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: string; role: string };

    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch {
    res.status(401).json({ message: 'Неверный или просроченный токен' });
    return; // обязательно return после отправки ответа
  }
};
