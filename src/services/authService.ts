import apiClient from '@/lib/api-client';
import { ApiResponse, LoginResponse, User } from '@/types/api';
import Cookies from 'js-cookie';

export const authService = {
  async login(credentials: { email: string; password: string; device_name?: string }) {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (res.data.success && res.data.data.token) {
      Cookies.set('token', res.data.data.token, { expires: 30 }); // 30 hari
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

  async updateProfile(data: Partial<User>) {
    const res = await apiClient.put<ApiResponse<User>>('/profile', data);
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  },
};
