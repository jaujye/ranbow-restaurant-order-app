// 用戶相關類型定義
export interface User {
  id: string  // 修正: 後端使用string類型的UUID
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
  id: string  // 修正: 後端使用string類型
  menuItemId: string  // 修正: 與MenuItem.itemId保持一致
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
}

export interface Cart {
  id: string  // 修正: 後端使用string類型
  userId: string  // 修正: 後端使用string類型
  items: CartItem[]
  subtotal: number
  tax: number
  serviceCharge: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  menuItemId: string  // 修正: 與MenuItem.itemId保持一致
  quantity: number
  specialRequests?: string
}

export interface UpdateCartItemRequest {
  quantity: number
  specialRequests?: string
}

// 訂單相關類型定義
export interface Order {
  id: string  // 修正: 後端使用string類型
  userId: string  // 修正: 後端使用string類型
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
  id: string  // 修正: 後端使用string類型
  orderId: string  // 修正: 後端使用string類型
  menuItemId: string  // 修正: 與MenuItem.itemId保持一致
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
    specialRequests?: string  // 商品級別特殊要求
  }>
  paymentMethod: PaymentMethod
  specialInstructions?: string  // 訂單級別特殊指示，與後端API匹配
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
  estimatedTime?: number
}

// 支付相關類型定義
export interface Payment {
  id: string  // 修正: 後端使用string類型
  orderId: string  // 修正: 與Order.id保持一致
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
  orderId: string        // Backend expects string, not number
  customerId: string     // Backend requires customerId
  paymentMethod: PaymentMethod  // Backend expects "paymentMethod", not "method"
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
  userId?: string  // 修正類型：後端使用string類型的UUID
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

// 支付模擬相關類型定義
export interface PaymentSimulationResult {
  success: boolean
  transactionId?: string
  message?: string
  errorCode?: string
  processingTime?: number
}

export interface CreditCardData {
  number: string
  holder: string
  expiry: string
  cvv: string
}

export interface CreditCardValidation {
  number: boolean
  holder: boolean
  expiry: boolean
  cvv: boolean
}

export interface LinePayAuthData {
  qrCode: string
  authUrl: string
  transactionId: string
  expiresAt: string
}

export interface LinePayStatusResponse {
  status: 'PENDING' | 'AUTHORIZED' | 'EXPIRED' | 'CANCELLED'
  transactionId: string
  authCode?: string
  errorMessage?: string
}

export interface ApplePayAuthData {
  deviceSupported: boolean
  authMethod: 'touch_id' | 'face_id'
  merchantId: string
  supportedNetworks: string[]
}

export interface PaymentProcessStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  timestamp?: string
  errorMessage?: string
}

export interface PaymentFlowState {
  currentStep: 'selection' | 'processing' | 'success' | 'error'
  selectedMethod: PaymentMethod | null
  amount: number
  orderId: string | null
  steps: PaymentProcessStep[]
  result: PaymentSimulationResult | null
}

// 支付方式詳細配置
export interface PaymentMethodConfig {
  method: PaymentMethod
  name: string
  displayName: string
  description: string
  icon: string
  enabled: boolean
  badges: string[]
  gradient: string
  processingTime: number
  successRate: number
  supportedCurrencies: string[]
  minimumAmount?: number
  maximumAmount?: number
  fees?: {
    fixed?: number
    percentage?: number
  }
}

// 支付驗證錯誤類型
export interface PaymentValidationError {
  field: string
  code: string
  message: string
  suggestions?: string[]
}

// 支付安全令牌
export interface PaymentSecurityToken {
  token: string
  expiresAt: string
  scope: PaymentMethod[]
  deviceFingerprint?: string
}

// 支付收據數據
export interface PaymentReceipt {
  id: string
  paymentId: number
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string
  timestamp: string
  merchantInfo: {
    name: string
    address: string
    phone: string
    taxId: string
  }
  customerInfo: {
    name: string
    email?: string
    phone?: string
  }
  itemsBreakdown: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  taxBreakdown: {
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
  }
  paymentDetails: {
    cardLast4?: string
    cardBrand?: string
    authCode?: string
    referenceNumber: string
  }
}