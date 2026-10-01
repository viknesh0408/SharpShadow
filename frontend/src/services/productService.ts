import api from './api';
import { ApiResponse, PageResponse, Product } from '../types';

export interface ProductFilters {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PageResponse<Product>> {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', {
      params: filters,
    });
    return res.data.data!;
  },

  async getFeatured(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products/featured');
    return res.data.data || [];
  },

  async getPopular(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products/popular');
    return res.data.data || [];
  },

  async getLatest(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products/latest');
    return res.data.data || [];
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return res.data.data!;
  },

  async getRelated(productId: number): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related`);
    return res.data.data || [];
  },
};
