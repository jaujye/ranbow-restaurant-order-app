/**
 * 🔐 Enhanced Authentication Types
 * Comprehensive TypeScript definitions for staff authentication with security features
 */

import type { StaffMember, StaffRole, DeviceInfo, WorkShift } from './staff'

// 🔒 Security & Session Types
export interface SecurityState {
  failedAttempts: number
  accountLocked: boolean
  lockoutUntil: Date | null
  lastFailedAttempt: Date | null
  deviceTrusted: boolean
  sessionWarningShown: boolean
  suspiciousActivityDetected: boolean
  lastSecurityCheck: Date | null
}

export interface DeviceSession {
  sessionId: string
  deviceId: string
  deviceInfo: DeviceInfo
  staffId: string
  isActive: boolean
  lastSeen: Date
  loginCount: number
  createdAt: Date
  ipAddress?: string
  userAgent?: string
  location?: string
  isTrusted: boolean
}

// 🔐 Enhanced Authentication State
export interface EnhancedAuthState {
  // Core Authentication
  currentStaff: StaffMember | null
  isAuthenticated: boolean
  authToken: string | null
  refreshToken: string | null
  sessionStartTime: Date | null
  lastActivityTime: Date | null
  
  // Staff Management
  availableStaff: StaffMember[]
  workShift: WorkShift | null
  
  // Security Features
  security: SecurityState
  deviceSessions: DeviceSession[]
  trustedDevices: DeviceInfo[]
  
  // Session Management
  sessionTimeoutMinutes: number
  warningThresholdMinutes: number
  maxIdleMinutes: number
  autoLogoutEnabled: boolean
}

// 📝 Authentication Request Types
export interface StaffLoginRequest {
  loginId: string
  password: string
  deviceInfo: DeviceInfo
  rememberMe?: boolean
  captchaToken?: string
  twoFactorCode?: string
}

export interface PinLoginRequest {
  employeeNumber: string
  pin: string
  deviceInfo: DeviceInfo
}

export interface QuickSwitchRequest {
  currentStaffId: string
  targetStaffId: string
  pin: string
  reason?: string
}

export interface TokenRefreshRequest {
  refreshToken: string
  deviceId: string
}

export interface LogoutRequest {
  accessToken: string
  logoutAll?: boolean
  reason?: LogoutReason
}

export type LogoutReason = 
  | 'manual' 
  | 'session_expired' 
  | 'idle_timeout' 
  | 'security_violation'
  | 'admin_forced'
  | 'device_switched'

// 📊 Authentication Response Types
export interface AuthenticationResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  errorCode?: string
  data?: T
  timestamp: Date
  requestId?: string
}

export interface StaffAuthData {
  staff: StaffInfo
  auth: AuthTokens
  workShift?: WorkShift
  permissions: string[]
  sessionInfo: SessionInfo
}

export interface StaffInfo {
  staffId: string
  employeeNumber: string
  name: string
  email?: string
  role: StaffRole
  department: string
  avatar?: string
  permissions: string[]
  quickSwitchEnabled: boolean
  lastLoginAt?: Date
  preferences: StaffPreferences
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
  scope?: string[]
}

export interface SessionInfo {
  sessionId: string
  deviceId: string
  createdAt: Date
  expiresAt: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
  location?: string
}

// 🛡️ Security & Validation Types
export interface SecurityCheckResult {
  isSecure: boolean
  violations: SecurityViolation[]
  recommendations: string[]
  riskScore: number
  lastCheck: Date
}

export interface SecurityViolation {
  type: ViolationType
  severity: ViolationSeverity
  message: string
  timestamp: Date
  details?: Record<string, any>
}

export type ViolationType = 
  | 'multiple_failed_attempts'
  | 'suspicious_location'
  | 'unusual_device'
  | 'session_hijacking'
  | 'concurrent_sessions_exceeded'
  | 'weak_credentials'
  | 'expired_session'
  | 'invalid_permissions'

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical'

// 📱 Device Management Types
export interface DeviceRegistration {
  deviceName: string
  deviceType: DeviceInfo['deviceType']
  location?: string
  autoLogin: boolean
  sessionTimeout: number
  notificationsEnabled: boolean
  biometricEnabled?: boolean
}

export interface TrustedDevice extends DeviceInfo {
  deviceName: string
  trustedAt: Date
  lastUsed: Date
  autoLogin: boolean
  location?: string
}

export interface DeviceSecurityCheck {
  deviceId: string
  isSecure: boolean
  checks: {
    httpsConnection: boolean
    validCertificate: boolean
    supportedBrowser: boolean
    secureStorage: boolean
    screenLock: boolean
  }
  warnings: string[]
  recommendations: string[]
}

// ⏰ Session Management Types
export interface SessionConfiguration {
  maxDurationMinutes: number
  warningThresholdMinutes: number
  idleTimeoutMinutes: number
  maxConcurrentSessions: number
  enableAutoLogout: boolean
  enableIdleDetection: boolean
  enableSecurityChecks: boolean
  sessionPersistence: boolean
}

export interface SessionStatus {
  isActive: boolean
  remainingTime: number
  isExpiringSoon: boolean
  isIdle: boolean
  idleTime: number
  lastActivity: Date
  warningShown: boolean
  autoLogoutScheduled: boolean
}

export interface SessionEvent {
  eventId: string
  sessionId: string
  staffId: string
  eventType: SessionEventType
  timestamp: Date
  deviceInfo: DeviceInfo
  details?: Record<string, any>
  ipAddress?: string
}

export type SessionEventType = 
  | 'session_created'
  | 'session_renewed'
  | 'session_extended'
  | 'session_warning'
  | 'session_expired'
  | 'session_terminated'
  | 'device_trusted'
  | 'device_untrusted'
  | 'security_violation'
  | 'quick_switch'

// 🔄 Authentication Flow Types
export interface AuthFlow {
  flowId: string
  type: AuthFlowType
  status: AuthFlowStatus
  steps: AuthStep[]
  currentStep: number
  startedAt: Date
  completedAt?: Date
  expiresAt: Date
  metadata?: Record<string, any>
}

export type AuthFlowType = 
  | 'standard_login'
  | 'pin_login'
  | 'quick_switch'
  | 'password_reset'
  | 'two_factor'
  | 'device_registration'

export type AuthFlowStatus = 
  | 'initiated'
  | 'in_progress'
  | 'awaiting_input'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled'

export interface AuthStep {
  stepId: string
  type: AuthStepType
  status: AuthStepStatus
  title: string
  description?: string
  required: boolean
  completed: boolean
  data?: Record<string, any>
  error?: string
  completedAt?: Date
}

export type AuthStepType = 
  | 'device_check'
  | 'credentials_validation'
  | 'security_check'
  | 'two_factor_auth'
  | 'device_registration'
  | 'permission_check'
  | 'session_creation'
  | 'profile_loading'

export type AuthStepStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped'

// 👤 User Preferences & Settings
export interface StaffPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  security: SecurityPreferences
  display: DisplayPreferences
  accessibility: AccessibilityPreferences
}

export interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  vibration: boolean
  desktop: boolean
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  types: {
    newOrders: boolean
    urgentOrders: boolean
    systemAlerts: boolean
    achievements: boolean
  }
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean
  biometricLogin: boolean
  autoLogout: boolean
  sessionWarnings: boolean
  securityAlerts: boolean
  trustedDevicesOnly: boolean
  requirePasswordForSensitiveActions: boolean
}

export interface DisplayPreferences {
  density: 'compact' | 'comfortable' | 'spacious'
  fontSize: 'small' | 'medium' | 'large'
  animationsEnabled: boolean
  showTooltips: boolean
  sidebarCollapsed: boolean
}

export interface AccessibilityPreferences {
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  alternativeText: boolean
}

// 📊 Analytics & Monitoring Types
export interface AuthAnalytics {
  staffId: string
  timeframe: AnalyticsTimeframe
  loginCount: number
  successfulLogins: number
  failedAttempts: number
  quickSwitches: number
  averageSessionDuration: number
  mostUsedDevice: DeviceInfo
  loginTimes: Date[]
  securityEvents: SecurityEvent[]
}

export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface SecurityEvent {
  eventId: string
  type: SecurityEventType
  severity: ViolationSeverity
  timestamp: Date
  staffId: string
  deviceInfo: DeviceInfo
  description: string
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export type SecurityEventType = 
  | 'failed_login'
  | 'account_lockout'
  | 'suspicious_location'
  | 'multiple_sessions'
  | 'permission_denied'
  | 'session_hijacking'
  | 'unusual_activity'
  | 'security_scan'

// 🎯 Form & Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ValidationError {
  field: string
  message: string
  code?: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface FormFieldState {
  value: any
  error?: string
  warning?: string
  touched: boolean
  dirty: boolean
  validating: boolean
}

// 🔄 API Integration Types
export interface AuthApiClient {
  login: (request: StaffLoginRequest) => Promise<AuthenticationResponse<StaffAuthData>>
  pinLogin: (request: PinLoginRequest) => Promise<AuthenticationResponse<StaffAuthData>>
  quickSwitch: (request: QuickSwitchRequest) => Promise<AuthenticationResponse<StaffAuthData>>
  refreshToken: (request: TokenRefreshRequest) => Promise<AuthenticationResponse<AuthTokens>>
  logout: (request: LogoutRequest) => Promise<AuthenticationResponse<void>>
  getProfile: (staffId: string) => Promise<AuthenticationResponse<StaffInfo>>
  updatePreferences: (preferences: StaffPreferences) => Promise<AuthenticationResponse<void>>
  getSessions: () => Promise<AuthenticationResponse<DeviceSession[]>>
  terminateSession: (sessionId: string) => Promise<AuthenticationResponse<void>>
  checkSecurity: () => Promise<AuthenticationResponse<SecurityCheckResult>>
}

export interface AuthApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableRequestLogging: boolean
  enableResponseLogging: boolean
}

// 🎨 UI State Types
export interface AuthUIState {
  loginForm: {
    isVisible: boolean
    mode: 'password' | 'pin'
    isSubmitting: boolean
    error?: string
    success?: string
  }
  quickSwitch: {
    isVisible: boolean
    selectedStaff?: StaffMember
    isSubmitting: boolean
  }
  sessionWarning: {
    isVisible: boolean
    type: 'expiry' | 'idle' | 'security'
    message: string
    autoHide: boolean
  }
  securityPanel: {
    isVisible: boolean
    activeTab: 'sessions' | 'devices' | 'events'
  }
}

// 🎯 Hook Return Types
export interface AuthHookReturn {
  // State
  isAuthenticated: boolean
  currentStaff: StaffMember | null
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: StaffLoginRequest) => Promise<boolean>
  logout: () => Promise<void>
  quickSwitch: (request: QuickSwitchRequest) => Promise<boolean>
  refreshToken: () => Promise<boolean>
  
  // Security
  security: SecurityState
  checkSecurity: () => Promise<SecurityCheckResult>
  trustDevice: (device: DeviceInfo) => void
  
  // Session
  sessionStatus: SessionStatus
  extendSession: () => Promise<boolean>
  terminateSession: (sessionId: string) => Promise<boolean>
}

// 🌐 Export all types
export type {
  // Re-export from staff.ts for convenience
  StaffMember,
  StaffRole,
  DeviceInfo,
  WorkShift
}