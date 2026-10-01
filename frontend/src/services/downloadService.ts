import api from './api';
import { ApiResponse, Download, PageResponse } from '../types';

export interface DownloadResponseData {
  productId: number;
  productTitle: string;
  fileName: string;
  fileSize: string;
  downloadUrl: string;
  expiresAt: string;
  message: string;
}

export const downloadService = {
  async getDownloadUrl(productId: number): Promise<DownloadResponseData> {
    const res = await api.get<ApiResponse<DownloadResponseData>>(`/downloads/${productId}`);
    return res.data.data!;
  },

  async getDownloadHistory(page = 0, size = 10): Promise<PageResponse<Download>> {
    const res = await api.get<ApiResponse<PageResponse<Download>>>('/downloads/history', {
      params: { page, size },
    });
    return res.data.data!;
  },
};
