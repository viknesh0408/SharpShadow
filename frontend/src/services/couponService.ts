import api from './api';
import { ApiResponse } from '../types';

export interface ApplyCouponResult {
  valid: boolean;
  code: string;
  message: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
}

export const couponService = {
  async validateCoupon(couponCode: string, productIds: number[]): Promise<ApplyCouponResult> {
    const res = await api.post<ApiResponse<ApplyCouponResult>>('/coupons/validate', {
      couponCode,
      productIds,
    });
    return res.data.data!;
  },
};
