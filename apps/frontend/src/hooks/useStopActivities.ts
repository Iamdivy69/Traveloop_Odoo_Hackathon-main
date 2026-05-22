import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { StopActivity } from './useTrips';

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────
export function useStopActivities(tripId: string, stopId: string) {
  return useQuery<StopActivity[]>({
    queryKey: ['stop-activities', tripId, stopId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/stops/${stopId}/activities`);
      return data.data;
    },
    enabled: !!tripId && !!stopId,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────
export function useAddActivity(tripId: string, stopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityData: {
      activity_id?: string;
      custom_title?: string;
      scheduled_time?: string;
      custom_cost?: number;
      notes?: string;
    }) => {
      const { data } = await api.post(
        `/trips/${tripId}/stops/${stopId}/activities`,
        activityData
      );
      return data.data as StopActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['stop-activities', tripId, stopId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats', tripId] });
    },
  });
}

export function useUpdateStopActivity(tripId: string, stopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      saId,
      ...updateData
    }: {
      saId: string;
      scheduled_time?: string | null;
      custom_cost?: number | null;
      notes?: string | null;
    }) => {
      const { data } = await api.patch(
        `/trips/${tripId}/stops/${stopId}/activities/${saId}`,
        updateData
      );
      return data.data as StopActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['stop-activities', tripId, stopId] });
    },
  });
}

export function useRemoveStopActivity(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stopId, saId }: { stopId: string; saId: string }) => {
      await api.delete(`/trips/${tripId}/stops/${stopId}/activities/${saId}`);
      return { stopId, saId };
    },
    onMutate: async ({ stopId, saId }) => {
      await queryClient.cancelQueries({ queryKey: ['stops', tripId] });
      await queryClient.cancelQueries({ queryKey: ['stop-activities', tripId, stopId] });
      const previous = queryClient.getQueryData<StopActivity[]>([
        'stop-activities',
        tripId,
        stopId,
      ]);
      if (previous) {
        queryClient.setQueryData<StopActivity[]>(
          ['stop-activities', tripId, stopId],
          previous.filter((a) => a.id !== saId)
        );
      }
      return { previous };
    },
    onError: (_err, { stopId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['stop-activities', tripId, stopId], context.previous);
      }
    },
    onSettled: (_data, _error, { stopId }) => {
      queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
      queryClient.invalidateQueries({ queryKey: ['stop-activities', tripId, stopId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats', tripId] });
    },
  });
}
