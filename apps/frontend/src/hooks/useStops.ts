import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useStops(tripId: string) {
  return useQuery({
    queryKey: ['stops', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/stops`);
      return data.data;
    },
    enabled: !!tripId,
  });
}

export function useCreateStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, stopData }: { tripId: string; stopData: any }) => {
      const { data } = await api.post(`/trips/${tripId}/stops`, stopData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stops', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
  });
}

export function useDeleteStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, stopId }: { tripId: string; stopId: string }) => {
      await api.delete(`/trips/${tripId}/stops/${stopId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stops', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
  });
}
