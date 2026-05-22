import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(500),
  trip_id: z.string().uuid().optional(),
  image_url: z.string().url('Must be a valid URL').optional(),
  is_public: z.boolean().optional().default(true),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type FeedQuery = z.infer<typeof feedQuerySchema>;

export const friendRequestSchema = z.object({
  userId: z.string().uuid('Must be a valid user ID'),
});
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
