import { Request, Response } from 'express';

export const notFound = (_request: Request, response: Response) => {
  response.status(404).json({
    success: false,
    message: 'Not Found',
  });
};
