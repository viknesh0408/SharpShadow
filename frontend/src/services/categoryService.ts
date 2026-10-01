import api from './api';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data || [];
  },

  async getBySlug(slug: string): Promise<Category> {
    const res = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data!;
  },
};
