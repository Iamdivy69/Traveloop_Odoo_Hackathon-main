import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the provided schema.
 * Returns 422 with structured errors on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues ?? [];
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body validation failed',
          details: issues.map((e: any) => ({
            field: e.path.join('.'),
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
 * Validate query parameters against the provided schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues ?? [];
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter validation failed',
          details: issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      });
      return;
    }
    req.query = result.data as any;
    next();
  };
}
