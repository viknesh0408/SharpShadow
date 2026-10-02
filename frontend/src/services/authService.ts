import api from './api';
import { ApiResponse, User } from '../types';

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  user: User;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data!;
  },

  async adminLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/admin-login', data);
    return res.data.data!;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await api.post<ApiResponse<{ message: string; resetToken?: string }>>('/auth/forgot-password', { email });
    return res.data.data || { message: res.data.message || 'Password reset requested' };
  },

  async resetPassword(data: { token: string; newPassword: string; confirmPassword: string }): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/reset-password', data);
    return res.data.message || res.data.data || 'Password reset successful';
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/change-password', data);
    return res.data.message || res.data.data || 'Password changed successfully';
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  async updateProfile(data: { name: string }): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data!;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
