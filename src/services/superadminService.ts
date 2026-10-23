import apiClient from '@/lib/api-client';
import { ApiResponse, User } from '@/types/api';

export interface RoleItem {
  id: number;
  name: string;
  guard_name?: string;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BackupItem {
  name: string;
  size: number;
  size_formatted: string;
  date: string;
}

export interface ActivityLogItem {
  id: number;
  user_id?: number;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

export interface TelegramUserItem {
  id: number;
  telegram_id: string | number;
  name?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface TelegramBotStatus {
  bot: {
    id: number;
    first_name: string;
    username: string;
  };
  webhook: {
    url?: string;
    pending_update_count: number;
    last_error_message?: string;
  };
}

export interface SystemSettings {
  asset_approval_enabled: boolean;
  asset_maintenance_approval_enabled: boolean;
  pengadaan_approval_enabled: boolean;
}

export const superadminService = {
  // ── Users ─────────────────────────────────────────────────────────────────
  async getUsers(params?: { page?: number; per_page?: number; q?: string; role?: string }) {
    const res = await apiClient.get<ApiResponse<User[]>>('/superadmin/users', { params });
    return res.data;
  },

  async createUser(data: Record<string, any>) {
    const res = await apiClient.post<ApiResponse<User>>('/superadmin/users', data);
    return res.data;
  },

  async updateUser(id: number | string, data: Record<string, any>) {
    const res = await apiClient.put<ApiResponse<User>>(`/superadmin/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/superadmin/users/${id}`);
    return res.data;
  },

  // ── Roles ─────────────────────────────────────────────────────────────────
  async getRoles() {
    const res = await apiClient.get<ApiResponse<RoleItem[]>>('/superadmin/roles');
    return res.data;
  },

  async createRole(data: { name: string }) {
    const res = await apiClient.post<ApiResponse<RoleItem>>('/superadmin/roles', data);
    return res.data;
  },

  async updateRole(id: number | string, data: { name: string }) {
    const res = await apiClient.put<ApiResponse<RoleItem>>(`/superadmin/roles/${id}`, data);
    return res.data;
  },

  async deleteRole(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/superadmin/roles/${id}`);
    return res.data;
  },

  // ── Backups ───────────────────────────────────────────────────────────────
  async getBackups() {
    const res = await apiClient.get<ApiResponse<BackupItem[]>>('/backups');
    return res.data;
  },

  async createBackup() {
    const res = await apiClient.post<ApiResponse<any>>('/backups/create');
    return res.data;
  },

  async deleteBackup(filename: string) {
    const res = await apiClient.post<ApiResponse<any>>('/backups/delete', { file: filename });
    return res.data;
  },

  async uploadDrive(filename: string) {
    const res = await apiClient.post<ApiResponse<any>>('/backups/upload-drive', { file: filename });
    return res.data;
  },

  // ── Activity Logs ─────────────────────────────────────────────────────────
  async getActivityLogs(params?: { page?: number; per_page?: number; q?: string; action?: string }) {
    const res = await apiClient.get<ApiResponse<ActivityLogItem[]>>('/activity-logs', { params });
    return res.data;
  },

  // ── Telegram Settings ─────────────────────────────────────────────────────
  async getTelegramUsers() {
    const res = await apiClient.get<ApiResponse<TelegramUserItem[]>>('/superadmin/telegram');
    return res.data;
  },

  async getTelegramBotStatus() {
    const res = await apiClient.get<ApiResponse<TelegramBotStatus>>('/superadmin/telegram/bot-status');
    return res.data;
  },

  async addTelegramUser(data: { telegram_id: string | number; name?: string; description?: string }) {
    const res = await apiClient.post<ApiResponse<TelegramUserItem>>('/superadmin/telegram/users', data);
    return res.data;
  },

  async toggleTelegramUser(id: number | string) {
    const res = await apiClient.post<ApiResponse<any>>(`/superadmin/telegram/users/${id}/toggle`);
    return res.data;
  },

  async deleteTelegramUser(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/superadmin/telegram/users/${id}`);
    return res.data;
  },

  async setTelegramWebhook(url: string) {
    const res = await apiClient.post<ApiResponse<any>>('/superadmin/telegram/set-webhook', { url });
    return res.data;
  },

  async removeTelegramWebhook() {
    const res = await apiClient.post<ApiResponse<any>>('/superadmin/telegram/remove-webhook');
    return res.data;
  },

  // ── API Tokens ────────────────────────────────────────────────────────────
  async getApiTokens(params?: { page?: number; per_page?: number; search?: string }) {
    const res = await apiClient.get<ApiResponse<any>>('/superadmin/api-tokens', { params });
    return res.data;
  },

  async createApiToken(data: { user_id: number; token_name: string; abilities?: string[] }) {
    const res = await apiClient.post<ApiResponse<any>>('/superadmin/api-tokens', data);
    return res.data;
  },

  async revokeApiToken(tokenId: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/superadmin/api-tokens/${tokenId}`);
    return res.data;
  },

  async revokeAllTokens(userId: number | string) {
    const res = await apiClient.post<ApiResponse<null>>(`/superadmin/api-tokens/users/${userId}/revoke-all`);
    return res.data;
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings() {
    const res = await apiClient.get<ApiResponse<SystemSettings>>('/settings');
    return res.data;
  },

  async updateSettings(data: Partial<SystemSettings>) {
    const res = await apiClient.put<ApiResponse<SystemSettings>>('/settings', data);
    return res.data;
  },

  // ── Asset History & Trash Bin ─────────────────────────────────────────────
  async getAssetTransactions(params?: { page?: number; per_page?: number }) {
    const res = await apiClient.get<ApiResponse<any>>('/assets/transactions', { params });
    return res.data;
  },

  async getDeletedAssets(params?: { page?: number; per_page?: number; q?: string }) {
    const res = await apiClient.get<ApiResponse<any>>('/assets/deleted', { params });
    return res.data;
  },
};
