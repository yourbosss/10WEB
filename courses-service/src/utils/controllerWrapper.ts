import { Request, Response, NextFunction, RequestHandler } from 'express';

export class ControllerWrapper {
  protected wrap(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
    return (req, res, next) => {
      handler(req, res, next).catch(next);
    };
  }
}
