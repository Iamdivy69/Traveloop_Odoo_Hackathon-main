import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/expenses`);
      return data.data; // List of expenses
    },
    enabled: !!tripId,
  });
}

export function useExpenseSummary(tripId: string) {
  return useQuery({
    queryKey: ['expenses', 'summary', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/expenses/summary`);
      return data.data; // { totalSpent, byCategory, byPerson }
    },
    enabled: !!tripId,
  });
}

export function useInvoiceData(tripId: string) {
  return useQuery({
    queryKey: ['invoice', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/invoice`);
      return data.data;
    },
    enabled: !!tripId,
  });
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseData: any) => {
      const { data } = await api.post(`/trips/${tripId}/expenses`, expenseData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'summary', tripId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', tripId] });
    },
  });
}

export function useDeleteExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { data } = await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'summary', tripId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', tripId] });
    },
  });
}

export function useSplitExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ expenseId, splits }: { expenseId: string; splits: any[] }) => {
      const { data } = await api.post(`/trips/${tripId}/expenses/${expenseId}/split`, { splits });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'summary', tripId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', tripId] });
    },
  });
}

export function usePaySplit(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (splitId: string) => {
      const { data } = await api.put(`/trips/${tripId}/expenses/splits/${splitId}/pay`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'summary', tripId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', tripId] });
    },
  });
}
