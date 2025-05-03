import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../response';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (err instanceof AppError) {
    return createErrorResponse(req, res, err.statusCode, err.message, err.error);
  }

  return createErrorResponse(req, res, 500, 'Internal Server Error', err);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return createErrorResponse(req, res, 404, 'Resource not found');
};

export const validationErrorHandler = (err: any, req: Request, res: Response) => {
  return createErrorResponse(req, res, 400, 'Validation Error', err.details);
}; 