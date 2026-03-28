import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';

export const ANALYTICS_KEY = 'analytics';

export function useAnalyticsOverview(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'overview', params],
    queryFn: async () => {
      const res = await analyticsApi.overview(params);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useMonthlyBreakdown(months = 12) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'monthly', months],
    queryFn: async () => {
      const res = await analyticsApi.monthly({ months });
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useCategoryBreakdown(type: 'INCOME' | 'EXPENSE' = 'EXPENSE', params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'categories', type, params],
    queryFn: async () => {
      const res = await analyticsApi.categories({ type, ...params });
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useDailyTrend(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'trend', params],
    queryFn: async () => {
      const res = await analyticsApi.trend(params);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}
