import { Request, Response, NextFunction } from 'express';

// Simple regex to strip HTML tags
const HTML_TAG_REGEX = /<[^>]*>/g;

function sanitize(value: any): any {
  if (typeof value === 'string') {
    return value.replace(HTML_TAG_REGEX, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: { [key: string]: any } = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitize(value[key]);
    }
    return sanitizedObj;
  }
  return value;
}

/**
 * Middleware that strips HTML tags from all string values in req.body for POST/PUT/PATCH requests.
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    req.body = sanitize(req.body);
  }
  next();
}
