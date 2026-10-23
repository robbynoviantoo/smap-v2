'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard() {
  const {
    data: summaryResponse,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardService.getSummary,
    staleTime: 60 * 1000,
  });

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60 * 1000,
  });

  return {
    summary: summaryResponse?.data,
    stats: statsResponse?.data,
    isLoading: isLoadingSummary || isLoadingStats,
    summaryError,
    statsError,
    refetch: () => {
      refetchSummary();
      refetchStats();
    },
  };
}
