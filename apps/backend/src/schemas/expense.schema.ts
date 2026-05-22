import { z } from 'zod';

export const expenseCategorySchema = z.enum([
  'FOOD',
  'TRANSPORT',
  'ACCOMMODATION',
  'ACTIVITY',
  'SHOPPING',
  'OTHER',
]);

const splitSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().min(0),
});

export const createExpenseSchema = z.object({
  title: z.string().min(2, 'Title is required').max(150),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().length(3).default('INR'),
  category: expenseCategorySchema,
  splits: z.array(splitSchema).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const splitExpenseSchema = z.object({
  splits: z.array(splitSchema).min(1, 'At least one split is required'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type SplitExpenseInput = z.infer<typeof splitExpenseSchema>;
