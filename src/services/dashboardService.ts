import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { DashboardSummary, DashboardStats } from '@/types/dashboard';

export const dashboardService = {
  async getSummary() {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data;
  },

  async getStats() {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data;
  },
};
