import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────
export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  description?: string;
  image_url?: string;
  cost_index: number;
  popularity_score: number;
  _count: { activities: number; stops: number };
}

export interface Activity {
  id: string;
  city_id: string;
  name: string;
  type: string;
  cost: number;
  duration_mins?: number;
  description?: string;
  image_url?: string;
}

export interface CityDetail extends City {
  activities: Activity[];
}

export interface CityFilters {
  q?: string;
  country?: string;
  region?: string;
  sort?: 'popularity' | 'cost' | 'name';
  page?: number;
  limit?: number;
}

export interface PaginatedCities {
  items: City[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

// ─── Queries ────────────────────────────────────────────────────
export function useCities(filters: CityFilters = {}) {
  return useQuery<PaginatedCities>({
    queryKey: ['cities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.country) params.append('country', filters.country);
      if (filters.region) params.append('region', filters.region);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      const { data } = await api.get(`/cities?${params.toString()}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // cities are relatively static, cache 5 min
  });
}

export function useCity(id: string | null) {
  return useQuery<CityDetail>({
    queryKey: ['cities', id],
    queryFn: async () => {
      const { data } = await api.get(`/cities/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCityActivities(cityId: string | null, filters: { category?: string; max_cost?: number; search?: string } = {}) {
  return useQuery<Activity[]>({
    queryKey: ['city-activities', cityId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.max_cost) params.append('max_cost', String(filters.max_cost));
      if (filters.search) params.append('search', filters.search);
      const { data } = await api.get(`/cities/${cityId}/activities?${params.toString()}`);
      return data.data;
    },
    enabled: !!cityId,
  });
}

// ─── Mutation: Add Activity to a Stop ───────────────────────────
export function useAddActivityToStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tripId,
      stopId,
      activityId,
      customTitle,
      customCost,
      notes,
      scheduledTime,
    }: {
      tripId: string;
      stopId: string;
      activityId?: string;
      customTitle?: string;
      customCost?: number;
      notes?: string;
      scheduledTime?: string;
    }) => {
      const { data } = await api.post(
        `/trips/${tripId}/stops/${stopId}/activities`,
        { activity_id: activityId, custom_title: customTitle, custom_cost: customCost, notes, scheduled_time: scheduledTime }
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stop-activities', variables.tripId, variables.stopId] });
      queryClient.invalidateQueries({ queryKey: ['stops', variables.tripId] });
    },
  });
}
