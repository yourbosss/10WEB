import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Логируем ошибку в консоль (можно заменить на более продвинутый логгер)
  console.error(`[${new Date().toISOString()}] Ошибка:`, err.message);

  // Если заголовки уже отправлены, передаём ошибку дальше
  if (res.headersSent) {
    return next(err);
  }

  // Формируем ответ клиенту
  res.status(500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера',
    // В режиме разработки добавляем стек ошибки для отладки
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
