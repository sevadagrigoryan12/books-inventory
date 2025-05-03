import { Request, Response, NextFunction } from 'express';
import { ValidationError as ExpressValidationError } from 'express-validation';
import { AppError, ValidationError } from '../../utils/error';

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  console.error('Error:', error);

  // Handle express-validation errors
  if (error instanceof ExpressValidationError) {
    return response.status(400).json({
      success: false,
      type: 'ValidationError',
      message: 'Validation failed',
      errors: error.details,
    });
  }

  // Handle our custom errors
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      type: error.name,
      message: error.message,
      ...(error instanceof ValidationError && { errors: error.details }),
    });
  }

  // Handle unexpected errors
  return response.status(500).json({
    success: false,
    type: 'InternalServerError',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
};
