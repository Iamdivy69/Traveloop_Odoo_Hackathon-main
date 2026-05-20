import { Request, Response, NextFunction } from 'express';

/**
 * Restricts routes to admin users. Must run after `authenticate`.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.is_admin !== true) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  next();
}
