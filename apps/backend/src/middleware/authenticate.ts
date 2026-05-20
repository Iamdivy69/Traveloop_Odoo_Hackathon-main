import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** User context attached after successful JWT verification (JWT payload uses `sub` for user id). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  is_admin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    [key: string]: string;
  }
}

type JwtAuthClaims = {
  sub: string;
  email: string;
  is_admin: boolean;
};

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : '';
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & JwtAuthClaims;
    if (!decoded.sub || typeof decoded.email !== 'string' || typeof decoded.is_admin !== 'boolean') {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      is_admin: decoded.is_admin,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
