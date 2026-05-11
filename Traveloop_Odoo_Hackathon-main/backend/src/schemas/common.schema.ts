import { z } from 'zod';

/** UUID format validation */
export const uuidParam = z.string().uuid('Invalid UUID format');

/** Pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
