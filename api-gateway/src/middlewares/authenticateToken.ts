import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token not provided' });
    return; 
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: string; role: string };

    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
    return; 
  }
};