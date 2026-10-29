import apiClient from '@/lib/api-client';
import { ApiResponse, Asset } from '@/types/api';

export interface AssetFilterParams {
  per_page?: number;
  page?: number;
  q?: string;
  category?: string;
  sub_category?: string;
  merk?: string;
  status?: string;
  available_status?: string;
  location?: string;
  building?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

function assetFormData(data: Partial<Asset>, imageFile: File) {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  form.append('image', imageFile);
  return form;
}

export const assetService = {
  async generateAssetNumber() {
    const res = await apiClient.get<ApiResponse<{ no_asset: string }>>('/assets/generate-no-asset');
    return res.data;
  },

  async getAssets(params?: AssetFilterParams) {
    const res = await apiClient.get<ApiResponse<Asset[]>>('/assets', { params });
    return res.data;
  },

  async exportAssets(params?: AssetFilterParams) {
    const res = await apiClient.get<Blob>('/assets/export', { params, responseType: 'blob' });
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
      sub_categories: string[];
      locations: string[];
      buildings: string[];
      merks: string[];
    }>>('/assets/metadata');
    return res.data;
  },

  async createAsset(data: Partial<Asset>, imageFile?: File) {
    const res = imageFile
      ? await apiClient.post<ApiResponse<Asset>>('/assets', assetFormData(data, imageFile), {
          headers: { 'Content-Type': undefined },
        })
      : await apiClient.post<ApiResponse<Asset>>('/assets', data);
    return res.data;
  },

  async updateAsset(id: number | string, data: Partial<Asset>, imageFile?: File) {
    if (imageFile) {
      const form = assetFormData(data, imageFile);
      // PHP parses multipart files on POST; Laravel honors the method override.
      form.append('_method', 'PUT');
      const res = await apiClient.post<ApiResponse<Asset>>(`/assets/${id}`, form, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    }
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

  async scheduleMaintenance(id: number | string, next_maintenance_date: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/maintenances/assets/${id}/schedule`, {
      next_maintenance_date,
    });
    return res.data;
  },

  async startMaintenance(id: number | string, notes: string) {
    const res = await apiClient.post<ApiResponse<any>>(`/maintenances/assets/${id}/start`, {
      notes,
    });
    return res.data;
  },

  async finishMaintenance(
    id: number | string,
    data: { notes: string; next_maintenance_date?: string }
  ) {
    const res = await apiClient.post<ApiResponse<any>>(`/maintenances/assets/${id}/finish`, data);
    return res.data;
  },

  async getMaintenanceHistory(assetId: number | string) {
    const res = await apiClient.get<ApiResponse<any>>('/maintenances', {
      params: { asset_id: assetId },
    });
    return res.data;
  },
};
