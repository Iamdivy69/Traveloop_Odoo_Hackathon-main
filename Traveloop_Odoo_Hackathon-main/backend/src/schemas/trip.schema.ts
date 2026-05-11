import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().trim().min(1, 'Trip name is required').max(150),
  start_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
  end_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
  description: z.string().trim().optional(),
  cover_photo_url: z.string().url().optional(),
  total_budget: z.number().min(0).optional(),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: 'end_date must be after start_date',
  path: ['end_date'],
});

export const updateTripSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  start_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format').optional(),
  end_date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format').optional(),
  description: z.string().trim().nullable().optional(),
  cover_photo_url: z.string().url().nullable().optional(),
  total_budget: z.number().min(0).nullable().optional(),
});

export const shareTripSchema = z.object({
  is_public: z.boolean(),
});
