/**
 * 📋 Main Types Export
 * Central export file for all TypeScript type definitions
 */

// 👥 Staff Management Types
export type * from './staff'
export type {
  StaffMember,
  StaffRole,
  StaffAuthState,
  LoginCredentials,
  QuickSwitchCredentials,
  WorkShift,
  StaffActivity,
  StaffPerformance,
  StaffNotification,
  StaffDashboardData,
  LoginFormData
} from './staff'

// 📦 Order Management Types  
export type * from './orders'
export type {
  Order,
  OrderStatus,
  OrderPriority,
  OrderItem,
  OrderQueue,
  QueueSummary,
  OrderFilters,
  OrderAlert,
  KitchenOrder,
  CookingTimer,
  OrderDashboard
} from './orders'

// 🔌 WebSocket Communication Types
export type * from './websocket'
export type {
  WSMessage,
  MessageType,
  MessagePriority,
  WebSocketConfig,
  WSManager,
  NewOrderMessage,
  OrderUpdateMessage,
  KitchenAlertMessage,
  UrgentOrderAlertMessage,
  WSConnectionState
} from './websocket'

// 🎨 UI & Component Types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps extends ComponentProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
}

export interface ToastProps {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

// 📱 Navigation & Routing Types
export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: string | number
  children?: NavItem[]
  permission?: string
  exact?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
}

// 📊 Chart & Visualization Types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: any
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  data: ChartDataPoint[]
  options?: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    legend?: boolean
    tooltip?: boolean
  }
}

// 📋 Form & Validation Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: any }[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

export interface FormConfig {
  fields: FormField[]
  submitLabel?: string
  resetLabel?: string
  layout?: 'vertical' | 'horizontal' | 'inline'
}

export interface FormErrors {
  [fieldName: string]: string
}

// 🔍 Search & Filter Types
export interface SearchConfig {
  placeholder?: string
  debounceMs?: number
  minLength?: number
  maxResults?: number
  categories?: string[]
}

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: { label: string; value: any }[]
  multiple?: boolean
}

export interface ActiveFilter {
  key: string
  value: any
  label: string
}

// 📊 Table & List Types
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableConfig {
  columns: TableColumn[]
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showTotal?: boolean
}

// 🎯 Action Types
export interface ActionItem {
  id: string
  label: string
  icon?: string
  action: () => void
  disabled?: boolean
  hidden?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  permission?: string
}

export interface BulkAction extends ActionItem {
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

// 🔄 API & Data Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface APIError {
  code: string
  message: string
  details?: any
  field?: string
}

export interface APIConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

// 🔔 Notification & Alert Types
export interface NotificationConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  autoClose: boolean
  closeOnClick: boolean
  pauseOnHover: boolean
  draggable: boolean
  maxNotifications: number
}

export interface AlertConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  closable?: boolean
  showIcon?: boolean
  actions?: ActionItem[]
}

// 🎨 Theme & Styling Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  secondaryColor: string
  accentColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  fontSize: 'sm' | 'md' | 'lg'
  fontFamily: string
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
  gray: Record<number, string>
}

// 📱 Device & Platform Types
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux'
  browser: string
  version: string
  viewport: {
    width: number
    height: number
  }
}

export interface AppInfo {
  name: string
  version: string
  build: string
  environment: 'development' | 'staging' | 'production'
}

// 🔧 Configuration Types
export interface AppConfig {
  api: APIConfig
  websocket: WebSocketConfig
  theme: ThemeConfig
  notifications: NotificationConfig
  features: Record<string, boolean>
  debug: boolean
}

// 📊 Analytics & Tracking Types
export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
}

export interface UserSession {
  sessionId: string
  userId: string
  startTime: Date
  lastActivity: Date
  device: DeviceInfo
  location?: {
    country: string
    city: string
    timezone: string
  }
}

// 🛡️ Security & Permissions Types
export interface Permission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
}

export interface SecurityContext {
  user: StaffMember
  roles: Role[]
  permissions: Permission[]
  session: UserSession
}

// 📝 Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Nullable<T> = T | null
export type Awaitable<T> = T | Promise<T>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 🔄 State Management Types
export interface StoreState<T> {
  data: T
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface AsyncAction<T> {
  pending: () => void
  fulfilled: (data: T) => void
  rejected: (error: string) => void
}