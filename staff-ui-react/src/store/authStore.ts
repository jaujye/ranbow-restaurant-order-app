/**
 * 🔐 Staff Authentication Store
 * Zustand store for managing staff authentication and session state
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  StaffMember, 
  StaffAuthState, 
  LoginCredentials, 
  QuickSwitchCredentials, 
  WorkShift,
  DeviceInfo 
} from '@/types'

interface AuthStore extends StaffAuthState {
  // 🔄 Auth Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  quickSwitch: (credentials: QuickSwitchCredentials) => Promise<boolean>
  refreshToken: () => Promise<boolean>
  updateActivity: () => void
  
  // 👤 Staff Management
  setCurrentStaff: (staff: StaffMember) => void
  updateStaffInfo: (updates: Partial<StaffMember>) => void
  setAvailableStaff: (staff: StaffMember[]) => void
  
  // 📋 Work Shift
  setWorkShift: (shift: WorkShift) => void
  startBreak: () => void
  endBreak: () => void
  
  // 🔧 Session Management
  checkSessionExpiry: () => boolean
  extendSession: () => void
  clearSession: () => void
  
  // 📱 Device & Settings
  updateDeviceInfo: (info: DeviceInfo) => void
  
  // 📊 State Getters
  getPermissions: () => string[]
  hasPermission: (permission: string) => boolean
  getSessionDuration: () => number
  isSessionExpiringSoon: () => boolean
}

// 🔒 Session Configuration
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
const WARNING_THRESHOLD = 15 * 60 * 1000    // 15 minutes before expiry
const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000 // Update activity every 5 minutes

// 📱 Device Info Helper
const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent
  let deviceType: DeviceInfo['deviceType'] = 'DESKTOP'
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'TABLET'
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'PHONE'
  }
  
  return {
    deviceId: localStorage.getItem('deviceId') || `device-${Date.now()}`,
    deviceType,
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    platform: navigator.platform
  }
}

// 🏪 Auth Store Implementation
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 📊 Initial State
      currentStaff: null,
      isAuthenticated: false,
      authToken: null,
      refreshToken: null,
      sessionStartTime: null,
      lastActivityTime: null,
      availableStaff: [],
      workShift: null,

      // 🔐 Login Action
      login: async (credentials: LoginCredentials): Promise<boolean> => {
        try {
          // Store device ID for future use
          if (!localStorage.getItem('deviceId')) {
            localStorage.setItem('deviceId', credentials.deviceInfo.deviceId)
          }

          // TODO: Replace with actual API call
          const response = await fetch('/api/staff/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          const now = new Date()

          set({
            currentStaff: data.staff,
            isAuthenticated: true,
            authToken: data.auth.accessToken,
            refreshToken: data.auth.refreshToken,
            sessionStartTime: now,
            lastActivityTime: now,
            workShift: data.workShift
          })

          // Start activity tracking
          const { startActivityTracking } = get()
          startActivityTracking()

          return true
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      // 🚪 Logout Action
      logout: async (): Promise<void> => {
        try {
          const { authToken } = get()
          
          if (authToken) {
            // TODO: Call logout API
            await fetch('/api/staff/auth/logout', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().clearSession()
        }
      },

      // 🔄 Quick Switch Action
      quickSwitch: async (credentials: QuickSwitchCredentials): Promise<boolean> => {
        try {
          const { authToken } = get()
          
          const response = await fetch('/api/staff/auth/quick-switch', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
          })

          if (!response.ok) {
            throw new Error('Quick switch failed')
          }

          const data = await response.json()

          set({
            currentStaff: data.newStaff,
            authToken: data.newToken,
            lastActivityTime: new Date()
          })

          return true
        } catch (error) {
          console.error('Quick switch error:', error)
          return false
        }
      },

      // 🔄 Refresh Token Action
      refreshToken: async (): Promise<boolean> => {
        try {
          const { refreshToken: currentRefreshToken } = get()
          
          if (!currentRefreshToken) {
            return false
          }

          const response = await fetch('/api/staff/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: currentRefreshToken })
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()

          set({
            authToken: data.accessToken,
            refreshToken: data.refreshToken,
            lastActivityTime: new Date()
          })

          return true
        } catch (error) {
          console.error('Token refresh error:', error)
          get().clearSession()
          return false
        }
      },

      // 📊 Update Activity
      updateActivity: (): void => {
        set({ lastActivityTime: new Date() })
      },

      // 👤 Staff Management Actions
      setCurrentStaff: (staff: StaffMember): void => {
        set({ currentStaff: staff })
      },

      updateStaffInfo: (updates: Partial<StaffMember>): void => {
        const { currentStaff } = get()
        if (currentStaff) {
          set({ 
            currentStaff: { ...currentStaff, ...updates }
          })
        }
      },

      setAvailableStaff: (staff: StaffMember[]): void => {
        set({ availableStaff: staff })
      },

      // 📋 Work Shift Actions
      setWorkShift: (shift: WorkShift): void => {
        set({ workShift: shift })
      },

      startBreak: (): void => {
        const { workShift } = get()
        if (workShift) {
          // TODO: Call break start API
          set({
            workShift: { ...workShift, status: 'BREAK' as any }
          })
        }
      },

      endBreak: (): void => {
        const { workShift } = get()
        if (workShift) {
          // TODO: Call break end API
          set({
            workShift: { ...workShift, status: 'ACTIVE' as any }
          })
        }
      },

      // 🔧 Session Management
      checkSessionExpiry: (): boolean => {
        const { sessionStartTime } = get()
        if (!sessionStartTime) return true

        const now = Date.now()
        const sessionAge = now - sessionStartTime.getTime()
        return sessionAge > SESSION_DURATION
      },

      extendSession: (): void => {
        const now = new Date()
        set({ 
          sessionStartTime: now,
          lastActivityTime: now 
        })
      },

      clearSession: (): void => {
        set({
          currentStaff: null,
          isAuthenticated: false,
          authToken: null,
          refreshToken: null,
          sessionStartTime: null,
          lastActivityTime: null,
          workShift: null
        })
      },

      // 📱 Device Management
      updateDeviceInfo: (info: DeviceInfo): void => {
        localStorage.setItem('deviceId', info.deviceId)
        // Update device info in backend if needed
      },

      // 📊 State Getters
      getPermissions: (): string[] => {
        const { currentStaff } = get()
        return currentStaff?.permissions || []
      },

      hasPermission: (permission: string): boolean => {
        const permissions = get().getPermissions()
        return permissions.includes(permission) || permissions.includes('*')
      },

      getSessionDuration: (): number => {
        const { sessionStartTime } = get()
        if (!sessionStartTime) return 0
        return Date.now() - sessionStartTime.getTime()
      },

      isSessionExpiringSoon: (): boolean => {
        const { sessionStartTime } = get()
        if (!sessionStartTime) return true

        const sessionAge = Date.now() - sessionStartTime.getTime()
        const remainingTime = SESSION_DURATION - sessionAge
        return remainingTime <= WARNING_THRESHOLD
      },

      // 🔄 Activity Tracking (Private method)
      startActivityTracking: (): void => {
        // Update activity on user interactions
        const events = ['click', 'keypress', 'scroll', 'touchstart']
        const updateActivity = get().updateActivity

        events.forEach(event => {
          document.addEventListener(event, updateActivity, { passive: true })
        })

        // Periodic activity check
        setInterval(() => {
          const { isAuthenticated, checkSessionExpiry, logout } = get()
          
          if (isAuthenticated && checkSessionExpiry()) {
            logout()
          }
        }, ACTIVITY_UPDATE_INTERVAL)
      }
    }),
    {
      name: 'staff-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStaff: state.currentStaff,
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        sessionStartTime: state.sessionStartTime,
        lastActivityTime: state.lastActivityTime,
        workShift: state.workShift,
        availableStaff: state.availableStaff.filter(staff => staff.quickSwitchEnabled)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if session is expired on app load
          if (state.checkSessionExpiry()) {
            state.clearSession()
          } else {
            // Start activity tracking
            const store = state as any
            if (store.startActivityTracking) {
              store.startActivityTracking()
            }
          }
        }
      }
    }
  )
)

// 🔗 Auth Hooks & Selectors
export const useCurrentStaff = () => useAuthStore(state => state.currentStaff)
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useWorkShift = () => useAuthStore(state => state.workShift)
export const useAuthToken = () => useAuthStore(state => state.authToken)
export const useStaffPermissions = () => useAuthStore(state => state.getPermissions())
export const useHasPermission = (permission: string) => 
  useAuthStore(state => state.hasPermission(permission))

// 🎯 Auth Actions Hook
export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    login: store.login,
    logout: store.logout,
    quickSwitch: store.quickSwitch,
    refreshToken: store.refreshToken,
    updateActivity: store.updateActivity
  }
}