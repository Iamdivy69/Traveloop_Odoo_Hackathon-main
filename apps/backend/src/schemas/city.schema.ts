import { z } from 'zod';

// ─── City Schemas ────────────────────────────────────────────────
export const createCitySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  country: z.string().trim().min(1, 'Country is required').max(100),
  region: z.string().trim().max(100).optional(),
  description: z.string().trim().optional(),
  image_url: z.string().url('Must be a valid URL').optional(),
  cost_index: z.coerce.number().min(0).max(10000),
  popularity_score: z.coerce.number().int().min(0).default(0),
});
export type CreateCityInput = z.infer<typeof createCitySchema>;

export const updateCitySchema = createCitySchema.partial();
export type UpdateCityInput = z.infer<typeof updateCitySchema>;

export const cityListQuerySchema = z.object({
  q: z.string().trim().optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().optional(),
  sort: z.enum(['popularity', 'cost', 'name']).optional().default('popularity'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type CityListQuery = z.infer<typeof cityListQuerySchema>;

// ─── Activity Schemas ────────────────────────────────────────────
export const ACTIVITY_CATEGORIES = [
  'CULTURE', 'ADVENTURE', 'FOOD', 'NATURE',
  'SHOPPING', 'NIGHTLIFE', 'WELLNESS', 'HISTORY', 'OTHER',
] as const;
export type ActivityCategory = typeof ACTIVITY_CATEGORIES[number];

export const createActivitySchema = z.object({
  name: z.string().trim().min(1, 'Activity name is required').max(150),
  type: z.string().trim().min(1).max(50),
  cost: z.coerce.number().min(0).default(0),
  duration_mins: z.coerce.number().int().min(1).optional(),
  description: z.string().trim().optional(),
  image_url: z.string().url('Must be a valid URL').optional(),
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial();
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export const activityFilterSchema = z.object({
  category: z.enum(ACTIVITY_CATEGORIES).optional(),
  max_cost: z.coerce.number().min(0).optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ActivityFilterQuery = z.infer<typeof activityFilterSchema>;
