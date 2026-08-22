import apiClient from '@/lib/api-client';
import { ApiResponse, Asset } from '@/types/api';

export interface AssetFilterParams {
  per_page?: number;
  page?: number;
  q?: string;
  category?: string;
  status?: string;
  available_status?: string;
  location?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const assetService = {
  async getAssets(params?: AssetFilterParams) {
    const res = await apiClient.get<ApiResponse<Asset[]>>('/assets', { params });
    return res.data;
  },

  async getAssetById(id: number | string) {
    const res = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
    return res.data;
  },

  async scanAsset(code: string) {
    const res = await apiClient.get<ApiResponse<Asset>>(`/assets/scanner/${encodeURIComponent(code)}`);
    return res.data;
  },

  async getMetadata() {
    const res = await apiClient.get<ApiResponse<{
      categories: string[];
      locations: string[];
      buildings: string[];
      merks: string[];
    }>>('/assets/metadata');
    return res.data;
  },

  async createAsset(data: Partial<Asset>) {
    const res = await apiClient.post<ApiResponse<Asset>>('/assets', data);
    return res.data;
  },

  async updateAsset(id: number | string, data: Partial<Asset>) {
    const res = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, data);
    return res.data;
  },

  async deleteAsset(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/assets/${id}`);
    return res.data;
  },

  async borrowAsset(id: number | string, remark?: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/assets/${id}/borrow`, { remark });
    return res.data;
  },

  async returnAsset(id: number | string, remark?: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/assets/${id}/returned`, { remark });
    return res.data;
  },
};
