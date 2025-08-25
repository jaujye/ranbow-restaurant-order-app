// Notification system types - centralized type definitions

// Notification type enumeration
export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  ORDER_OVERDUE = 'ORDER_OVERDUE',
  KITCHEN_ALERT = 'KITCHEN_ALERT',
  STAFF_MESSAGE = 'STAFF_MESSAGE',
  SYSTEM = 'SYSTEM',
  SHIFT_START = 'SHIFT_START',
  SHIFT_END = 'SHIFT_END',
  EMERGENCY = 'EMERGENCY'
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL', 
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

// Main notification data structure
export interface NotificationData {
  notificationId: string;
  recipientStaffId: string;
  senderStaffId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  relatedOrderId?: string;
  isRead?: boolean;
  read?: boolean;
  sentAt: string;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  expired?: boolean;
  urgent?: boolean;
  minutesSinceSent?: number;
}

// API request types
export interface GetNotificationsRequest {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MarkReadRequest {
  notificationId?: string;
}

// API response types
export interface NotificationsListResponse {
  notifications: NotificationData[];
  unreadCount: number;
  totalCount: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  markedCount?: number;
}

// UI-specific types
export interface NotificationUIState {
  loading: boolean;
  error: string | null;
  selectedNotification: NotificationData | null;
  showReadNotifications: boolean;
  filterType: NotificationType | 'ALL';
  filterPriority: NotificationPriority | 'ALL';
}

export interface NotificationFilters {
  type?: NotificationType | 'ALL';
  priority?: NotificationPriority | 'ALL';
  isRead?: boolean | 'ALL';
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recentCount: number;
}

// Display configuration
export interface NotificationDisplayConfig {
  showTimestamp: boolean;
  showSender: boolean;
  showPriority: boolean;
  showType: boolean;
  compact: boolean;
  groupByDate: boolean;
}

// Settings
export interface NotificationSettings {
  enableSound: boolean;
  enableDesktopNotifications: boolean;
  enableVibration: boolean;
  soundVolume: number;
  autoMarkReadOnView: boolean;
  showOnlyUnread: boolean;
  refreshInterval: number;
}

// Action types
export type NotificationAction = 
  | 'view'
  | 'markRead'
  | 'markAllRead'
  | 'delete'
  | 'goToOrder'
  | 'goToKitchen'
  | 'respond'
  | 'dismiss';

export interface NotificationActionHandler {
  action: NotificationAction;
  handler: (notification: NotificationData) => void | Promise<void>;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

// Grouping
export interface NotificationGroup {
  date: string;
  notifications: NotificationData[];
  unreadCount: number;
}

// Events
export interface NotificationEvent {
  type: 'NEW_NOTIFICATION' | 'NOTIFICATION_READ' | 'NOTIFICATION_DELETED';
  notification: NotificationData;
  timestamp: string;
}

// WebSocket
export interface WebSocketNotificationPayload {
  type: 'NOTIFICATION';
  data: {
    staffId: string;
    notification: NotificationData;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
  };
}

// Toast configuration
export interface ToastNotificationConfig {
  duration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showClose: boolean;
  persistent: boolean;
  sound: boolean;
  vibration: boolean;
}

// Badge configuration
export interface NotificationBadgeConfig {
  showCount: boolean;
  maxCount: number;
  showDot: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color: string;
  animate: boolean;
}

// Error handling
export interface NotificationError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

// Context interface
export interface NotificationContext {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  error: NotificationError | null;
  settings: NotificationSettings;
  filters: NotificationFilters;
  stats: NotificationStats;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  updateFilters: (filters: Partial<NotificationFilters>) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

// Component props
export interface NotificationItemProps {
  notification: NotificationData;
  config: NotificationDisplayConfig;
  actions: NotificationActionHandler[];
  onAction: (action: NotificationAction, notification: NotificationData) => void;
  selected?: boolean;
  compact?: boolean;
}

export interface NotificationListProps {
  notifications: NotificationData[];
  loading?: boolean;
  error?: string | null;
  config: NotificationDisplayConfig;
  filters: NotificationFilters;
  onFilterChange: (filters: Partial<NotificationFilters>) => void;
  onNotificationAction: (action: NotificationAction, notification: NotificationData) => void;
  emptyMessage?: string;
  className?: string;
}

export interface NotificationCenterProps {
  staffId: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  maxHeight?: number;
  compact?: boolean;
  className?: string;
}

// Label type mappings
export type NotificationTypeLabel = {
  [K in NotificationType]: string;
};

export type NotificationPriorityLabel = {
  [K in NotificationPriority]: string;
};

export type NotificationTypeColor = {
  [K in NotificationType]: string;
};

export type NotificationPriorityColor = {
  [K in NotificationPriority]: string;
};

// Constants
export const NOTIFICATION_TYPE_LABELS: NotificationTypeLabel = {
  [NotificationType.NEW_ORDER]: '新訂單',
  [NotificationType.ORDER_STATUS_CHANGE]: '訂單狀態更新',
  [NotificationType.ORDER_OVERDUE]: '訂單超時',
  [NotificationType.KITCHEN_ALERT]: '廚房警報',
  [NotificationType.STAFF_MESSAGE]: '員工訊息',
  [NotificationType.SYSTEM]: '系統通知',
  [NotificationType.SHIFT_START]: '班次開始',
  [NotificationType.SHIFT_END]: '班次結束',
  [NotificationType.EMERGENCY]: '緊急通知'
};

export const NOTIFICATION_PRIORITY_LABELS: NotificationPriorityLabel = {
  [NotificationPriority.LOW]: '低',
  [NotificationPriority.NORMAL]: '一般',
  [NotificationPriority.HIGH]: '高',
  [NotificationPriority.URGENT]: '緊急',
  [NotificationPriority.EMERGENCY]: '緊急'
};

export const NOTIFICATION_TYPE_COLORS: NotificationTypeColor = {
  [NotificationType.NEW_ORDER]: 'bg-blue-100 text-blue-800',
  [NotificationType.ORDER_STATUS_CHANGE]: 'bg-green-100 text-green-800',
  [NotificationType.ORDER_OVERDUE]: 'bg-red-100 text-red-800',
  [NotificationType.KITCHEN_ALERT]: 'bg-orange-100 text-orange-800',
  [NotificationType.STAFF_MESSAGE]: 'bg-purple-100 text-purple-800',
  [NotificationType.SYSTEM]: 'bg-gray-100 text-gray-800',
  [NotificationType.SHIFT_START]: 'bg-emerald-100 text-emerald-800',
  [NotificationType.SHIFT_END]: 'bg-indigo-100 text-indigo-800',
  [NotificationType.EMERGENCY]: 'bg-red-100 text-red-800'
};

export const NOTIFICATION_PRIORITY_COLORS: NotificationPriorityColor = {
  [NotificationPriority.LOW]: 'bg-gray-100 text-gray-600',
  [NotificationPriority.NORMAL]: 'bg-blue-100 text-blue-600',
  [NotificationPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
  [NotificationPriority.URGENT]: 'bg-red-100 text-red-800',
  [NotificationPriority.EMERGENCY]: 'bg-red-200 text-red-900'
};