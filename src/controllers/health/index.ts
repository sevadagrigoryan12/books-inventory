import { Request, Response } from 'express';

export const healthController = (_req: Request, res: Response): Response => {
  return res.json({
    status: 'OK',
    date: new Date().toISOString()
  });
};
