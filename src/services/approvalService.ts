import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import {
  AssetPending,
  PengadaanAssetPending,
  BorrowPending,
  MaintenancePending,
} from '@/types/approval';

export interface ApprovalFilterParams {
  page?: number;
  per_page?: number;
  status?: string;
  q?: string;
  priority?: string;
}

export const approvalService = {
  // ── Asset Pendings ────────────────────────────────────────────────────────
  async getAssetPendings(params?: ApprovalFilterParams) {
    const res = await apiClient.get<ApiResponse<AssetPending[]>>('/approvals/asset-pendings', {
      params,
    });
    return res.data;
  },

  async getAssetPendingById(id: number | string) {
    const res = await apiClient.get<ApiResponse<AssetPending>>(`/approvals/asset-pendings/${id}`);
    return res.data;
  },

  async approveAsset(id: number | string) {
    const res = await apiClient.patch<ApiResponse<any>>(`/approvals/asset-pendings/${id}/approve`);
    return res.data;
  },

  async rejectAsset(id: number | string, reason?: string) {
    const res = await apiClient.patch<ApiResponse<any>>(`/approvals/asset-pendings/${id}/reject`, {
      reject_reason: reason,
    });
    return res.data;
  },

  // ── Pengadaan Pendings ────────────────────────────────────────────────────
  async getPengadaanPendings(params?: ApprovalFilterParams) {
    const res = await apiClient.get<ApiResponse<PengadaanAssetPending[]>>(
      '/approvals/pengadaan-pendings',
      { params }
    );
    return res.data;
  },

  async getPengadaanPendingById(id: number | string) {
    const res = await apiClient.get<ApiResponse<PengadaanAssetPending>>(
      `/approvals/pengadaan-pendings/${id}`
    );
    return res.data;
  },

  async approvePengadaan(id: number | string) {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/approvals/pengadaan-pendings/${id}/approve`
    );
    return res.data;
  },

  async rejectPengadaan(id: number | string, reason?: string) {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/approvals/pengadaan-pendings/${id}/reject`,
      { reject_reason: reason }
    );
    return res.data;
  },

  // ── Borrow Pendings ───────────────────────────────────────────────────────
  async getBorrowPendings(params?: ApprovalFilterParams) {
    const res = await apiClient.get<ApiResponse<BorrowPending[]>>('/approvals/borrow-pendings', {
      params,
    });
    return res.data;
  },

  async approveBorrow(id: number | string) {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/approvals/borrow-pendings/${id}/approve`
    );
    return res.data;
  },

  async rejectBorrow(id: number | string, reason?: string) {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/approvals/borrow-pendings/${id}/reject`,
      { reject_reason: reason }
    );
    return res.data;
  },

  // ── Maintenance Pendings ──────────────────────────────────────────────────
  async getMaintenancePendings(params?: ApprovalFilterParams) {
    const res = await apiClient.get<ApiResponse<MaintenancePending[]>>(
      '/approvals/maintenance-pendings',
      { params }
    );
    return res.data;
  },
};
