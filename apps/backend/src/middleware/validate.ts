import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validates `req.body` against a Zod schema. On failure: 400 with field-level messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues ?? [];
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body validation failed',
          fields: issues.map((e) => ({
            path: e.path.length ? e.path.join('.') : '(root)',
            message: e.message,
          })),
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates `req.query` against a Zod schema. On failure: 400 with field-level messages.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues ?? [];
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter validation failed',
          fields: issues.map((e) => ({
            path: e.path.length ? e.path.join('.') : '(root)',
            message: e.message,
          })),
        },
      });
      return;
    }
    Object.defineProperty(req, 'query', {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
}
