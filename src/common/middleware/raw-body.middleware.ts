// src/common/middleware/raw-body.middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

export function rawBodyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.originalUrl === '/stripe/webhook') {
    bodyParser.raw({ type: '*/*' })(req, res, () => {
      // 👇 Gán thủ công rawBody
      (req as any).rawBody = req.body;
      next();
    });
  } else {
    next();
  }
}
