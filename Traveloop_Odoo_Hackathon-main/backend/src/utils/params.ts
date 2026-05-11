import { Request } from 'express';

/** Safely extract a route parameter as string (Express 5 compatibility) */
export function p(req: Request, name: string): string {
  const val = req.params[name];
  return (Array.isArray(val) ? val[0] : val) as string;
}
