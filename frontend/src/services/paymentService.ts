import api from './api';
import { ApiResponse, Payment } from '../types';

export interface PaymentVerificationData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod?: string;
}

export interface QRPaymentInfo {
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  qrCodePayload: string;
  status: string;
}

export const paymentService = {
  async verifyPayment(data: PaymentVerificationData): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>('/payments/verify', data);
    return res.data.data!;
  },

  async getQrPayment(orderNumber: string): Promise<QRPaymentInfo> {
    const res = await api.get<ApiResponse<QRPaymentInfo>>(`/payments/qr/${orderNumber}`);
    return res.data.data!;
  },

  async checkStatus(orderNumber: string): Promise<{ orderNumber: string; status: string }> {
    const res = await api.get<ApiResponse<{ orderNumber: string; status: string }>>(`/payments/status/${orderNumber}`);
    return res.data.data!;
  },
};
