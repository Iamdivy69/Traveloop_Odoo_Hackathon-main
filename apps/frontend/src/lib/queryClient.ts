import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30s
      retry: 1,
      // React Query handles errors globally if you want, but we typically let the api interceptor handle 401s
    },
  },
});
