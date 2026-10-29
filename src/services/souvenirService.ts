import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import {
  SouvenirName,
  Souvenir,
  SouvenirTransaction,
  SouvenirStockAddition,
} from '@/types/souvenir';

export interface BaseFilterParams {
  page?: number;
  per_page?: number;
  q?: string;
  stock?: 'low' | 'available' | 'empty' | '';
}

export const souvenirService = {
  async getStockOptions(): Promise<Souvenir[]> {
    const items: Souvenir[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await apiClient.get<ApiResponse<Souvenir[]>>('/souvenirs', { params: { page, per_page: 100 } });
      items.push(...res.data.data);
      lastPage = res.data.meta?.last_page || 1;
      page++;
    } while (page <= lastPage);
    return items;
  },
  async getSummary() {
    const res = await apiClient.get<ApiResponse<{ available: number; variants: number; low_stock: number; open_distributions: number }>>('/souvenirs/summary');
    return res.data;
  },
  async exportStock() {
    return (await apiClient.get<Blob>('/souvenirs/export', { responseType: 'blob' })).data;
  },
  async exportTransactions(params?: { souvenir_id?: number; status?: string }) {
    return (await apiClient.get<Blob>('/souvenirs/transactions/export', { params, responseType: 'blob' })).data;
  },
  // ── Master Names ──────────────────────────────────────────────────────────
  async getNames(params?: BaseFilterParams) {
    const res = await apiClient.get<ApiResponse<SouvenirName[]>>('/souvenirs/names', { params });
    return res.data;
  },

  async createName(data: { name: string; description?: string }) {
    const res = await apiClient.post<ApiResponse<SouvenirName>>('/souvenirs/names', data);
    return res.data;
  },

  async updateName(id: number | string, data: { name: string; description?: string }) {
    const res = await apiClient.put<ApiResponse<SouvenirName>>(`/souvenirs/names/${id}`, data);
    return res.data;
  },

  async deleteName(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/souvenirs/names/${id}`);
    return res.data;
  },

  // ── Souvenirs (Stock) ─────────────────────────────────────────────────────
  async getSouvenirs(params?: BaseFilterParams) {
    const res = await apiClient.get<ApiResponse<Souvenir[]>>('/souvenirs', { params });
    return res.data;
  },

  async getSouvenirById(id: number | string) {
    const res = await apiClient.get<ApiResponse<Souvenir>>(`/souvenirs/${id}`);
    return res.data;
  },

  async createSouvenir(data: FormData | Record<string, unknown>) {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    const res = await apiClient.post<ApiResponse<Souvenir>>('/souvenirs', data, { headers });
    return res.data;
  },

  async updateSouvenir(id: number | string, data: FormData | Record<string, unknown>) {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    // In Laravel, PUT with multipart can need _method: PUT via POST or normal PUT if JSON
    if (data instanceof FormData) data.set('_method', 'PUT');
    const request = data instanceof FormData ? apiClient.post : apiClient.put;
    const res = await request<ApiResponse<Souvenir>>(`/souvenirs/${id}`, data, { headers });
    return res.data;
  },

  async deleteSouvenir(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/souvenirs/${id}`);
    return res.data;
  },

  // ── Stock Additions ───────────────────────────────────────────────────────
  async getStockAdditions(params?: BaseFilterParams & { souvenir_id?: number | string }) {
    const res = await apiClient.get<ApiResponse<SouvenirStockAddition[]>>(
      '/souvenirs/stock-additions',
      { params }
    );
    return res.data;
  },

  async addStock(data: {
    souvenir_id: number;
    qty: number;
    date: string;
    notes?: string;
  }) {
    const res = await apiClient.post<ApiResponse<SouvenirStockAddition>>(
      '/souvenirs/stock-additions',
      data
    );
    return res.data;
  },

  async deleteStockAddition(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/souvenirs/stock-additions/${id}`);
    return res.data;
  },

  // ── Souvenir Transactions ─────────────────────────────────────────────────
  async getTransactions(
    params?: BaseFilterParams & { souvenir_id?: number | string; status?: string }
  ) {
    const res = await apiClient.get<ApiResponse<SouvenirTransaction[]>>(
      '/souvenirs/transactions',
      { params }
    );
    return res.data;
  },

  async getTransactionById(id: number) {
    return (await apiClient.get<ApiResponse<SouvenirTransaction>>(`/souvenirs/transactions/${id}`)).data;
  },
  async createTransaction(data: FormData | {
    souvenir_id: number;
    training_name: string;
    pic: string;
    qty_out: number;
    date_out: string;
    notes?: string;
  }) {
    const res = await apiClient.post<ApiResponse<SouvenirTransaction>>(
      '/souvenirs/transactions',
      data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return res.data;
  },

  async updateTransaction(id: number | string, data: FormData | Record<string, unknown>) {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    if (data instanceof FormData) data.set('_method', 'PUT');
    const request = data instanceof FormData ? apiClient.post : apiClient.put;
    const res = await request<ApiResponse<SouvenirTransaction>>(
      `/souvenirs/transactions/${id}`,
      data,
      { headers }
    );
    return res.data;
  },

  async finishTransaction(
    id: number | string,
    data: {
      qty_actual?: number;
      return_location?: string;
      return_notes?: string;
    }
  ) {
    const res = await apiClient.post<ApiResponse<SouvenirTransaction>>(
      `/souvenirs/transactions/${id}/finish`,
      data
    );
    return res.data;
  },

  async recallTransaction(
    id: number | string,
    data: {
      qty_recall: number;
      recall_notes?: string;
    }
  ) {
    const res = await apiClient.post<ApiResponse<SouvenirTransaction>>(
      `/souvenirs/transactions/${id}/recall`,
      data
    );
    return res.data;
  },

  async deleteTransaction(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/souvenirs/transactions/${id}`);
    return res.data;
  },
};
