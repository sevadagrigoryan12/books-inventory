import { Request, Response } from 'express';

export function healthController(_req: Request, res: Response) {
  return res.json({
    status: 'ok',
    date: new Date(),
  });
}
