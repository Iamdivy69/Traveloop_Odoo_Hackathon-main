import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useCities(query?: { q?: string; country?: string }) {
  return useQuery({
    queryKey: ['cities', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.q) params.append('q', query.q);
      if (query?.country) params.append('country', query.country);
      const { data } = await api.get(`/cities?${params.toString()}`);
      return data.data;
    },
  });
}

export function useCity(id: string) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: async () => {
      const { data } = await api.get(`/cities/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
