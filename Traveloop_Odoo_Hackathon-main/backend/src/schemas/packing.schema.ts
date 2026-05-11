import { z } from 'zod';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'gear', 'other'] as const;

export const createPackingSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(150),
  category: z.enum(CATEGORIES).default('other'),
});

export const updatePackingSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  category: z.enum(CATEGORIES).optional(),
  is_packed: z.boolean().optional(),
});
