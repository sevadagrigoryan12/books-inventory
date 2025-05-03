import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userEmail = req.headers['user-email'] as string;
  const isAdminUser = userEmail === 'admin@dummy-library.com';

  if (!isAdminUser) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  next();
}; 