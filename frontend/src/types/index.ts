export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  status: string;
  productCount?: number;
  createdAt?: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: Category;
  thumbnailUrl: string;
  fileName?: string;
  fileSize?: string;
  dimensions?: string;
  resolution?: string;
  colorMode?: string;
  photoshopVersion?: string;
  featured: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  downloadCount: number;
  previewImages?: string[];
  hasPurchased?: boolean;
  createdAt?: string;
  updatedAt?: string;
  internalFileUrl?: string;
}

export type OrderStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  productThumbnail?: string;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayKeyId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface Download {
  id: number;
  productId: number;
  productTitle: string;
  productSlug: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize?: string;
  orderId: number;
  downloadedAt: string;
  ipAddress?: string;
  userName?: string;
  userEmail?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  status: string;
}

export interface AdminDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  todaySales: number;
  totalDownloads: number;
  salesByDay: { day: string; sales: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  popularProducts: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  path?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CartItem {
  product: Product;
}
