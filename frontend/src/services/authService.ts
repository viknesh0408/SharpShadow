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

  async forgotPassword(email: string): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return res.data.message || 'Password reset requested';
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
