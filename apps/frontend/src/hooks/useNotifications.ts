import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationList {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ─── Fetch notifications (paginated) ────────────────────────────
export function useNotifications(page = 1, limit = 20) {
  return useQuery<NotificationList>({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page, limit } });
      return data.data;
    },
    refetchInterval: 30_000, // poll every 30 seconds
    staleTime: 20_000,
  });
}

// ─── Unread count ────────────────────────────────────────────────
export function useNotificationCount() {
  return useQuery<number>({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.data.count as number;
    },
    refetchInterval: 30_000, // poll every 30 seconds
    staleTime: 20_000,
  });
}

// ─── Mark one notification as read ──────────────────────────────
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data.data as Notification;
    },
    // Optimistic update: mark as read immediately in cache
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notification-count'] });

      const previousCount = queryClient.getQueryData<number>(['notification-count']);

      // Optimistically decrement count
      queryClient.setQueryData<number>(['notification-count'], (old = 0) =>
        Math.max(0, old - 1)
      );

      // Optimistically mark notification as read in all cached pages
      queryClient.setQueriesData<NotificationList>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            ),
          };
        }
      );

      return { previousCount };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notification-count'], context.previousCount);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });
}

// ─── Mark all as read ────────────────────────────────────────────
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notification-count'] });

      const previousCount = queryClient.getQueryData<number>(['notification-count']);

      // Optimistically zero out badge
      queryClient.setQueryData<number>(['notification-count'], 0);

      // Optimistically mark all notifications as read
      queryClient.setQueriesData<NotificationList>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((n) => ({ ...n, is_read: true })),
          };
        }
      );

      return { previousCount };
    },
    onError: (_err, _v, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(['notification-count'], context.previousCount);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Delete a notification ───────────────────────────────────────
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });
}
