/**
 * 🧑‍💼 Staff Management Types
 * TypeScript definitions for staff-related data structures
 */

// 👤 Staff Member Core Types
export interface StaffMember {
  staffId: string
  employeeNumber: string
  name: string
  email?: string
  phone?: string
  role: StaffRole
  department: string
  avatar?: string
  isActive: boolean
  quickSwitchEnabled: boolean
  permissions: string[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export type StaffRole = 'KITCHEN' | 'SERVICE' | 'CASHIER' | 'MANAGER'

// 🔐 Authentication & Session
export interface StaffAuthState {
  currentStaff: StaffMember | null
  isAuthenticated: boolean
  authToken: string | null
  refreshToken: string | null
  sessionStartTime: Date | null
  lastActivityTime: Date | null
  availableStaff: StaffMember[]
  workShift: WorkShift | null
}

export interface LoginCredentials {
  loginId: string  // Employee number or email
  password: string
  deviceInfo: DeviceInfo
  rememberMe?: boolean
}

export interface QuickSwitchCredentials {
  currentStaffId: string
  targetStaffId: string
  pin: string
}

export interface DeviceInfo {
  deviceId: string
  deviceType: 'TABLET' | 'PHONE' | 'POS' | 'DESKTOP'
  appVersion: string
  platform?: string
}

// 📋 Work Shift Management
export interface WorkShift {
  shiftId: string
  staffId: string
  shiftDate: Date
  startTime: Date
  endTime: Date
  actualStart?: Date
  actualEnd?: Date
  breakMinutes: number
  overtimeMinutes: number
  status: WorkShiftStatus
}

export type WorkShiftStatus = 'SCHEDULED' | 'ACTIVE' | 'BREAK' | 'COMPLETED' | 'CANCELLED'

// 📈 Staff Activity Tracking
export interface StaffActivity {
  activityId: string
  staffId: string
  activityType: StaffActivityType
  orderId?: number
  description?: string
  durationSeconds: number
  createdAt: Date
}

export type StaffActivityType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'ORDER_ACCEPT'
  | 'ORDER_START'
  | 'ORDER_COMPLETE'
  | 'ORDER_CANCEL'
  | 'BREAK_START'
  | 'BREAK_END'
  | 'KITCHEN_PREP'
  | 'KITCHEN_COOK'
  | 'SERVICE_DELIVER'

// 🎖️ Staff Performance
export interface StaffPerformance {
  staffId: string
  staffName: string
  period: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    date: string
    workHours: number
  }
  orderStats: {
    totalProcessed: number
    completed: number
    cancelled: number
    inProgress: number
    completionRate: number
    averageProcessTime: number  // minutes
  }
  efficiency: {
    score: number  // 0-100
    rank: number
    totalStaff: number
    overdueOrders: number
    onTimeRate: number  // percentage
  }
  achievements: StaffAchievement[]
  customerFeedback: {
    averageRating: number
    totalReviews: number
    compliments: number
  }
}

export interface StaffAchievement {
  type: AchievementType
  name: string
  description?: string
  earnedAt: Date
  level?: number
}

export type AchievementType = 
  | 'ZERO_OVERTIME'
  | 'EFFICIENCY_CHAMPION'
  | 'CUSTOMER_FAVORITE'
  | 'SPEED_DEMON'
  | 'PERFECTIONIST'
  | 'TEAM_PLAYER'

// 🔔 Staff Notifications
export interface StaffNotification {
  id: string
  staffId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  priority: NotificationPriority
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

export type NotificationType = 
  | 'NEW_ORDER'
  | 'ORDER_UPDATE'
  | 'URGENT_ORDER'
  | 'KITCHEN_ALERT'
  | 'STAFF_MESSAGE'
  | 'SYSTEM_NOTIFICATION'
  | 'ACHIEVEMENT'
  | 'PERFORMANCE_REPORT'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

// 📊 Dashboard Data
export interface StaffDashboardData {
  staff: StaffMember
  todayStats: {
    ordersProcessed: number
    activeOrders: number
    pendingOrders: number
    avgProcessTime: number
    efficiency: number
  }
  recentOrders: OrderSummary[]
  notifications: StaffNotification[]
  workShift: WorkShift
  quickActions: QuickAction[]
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  enabled: boolean
  badge?: string | number
}

// 📱 UI State Types
export interface StaffUIState {
  sidebarOpen: boolean
  currentPage: string
  loading: boolean
  error: string | null
  theme: 'light' | 'dark'
  notifications: {
    sound: boolean
    vibration: boolean
    desktop: boolean
  }
}

// 🔄 API Response Types
export interface StaffAPIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
}

export interface StaffLoginResponse extends StaffAPIResponse {
  data: {
    staff: StaffMember
    auth: {
      accessToken: string
      refreshToken: string
      expiresIn: number
      tokenType: string
    }
    workShift: WorkShift
  }
}

// 📋 Form Types
export interface LoginFormData {
  loginId: string
  password: string
  rememberMe: boolean
}

export interface QuickSwitchFormData {
  targetStaffId: string
  pin: string
}

// Export commonly used type unions
export type StaffPermission = 
  | 'ORDER_VIEW'
  | 'ORDER_UPDATE' 
  | 'ORDER_CANCEL'
  | 'KITCHEN_MANAGE'
  | 'STATS_VIEW'
  | 'STAFF_MANAGE'
  | 'SYSTEM_CONFIG'

export type StaffStatus = 'ACTIVE' | 'BREAK' | 'BUSY' | 'OFFLINE'

// 📋 Order Summary (imported from orders)
export interface OrderSummary {
  orderId: number
  orderNumber: string
  tableNumber: string
  status: string
  totalAmount: number
  itemCount: number
  orderTime: Date
  isUrgent: boolean
}