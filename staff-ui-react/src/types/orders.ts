/**
 * 📦 Order Management Types
 * TypeScript definitions for order-related data structures
 */

// 🛒 Core Order Types
export interface Order {
  orderId: number
  orderNumber: string
  tableNumber: string
  customerName?: string
  customerPhone?: string
  status: OrderStatus
  priority: OrderPriority
  items: OrderItem[]
  totalAmount: number
  orderTime: Date
  estimatedCompleteTime?: Date
  actualCompleteTime?: Date
  assignedStaff?: string
  isOverdue: boolean
  overdueMinutes: number
  specialInstructions?: string
  paymentStatus: PaymentStatus
  source: OrderSource
}

export type OrderStatus = 
  | 'PENDING'      // 待處理
  | 'CONFIRMED'    // 已確認
  | 'PROCESSING'   // 處理中
  | 'PREPARING'    // 製作中
  | 'READY'        // 準備完成
  | 'DELIVERED'    // 已送達
  | 'COMPLETED'    // 已完成
  | 'CANCELLED'    // 已取消
  | 'REFUNDED'     // 已退款

export type OrderPriority = 'NORMAL' | 'HIGH' | 'URGENT'

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'

export type OrderSource = 
  | 'DINE_IN'      // 內用
  | 'TAKEAWAY'     // 外帶
  | 'DELIVERY'     // 外送
  | 'ONLINE'       // 線上訂餐
  | 'APP'          // 手機App

// 🍽️ Order Item Types
export interface OrderItem {
  itemId: number
  menuItemId: number
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specialRequests?: string
  preparationTime: number  // estimated minutes
  status: OrderItemStatus
  assignedChef?: string
  startTime?: Date
  completeTime?: Date
  notes?: string
}

export type OrderItemStatus = 
  | 'PENDING'
  | 'PREPARING'
  | 'COOKING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED'

// 📋 Order Assignment & Tracking
export interface OrderAssignment {
  assignmentId: string
  orderId: number
  staffId: string
  assignedAt: Date
  startedAt?: Date
  completedAt?: Date
  status: AssignmentStatus
  notes?: string
  estimatedDuration: number
}

export type AssignmentStatus = 'ASSIGNED' | 'STARTED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

// ⏱️ Cooking Timer Types
export interface CookingTimer {
  timerId: string
  orderId: number
  staffId: string
  startTime: Date
  pausedTime?: Date
  resumeTime?: Date
  endTime?: Date
  totalPausedDuration: number  // seconds
  estimatedDuration: number    // seconds
  actualDuration?: number      // seconds
  status: TimerStatus
  alerts: TimerAlerts
}

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export interface TimerAlerts {
  halfTime: boolean      // 時間過半提醒
  nearComplete: boolean  // 即將完成提醒
  overdue: boolean      // 超時提醒
}

// 📊 Order Queue Management
export interface OrderQueue {
  pending: Order[]
  processing: Order[]
  ready: Order[]
  completed: Order[]
  cancelled: Order[]
}

export interface QueueSummary {
  pendingCount: number
  processingCount: number
  urgentCount: number
  overdueCount: number
  averageWaitTime: number  // minutes
  totalRevenue: number
  completionRate: number   // percentage
}

// 🔍 Order Filtering & Search
export interface OrderFilters {
  status?: OrderStatus[]
  priority?: OrderPriority[]
  assignedTo?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tableNumber?: string
  customerName?: string
  orderSource?: OrderSource[]
  minAmount?: number
  maxAmount?: number
}

export interface OrderSearchParams {
  query?: string
  filters?: OrderFilters
  sortBy?: OrderSortField
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type OrderSortField = 
  | 'orderTime'
  | 'tableNumber'
  | 'totalAmount'
  | 'priority'
  | 'status'
  | 'estimatedCompleteTime'

// 📈 Order Analytics
export interface OrderAnalytics {
  period: {
    start: Date
    end: Date
    type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  }
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  averageProcessingTime: number
  completionRate: number
  statusBreakdown: Record<OrderStatus, number>
  priorityBreakdown: Record<OrderPriority, number>
  sourceBreakdown: Record<OrderSource, number>
  hourlyDistribution: HourlyOrderData[]
  popularItems: PopularItem[]
}

export interface HourlyOrderData {
  hour: number
  orderCount: number
  revenue: number
  averageWaitTime: number
}

export interface PopularItem {
  itemId: number
  name: string
  orderCount: number
  revenue: number
  averageRating?: number
}

// 🚨 Order Alerts & Notifications
export interface OrderAlert {
  id: string
  orderId: number
  type: OrderAlertType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  resolvedAt?: Date
}

export type OrderAlertType = 
  | 'OVERDUE'
  | 'HIGH_PRIORITY'
  | 'KITCHEN_DELAY'
  | 'CUSTOMER_COMPLAINT'
  | 'PAYMENT_ISSUE'
  | 'INVENTORY_LOW'
  | 'SPECIAL_REQUEST'

// 🍳 Kitchen-specific Types
export interface KitchenOrder {
  orderId: number
  orderNumber: string
  tableNumber: string
  items: KitchenOrderItem[]
  priority: OrderPriority
  orderTime: Date
  estimatedCompleteTime: Date
  specialInstructions?: string
  assignedChef?: string
  cookingStatus: KitchenStatus
  elapsedTime: number  // minutes
  remainingTime: number  // minutes
}

export interface KitchenOrderItem {
  itemId: number
  name: string
  quantity: number
  cookingTime: number
  specialRequests?: string
  status: OrderItemStatus
  workstation?: string
  ingredients?: string[]
}

export type KitchenStatus = 'QUEUED' | 'PREP' | 'COOKING' | 'PLATING' | 'READY'

// 🏪 Workstation Management
export interface Workstation {
  stationId: string
  name: string
  type: WorkstationType
  capacity: number
  currentLoad: number
  assignedStaff: string[]
  activeOrders: number[]
  status: WorkstationStatus
  lastMaintenanceAt?: Date
}

export type WorkstationType = 
  | 'GRILL'
  | 'WOK'
  | 'FRYER'
  | 'OVEN'
  | 'PREP'
  | 'SALAD'
  | 'DESSERT'
  | 'BEVERAGE'

export type WorkstationStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | 'CLEANING'

// 📱 UI State Types
export interface OrderUIState {
  selectedOrder: Order | null
  viewMode: 'list' | 'grid' | 'kanban'
  filters: OrderFilters
  sortBy: OrderSortField
  sortOrder: 'asc' | 'desc'
  searchQuery: string
  loading: boolean
  error: string | null
  autoRefresh: boolean
  refreshInterval: number
}

// 🔄 WebSocket Message Types
export interface OrderWebSocketMessage {
  type: OrderMessageType
  timestamp: Date
  data: any
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

export type OrderMessageType = 
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_ASSIGNMENT'
  | 'URGENT_ORDER_ALERT'
  | 'KITCHEN_UPDATE'
  | 'TIMER_ALERT'
  | 'QUEUE_UPDATE'

// 📋 Form Types
export interface OrderStatusUpdateForm {
  newStatus: OrderStatus
  staffId: string
  note?: string
  estimatedCompleteTime?: Date
}

export interface OrderAssignmentForm {
  orderId: number
  staffId: string
  notes?: string
  priority?: OrderPriority
}

export interface CookingTimerForm {
  orderId: number
  estimatedMinutes: number
  workstationId?: string
  notes?: string
}

// 🔄 API Response Types
export interface OrderAPIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
}

export interface OrderQueueResponse extends OrderAPIResponse {
  data: {
    orders: Order[]
    pagination: {
      currentPage: number
      totalPages: number
      totalElements: number
      hasNext: boolean
    }
    summary: QueueSummary
  }
}

export interface OrderHistoryEntry {
  id: string
  orderId: number
  action: string
  previousValue?: string
  newValue?: string
  staffId: string
  staffName: string
  timestamp: Date
  notes?: string
}

// 📊 Order Dashboard Types
export interface OrderDashboard {
  summary: QueueSummary
  recentOrders: Order[]
  alerts: OrderAlert[]
  performance: {
    completionRate: number
    averageWaitTime: number
    onTimeDelivery: number
    customerSatisfaction: number
  }
  kitchenWorkload: {
    currentCapacity: number
    activeStations: number
    avgCookingTime: number
  }
}