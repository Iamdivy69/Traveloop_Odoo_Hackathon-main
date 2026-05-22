import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface TripNote {
  id: string;
  trip_id: string;
  stop_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  stop?: {
    id: string;
    city: { name: string; country: string };
    arrival_date: string;
    departure_date: string;
  } | null;
}

export function useNotes(tripId: string, stopId?: string) {
  return useQuery({
    queryKey: ['notes', tripId, stopId],
    queryFn: async () => {
      const params = stopId ? { stopId } : {};
      const { data } = await api.get(`/trips/${tripId}/notes`, { params });
      return data.data as TripNote[];
    },
    enabled: !!tripId,
  });
}

export function useCreateNote(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteData: { content: string; stop_id?: string; title?: string; image_url?: string }) => {
      const { data } = await api.post(`/trips/${tripId}/notes`, noteData);
      return data.data as TripNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', tripId] });
    },
  });
}

export function useUpdateNote(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, ...body }: { noteId: string; content?: string; stop_id?: string | null }) => {
      const { data } = await api.put(`/trips/${tripId}/notes/${noteId}`, body);
      return data.data as TripNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', tripId] });
    },
  });
}

export function useDeleteNote(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/trips/${tripId}/notes/${noteId}`);
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', tripId] });
    },
  });
}
