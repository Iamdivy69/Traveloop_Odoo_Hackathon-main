import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalPosts: number;
  newUsersThisWeek: number;
  activeTrips: number;
  most_visited_cities: { city: string; count: number }[];
}

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  photo_url: string | null;
  is_admin: boolean;
  created_at: string;
  _count: { trips: number };
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminPost {
  id: string;
  user_id: string;
  trip_id: string | null;
  content: string;
  image_url: string | null;
  is_public: boolean;
  likes: number;
  created_at: string;
  user: {
    id: string;
    username: string | null;
    first_name: string;
    last_name: string;
    photo_url: string | null;
  };
  trip?: {
    id: string;
    name: string;
  } | null;
}

export interface AdminPostsResponse {
  items: AdminPost[];
  total: number;
  limit: number;
  offset: number;
}

// Queries
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
  });
}

export function useAdminUsers(params: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery<AdminUsersResponse>({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
      if (params.search) q.append('search', params.search);
      const { data } = await api.get(`/admin/users?${q.toString()}`);
      return data.data;
    },
  });
}

export function useAdminPosts(params: { page?: number; limit?: number } = {}) {
  return useQuery<AdminPostsResponse>({
    queryKey: ['admin-posts', params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
      const { data } = await api.get(`/admin/posts?${q.toString()}`);
      return data.data;
    },
  });
}

// Mutations: Users
export function useToggleAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/admin/users/${userId}/toggle-admin`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Mutations: Community Moderation
export function useModerateDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}

// Mutations: Cities
export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cityData: {
      name: string;
      country: string;
      region?: string;
      cost_index: number;
      popularity_score: number;
      description?: string;
      image_url?: string;
    }) => {
      const { data } = await api.post('/cities', cityData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...cityData }: {
      id: string;
      name?: string;
      country?: string;
      region?: string;
      cost_index?: number;
      popularity_score?: number;
      description?: string;
      image_url?: string;
    }) => {
      const { data } = await api.put(`/cities/${id}`, cityData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities', variables.id] });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cityId: string) => {
      await api.delete(`/cities/${cityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Mutations: Activities
export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cityId, ...activityData }: {
      cityId: string;
      name: string;
      type: string;
      cost: number;
      duration_mins?: number;
      description?: string;
      image_url?: string;
    }) => {
      const { data } = await api.post(`/cities/${cityId}/activities`, activityData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cities', variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ['city-activities', variables.cityId] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...activityData }: {
      id: string;
      name?: string;
      type?: string;
      cost?: number;
      duration_mins?: number;
      description?: string;
      image_url?: string;
    }) => {
      const { data } = await api.put(`/admin/activities/${id}`, activityData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city-activities'] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: string) => {
      await api.delete(`/admin/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city-activities'] });
    },
  });
}
