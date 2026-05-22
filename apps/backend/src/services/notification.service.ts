import prisma from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import type { NotificationType } from '../schemas/notification.schema';

// ─── Internal creation helper (called by other services) ────────
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      user_id: params.userId,
      type: params.type,
      message: params.message,
    },
  });
}

// ─── List notifications (paginated, newest first) ────────────────
export async function listNotifications(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
  ]);

  return { items, total, page, limit };
}

// ─── Unread count ────────────────────────────────────────────────
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });
}

// ─── Mark single notification as read ───────────────────────────
export async function markAsRead(notificationId: string, userId: string) {
  // Verify ownership first
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, user_id: true },
  });
  if (!notif) {
    throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  }
  if (notif.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot modify this notification');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });
}

// ─── Mark all as read ────────────────────────────────────────────
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
  return { updated: result.count };
}

// ─── Delete a notification ───────────────────────────────────────
export async function deleteNotification(notificationId: string, userId: string) {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, user_id: true },
  });
  if (!notif) {
    throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  }
  if (notif.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot delete this notification');
  }

  await prisma.notification.delete({ where: { id: notificationId } });
}
