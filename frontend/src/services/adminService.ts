import api from './api';
import { AdminDashboardStats, ApiResponse, Category, Coupon, Download, Order, PageResponse, Product, User } from '../types';

export interface ProductPayload {
  title: string;
  slug?: string;
  categoryId: number;
  description: string;
  price: number;
  discountPrice?: number | null;
  thumbnailUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  dimensions?: string;
  resolution?: string;
  colorMode?: string;
  photoshopVersion?: string;
  featured?: boolean;
  status?: string;
  previewImages?: string[];
  demoFileUrl?: string | null;
  demoFileName?: string | null;
}

export interface UploadMetadata {
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
  formattedSize: string;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const res = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard');
    return res.data.data!;
  },

  async uploadAsset(
    file: File,
    onProgress?: (percent: number, loaded: number, total: number) => void,
    signal?: AbortSignal
  ): Promise<UploadMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<UploadMetadata>>('/admin/upload/asset', formData, {
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress?.(percent, progressEvent.loaded, progressEvent.total);
        }
      },
    });
    return res.data.data!;
  },

  async uploadDemoPdf(
    file: File,
    onProgress?: (percent: number, loaded: number, total: number) => void,
    signal?: AbortSignal
  ): Promise<UploadMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<UploadMetadata>>('/admin/upload/demo', formData, {
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress?.(percent, progressEvent.loaded, progressEvent.total);
        }
      },
    });
    return res.data.data!;
  },

  async uploadImage(
    file: File,
    onProgress?: (percent: number, loaded: number, total: number) => void,
    signal?: AbortSignal
  ): Promise<UploadMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<UploadMetadata>>('/admin/upload/image', formData, {
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && progressEvent.total > 0) {
          const percent = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          onProgress?.(percent, progressEvent.loaded, progressEvent.total);
        }
      },
    });
    return res.data.data!;
  },

  // Products
  async getProducts(page = 0, size = 20): Promise<PageResponse<Product>> {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/admin/products', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async getPngProducts(page = 0, size = 20): Promise<PageResponse<Product>> {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/admin/products/png', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async getProductById(id: number | string): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return res.data.data!;
  },

  async createProduct(data: ProductPayload): Promise<Product> {
    const res = await api.post<ApiResponse<Product>>('/admin/products', data);
    return res.data.data!;
  },

  async updateProduct(id: number, data: ProductPayload): Promise<Product> {
    const res = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return res.data.data!;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/products/${id}`);
  },

  // Categories
  async getCategories(page = 0, size = 20): Promise<PageResponse<Category>> {
    const res = await api.get<ApiResponse<PageResponse<Category>>>('/admin/categories', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/admin/categories', data);
    return res.data.data!;
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return res.data.data!;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/categories/${id}`);
  },

  // Orders
  async getOrders(page = 0, size = 20): Promise<PageResponse<Order>> {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/admin/orders', {
      params: { page, size },
    });
    return res.data.data!;
  },

  // Users
  async getUsers(page = 0, size = 20): Promise<PageResponse<User>> {
    const res = await api.get<ApiResponse<PageResponse<User>>>('/admin/users', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async updateUserRole(id: number, role: 'CUSTOMER' | 'ADMIN'): Promise<void> {
    await api.patch<ApiResponse<void>>(`/admin/users/${id}/role`, { role });
  },

  // Coupons
  async getCoupons(page = 0, size = 20): Promise<PageResponse<Coupon>> {
    const res = await api.get<ApiResponse<PageResponse<Coupon>>>('/admin/coupons', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const res = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return res.data.data!;
  },

  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon> {
    const res = await api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return res.data.data!;
  },

  async deleteCoupon(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
  },

  // Downloads
  async getDownloads(page = 0, size = 20): Promise<PageResponse<Download>> {
    const res = await api.get<ApiResponse<PageResponse<Download>>>('/admin/downloads', {
      params: { page, size },
    });
    return res.data.data!;
  },
};
