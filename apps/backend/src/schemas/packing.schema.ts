import { z } from 'zod';

const CATEGORIES = [
  'Clothing',
  'Documents',
  'Electronics',
  'Toiletries',
  'Medicine',
  'Snacks',
  'Other',
] as const;

export const createPackingSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(150),
  category: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val;
      const match = CATEGORIES.find((c) => c.toLowerCase() === val.toLowerCase());
      return match || val;
    },
    z.enum(CATEGORIES).default('Other')
  ),
});

export const updatePackingSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(150).optional(),
  category: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val;
      const match = CATEGORIES.find((c) => c.toLowerCase() === val.toLowerCase());
      return match || val;
    },
    z.enum(CATEGORIES).optional()
  ),
  is_packed: z.boolean().optional(),
});
