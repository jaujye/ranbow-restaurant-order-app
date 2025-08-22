/**
 * 🔐 Enhanced Staff Authentication Store
 * Zustand store for managing staff authentication with security features
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

// 🔒 Security State Interface
interface SecurityState {
  failedAttempts: number
  accountLocked: boolean
  lockoutUntil: Date | null
  lastFailedAttempt: Date | null
  deviceTrusted: boolean
  sessionWarningShown: boolean
}

// 📱 Device Session Interface
interface DeviceSession {
  deviceId: string
  deviceInfo: DeviceInfo
  isActive: boolean
  lastSeen: Date
  loginCount: number
}

interface EnhancedAuthStore extends StaffAuthState {
  // 🔒 Security Features
  security: SecurityState
  deviceSessions: DeviceSession[]
  
  // 🔄 Enhanced Auth Actions
  login: (credentials: LoginCredentials & { isPinLogin?: boolean; pin?: string }) => Promise<boolean>
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
  
  // 🔧 Enhanced Session Management
  checkSessionExpiry: () => boolean
  extendSession: () => void
  clearSession: () => void
  setSessionWarningShown: (shown: boolean) => void
  
  // 🔒 Security Actions
  recordFailedAttempt: () => void
  clearFailedAttempts: () => void
  checkAccountLockout: () => boolean
  trustDevice: (deviceInfo: DeviceInfo) => void
  untrustDevice: (deviceId: string) => void
  getActiveSessions: () => DeviceSession[]
  terminateSession: (deviceId: string) => Promise<boolean>
  terminateAllOtherSessions: () => Promise<boolean>
  
  // 📱 Enhanced Device Management
  updateDeviceInfo: (info: DeviceInfo) => void
  registerDevice: (deviceInfo: DeviceInfo) => void
  updateDeviceActivity: (deviceId: string) => void
  
  // 📊 Enhanced State Getters
  getPermissions: () => string[]
  hasPermission: (permission: string) => boolean
  getSessionDuration: () => number
  isSessionExpiringSoon: () => boolean
  getSecurityStatus: () => SecurityState
  isDeviceTrusted: (deviceId: string) => boolean
  
  // 🔄 Activity Tracking (Private)
  startActivityTracking: () => void
}

// 🔒 Security Configuration
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
const WARNING_THRESHOLD = 15 * 60 * 1000    // 15 minutes before expiry
const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000 // Update activity every 5 minutes
const MAX_FAILED_ATTEMPTS = 5               // Max failed login attempts
const LOCKOUT_DURATION = 15 * 60 * 1000     // 15 minutes lockout
const DEVICE_SESSION_LIMIT = 3              // Max concurrent device sessions

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
    deviceId: localStorage.getItem('staffDeviceId') || `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    deviceType,
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    platform: navigator.platform
  }
}

// 🏪 Enhanced Auth Store Implementation
export const useAuthStore = create<EnhancedAuthStore>()(
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
      
      // 🔒 Security State
      security: {
        failedAttempts: 0,
        accountLocked: false,
        lockoutUntil: null,
        lastFailedAttempt: null,
        deviceTrusted: false,
        sessionWarningShown: false
      },
      deviceSessions: [],

      // 🔐 Enhanced Login Action with Security
      login: async (credentials: LoginCredentials & { isPinLogin?: boolean; pin?: string }): Promise<boolean> => {
        const state = get()
        
        try {
          // Check account lockout
          if (state.checkAccountLockout()) {
            throw new Error('Account temporarily locked due to too many failed attempts')
          }

          // Store device ID for future use
          if (!localStorage.getItem('staffDeviceId')) {
            localStorage.setItem('staffDeviceId', credentials.deviceInfo.deviceId)
          }

          // Prepare request data
          const requestData = credentials.isPinLogin ? {
            employeeNumber: credentials.loginId,
            pin: credentials.pin,
            deviceInfo: credentials.deviceInfo
          } : {
            loginId: credentials.loginId,
            password: credentials.password,
            deviceInfo: credentials.deviceInfo,
            rememberMe: credentials.rememberMe
          }

          const endpoint = credentials.isPinLogin ? 
            'http://localhost:8081/api/staff/auth/pin-login' : 
            'http://localhost:8081/api/staff/auth/login'

          // Call authentication API
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          })

          if (!response.ok) {
            // Record failed attempt
            state.recordFailedAttempt()
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Login failed')
          }

          const data = await response.json()
          
          if (!data.success) {
            state.recordFailedAttempt()
            throw new Error(data.message || 'Login failed')
          }

          const now = new Date()

          // Register/Update device session
          const deviceSession: DeviceSession = {
            deviceId: credentials.deviceInfo.deviceId,
            deviceInfo: credentials.deviceInfo,
            isActive: true,
            lastSeen: now,
            loginCount: (state.deviceSessions.find(s => s.deviceId === credentials.deviceInfo.deviceId)?.loginCount || 0) + 1
          }

          // Update device sessions (keep only recent sessions)
          const updatedSessions = [
            deviceSession,
            ...state.deviceSessions
              .filter(s => s.deviceId !== credentials.deviceInfo.deviceId)
              .slice(0, DEVICE_SESSION_LIMIT - 1)
          ]

          set({
            currentStaff: data.data.staff,
            isAuthenticated: true,
            authToken: data.data.auth.accessToken,
            refreshToken: data.data.auth.refreshToken,
            sessionStartTime: now,
            lastActivityTime: now,
            workShift: data.data.workShift,
            security: {
              ...state.security,
              failedAttempts: 0,
              accountLocked: false,
              lockoutUntil: null,
              deviceTrusted: true,
              sessionWarningShown: false
            },
            deviceSessions: updatedSessions
          })

          // Trust device if remember me is enabled
          if (credentials.rememberMe) {
            state.trustDevice(credentials.deviceInfo)
          }

          // Start activity tracking
          const { startActivityTracking } = get()
          startActivityTracking()

          return true
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      // 🚪 Enhanced Logout Action
      logout: async (): Promise<void> => {
        try {
          const { authToken } = get()
          
          if (authToken) {
            // Call logout API
            await fetch('http://localhost:8081/api/staff/auth/logout', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }).catch(console.error)
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().clearSession()
        }
      },

      // 🔄 Enhanced Quick Switch Action
      quickSwitch: async (credentials: QuickSwitchCredentials): Promise<boolean> => {
        try {
          const { authToken } = get()
          
          const response = await fetch('http://localhost:8081/api/staff/auth/quick-switch', {
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
          
          if (!data.success) {
            throw new Error(data.message || 'Quick switch failed')
          }

          const now = new Date()
          
          set({
            currentStaff: data.data.staff,
            authToken: data.data.auth.accessToken,
            refreshToken: data.data.auth.refreshToken,
            lastActivityTime: now,
            workShift: data.data.workShift
          })

          return true
        } catch (error) {
          console.error('Quick switch error:', error)
          return false
        }
      },

      // 🔄 Enhanced Refresh Token Action
      refreshToken: async (): Promise<boolean> => {
        try {
          const { refreshToken: currentRefreshToken, security } = get()
          
          if (!currentRefreshToken) {
            return false
          }

          const deviceId = localStorage.getItem('staffDeviceId')
          
          const response = await fetch('http://localhost:8081/api/staff/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              refreshToken: currentRefreshToken,
              deviceId 
            })
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()
          
          if (!data.success) {
            throw new Error(data.message || 'Token refresh failed')
          }

          set({
            authToken: data.data.auth.accessToken,
            refreshToken: data.data.auth.refreshToken || currentRefreshToken,
            lastActivityTime: new Date(),
            security: {
              ...security,
              sessionWarningShown: false
            }
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
        const { deviceSessions } = get()
        const currentDeviceId = localStorage.getItem('staffDeviceId')
        
        if (currentDeviceId) {
          const updatedSessions = deviceSessions.map(session => 
            session.deviceId === currentDeviceId
              ? { ...session, lastSeen: new Date() }
              : session
          )
          
          set({ 
            lastActivityTime: new Date(),
            deviceSessions: updatedSessions
          })
        } else {
          set({ lastActivityTime: new Date() })
        }
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

      // 🔧 Enhanced Session Management
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
        // Clean up activity tracking
        const events = ['click', 'keypress', 'scroll', 'touchstart']
        events.forEach(event => {
          document.removeEventListener(event, get().updateActivity)
        })

        set({
          currentStaff: null,
          isAuthenticated: false,
          authToken: null,
          refreshToken: null,
          sessionStartTime: null,
          lastActivityTime: null,
          workShift: null,
          security: {
            failedAttempts: 0,
            accountLocked: false,
            lockoutUntil: null,
            lastFailedAttempt: null,
            deviceTrusted: false,
            sessionWarningShown: false
          },
          deviceSessions: []
        })
      },

      setSessionWarningShown: (shown: boolean): void => {
        const { security } = get()
        set({
          security: { ...security, sessionWarningShown: shown }
        })
      },

      // 🔒 Security Actions
      recordFailedAttempt: (): void => {
        const { security } = get()
        const now = new Date()
        const failedAttempts = security.failedAttempts + 1

        set({
          security: {
            ...security,
            failedAttempts,
            lastFailedAttempt: now,
            accountLocked: failedAttempts >= MAX_FAILED_ATTEMPTS,
            lockoutUntil: failedAttempts >= MAX_FAILED_ATTEMPTS 
              ? new Date(now.getTime() + LOCKOUT_DURATION)
              : null
          }
        })
      },

      clearFailedAttempts: (): void => {
        const { security } = get()
        set({
          security: {
            ...security,
            failedAttempts: 0,
            accountLocked: false,
            lockoutUntil: null,
            lastFailedAttempt: null
          }
        })
      },

      checkAccountLockout: (): boolean => {
        const { security } = get()
        
        if (!security.accountLocked || !security.lockoutUntil) {
          return false
        }

        // Check if lockout period has expired
        if (Date.now() > security.lockoutUntil.getTime()) {
          get().clearFailedAttempts()
          return false
        }

        return true
      },

      trustDevice: (deviceInfo: DeviceInfo): void => {
        const { security, deviceSessions } = get()
        
        // Update security state
        set({
          security: { ...security, deviceTrusted: true }
        })

        // Mark device as trusted in sessions
        const updatedSessions = deviceSessions.map(session => 
          session.deviceId === deviceInfo.deviceId
            ? { ...session, isActive: true }
            : session
        )

        set({ deviceSessions: updatedSessions })

        // Store trusted device info
        localStorage.setItem('trustedDevice', JSON.stringify(deviceInfo))
      },

      untrustDevice: (deviceId: string): void => {
        const { deviceSessions } = get()
        
        const updatedSessions = deviceSessions.filter(session => 
          session.deviceId !== deviceId
        )

        set({ deviceSessions: updatedSessions })

        // Remove from trusted devices
        const trustedDevice = localStorage.getItem('trustedDevice')
        if (trustedDevice) {
          try {
            const parsed = JSON.parse(trustedDevice)
            if (parsed.deviceId === deviceId) {
              localStorage.removeItem('trustedDevice')
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      },

      getActiveSessions: (): DeviceSession[] => {
        const { deviceSessions } = get()
        return deviceSessions.filter(session => session.isActive)
      },

      terminateSession: async (deviceId: string): Promise<boolean> => {
        try {
          const { authToken } = get()
          
          const response = await fetch('http://localhost:8081/api/staff/auth/terminate-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceId })
          })

          if (response.ok) {
            get().untrustDevice(deviceId)
            return true
          }
          return false
        } catch (error) {
          console.error('Terminate session error:', error)
          return false
        }
      },

      terminateAllOtherSessions: async (): Promise<boolean> => {
        try {
          const { authToken } = get()
          const currentDeviceId = localStorage.getItem('staffDeviceId')
          
          const response = await fetch('http://localhost:8081/api/staff/auth/terminate-all-sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ excludeDeviceId: currentDeviceId })
          })

          if (response.ok) {
            const { deviceSessions } = get()
            const updatedSessions = deviceSessions.filter(session => 
              session.deviceId === currentDeviceId
            )
            set({ deviceSessions: updatedSessions })
            return true
          }
          return false
        } catch (error) {
          console.error('Terminate all sessions error:', error)
          return false
        }
      },

      // 📱 Enhanced Device Management
      updateDeviceInfo: (info: DeviceInfo): void => {
        localStorage.setItem('staffDeviceId', info.deviceId)
        get().updateDeviceActivity(info.deviceId)
      },

      registerDevice: (deviceInfo: DeviceInfo): void => {
        const { deviceSessions } = get()
        const now = new Date()

        const newSession: DeviceSession = {
          deviceId: deviceInfo.deviceId,
          deviceInfo,
          isActive: true,
          lastSeen: now,
          loginCount: 1
        }

        const updatedSessions = [
          newSession,
          ...deviceSessions.filter(s => s.deviceId !== deviceInfo.deviceId)
        ].slice(0, DEVICE_SESSION_LIMIT)

        set({ deviceSessions: updatedSessions })
      },

      updateDeviceActivity: (deviceId: string): void => {
        const { deviceSessions } = get()
        const updatedSessions = deviceSessions.map(session => 
          session.deviceId === deviceId
            ? { ...session, lastSeen: new Date() }
            : session
        )
        set({ deviceSessions: updatedSessions })
      },

      // 📊 Enhanced State Getters
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

      getSecurityStatus: (): SecurityState => {
        const { security } = get()
        return security
      },

      isDeviceTrusted: (deviceId: string): boolean => {
        const { deviceSessions, security } = get()
        const session = deviceSessions.find(s => s.deviceId === deviceId)
        return (session?.isActive && security.deviceTrusted) || false
      },

      // 🔄 Activity Tracking (Private method)
      startActivityTracking: (): void => {
        // Update activity on user interactions
        const events = ['click', 'keypress', 'scroll', 'touchstart']
        const updateActivity = get().updateActivity

        events.forEach(event => {
          document.addEventListener(event, updateActivity, { passive: true })
        })

        // Periodic activity check and session validation
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
        availableStaff: state.availableStaff.filter(staff => staff.quickSwitchEnabled),
        security: state.security,
        deviceSessions: state.deviceSessions.slice(0, DEVICE_SESSION_LIMIT)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if session is expired on app load
          if (state.checkSessionExpiry()) {
            state.clearSession()
          } else if (state.checkAccountLockout()) {
            // Account is locked, clear session
            state.clearSession()
          } else if (state.isAuthenticated) {
            // Start activity tracking for valid sessions
            state.startActivityTracking()
          }
        }
      }
    }
  )
)

// 🔗 Enhanced Auth Hooks & Selectors
export const useCurrentStaff = () => useAuthStore(state => state.currentStaff)
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useWorkShift = () => useAuthStore(state => state.workShift)
export const useAuthToken = () => useAuthStore(state => state.authToken)
export const useStaffPermissions = () => useAuthStore(state => state.getPermissions())
export const useHasPermission = (permission: string) => 
  useAuthStore(state => state.hasPermission(permission))
export const useSecurityStatus = () => useAuthStore(state => state.getSecurityStatus())
export const useActiveSessions = () => useAuthStore(state => state.getActiveSessions())

// 🎯 Enhanced Auth Actions Hook
export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    login: store.login,
    logout: store.logout,
    quickSwitch: store.quickSwitch,
    refreshToken: store.refreshToken,
    updateActivity: store.updateActivity,
    trustDevice: store.trustDevice,
    terminateSession: store.terminateSession,
    terminateAllOtherSessions: store.terminateAllOtherSessions,
    clearFailedAttempts: store.clearFailedAttempts
  }
}