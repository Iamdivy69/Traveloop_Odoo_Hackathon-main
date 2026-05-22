import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────
export interface FriendUser {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

export interface FriendshipRecord {
  friendshipId: string;
  friend: FriendUser;
  since: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  requester: FriendUser;
}

export type FriendStatus = 'none' | 'requested_by_me' | 'requested_by_them' | 'friends';

// ─── Queries ────────────────────────────────────────────────────
export function useMyFriends() {
  return useQuery<FriendshipRecord[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/friends');
      return data.data;
    },
  });
}

export function useFriendRequests() {
  return useQuery<FriendRequest[]>({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const { data } = await api.get('/friends/requests');
      return data.data;
    },
  });
}

export function useFriendStatus(userId: string | null) {
  return useQuery<{ status: FriendStatus; requestId: string | null }>({
    queryKey: ['friend-status', userId],
    queryFn: async () => {
      const { data } = await api.get(`/friends/status/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post('/friends/request', { userId });
      return data.data;
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['friend-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['community-discover'] });
    },
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'accept' | 'decline' }) => {
      const { data } = await api.put(`/friends/${requestId}/${action}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      await api.delete(`/friends/${friendshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      // Invalidate all friend-status queries so profile pages update immediately
      queryClient.invalidateQueries({ queryKey: ['friend-status'] });
      // Invalidate community-feed to remove private posts of the unfriended user
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}
