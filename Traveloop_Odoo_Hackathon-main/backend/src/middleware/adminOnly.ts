import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that restricts access to admin users only.
 * Must be used after the authenticate middleware.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.is_admin) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    });
    return;
  }
  next();
}
