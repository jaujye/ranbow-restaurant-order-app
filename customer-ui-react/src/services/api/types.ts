// 用戶相關類型定義
export interface User {
  id: number
  email: string
  name: string
  phone: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  phoneNumber: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresIn: number
}

// 菜單相關類型定義
export interface MenuItem {
  itemId: string  // 後端使用UUID字符串
  id?: number     // 向後兼容
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string | null
  available: boolean
  popular?: boolean
  preparationTime?: number
  createdAt: string
  updatedAt: string
}

export interface MenuCategory {
  id: number
  name: string
  displayName: string
  description?: string
  order: number
}

// 購物車相關類型定義
export interface CartItem {
  id: number
  menuItemId: number
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  subtotal: number
  tax: number
  serviceCharge: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  menuItemId: number
  quantity: number
  specialRequests?: string
}

export interface UpdateCartItemRequest {
  quantity: number
  specialRequests?: string
}

// 訂單相關類型定義
export interface Order {
  id: number
  userId: number
  user?: User
  items: OrderItem[]
  tableNumber: string
  subtotal: number
  tax: number
  serviceCharge: number
  totalAmount: number
  status: OrderStatus
  paymentMethod?: PaymentMethod
  paymentStatus: PaymentStatus
  specialRequests?: string
  estimatedTime?: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'

export type PaymentMethod = 
  | 'CASH'
  | 'CREDIT_CARD'
  | 'LINE_PAY'
  | 'APPLE_PAY'

export interface CreateOrderRequest {
  customerId?: string
  tableNumber: string
  items: Array<{
    menuItemId: string
    quantity: number
    specialRequests?: string
  }>
  paymentMethod: PaymentMethod
  specialRequests?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  estimatedTime?: number
}

// 支付相關類型定義
export interface Payment {
  id: number
  orderId: number
  order?: Order
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  providerResponse?: any
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CreatePaymentRequest {
  orderId: number
  method: PaymentMethod
  amount: number
}

export interface ProcessPaymentRequest {
  transactionId: string
  providerData?: any
}

// API 分頁回應類型
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API 查詢參數類型
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface MenuQueryParams extends PaginationParams {
  category?: string
  search?: string
  available?: boolean
  popular?: boolean
}

export interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus
  userId?: number
  startDate?: string
  endDate?: string
}

// 錯誤響應類型
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// 健康檢查響應類型
export interface HealthCheckResponse {
  status: 'UP' | 'DOWN'
  timestamp: string
  services: {
    database: 'UP' | 'DOWN'
    redis: 'UP' | 'DOWN'
  }
}

// 統計數據類型
export interface DashboardStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  popularItems: MenuItem[]
  recentOrders: Order[]
}