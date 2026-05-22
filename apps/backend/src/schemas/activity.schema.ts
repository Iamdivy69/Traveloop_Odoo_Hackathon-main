import { z } from 'zod';

export const addStopActivitySchema = z
  .object({
    activity_id: z.string().uuid('Invalid activity ID').optional(),
    custom_title: z.string().trim().min(1).max(150).optional(),
    scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    custom_cost: z.number().min(0).optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => !!data.activity_id || !!data.custom_title,
    { message: 'Either activity_id or custom_title is required', path: ['activity_id'] }
  );

export type AddStopActivityInput = z.infer<typeof addStopActivitySchema>;

export const updateStopActivitySchema = z.object({
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').nullable().optional(),
  custom_cost: z.number().min(0).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export type UpdateStopActivityInput = z.infer<typeof updateStopActivitySchema>;
