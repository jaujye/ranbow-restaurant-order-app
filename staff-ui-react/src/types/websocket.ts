/**
 * 🔌 WebSocket Communication Types
 * TypeScript definitions for real-time messaging and notifications
 */

// 🌐 WebSocket Configuration
export interface WebSocketConfig {
  url: string                      // ws://localhost:8081/ws/staff/{staffId}
  reconnectInterval: number        // 5000ms
  maxReconnectAttempts: number     // 10
  heartbeatInterval: number        // 30000ms
  timeout: number                  // 10000ms
  
  events: {
    onConnect: () => void
    onDisconnect: (reason?: string) => void
    onMessage: (data: WSMessage) => void
    onError: (error: Error) => void
    onReconnect: (attempt: number) => void
    onReconnectFailed: () => void
  }
}

// 📨 Core WebSocket Message
export interface WSMessage {
  id: string                       // Unique message ID
  type: MessageType
  timestamp: Date
  data: any
  priority: MessagePriority
  targetStaff?: string[]           // Specific staff IDs (optional)
  expiresAt?: Date                 // Message expiration
  requiresAck?: boolean            // Requires acknowledgment
  correlationId?: string           // For request-response pattern
}

export type MessageType = 
  // 📦 Order Messages
  | 'NEW_ORDER'
  | 'ORDER_UPDATE' 
  | 'ORDER_STATUS_CHANGE'
  | 'ORDER_ASSIGNMENT'
  | 'ORDER_CANCELLED'
  | 'URGENT_ORDER'
  
  // 🍳 Kitchen Messages
  | 'KITCHEN_ALERT'
  | 'COOKING_TIMER'
  | 'WORKSTATION_UPDATE'
  | 'KITCHEN_CAPACITY'
  
  // 👥 Staff Messages
  | 'STAFF_MESSAGE'
  | 'STAFF_STATUS_UPDATE'
  | 'SHIFT_CHANGE'
  | 'BREAK_REMINDER'
  
  // 🔔 System Notifications
  | 'SYSTEM_NOTIFICATION'
  | 'SYSTEM_ALERT'
  | 'MAINTENANCE_MODE'
  | 'PERFORMANCE_REPORT'
  
  // 🔄 Connection Management
  | 'HEARTBEAT'
  | 'PING'
  | 'PONG'
  | 'ACKNOWLEDGE'

export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'

// 📦 Specific Message Data Types

// New Order Message
export interface NewOrderMessage {
  orderId: number
  orderNumber: string
  tableNumber: string
  customerName?: string
  itemCount: number
  totalAmount: number
  priority: 'NORMAL' | 'HIGH' | 'URGENT'
  source: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'ONLINE'
  specialInstructions?: string
  estimatedPrepTime: number       // minutes
  isUrgent: boolean
}

// Order Status Update Message
export interface OrderUpdateMessage {
  orderId: number
  orderNumber: string
  previousStatus: string
  newStatus: string
  updatedBy: string
  updatedByName: string
  timestamp: Date
  notes?: string
  estimatedCompleteTime?: Date
}

// Kitchen Alert Message
export interface KitchenAlertMessage {
  alertId: string
  type: 'CAPACITY_WARNING' | 'EQUIPMENT_ISSUE' | 'DELAY_ALERT' | 'PRIORITY_ORDER'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  affectedOrders?: number[]
  workstation?: string
  estimatedImpact: number         // minutes of delay
  actionRequired: string
}

// Staff Status Message
export interface StaffStatusMessage {
  staffId: string
  staffName: string
  previousStatus: string
  newStatus: string
  currentShift?: string
  onBreak: boolean
  availableUntil?: Date
  currentOrders: number[]
}

// System Notification Message
export interface SystemNotificationMessage {
  notificationId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  actionUrl?: string
  actionText?: string
  autoClose?: boolean
  duration?: number               // milliseconds
}

// Urgent Order Alert Message
export interface UrgentOrderAlertMessage {
  orderId: number
  orderNumber: string
  reason: 'OVERTIME' | 'HIGH_VALUE' | 'VIP_CUSTOMER' | 'SPECIAL_REQUEST' | 'COMPLAINT'
  overdueMinutes?: number
  tableNumber: string
  customerInfo?: {
    name: string
    phone?: string
    memberLevel?: string
  }
  requiresImmediateAction: boolean
  escalationLevel: number         // 1-5
  originalOrderTime: Date
}

// Kitchen Capacity Warning Message
export interface KitchenCapacityMessage {
  currentCapacity: number         // percentage
  queueLength: number
  activeOrders: number
  estimatedDelay: number          // minutes
  bottleneckStations: string[]
  recommendedActions: string[]
  forecastedCapacity: {
    nextHour: number
    peak: Date
    peakCapacity: number
  }
}

// Cooking Timer Message
export interface CookingTimerMessage {
  timerId: string
  orderId: number
  orderNumber: string
  timerType: 'STARTED' | 'HALFWAY' | 'NEAR_COMPLETE' | 'OVERDUE' | 'COMPLETED'
  elapsedTime: number            // seconds
  remainingTime: number          // seconds
  workstation?: string
  assignedChef: string
}

// 🔄 WebSocket Connection State
export interface WSConnectionState {
  isConnected: boolean
  reconnectAttempts: number
  lastConnectedAt?: Date
  lastDisconnectedAt?: Date
  connectionId?: string
  latency?: number               // milliseconds
  messagesSent: number
  messagesReceived: number
  errors: WSError[]
}

export interface WSError {
  id: string
  timestamp: Date
  type: 'CONNECTION' | 'MESSAGE' | 'TIMEOUT' | 'PROTOCOL'
  message: string
  details?: any
  recovered: boolean
}

// 🔔 Message Handling & Acknowledgment
export interface MessageHandler {
  type: MessageType
  handler: (message: WSMessage) => Promise<void> | void
  priority?: number              // Handler execution priority
  timeout?: number               // Handler timeout in ms
}

export interface MessageAcknowledgment {
  messageId: string
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED'
  timestamp: Date
  processingTime?: number        // milliseconds
  error?: string
}

// 📊 Message Statistics
export interface MessageStats {
  period: {
    start: Date
    end: Date
  }
  totalMessages: number
  messagesByType: Record<MessageType, number>
  messagesByPriority: Record<MessagePriority, number>
  averageLatency: number         // milliseconds
  failedMessages: number
  reconnections: number
  uptime: number                 // percentage
}

// 🎛️ WebSocket Manager Interface
export interface WSManager {
  // Connection Management
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  
  // Message Handling
  sendMessage(message: Partial<WSMessage>): Promise<void>
  subscribe(type: MessageType, handler: MessageHandler['handler']): () => void
  unsubscribe(type: MessageType): void
  
  // Acknowledgment
  acknowledgeMessage(messageId: string): Promise<void>
  
  // Statistics & Monitoring
  getStats(): MessageStats
  getConnectionState(): WSConnectionState
}

// 🔧 WebSocket Configuration Options
export interface WSOptions {
  autoReconnect: boolean
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  messageTimeout: number
  queueMessages: boolean         // Queue messages when disconnected
  enableCompression: boolean
  enableLogging: boolean
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
}

// 📱 UI Integration Types
export interface WSNotificationDisplay {
  id: string
  type: MessageType
  title: string
  message: string
  priority: MessagePriority
  timestamp: Date
  actions?: NotificationAction[]
  autoClose?: boolean
  duration?: number
  sound?: boolean
  vibration?: boolean
}

export interface NotificationAction {
  id: string
  label: string
  action: () => void
  style: 'primary' | 'secondary' | 'danger'
}

// 🔄 Event Emitter Types
export interface WSEventMap {
  'connected': () => void
  'disconnected': (reason?: string) => void
  'message': (message: WSMessage) => void
  'error': (error: WSError) => void
  'reconnecting': (attempt: number) => void
  'reconnected': () => void
  'messageAcknowledged': (ack: MessageAcknowledgment) => void
}

// 📋 Message Queue Types
export interface MessageQueue {
  pending: WSMessage[]
  sent: WSMessage[]
  acknowledged: WSMessage[]
  failed: WSMessage[]
  maxSize: number
  retryAttempts: number
}

// 🛡️ Security & Validation
export interface WSSecurityConfig {
  enableTokenAuth: boolean
  tokenRefreshInterval: number   // milliseconds
  allowedOrigins: string[]
  rateLimiting: {
    messagesPerMinute: number
    burstSize: number
  }
  messageValidation: boolean
  encryptMessages: boolean
}

export interface MessageValidation {
  isValid: boolean
  errors: string[]
  sanitized?: WSMessage
}