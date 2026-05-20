import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function usePackingItems(tripId: string) {
  return useQuery({
    queryKey: ['packing', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/packing`);
      return data.data;
    },
    enabled: !!tripId,
  });
}

export function useAddPackingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, itemData }: { tripId: string; itemData: { name: string; category?: string } }) => {
      const { data } = await api.post(`/trips/${tripId}/packing`, itemData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
    },
  });
}

export function useTogglePacked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, itemId, is_packed }: { tripId: string; itemId: string; is_packed: boolean }) => {
      const { data } = await api.patch(`/trips/${tripId}/packing/${itemId}`, { is_packed });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
    },
  });
}

export function useDeletePackingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, itemId }: { tripId: string; itemId: string }) => {
      await api.delete(`/trips/${tripId}/packing/${itemId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
    },
  });
}

export function useBulkAddItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, items }: { tripId: string; items: { name: string; category: string }[] }) => {
      const { data } = await api.post(`/trips/${tripId}/packing/bulk`, { items });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
    },
  });
}
