interface EnvironmentConfig {
  // API Configuration
  API_BASE_URL: string;
  WS_BASE_URL: string;
  API_TIMEOUT: number;
  
  // WebSocket Configuration
  WS_RECONNECT_INTERVAL: number;
  WS_MAX_RECONNECT_ATTEMPTS: number;
  WS_HEARTBEAT_INTERVAL: number;
  
  // Application Configuration
  APP_TITLE: string;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'production' | 'test';
  APP_DESCRIPTION: string;
  
  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_PWA: boolean;
  ENABLE_DARK_MODE: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_SOUND_EFFECTS: boolean;
  ENABLE_VIBRATION: boolean;
  
  // Query Configuration
  QUERY_STALE_TIME: number;
  QUERY_CACHE_TIME: number;
  ORDERS_REFETCH_INTERVAL: number;
  KITCHEN_REFETCH_INTERVAL: number;
  
  // Development Settings
  MOCK_API: boolean;
  DEBUG_MODE: boolean;
  ENABLE_DEVTOOLS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Performance Configuration
  REQUEST_TIMEOUT: number;
  MAX_CONCURRENT_REQUESTS: number;
  CACHE_DURATION: number;
  
  // Security Configuration
  SESSION_TIMEOUT: number;
  IDLE_TIMEOUT: number;
}

function getEnvValue(key: string, fallback?: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

function getEnvBoolean(key: string, fallback: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, fallback: number): number {
  const value = import.meta.env[key];
  if (value === undefined) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

export const env: EnvironmentConfig = {
  // API Configuration
  API_BASE_URL: getEnvValue('VITE_API_BASE_URL', 'http://localhost:8081/api'),
  WS_BASE_URL: getEnvValue('VITE_WS_BASE_URL', 'ws://localhost:8081/ws'),
  API_TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 10000),
  
  // WebSocket Configuration
  WS_RECONNECT_INTERVAL: getEnvNumber('VITE_WS_RECONNECT_INTERVAL', 5000),
  WS_MAX_RECONNECT_ATTEMPTS: getEnvNumber('VITE_WS_MAX_RECONNECT_ATTEMPTS', 10),
  WS_HEARTBEAT_INTERVAL: getEnvNumber('VITE_WS_HEARTBEAT_INTERVAL', 30000),
  
  // Application Configuration
  APP_TITLE: getEnvValue('VITE_APP_TITLE', 'Ranbow Restaurant Staff UI'),
  APP_VERSION: getEnvValue('VITE_APP_VERSION', '2.0.0'),
  ENVIRONMENT: getEnvValue('VITE_ENVIRONMENT', 'development') as EnvironmentConfig['ENVIRONMENT'],
  APP_DESCRIPTION: getEnvValue('VITE_APP_DESCRIPTION', '彩虹餐廳員工作業系統'),
  
  // Feature Flags
  ENABLE_ANALYTICS: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
  ENABLE_PWA: getEnvBoolean('VITE_ENABLE_PWA', true),
  ENABLE_DARK_MODE: getEnvBoolean('VITE_ENABLE_DARK_MODE', true),
  ENABLE_NOTIFICATIONS: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
  ENABLE_SOUND_EFFECTS: getEnvBoolean('VITE_ENABLE_SOUND_EFFECTS', true),
  ENABLE_VIBRATION: getEnvBoolean('VITE_ENABLE_VIBRATION', true),
  
  // Query Configuration
  QUERY_STALE_TIME: getEnvNumber('VITE_QUERY_STALE_TIME', 10000),
  QUERY_CACHE_TIME: getEnvNumber('VITE_QUERY_CACHE_TIME', 300000),
  ORDERS_REFETCH_INTERVAL: getEnvNumber('VITE_ORDERS_REFETCH_INTERVAL', 30000),
  KITCHEN_REFETCH_INTERVAL: getEnvNumber('VITE_KITCHEN_REFETCH_INTERVAL', 15000),
  
  // Development Settings
  MOCK_API: getEnvBoolean('VITE_MOCK_API', false),
  DEBUG_MODE: getEnvBoolean('VITE_DEBUG_MODE', false),
  ENABLE_DEVTOOLS: getEnvBoolean('VITE_ENABLE_DEVTOOLS', false),
  LOG_LEVEL: getEnvValue('VITE_LOG_LEVEL', 'info') as EnvironmentConfig['LOG_LEVEL'],
  
  // Performance Configuration
  REQUEST_TIMEOUT: getEnvNumber('VITE_REQUEST_TIMEOUT', 8000),
  MAX_CONCURRENT_REQUESTS: getEnvNumber('VITE_MAX_CONCURRENT_REQUESTS', 10),
  CACHE_DURATION: getEnvNumber('VITE_CACHE_DURATION', 300000),
  
  // Security Configuration
  SESSION_TIMEOUT: getEnvNumber('VITE_SESSION_TIMEOUT', 28800000),
  IDLE_TIMEOUT: getEnvNumber('VITE_IDLE_TIMEOUT', 1800000),
};

// Development helper
export const isDevelopment = env.ENVIRONMENT === 'development';
export const isProduction = env.ENVIRONMENT === 'production';
export const isTest = env.ENVIRONMENT === 'test';

// Export for debugging
if (env.DEBUG_MODE) {
  console.log('🔧 Environment Configuration:', env);
}