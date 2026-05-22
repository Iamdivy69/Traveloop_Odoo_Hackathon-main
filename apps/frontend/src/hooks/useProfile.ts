import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface UserProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo_url?: string | null;
  language: string;
  is_admin: boolean;
  saved_destinations: string[];
  username?: string | null;
  bio?: string | null;
  is_public: boolean;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export function useMyProfile() {
  return useQuery<UserProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfileData>) => {
      const { data } = await api.put('/users/me', profileData);
      return data.data;
    },
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData<UserProfileData>(['profile']);
      
      if (previousProfile) {
        queryClient.setQueryData<UserProfileData>(['profile'], {
          ...previousProfile,
          ...newProfileData,
        });
      }
      return { previousProfile };
    },
    onError: (_err, _newProfileData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.put('/users/me/username', { username });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update local storage or session store if username is cached
    },
  });
}

export function useCheckUsername(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  return useQuery<{ available: boolean }>({
    queryKey: ['check-username', cleanUsername],
    queryFn: async () => {
      const { data } = await api.get(`/users/check-username?username=${cleanUsername}`);
      return data.data;
    },
    enabled: !!cleanUsername && cleanUsername.length >= 3,
    retry: false,
    staleTime: 1000 * 30, // 30s cache
  });
}

export function usePublicProfile(username: string) {
  const cleanUsername = username.trim().toLowerCase();
  return useQuery<UserProfileData>({
    queryKey: ['public-profile', cleanUsername],
    queryFn: async () => {
      const { data } = await api.get(`/users/${cleanUsername}`);
      return data.data;
    },
    enabled: !!cleanUsername,
  });
}
