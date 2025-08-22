/**
 * 🔐 Authentication Components Export Index
 * Centralized exports for all authentication-related components
 */

// Authentication Components
export { default as StaffLoginForm } from './StaffLoginForm'
export { default as QuickStaffSwitch } from './QuickStaffSwitch'
export { default as SessionManager } from './SessionManager'
export { default as AuthGuard } from './AuthGuard'
export { default as ProtectedRoute } from './ProtectedRoute'

// Higher-order Components and Utilities
export { withAuthGuard, ManagerGuard, KitchenGuard, ServiceGuard } from './AuthGuard'

// Types (re-export for convenience)
export type { 
  AuthGuardProps 
} from './AuthGuard'