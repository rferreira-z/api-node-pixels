import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  console.error(err);
  console.error(req.baseUrl);
  res.status(err.status || 500).json({
    message: err.message,
  });
};
