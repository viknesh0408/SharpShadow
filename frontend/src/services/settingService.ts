import api from './api';
import { ApiResponse } from '../types';

export interface SocialLinks {
  social_github?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_linkedin?: string;
  social_discord?: string;
  social_facebook?: string;
}

export const settingService = {
  async getPublicSettings(): Promise<Record<string, string>> {
    try {
      const res = await api.get<ApiResponse<Record<string, string>>>('/settings/public');
      return res.data.data || {};
    } catch {
      return {
        social_github: 'https://github.com/viknesh0408',
        social_instagram: 'https://instagram.com',
        social_twitter: 'https://x.com',
        social_linkedin: 'https://linkedin.com',
      };
    }
  },

  async getAllSettings(): Promise<Record<string, string>> {
    const res = await api.get<ApiResponse<Record<string, string>>>('/admin/settings');
    return res.data.data || {};
  },

  async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    const res = await api.put<ApiResponse<Record<string, string>>>('/admin/settings', settings);
    return res.data.data || {};
  },
};
