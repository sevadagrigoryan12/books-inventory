import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validation';
import { createFailResponse } from '../../utils/response';

export function validationError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    const errorMessage = Object.keys(err.details).reduce((errMessage: string, errKey: string) => {
      const errors = (err as any).details[errKey].map((e: any) => e.message).join('. ');
      return `${errMessage}${errors}`;
    }, '');

    return createFailResponse(req, res, 400, errorMessage, {}, err);
  }

  return next(err);
}
