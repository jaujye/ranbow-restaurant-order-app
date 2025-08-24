// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Staff Types
export interface Staff {
  staffId: string;
  name: string;
  email: string;
  phone: string;
  position: StaffPosition;
  department: string;
  isOnDuty: boolean;
  shift: StaffShift;
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile extends Staff {
  todayStats?: StaffStatistics;
  unreadNotifications: number;
  lastLogin?: string;
  currentSession?: {
    loginTime: string;
    lastActivity: string;
  };
}

export enum StaffPosition {
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  COOK = 'COOK',
  SERVER = 'SERVER',
  CASHIER = 'CASHIER',
  CLEANER = 'CLEANER'
}

export enum StaffShift {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}

// Order Types
export interface Order {
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: string;
  specialInstructions?: string;
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
  priority: OrderPriority;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customizations?: string[];
  specialRequests?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY'
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Kitchen Types
export interface KitchenOrder {
  orderId: string;
  items: KitchenOrderItem[];
  status: KitchenStatus;
  assignedCook?: string;
  startTime?: string;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  priority: OrderPriority;
  specialInstructions?: string;
  notes?: string;
}

export interface KitchenOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  cookingInstructions?: string;
  ingredients: string[];
  allergens?: string[];
  customizations?: string[];
}

export enum KitchenStatus {
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}

// Statistics Types
export interface StaffStatistics {
  staffId: string;
  date: string;
  period: StatisticsPeriod;
  ordersProcessed: number;
  averageProcessingTime: number;
  customerRating?: number;
  totalWorkingHours: number;
  breaks: number;
  efficiency: number;
  revenue: number;
  tips?: number;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  customerSatisfaction: number;
  teamwork: number;
  punctuality: number;
  overall: number;
}

export interface TeamStatistics {
  totalStaff: number;
  activeStaff: number;
  totalOrdersProcessed: number;
  averageProcessingTime: number;
  customerSatisfactionRating: number;
  revenue: number;
  efficiency: number;
  date: string;
}

export interface StaffLeaderboard {
  rank: number;
  staffId: string;
  name: string;
  position: StaffPosition;
  score: number;
  ordersProcessed: number;
  efficiency: number;
  customerRating?: number;
  avatar?: string;
}

export enum StatisticsPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Notification Types
export interface Notification {
  id: string;
  staffId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  KITCHEN_ALERT = 'KITCHEN_ALERT',
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
  SHIFT_REMINDER = 'SHIFT_REMINDER',
  PERFORMANCE_UPDATE = 'PERFORMANCE_UPDATE',
  EMERGENCY = 'EMERGENCY'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Request/Response DTOs
export interface StaffLoginRequest {
  identifier: string; // Email or staff ID
  password: string;
}

export interface StaffSwitchRequest {
  fromStaffId: string;
  toStaffId: string;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
  staffId: string;
  notes?: string;
}

export interface KitchenStartRequest {
  staffId: string;
}

export interface KitchenTimerRequest {
  estimatedMinutesRemaining: number;
  notes?: string;
}

export interface KitchenCompleteRequest {
  staffId: string;
}

export interface MarkReadRequest {
  notificationId?: string; // If not provided, mark all as read
}

// WebSocket Types
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
  id: string;
}

export enum WebSocketMessageType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  KITCHEN_UPDATE = 'KITCHEN_UPDATE',
  NOTIFICATION = 'NOTIFICATION',
  STAFF_UPDATE = 'STAFF_UPDATE',
  HEARTBEAT = 'HEARTBEAT'
}

// Filter and Search Types
export interface OrderFilters {
  status?: OrderStatus[];
  orderType?: OrderType[];
  priority?: OrderPriority[];
  assignedStaff?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface StaffFilters {
  position?: StaffPosition[];
  department?: string[];
  shift?: StaffShift[];
  isOnDuty?: boolean;
  searchTerm?: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Theme and UI Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UIPreferences {
  theme: ThemeMode;
  language: string;
  notifications: boolean;
  soundEffects: boolean;
  vibration: boolean;
  compactMode: boolean;
}

// Feature Flag Types
export interface FeatureFlags {
  analytics: boolean;
  pwa: boolean;
  darkMode: boolean;
  notifications: boolean;
  soundEffects: boolean;
  vibration: boolean;
  mockApi: boolean;
  debugMode: boolean;
  devtools: boolean;
}