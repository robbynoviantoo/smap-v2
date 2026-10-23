import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import {
  PengadaanAsset,
  PengadaanAssetDelivery,
  PengadaanFilterParams,
  PengadaanProgress,
} from '@/types/pengadaan';

export const pengadaanService = {
  async getPengadaanList(params?: PengadaanFilterParams) {
    const res = await apiClient.get<ApiResponse<PengadaanAsset[]>>('/pengadaan-assets', {
      params,
    });
    return res.data;
  },

  async getPengadaanById(id: number | string) {
    const res = await apiClient.get<ApiResponse<PengadaanAsset>>(`/pengadaan-assets/${id}`);
    return res.data;
  },

  async createPengadaan(data: FormData | Record<string, any>) {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    const res = await apiClient.post<ApiResponse<any>>('/pengadaan-assets', data, { headers });
    return res.data;
  },

  async updatePengadaan(id: number | string, data: Record<string, any>) {
    const res = await apiClient.put<ApiResponse<PengadaanAsset>>(`/pengadaan-assets/${id}`, data);
    return res.data;
  },

  async deletePengadaan(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/pengadaan-assets/${id}`);
    return res.data;
  },

  async updateProgress(id: number | string, progress: PengadaanProgress) {
    const res = await apiClient.patch<ApiResponse<PengadaanAsset>>(
      `/pengadaan-assets/${id}/progress`,
      { progress }
    );
    return res.data;
  },

  async storeDelivery(id: number | string, formData: FormData) {
    const res = await apiClient.post<ApiResponse<PengadaanAssetDelivery>>(
      `/pengadaan-assets/${id}/deliveries`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async storeRetur(id: number | string, deliveryId: number | string, formData: FormData) {
    const res = await apiClient.post<ApiResponse<any>>(
      `/pengadaan-assets/${id}/deliveries/${deliveryId}/retur`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async storeDisposition(
    id: number | string,
    deliveryId: number | string,
    data: {
      disposition: 'asset' | 'consumable';
      asset?: string;
      location?: string;
      building?: string;
      category?: string;
      sub_category?: string;
      merk?: string;
      size?: string;
      unit?: string;
      status?: string;
      remarks?: string;
      last_maintenance?: string;
      next_maintenance?: string;
    }
  ) {
    const res = await apiClient.post<ApiResponse<any>>(
      `/pengadaan-assets/${id}/deliveries/${deliveryId}/disposition`,
      data
    );
    return res.data;
  },

  async finishPengadaan(id: number | string) {
    const res = await apiClient.patch<ApiResponse<PengadaanAsset>>(
      `/pengadaan-assets/${id}/finish`
    );
    return res.data;
  },
};
