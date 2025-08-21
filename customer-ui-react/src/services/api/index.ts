// HTTP Client and base utilities
export { HttpClient, type ApiResponse } from './client'

// Type definitions
export * from './types'

// Service classes
export { AuthService } from './authService'
export { MenuService } from './menuService'
export { OrderService } from './orderService'
export { PaymentService } from './paymentService'
export { HealthService } from './healthService'

// Re-export commonly used types for convenience
export type {
  User,
  MenuItem,
  Order,
  Payment,
  LoginRequest,
  RegisterRequest,
  CreateOrderRequest,
  CreatePaymentRequest
} from './types'