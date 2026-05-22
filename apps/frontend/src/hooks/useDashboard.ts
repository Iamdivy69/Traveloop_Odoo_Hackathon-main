import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Trip, PaginatedTrips } from './useTrips';
import type { City, PaginatedCities } from './useCities';
import type { CommunityPost, FeedPage } from './useCommunity';
import type { UserProfileData } from './useProfile';

// ─────────────────────────────────────────────
// Individual query hooks (narrow scope)
// ─────────────────────────────────────────────

function useActiveTrips() {
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', { status: 'active' }],
    queryFn: async () => {
      const { data } = await api.get('/trips?status=active&limit=1');
      return data.data;
    },
    staleTime: 30_000,
  });
}

function useUpcomingTrips() {
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', { status: 'upcoming' }],
    queryFn: async () => {
      const { data } = await api.get('/trips?status=upcoming&limit=6');
      return data.data;
    },
    staleTime: 30_000,
  });
}

function useRecentTrips() {
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', { status: 'past', limit: 2 }],
    queryFn: async () => {
      const { data } = await api.get('/trips?status=past&limit=2');
      return data.data;
    },
    staleTime: 60_000,
  });
}

function usePopularCities() {
  return useQuery<PaginatedCities>({
    queryKey: ['cities', { sort: 'popularity', limit: 4 }],
    queryFn: async () => {
      const { data } = await api.get('/cities?sort=popularity&limit=4');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

function useCommunityHighlights() {
  return useQuery<FeedPage>({
    queryKey: ['community-highlights'],
    queryFn: async () => {
      const { data } = await api.get('/community/feed?limit=3');
      return data.data;
    },
    staleTime: 60_000,
  });
}

function useUserProfile() {
  return useQuery<UserProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data.data;
    },
    staleTime: 2 * 60_000,
  });
}

// ─────────────────────────────────────────────
// Dashboard aggregate hook
// ─────────────────────────────────────────────

export interface DashboardData {
  /** The single active trip (if any) */
  activeTrip: Trip | null;
  /** Upcoming trips list */
  upcomingTrips: Trip[];
  /** Last 2 past trips */
  recentTrips: Trip[];
  /** Top 4 popular cities */
  popularCities: City[];
  /** Latest 3 community posts */
  communityHighlights: CommunityPost[];
  /** Authenticated user profile */
  profile: UserProfileData | null;
  /** True while any fetch is still in flight */
  isLoading: boolean;
  /** Collected errors from every query */
  errors: (Error | null)[];
}

/**
 * Aggregates all dashboard data into a single hook.
 * Each query runs in parallel (TanStack Query fires them all simultaneously).
 * `isLoading` is true until ALL queries have settled for the first time.
 */
export function useDashboard(): DashboardData {
  const activeQ = useActiveTrips();
  const upcomingQ = useUpcomingTrips();
  const recentQ = useRecentTrips();
  const citiesQ = usePopularCities();
  const communityQ = useCommunityHighlights();
  const profileQ = useUserProfile();

  const isLoading =
    activeQ.isLoading ||
    upcomingQ.isLoading ||
    recentQ.isLoading ||
    citiesQ.isLoading ||
    communityQ.isLoading ||
    profileQ.isLoading;

  return {
    activeTrip: activeQ.data?.items?.[0] ?? null,
    upcomingTrips: upcomingQ.data?.items ?? [],
    recentTrips: recentQ.data?.items ?? [],
    popularCities: citiesQ.data?.items ?? [],
    communityHighlights: communityQ.data?.items ?? [],
    profile: profileQ.data ?? null,
    isLoading,
    errors: [
      activeQ.error as Error | null,
      upcomingQ.error as Error | null,
      recentQ.error as Error | null,
      citiesQ.error as Error | null,
      communityQ.error as Error | null,
      profileQ.error as Error | null,
    ],
  };
}
