/**
 * 🌐 API Services Export
 * Central export file for all API service modules
 */

// 📡 Core API Client
export { 
  apiClient, 
  createAPIRequest, 
  withRetry, 
  checkAPIHealth, 
  APIMonitor,
  getEnvironmentInfo 
} from './client'
export type { APIResponse, APIError } from './client'

// 👥 Staff Services
export { 
  staffService,
  staffAuthService,
  staffManagementService, 
  staffPerformanceService,
  workShiftService,
  staffActivityService,
  staffNotificationService,
  staffStatsService,
  staffSettingsService
} from './staffService'

// 📦 Order Services
export {
  orderService,
  orderManagementService,
  kitchenOperationsService,
  cookingTimerService,
  orderAlertService,
  orderAnalyticsService,
  orderSearchService
} from './orderService'

// 🔌 WebSocket Service
export { 
  webSocketService,
  WebSocketManager
} from './websocketService'

// 🍽️ Menu Services (if needed for staff interface)
export {
  menuService,
  menuManagementService,
  categoryService
} from './menuService'

// 📊 Analytics Services
export {
  analyticsService,
  reportService,
  dashboardService
} from './analyticsService'

// 🔄 Service Utilities
export {
  ServiceManager,
  createServiceHook,
  useServiceQuery,
  useServiceMutation
} from './serviceUtils'

/**
 * 🏪 Service Registry
 * Centralized service registry for dependency injection
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, any> = new Map()

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  register<T>(name: string, service: T): void {
    this.services.set(name, service)
  }

  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service as T
  }

  has(name: string): boolean {
    return this.services.has(name)
  }

  unregister(name: string): boolean {
    return this.services.delete(name)
  }

  clear(): void {
    this.services.clear()
  }
}

/**
 * 📋 Service Configuration
 * Configuration for all API services
 */
export interface ServiceConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  enableLogging: boolean
  enableCaching: boolean
  cacheExpiry: number
}

/**
 * ⚙️ Initialize Services
 * Initialize all services with configuration
 */
export const initializeServices = (config: Partial<ServiceConfig> = {}) => {
  const registry = ServiceRegistry.getInstance()
  
  // Register core services
  registry.register('staff', staffService)
  registry.register('order', orderService)
  registry.register('websocket', webSocketService)
  
  // Initialize WebSocket if needed
  if (typeof window !== 'undefined') {
    const wsService = registry.get('websocket')
    wsService.initialize({
      url: `${config.baseURL?.replace('http', 'ws')}/staff/ws`,
      autoReconnect: true,
      heartbeatInterval: 30000
    })
  }
  
  console.log('🚀 Services initialized')
}

/**
 * 🧹 Service Cleanup
 * Clean up services on app unmount
 */
export const cleanupServices = () => {
  const registry = ServiceRegistry.getInstance()
  
  // Cleanup WebSocket
  if (registry.has('websocket')) {
    const wsService = registry.get('websocket')
    wsService.disconnect()
  }
  
  // Clear registry
  registry.clear()
  
  console.log('🧹 Services cleaned up')
}

/**
 * 📊 Service Health Check
 * Check health of all critical services
 */
export const checkServicesHealth = async (): Promise<{
  api: boolean
  websocket: boolean
  overall: boolean
}> => {
  const results = {
    api: false,
    websocket: false,
    overall: false
  }
  
  try {
    // Check API health
    results.api = await checkAPIHealth()
    
    // Check WebSocket health
    const registry = ServiceRegistry.getInstance()
    if (registry.has('websocket')) {
      const wsService = registry.get('websocket')
      results.websocket = wsService.isConnected()
    }
    
    // Overall health
    results.overall = results.api && results.websocket
    
  } catch (error) {
    console.error('Service health check failed:', error)
  }
  
  return results
}

/**
 * 🔄 Service State Manager
 * Manage global service state
 */
export class ServiceStateManager {
  private static instance: ServiceStateManager
  private state: Map<string, any> = new Map()
  private listeners: Map<string, Set<(state: any) => void>> = new Map()

  static getInstance(): ServiceStateManager {
    if (!ServiceStateManager.instance) {
      ServiceStateManager.instance = new ServiceStateManager()
    }
    return ServiceStateManager.instance
  }

  setState<T>(key: string, state: T): void {
    this.state.set(key, state)
    
    // Notify listeners
    const keyListeners = this.listeners.get(key)
    if (keyListeners) {
      keyListeners.forEach(listener => listener(state))
    }
  }

  getState<T>(key: string): T | undefined {
    return this.state.get(key) as T
  }

  subscribe<T>(key: string, listener: (state: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key)!.add(listener)
    
    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key)
      if (keyListeners) {
        keyListeners.delete(listener)
      }
    }
  }

  clearState(key: string): void {
    this.state.delete(key)
  }

  clearAllState(): void {
    this.state.clear()
  }
}

// Export singleton instances
export const serviceRegistry = ServiceRegistry.getInstance()
export const serviceStateManager = ServiceStateManager.getInstance()

/**
 * 🎯 Service Hooks
 * React hooks for service integration
 */
export { useAPI } from './hooks/useAPI'
export { useWebSocket } from './hooks/useWebSocket'
export { useServiceState } from './hooks/useServiceState'