import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { TripStop } from './useTrips';

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────
const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export function useStops(tripId: string) {
  return useQuery<TripStop[]>({
    queryKey: ['stops', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/stops`);
      return data.data;
    },
    enabled: !!tripId && isUuid(tripId),
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────
export function useCreateStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stopData: {
      city_id?: string;
      custom_city_name?: string;
      arrival_date: string;
      departure_date: string;
      notes?: string;
    }) => {
      const { data } = await api.post(`/trips/${tripId}/stops`, stopData);
      return data.data as TripStop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats', tripId] });
    },
  });
}

export function useUpdateStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stopId,
      ...updateData
    }: {
      stopId: string;
      arrival_date?: string;
      departure_date?: string;
      notes?: string | null;
    }) => {
      const { data } = await api.patch(`/trips/${tripId}/stops/${stopId}`, updateData);
      return data.data as TripStop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
    },
  });
}

export function useDeleteStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stopId: string) => {
      await api.delete(`/trips/${tripId}/stops/${stopId}`);
      return stopId;
    },
    onMutate: async (stopId) => {
      await queryClient.cancelQueries({ queryKey: ['stops', tripId] });
      const previous = queryClient.getQueryData<TripStop[]>(['stops', tripId]);
      if (previous) {
        queryClient.setQueryData<TripStop[]>(
          ['stops', tripId],
          previous.filter((s) => s.id !== stopId)
        );
      }
      return { previous };
    },
    onError: (_err, _stopId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['stops', tripId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats', tripId] });
    },
  });
}

export function useReorderStops(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await api.patch(`/trips/${tripId}/stops/reorder`, { order: orderedIds });
    },
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ['stops', tripId] });
      const previous = queryClient.getQueryData<TripStop[]>(['stops', tripId]);
      if (previous) {
        const reordered = orderedIds
          .map((id, index) => {
            const stop = previous.find((s) => s.id === id);
            return stop ? { ...stop, order_index: index + 1 } : null;
          })
          .filter(Boolean) as TripStop[];
        queryClient.setQueryData(['stops', tripId], reordered);
      }
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['stops', tripId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
    },
  });
}
