import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_photo_url?: string;
  start_date?: string;
  end_date?: string;
  is_public: boolean;
  share_token: string;
  total_budget?: number;
  created_at: string;
  _count: { stops: number; expenses: number };
}

export interface TripDetail extends Trip {
  stops: TripStop[];
  packing_items: unknown[];
  notes: unknown[];
}

export interface TripStop {
  id: string;
  trip_id: string;
  city_id?: string;
  custom_location?: string;
  custom_city_name?: string;
  order_index: number;
  arrival_date: string;
  departure_date: string;
  city?: { id: string; name: string; country: string };
  activities: StopActivity[];
}

export interface StopActivity {
  id: string;
  stop_id: string;
  activity_id?: string;
  custom_title?: string;
  scheduled_time?: string;
  custom_cost?: number;
  notes?: string;
  activity?: {
    id: string;
    title: string;
    category: string;
    cost: number;
    duration_minutes?: number;
  };
}

export interface TripFilters {
  status?: 'upcoming' | 'active' | 'past' | 'draft';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTrips {
  items: Trip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

export interface TripStats {
  totalStops: number;
  totalActivities: number;
  totalExpenses: number;
  remainingBudget: number | null;
  dayCount: number;
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────
export function useTrips(filters: TripFilters = {}) {
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      const { data } = await api.get(`/trips?${params.toString()}`);
      return data.data;
    },
  });
}

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export function useTrip(id: string) {
  return useQuery<TripDetail>({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${id}`);
      return data.data;
    },
    enabled: !!id && isUuid(id),
  });
}

export function useTripStats(id: string) {
  return useQuery<TripStats>({
    queryKey: ['trip-stats', id],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${id}/stats`);
      return data.data;
    },
    enabled: !!id && isUuid(id),
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────
export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData: {
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      total_budget?: number;
      is_public?: boolean;
      cover_photo_url?: string;
    }) => {
      const { data } = await api.post('/trips', tripData);
      return data.data as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: unknown }) => {
      const { data } = await api.patch(`/trips/${id}`, updateData);
      return data.data as Trip;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trips/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['trips'] });
      const keys = queryClient.getQueriesData<PaginatedTrips>({ queryKey: ['trips'] });
      keys.forEach(([key, prev]) => {
        if (prev) {
          queryClient.setQueryData<PaginatedTrips>(key, {
            ...prev,
            items: prev.items.filter((t) => t.id !== id),
            total: prev.total - 1,
          });
        }
      });
      return { keys };
    },
    onError: (_err, _id, context) => {
      context?.keys?.forEach(([key, prev]) => {
        if (prev) queryClient.setQueryData(key, prev);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useShareTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/trips/${id}/share`);
      return data.data as { is_public: boolean; share_url: string | null; share_token: string };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
