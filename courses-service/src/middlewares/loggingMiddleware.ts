import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};
