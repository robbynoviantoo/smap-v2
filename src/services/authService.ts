import apiClient from '@/lib/api-client';
import { ApiResponse, LoginResponse, User } from '@/types/api';
import Cookies from 'js-cookie';
import { storedPushToken, clearPushSubscription } from './pushService';

export const authService = {
  async login(credentials: { email: string; password: string; device_name?: string }) {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (res.data.success && res.data.data.token) {
      Cookies.set('token', res.data.data.token, { expires: 30, path: '/' }); // 30 hari
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.data.token);
      }
    }
    return res.data;
  },

  async me() {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get<ApiResponse<User>>('/profile');
    return res.data;
  },

  async updateProfile(
    data: Partial<User> & { password?: string; password_confirmation?: string }
  ) {
    const res = await apiClient.put<ApiResponse<User>>('/profile', data);
    return res.data;
  },

  async completeOnboarding(data: {
    first_name: string;
    last_name?: string;
    no_handphone?: string;
    password?: string;
    password_confirmation?: string;
  }) {
    const res = await apiClient.post<ApiResponse<User>>('/onboarding', data);
    return res.data;
  },

  async logout() {
    await apiClient.post('/auth/logout', { fcm_token: storedPushToken() });
    try {
      await clearPushSubscription();
    } catch {
      // The API has already detached the device; local cleanup may fail while offline.
    } finally {
      Cookies.remove('token', { path: '/' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  },
};
