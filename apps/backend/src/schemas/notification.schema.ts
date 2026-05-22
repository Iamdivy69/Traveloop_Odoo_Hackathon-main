import { z } from 'zod';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

export const NOTIFICATION_TYPES = [
  'FRIEND_REQUEST',
  'FRIEND_ACCEPTED',
  'TRIP_SHARED',
  'ADMIN_ACTION',
] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];
