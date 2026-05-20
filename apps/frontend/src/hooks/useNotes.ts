import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useNotes(tripId: string, stopId?: string) {
  return useQuery({
    queryKey: ['notes', tripId, stopId],
    queryFn: async () => {
      const params = stopId ? `?stop_id=${stopId}` : '';
      const { data } = await api.get(`/trips/${tripId}/notes${params}`);
      return data.data;
    },
    enabled: !!tripId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, noteData }: { tripId: string; noteData: { content: string; stop_id?: string } }) => {
      const { data } = await api.post(`/trips/${tripId}/notes`, noteData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, noteId, content }: { tripId: string; noteId: string; content: string }) => {
      const { data } = await api.patch(`/trips/${tripId}/notes/${noteId}`, { content });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, noteId }: { tripId: string; noteId: string }) => {
      await api.delete(`/trips/${tripId}/notes/${noteId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
    },
  });
}
