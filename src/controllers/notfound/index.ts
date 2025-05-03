import { Request, Response } from 'express';

import { createFailResponse } from '../../utils/response';

export function notFoundController(req: Request, res: Response) {
  return createFailResponse(req, res, 404, 'Not Found');
}
