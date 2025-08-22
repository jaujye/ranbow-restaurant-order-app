/**
 * 🏪 Main Store Export
 * Central export file for all Zustand stores and related utilities
 */

// 🔐 Authentication Store
export {
  useAuthStore,
  useCurrentStaff,
  useIsAuthenticated,
  useWorkShift,
  useAuthToken,
  useStaffPermissions,
  useHasPermission,
  useAuthActions
} from './authStore'

// 📦 Order Management Store
export {
  useOrderStore,
  useOrders,
  useOrderQueue,
  useOrderSummary,
  useOrderAlerts,
  useSelectedOrder,
  useCookingTimers,
  useWorkstations,
  useOrderActions
} from './orderStore'

// 🔔 Notification Store
export {
  useNotificationStore,
  useNotifications,
  useUnreadCount,
  useNotificationActions
} from './notificationStore'

// 📊 Statistics Store
export {
  useStatsStore,
  useStaffStats,
  useKitchenStats,
  useRevenueStats,
  useStatsActions
} from './statsStore'

// 🎛️ UI Store
export {
  useUIStore,
  useTheme,
  useSidebar,
  useModal,
  useUIActions
} from './uiStore'

// 🔌 WebSocket Store
export {
  useWebSocketStore,
  useConnectionStatus,
  useMessageHandlers,
  useWebSocketActions
} from './websocketStore'

// 🔄 Store Utilities
import { create } from 'zustand'
import { persist, subscribeWithSelector, devtools } from 'zustand/middleware'

/**
 * 🛠️ Store Creation Helper
 * Utility function to create stores with common middleware
 */
export const createStore = <T>(
  initializer: Parameters<typeof create<T>>[0],
  options: {
    name?: string
    persist?: boolean
    devtools?: boolean
    selector?: boolean
  } = {}
) => {
  let store = create<T>(initializer)

  // Add devtools in development
  if (options.devtools && process.env.NODE_ENV === 'development') {
    store = create<T>(
      devtools(initializer, { name: options.name || 'Store' })
    )
  }

  // Add persistence if needed
  if (options.persist && options.name) {
    store = create<T>(
      persist(
        options.devtools && process.env.NODE_ENV === 'development'
          ? devtools(initializer, { name: options.name })
          : initializer,
        {
          name: `${options.name}-storage`
        }
      )
    )
  }

  // Add selector subscription if needed
  if (options.selector) {
    store = create<T>(
      subscribeWithSelector(
        options.persist && options.name
          ? persist(
              options.devtools && process.env.NODE_ENV === 'development'
                ? devtools(initializer, { name: options.name })
                : initializer,
              {
                name: `${options.name}-storage`
              }
            )
          : options.devtools && process.env.NODE_ENV === 'development'
          ? devtools(initializer, { name: options.name })
          : initializer
      )
    )
  }

  return store
}

/**
 * 🔄 Store Reset Utility
 * Reset all stores to their initial state
 */
export const resetAllStores = () => {
  // Note: Individual stores should implement their own reset methods
  // This is a placeholder for a global reset function
  if (typeof window !== 'undefined') {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('-storage')) {
        localStorage.removeItem(key)
      }
    })
    
    // Reload the page to reinitialize stores
    window.location.reload()
  }
}

/**
 * 📊 Store State Logger
 * Development utility to log store states
 */
export const logStoreState = (storeName: string, state: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🏪 ${storeName} State`)
    console.log('Current State:', state)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
}

/**
 * 🎯 Store Performance Monitor
 * Monitor store updates and performance
 */
export class StoreMonitor {
  private static instance: StoreMonitor
  private updateCounts: Map<string, number> = new Map()
  private lastUpdate: Map<string, number> = new Map()

  static getInstance(): StoreMonitor {
    if (!StoreMonitor.instance) {
      StoreMonitor.instance = new StoreMonitor()
    }
    return StoreMonitor.instance
  }

  trackUpdate(storeName: string): void {
    const now = Date.now()
    const count = this.updateCounts.get(storeName) || 0
    const lastTime = this.lastUpdate.get(storeName) || now

    this.updateCounts.set(storeName, count + 1)
    this.lastUpdate.set(storeName, now)

    // Log if updates are too frequent (more than 10 per second)
    if (now - lastTime < 100) {
      console.warn(`⚠️ High update frequency detected in ${storeName} store`)
    }
  }

  getStats(): Record<string, { updates: number; lastUpdate: number }> {
    const stats: Record<string, { updates: number; lastUpdate: number }> = {}
    
    this.updateCounts.forEach((updates, storeName) => {
      stats[storeName] = {
        updates,
        lastUpdate: this.lastUpdate.get(storeName) || 0
      }
    })

    return stats
  }

  reset(): void {
    this.updateCounts.clear()
    this.lastUpdate.clear()
  }
}

/**
 * 🔗 Store Connection Helper
 * Helper to connect multiple stores
 */
export const connectStores = <T extends Record<string, any>>(
  stores: T
): T => {
  // This could be enhanced to provide cross-store communication
  // For now, it just returns the stores object
  return stores
}

/**
 * 💾 Store Persistence Utilities
 */
export const storeUtils = {
  /**
   * Clear all persisted store data
   */
  clearPersistedData: () => {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('-storage')) {
          localStorage.removeItem(key)
        }
      })
    }
  },

  /**
   * Get persisted data for a specific store
   */
  getPersistedData: (storeName: string) => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`${storeName}-storage`)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  /**
   * Set persisted data for a specific store
   */
  setPersistedData: (storeName: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storeName}-storage`, JSON.stringify(data))
    }
  }
}

/**
 * 🎨 Store DevTools Integration
 */
export const connectDevTools = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Add store monitor to window for debugging
    ;(window as any).__STORE_MONITOR__ = StoreMonitor.getInstance()
    ;(window as any).__STORE_UTILS__ = storeUtils
    
    console.log('🔧 Store DevTools connected. Available:')
    console.log('- __STORE_MONITOR__: Monitor store performance')
    console.log('- __STORE_UTILS__: Store persistence utilities')
  }
}

// Auto-connect DevTools in development
if (process.env.NODE_ENV === 'development') {
  connectDevTools()
}