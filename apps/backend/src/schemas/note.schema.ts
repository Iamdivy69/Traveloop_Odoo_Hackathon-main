import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content is required').max(5000),
  stop_id: z.string().uuid().nullable().optional(),
  image_url: z.string().optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content is required').max(5000).optional(),
  stop_id: z.string().uuid().nullable().optional(),
  image_url: z.string().optional().nullable(),
});
