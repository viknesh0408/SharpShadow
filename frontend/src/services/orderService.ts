import api from './api';
import { ApiResponse, Order, PageResponse } from '../types';

export const orderService = {
  async createOrder(productIds: number[], couponCode?: string): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>('/orders', {
      productIds,
      couponCode: couponCode ? couponCode.trim() : undefined,
    });
    return res.data.data!;
  },

  async getUserOrders(page = 0, size = 10): Promise<PageResponse<Order>> {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/orders', {
      params: { page, size },
    });
    return res.data.data!;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
    return res.data.data!;
  },
};
