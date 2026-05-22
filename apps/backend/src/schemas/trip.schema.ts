import { z } from 'zod';

const isoDateString = z
  .string()
  .trim()
  .refine((d) => !Number.isNaN(Date.parse(d)), 'Invalid date format');

export const tripListQuerySchema = z.object({
  status: z.enum(['upcoming', 'active', 'past', 'draft']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type TripListQuery = z.infer<typeof tripListQuerySchema>;

export const createTripSchema = z
  .object({
    name: z.string().trim().min(1, 'Trip name is required').max(150),
    description: z.string().trim().optional(),
    start_date: isoDateString.optional(),
    end_date: isoDateString.optional(),
    cover_photo_url: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().url().optional()
    ),
    total_budget: z.coerce.number().min(0).optional(),
    is_public: z.boolean().optional().default(false),
  })
  .strict()
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date);
      }
      return true;
    },
    { message: 'end_date must be after start_date', path: ['end_date'] }
  )
  .refine(
    (data) => !data.end_date || !!data.start_date,
    { message: 'start_date is required when end_date is provided', path: ['start_date'] }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;

const updateTripFields = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().nullable().optional(),
    start_date: isoDateString.optional(),
    end_date: isoDateString.optional(),
    cover_photo_url: z.union([z.string().url(), z.null()]).optional(),
    total_budget: z.union([z.coerce.number().min(0), z.null()]).optional(),
    is_public: z.boolean().optional(),
  })
  .strict();

/** Allows empty / missing body on PATCH (Express may set `req.body` to undefined). */
export const updateTripSchema = z.preprocess(
  (data) => (data != null && typeof data === 'object' ? data : {}),
  updateTripFields
);

export type UpdateTripInput = z.infer<typeof updateTripFields>;
