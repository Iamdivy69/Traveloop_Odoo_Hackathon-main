import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export function usePackingList(tripId: string) {
  return useQuery({
    queryKey: ['packing', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/packing`);
      // data.data is Record<string, PackingItem[]>
      return data.data as Record<string, { id: string; name: string; category: string; is_packed: boolean; created_at: string }[]>;
    },
    enabled: !!tripId && isUuid(tripId),
  });
}

export function usePackingProgress(tripId: string) {
  return useQuery({
    queryKey: ['packing', 'progress', tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/packing/progress`);
      return data.data as { total: number; packed: number; percentage: number };
    },
    enabled: !!tripId && isUuid(tripId),
  });
}

export function useCreatePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: { name: string; category: string }) => {
      const { data } = await api.post(`/trips/${tripId}/packing`, item);
      return data.data;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['packing', tripId] });
      await queryClient.cancelQueries({ queryKey: ['packing', 'progress', tripId] });

      const previousPacking = queryClient.getQueryData<Record<string, any[]>>(['packing', tripId]);
      const previousProgress = queryClient.getQueryData<{ total: number; packed: number; percentage: number }>(['packing', 'progress', tripId]);

      if (previousPacking) {
        const category = newItem.category || 'Other';
        const tempItem = {
          id: `temp-${Date.now()}`,
          name: newItem.name,
          category,
          is_packed: false,
          created_at: new Date().toISOString(),
        };
        const currentItems = previousPacking[category] || [];
        const updated = {
          ...previousPacking,
          [category]: [...currentItems, tempItem],
        };
        queryClient.setQueryData(['packing', tripId], updated);
      }

      if (previousProgress) {
        const newTotal = previousProgress.total + 1;
        const newPercentage = newTotal > 0 ? Math.round((previousProgress.packed / newTotal) * 100) : 0;
        queryClient.setQueryData(['packing', 'progress', tripId], {
          total: newTotal,
          packed: previousProgress.packed,
          percentage: newPercentage,
        });
      }

      return { previousPacking, previousProgress };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPacking) {
        queryClient.setQueryData(['packing', tripId], ctx.previousPacking);
      }
      if (ctx?.previousProgress) {
        queryClient.setQueryData(['packing', 'progress', tripId], ctx.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packing', 'progress', tripId] });
    },
  });
}

export function useTogglePacked(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, is_packed }: { itemId: string; is_packed: boolean }) => {
      const { data } = await api.put(`/trips/${tripId}/packing/${itemId}`, { is_packed });
      return data.data;
    },
    onMutate: async ({ itemId, is_packed }) => {
      await queryClient.cancelQueries({ queryKey: ['packing', tripId] });
      await queryClient.cancelQueries({ queryKey: ['packing', 'progress', tripId] });

      const previousPacking = queryClient.getQueryData<Record<string, any[]>>(['packing', tripId]);
      const previousProgress = queryClient.getQueryData<{ total: number; packed: number; percentage: number }>(['packing', 'progress', tripId]);

      if (previousPacking) {
        const updated = Object.fromEntries(
          Object.entries(previousPacking).map(([cat, items]) => [
            cat,
            items.map((item) => (item.id === itemId ? { ...item, is_packed } : item)),
          ])
        );
        queryClient.setQueryData(['packing', tripId], updated);
      }

      if (previousProgress && previousPacking) {
        let wasPacked = false;
        let found = false;
        for (const items of Object.values(previousPacking)) {
          const matchedItem = items.find((item) => item.id === itemId);
          if (matchedItem) {
            wasPacked = matchedItem.is_packed;
            found = true;
            break;
          }
        }
        if (found && wasPacked !== is_packed) {
          const delta = is_packed ? 1 : -1;
          const newPacked = Math.max(0, Math.min(previousProgress.total, previousProgress.packed + delta));
          const newPercentage = previousProgress.total > 0 ? Math.round((newPacked / previousProgress.total) * 100) : 0;
          queryClient.setQueryData(['packing', 'progress', tripId], {
            total: previousProgress.total,
            packed: newPacked,
            percentage: newPercentage,
          });
        }
      }

      return { previousPacking, previousProgress };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPacking) {
        queryClient.setQueryData(['packing', tripId], ctx.previousPacking);
      }
      if (ctx?.previousProgress) {
        queryClient.setQueryData(['packing', 'progress', tripId], ctx.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packing', 'progress', tripId] });
    },
  });
}

export function useBulkToggle(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, isPacked }: { ids: string[]; isPacked: boolean }) => {
      const { data } = await api.put(`/trips/${tripId}/packing/bulk-check`, { ids, isPacked });
      return data.data;
    },
    onMutate: async ({ ids, isPacked }) => {
      await queryClient.cancelQueries({ queryKey: ['packing', tripId] });
      await queryClient.cancelQueries({ queryKey: ['packing', 'progress', tripId] });

      const previousPacking = queryClient.getQueryData<Record<string, any[]>>(['packing', tripId]);
      const previousProgress = queryClient.getQueryData<{ total: number; packed: number; percentage: number }>(['packing', 'progress', tripId]);

      if (previousPacking) {
        const updated = Object.fromEntries(
          Object.entries(previousPacking).map(([cat, items]) => [
            cat,
            items.map((item) => (ids.includes(item.id) ? { ...item, is_packed: isPacked } : item)),
          ])
        );
        queryClient.setQueryData(['packing', tripId], updated);
      }

      if (previousProgress && previousPacking) {
        let newlyPackedCount = 0;
        let newlyUnpackedCount = 0;
        for (const items of Object.values(previousPacking)) {
          for (const item of items) {
            if (ids.includes(item.id)) {
              if (isPacked && !item.is_packed) {
                newlyPackedCount++;
              } else if (!isPacked && item.is_packed) {
                newlyUnpackedCount++;
              }
            }
          }
        }
        const delta = isPacked ? newlyPackedCount : -newlyUnpackedCount;
        const newPacked = Math.max(0, Math.min(previousProgress.total, previousProgress.packed + delta));
        const newPercentage = previousProgress.total > 0 ? Math.round((newPacked / previousProgress.total) * 100) : 0;
        queryClient.setQueryData(['packing', 'progress', tripId], {
          total: previousProgress.total,
          packed: newPacked,
          percentage: newPercentage,
        });
      }

      return { previousPacking, previousProgress };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPacking) {
        queryClient.setQueryData(['packing', tripId], ctx.previousPacking);
      }
      if (ctx?.previousProgress) {
        queryClient.setQueryData(['packing', 'progress', tripId], ctx.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packing', 'progress', tripId] });
    },
  });
}

export function useDeletePacked(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`/trips/${tripId}/packing/packed`);
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['packing', tripId] });
      await queryClient.cancelQueries({ queryKey: ['packing', 'progress', tripId] });

      const previousPacking = queryClient.getQueryData<Record<string, any[]>>(['packing', tripId]);
      const previousProgress = queryClient.getQueryData<{ total: number; packed: number; percentage: number }>(['packing', 'progress', tripId]);

      if (previousPacking) {
        const updated = Object.fromEntries(
          Object.entries(previousPacking).map(([cat, items]) => [
            cat,
            items.filter((item) => !item.is_packed),
          ])
        );
        queryClient.setQueryData(['packing', tripId], updated);
      }

      if (previousProgress) {
        const newTotal = Math.max(0, previousProgress.total - previousProgress.packed);
        queryClient.setQueryData(['packing', 'progress', tripId], {
          total: newTotal,
          packed: 0,
          percentage: 0,
        });
      }

      return { previousPacking, previousProgress };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPacking) {
        queryClient.setQueryData(['packing', tripId], ctx.previousPacking);
      }
      if (ctx?.previousProgress) {
        queryClient.setQueryData(['packing', 'progress', tripId], ctx.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packing', 'progress', tripId] });
    },
  });
}

export function useDeletePackingItem(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/trips/${tripId}/packing/${itemId}`);
      return itemId;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['packing', tripId] });
      await queryClient.cancelQueries({ queryKey: ['packing', 'progress', tripId] });

      const previousPacking = queryClient.getQueryData<Record<string, any[]>>(['packing', tripId]);
      const previousProgress = queryClient.getQueryData<{ total: number; packed: number; percentage: number }>(['packing', 'progress', tripId]);

      let deletedItemPacked = false;
      let found = false;

      if (previousPacking) {
        const updated = Object.fromEntries(
          Object.entries(previousPacking).map(([cat, items]) => {
            const matchedItem = items.find((item) => item.id === itemId);
            if (matchedItem) {
              deletedItemPacked = matchedItem.is_packed;
              found = true;
            }
            return [cat, items.filter((item) => item.id !== itemId)];
          })
        );
        queryClient.setQueryData(['packing', tripId], updated);
      }

      if (previousProgress && found) {
        const newTotal = Math.max(0, previousProgress.total - 1);
        const newPacked = Math.max(0, previousProgress.packed - (deletedItemPacked ? 1 : 0));
        const newPercentage = newTotal > 0 ? Math.round((newPacked / newTotal) * 100) : 0;
        queryClient.setQueryData(['packing', 'progress', tripId], {
          total: newTotal,
          packed: newPacked,
          percentage: newPercentage,
        });
      }

      return { previousPacking, previousProgress };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPacking) {
        queryClient.setQueryData(['packing', tripId], ctx.previousPacking);
      }
      if (ctx?.previousProgress) {
        queryClient.setQueryData(['packing', 'progress', tripId], ctx.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packing', 'progress', tripId] });
    },
  });
}
