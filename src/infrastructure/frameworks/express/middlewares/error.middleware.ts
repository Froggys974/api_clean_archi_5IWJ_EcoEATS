import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}