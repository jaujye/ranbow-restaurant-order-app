// HTTP Client and base utilities
export { HttpClient, apiUrlManager, type ApiResponse } from './client'

// Type definitions
export * from './types'

// Service classes
export { AuthService } from './authService'
export { MenuService } from './menuService'
export { OrderService } from './orderService'
export { PaymentService } from './paymentService'
export { HealthService } from './healthService'
export { CartService } from './cartService'
export { ProfileService } from './profileService'

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

// Re-export cart service types
export type {
  CartItem,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest
} from './cartService'

// Re-export profile service types
export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserAddress,
  UserCoupon,
  UserReview,
  SessionData
} from './profileService'