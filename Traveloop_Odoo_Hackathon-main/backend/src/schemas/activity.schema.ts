import { z } from 'zod';

export const addStopActivitySchema = z.object({
  activity_id: z.string().uuid('Invalid activity ID'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  custom_cost: z.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const updateStopActivitySchema = z.object({
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').nullable().optional(),
  custom_cost: z.number().min(0).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});
