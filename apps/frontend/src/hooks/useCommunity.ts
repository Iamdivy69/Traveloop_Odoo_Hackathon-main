import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────
export interface PostAuthor {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  is_public: boolean;
  likes: number;
  /** Whether the currently authenticated user has liked this post. */
  hasLiked: boolean;
  created_at: string;
  trip_id: string | null;
  user: PostAuthor;
  trip: { id: string; name: string; cover_photo_url: string | null } | null;
}

export interface FeedPage {
  items: CommunityPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

export interface DiscoverUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  photo_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
}

// ─── Feed (Infinite Query) ───────────────────────────────────────
export function useCommunityFeed() {
  return useInfiniteQuery<FeedPage>({
    queryKey: ['community-feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/community/feed?page=${pageParam}&limit=15`);
      return data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// ─── Discover Users ──────────────────────────────────────────────
export function useDiscoverUsers() {
  return useQuery<DiscoverUser[]>({
    queryKey: ['community-discover'],
    queryFn: async () => {
      const { data } = await api.get('/community/users');
      return data.data;
    },
  });
}

// ─── Create Post ─────────────────────────────────────────────────
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      content: string;
      trip_id?: string;
      image_url?: string;
      is_public?: boolean;
    }) => {
      const { data } = await api.post('/community/posts', payload);
      return data.data as CommunityPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}

// ─── Toggle Like (Optimistic) ────────────────────────────────────
/**
 * Proper toggle: reads `post.hasLiked` from server state.
 * Optimistic update flips `hasLiked` and adjusts `likes` by ±1.
 * No local `liked` state in the component is needed.
 */
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await api.post(`/community/posts/${postId}/like`);
      return data.data as { id: string; likes: number; hasLiked: boolean };
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['community-feed'] });

      // Save snapshot for rollback
      const snapshot = queryClient.getQueriesData<{ pages: FeedPage[] }>({
        queryKey: ['community-feed'],
      });

      // Optimistically toggle hasLiked and update likes count (±1)
      queryClient.setQueriesData<{ pages: FeedPage[] }>(
        { queryKey: ['community-feed'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      hasLiked: !post.hasLiked,
                      likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      return { snapshot };
    },
    onError: (_err, _postId, ctx) => {
      // Rollback to saved snapshot
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}

// ─── Delete Post ─────────────────────────────────────────────────
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/community/posts/${postId}`);
      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}
