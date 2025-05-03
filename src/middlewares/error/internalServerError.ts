import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../../utils/response';

export function internalServerError(err: any, req: Request, res: Response, _next: NextFunction) {
  return createErrorResponse(req, res, 500, 'Internal Server Error', err);
}
