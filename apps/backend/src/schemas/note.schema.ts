import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content is required').max(5000),
  stop_id: z.string().uuid().optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content is required').max(5000),
});
