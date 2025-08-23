/**
 * 🔧 Staff UI API Configuration
 * Centralized API endpoints configuration using environment variables
 */

// 🌍 Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api'
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8084'

// 📡 API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_BASE_URL: WS_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// 🔐 Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/staff/auth/login`,
  PIN_LOGIN: `${API_BASE_URL}/staff/auth/pin-login`,
  LOGOUT: `${API_BASE_URL}/staff/auth/logout`,
  REFRESH: `${API_BASE_URL}/staff/auth/refresh`,
  QUICK_SWITCH: `${API_BASE_URL}/staff/auth/quick-switch`,
  ME: `${API_BASE_URL}/staff/auth/me`,
  AVAILABLE_STAFF: `${API_BASE_URL}/staff/auth/quick-switch/available`,
  TERMINATE_SESSION: `${API_BASE_URL}/staff/auth/terminate-session`,
  TERMINATE_ALL_SESSIONS: `${API_BASE_URL}/staff/auth/terminate-all-sessions`,
  SESSION_CLEANUP: `${API_BASE_URL}/staff/auth/session/cleanup`
}

// 📋 Order Management Endpoints
export const ORDER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/staff/orders`,
  DETAILS: (orderId: string) => `${API_BASE_URL}/staff/orders/${orderId}`,
  UPDATE_STATUS: (orderId: string) => `${API_BASE_URL}/staff/orders/${orderId}/status`,
  ASSIGN: (orderId: string) => `${API_BASE_URL}/staff/orders/${orderId}/assign`,
  PRIORITY: (orderId: string) => `${API_BASE_URL}/staff/orders/${orderId}/priority`,
  KITCHEN_STATUS: `${API_BASE_URL}/staff/orders/kitchen/status`,
  QUEUE: `${API_BASE_URL}/staff/orders/queue`,
  HISTORY: `${API_BASE_URL}/staff/orders/history`
}

// 👨‍🍳 Kitchen Management Endpoints
export const KITCHEN_ENDPOINTS = {
  DASHBOARD: `${API_BASE_URL}/staff/kitchen/dashboard`,
  STATIONS: `${API_BASE_URL}/staff/kitchen/stations`,
  STATION_STATUS: (stationId: string) => `${API_BASE_URL}/staff/kitchen/stations/${stationId}/status`,
  START_COOKING: `${API_BASE_URL}/staff/kitchen/start-cooking`,
  COMPLETE_STAGE: `${API_BASE_URL}/staff/kitchen/complete-stage`,
  TIMERS: `${API_BASE_URL}/staff/kitchen/timers`,
  PERFORMANCE: `${API_BASE_URL}/staff/kitchen/performance`
}

// 👤 Staff Management Endpoints
export const STAFF_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/staff/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/staff/profile/update`,
  CHANGE_PASSWORD: `${API_BASE_URL}/staff/profile/change-password`,
  WORK_SHIFT: `${API_BASE_URL}/staff/work-shift`,
  START_BREAK: `${API_BASE_URL}/staff/work-shift/break/start`,
  END_BREAK: `${API_BASE_URL}/staff/work-shift/break/end`,
  CLOCK_OUT: `${API_BASE_URL}/staff/work-shift/clock-out`
}

// 📊 Statistics Endpoints
export const STATS_ENDPOINTS = {
  DASHBOARD: `${API_BASE_URL}/staff/stats/dashboard`,
  PERFORMANCE: `${API_BASE_URL}/staff/stats/performance`,
  ORDERS: `${API_BASE_URL}/staff/stats/orders`,
  KITCHEN: `${API_BASE_URL}/staff/stats/kitchen`,
  REVENUE: `${API_BASE_URL}/staff/stats/revenue`
}

// 🔔 Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/staff/notifications`,
  MARK_READ: (notificationId: string) => `${API_BASE_URL}/staff/notifications/${notificationId}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/staff/notifications/read-all`,
  SETTINGS: `${API_BASE_URL}/staff/notifications/settings`
}

// 🌐 System Endpoints
export const SYSTEM_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  VERSION: `${API_BASE_URL}/version`,
  CONFIG: `${API_BASE_URL}/config`
}

// 🔌 WebSocket Endpoints
export const WS_ENDPOINTS = {
  STAFF: (staffId: string) => `${WS_BASE_URL}/ws/staff/${staffId}`,
  KITCHEN: `${WS_BASE_URL}/ws/kitchen`,
  ORDERS: `${WS_BASE_URL}/ws/orders`,
  NOTIFICATIONS: `${WS_BASE_URL}/ws/notifications`
}

// 🔍 Helper Functions
export const getApiUrl = (endpoint: string): string => {
  return endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
}

export const getWsUrl = (endpoint: string): string => {
  return endpoint.startsWith('ws') ? endpoint : `${WS_BASE_URL}${endpoint}`
}

// 📊 Environment Info
export const getEnvironmentInfo = () => ({
  mode: import.meta.env.MODE,
  baseURL: API_BASE_URL,
  wsBaseURL: WS_BASE_URL,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'local',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
})