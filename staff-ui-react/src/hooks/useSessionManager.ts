/**
 * ⏰ useSessionManager Hook
 * Custom hook for managing staff session lifecycle with security and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore, useAuthActions } from '@/store/authStore'

// 📊 Session Status Interface
interface SessionStatus {
  isActive: boolean
  remainingTime: number      // milliseconds
  isExpiringSoon: boolean
  lastActivity: Date
  warningThreshold: number   // milliseconds
  autoLogoutIn: number      // milliseconds until auto-logout
}

// ⚠️ Session Warning Interface
interface SessionWarning {
  show: boolean
  type: 'expiry' | 'idle' | 'security'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  actionRequired: boolean
  autoHideIn?: number       // milliseconds
}

// 🔧 Session Manager Options
interface SessionManagerOptions {
  warningThreshold?: number     // Minutes before expiry to show warning (default: 15)
  idleThreshold?: number        // Minutes of inactivity before idle warning (default: 30)
  autoLogoutThreshold?: number  // Minutes of inactivity before auto-logout (default: 60)
  checkInterval?: number        // Seconds between status checks (default: 30)
  enableIdleDetection?: boolean // Enable idle detection (default: true)
  enableAutoLogout?: boolean    // Enable auto-logout on idle (default: true)
  enableWarnings?: boolean      // Enable warning notifications (default: true)
}

const DEFAULT_OPTIONS: Required<SessionManagerOptions> = {
  warningThreshold: 15,        // 15 minutes warning
  idleThreshold: 30,           // 30 minutes idle warning
  autoLogoutThreshold: 60,     // 60 minutes auto-logout
  checkInterval: 30,           // 30 seconds
  enableIdleDetection: true,
  enableAutoLogout: true,
  enableWarnings: true
}

export const useSessionManager = (options: SessionManagerOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isActive: false,
    remainingTime: 0,
    isExpiringSoon: false,
    lastActivity: new Date(),
    warningThreshold: config.warningThreshold * 60 * 1000,
    autoLogoutIn: 0
  })
  
  const [sessionWarning, setSessionWarning] = useState<SessionWarning>({
    show: false,
    type: 'expiry',
    message: '',
    severity: 'low',
    actionRequired: false
  })
  
  const [idleTime, setIdleTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const warningTimeoutRef = useRef<NodeJS.Timeout>()
  const idleTimeoutRef = useRef<NodeJS.Timeout>()

  // Auth store state and actions
  const {
    isAuthenticated,
    sessionStartTime,
    lastActivityTime,
    security
  } = useAuthStore()
  
  const { logout, refreshToken, updateActivity, setSessionWarningShown } = useAuthActions()

  // Constants
  const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours
  const WARNING_THRESHOLD = config.warningThreshold * 60 * 1000
  const IDLE_THRESHOLD = config.idleThreshold * 60 * 1000
  const AUTO_LOGOUT_THRESHOLD = config.autoLogoutThreshold * 60 * 1000

  // Calculate current session status
  const calculateSessionStatus = useCallback((): SessionStatus => {
    if (!isAuthenticated || !sessionStartTime || !lastActivityTime) {
      return {
        isActive: false,
        remainingTime: 0,
        isExpiringSoon: false,
        lastActivity: new Date(),
        warningThreshold: WARNING_THRESHOLD,
        autoLogoutIn: 0
      }
    }

    const now = Date.now()
    const sessionAge = now - sessionStartTime.getTime()
    const activityAge = now - lastActivityTime.getTime()
    const remainingTime = Math.max(0, SESSION_DURATION - sessionAge)
    const autoLogoutIn = Math.max(0, AUTO_LOGOUT_THRESHOLD - activityAge)

    return {
      isActive: remainingTime > 0,
      remainingTime,
      isExpiringSoon: remainingTime <= WARNING_THRESHOLD,
      lastActivity: lastActivityTime,
      warningThreshold: WARNING_THRESHOLD,
      autoLogoutIn
    }
  }, [
    isAuthenticated, 
    sessionStartTime, 
    lastActivityTime, 
    SESSION_DURATION, 
    WARNING_THRESHOLD,
    AUTO_LOGOUT_THRESHOLD
  ])

  // Format time for display
  const formatTime = useCallback((milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }, [])

  // Show session warning
  const showWarning = useCallback((
    type: SessionWarning['type'],
    message: string,
    severity: SessionWarning['severity'],
    actionRequired: boolean = false,
    autoHideIn?: number
  ) => {
    if (!config.enableWarnings) return

    setSessionWarning({
      show: true,
      type,
      message,
      severity,
      actionRequired,
      autoHideIn
    })

    setSessionWarningShown(true)

    // Auto-hide warning if specified
    if (autoHideIn && !actionRequired) {
      warningTimeoutRef.current = setTimeout(() => {
        hideWarning()
      }, autoHideIn)
    }
  }, [config.enableWarnings, setSessionWarningShown])

  // Hide session warning
  const hideWarning = useCallback(() => {
    setSessionWarning(prev => ({ ...prev, show: false }))
    setSessionWarningShown(false)
    
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
  }, [setSessionWarningShown])

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const success = await refreshToken()
      
      if (success) {
        updateActivity()
        hideWarning()
        
        showWarning(
          'security',
          '會話已成功延長',
          'low',
          false,
          3000
        )
        
        return true
      } else {
        showWarning(
          'security',
          '延長會話失敗，請重新登入',
          'critical',
          true
        )
        return false
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
      showWarning(
        'security',
        '延長會話時發生錯誤',
        'high',
        true
      )
      return false
    }
  }, [refreshToken, updateActivity, hideWarning, showWarning])

  // Handle session expiry
  const handleSessionExpiry = useCallback(async () => {
    console.warn('Session expired, logging out user')
    
    showWarning(
      'expiry',
      '會話已過期，正在登出...',
      'critical',
      false,
      2000
    )
    
    setTimeout(async () => {
      await logout()
    }, 2000)
  }, [logout, showWarning])

  // Handle idle timeout
  const handleIdleTimeout = useCallback(async () => {
    if (!config.enableAutoLogout) return

    console.warn('User idle timeout, logging out')
    
    showWarning(
      'idle',
      '長時間無活動，正在自動登出...',
      'high',
      false,
      3000
    )
    
    setTimeout(async () => {
      await logout()
    }, 3000)
  }, [config.enableAutoLogout, logout, showWarning])

  // Main session monitoring loop
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers when not authenticated
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current)
      return
    }

    const checkSession = () => {
      const status = calculateSessionStatus()
      setSessionStatus(status)

      // Handle session expiry
      if (!status.isActive) {
        handleSessionExpiry()
        return
      }

      // Handle idle timeout
      if (config.enableAutoLogout && status.autoLogoutIn <= 0) {
        handleIdleTimeout()
        return
      }

      // Show expiry warning
      if (status.isExpiringSoon && !sessionWarning.show && !security.sessionWarningShown) {
        showWarning(
          'expiry',
          `會話將在 ${formatTime(status.remainingTime)} 後過期`,
          'high',
          true
        )
      }

      // Show idle warning
      if (config.enableIdleDetection && status.autoLogoutIn <= IDLE_THRESHOLD && status.autoLogoutIn > 0) {
        if (!sessionWarning.show || sessionWarning.type !== 'idle') {
          showWarning(
            'idle',
            `檢測到長時間無活動，${formatTime(status.autoLogoutIn)} 後將自動登出`,
            'medium',
            false,
            10000
          )
        }
      }
    }

    // Initial check
    checkSession()

    // Set up monitoring interval
    intervalRef.current = setInterval(checkSession, config.checkInterval * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    isAuthenticated,
    calculateSessionStatus,
    handleSessionExpiry,
    handleIdleTimeout,
    sessionWarning.show,
    sessionWarning.type,
    security.sessionWarningShown,
    showWarning,
    formatTime,
    config.enableAutoLogout,
    config.enableIdleDetection,
    config.checkInterval,
    IDLE_THRESHOLD
  ])

  // Track idle time
  useEffect(() => {
    if (!isAuthenticated || !config.enableIdleDetection) return

    let idleTimer = 0
    
    const updateIdleTime = () => {
      setIdleTime(idleTimer)
      idleTimer += 1000 // Increment by 1 second
    }

    const resetIdleTimer = () => {
      idleTimer = 0
      setIdleTime(0)
      updateActivity()
    }

    // Activity events
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus'
    ]

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    // Start idle timer
    const timer = setInterval(updateIdleTime, 1000)

    return () => {
      clearInterval(timer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [isAuthenticated, config.enableIdleDetection, updateActivity])

  // Public API
  return {
    // Status
    sessionStatus,
    sessionWarning,
    idleTime,
    isAuthenticated,
    
    // Actions
    extendSession,
    hideWarning,
    logout,
    
    // Utilities
    formatTime,
    
    // Configuration
    config: {
      warningThreshold: config.warningThreshold,
      idleThreshold: config.idleThreshold,
      autoLogoutThreshold: config.autoLogoutThreshold,
      checkInterval: config.checkInterval,
      enableIdleDetection: config.enableIdleDetection,
      enableAutoLogout: config.enableAutoLogout,
      enableWarnings: config.enableWarnings
    }
  }
}

// 🔒 Session Security Hook
export const useSessionSecurity = () => {
  const security = useAuthStore(state => state.getSecurityStatus())
  const activeSessions = useAuthStore(state => state.getActiveSessions())
  const { terminateSession, terminateAllOtherSessions } = useAuthActions()

  // Check for suspicious activity
  const checkSuspiciousActivity = useCallback(() => {
    const warnings: string[] = []
    const currentDeviceId = localStorage.getItem('staffDeviceId')
    
    // Check for multiple concurrent sessions
    if (activeSessions.length > 3) {
      warnings.push(`檢測到 ${activeSessions.length} 個併發會話`)
    }

    // Check for sessions from unknown devices
    const unknownDevices = activeSessions.filter(session => 
      session.deviceId !== currentDeviceId && 
      !session.deviceInfo.deviceId.includes('trusted')
    )
    
    if (unknownDevices.length > 0) {
      warnings.push(`發現 ${unknownDevices.length} 個未知設備的會話`)
    }

    // Check for old sessions
    const oldSessions = activeSessions.filter(session => 
      Date.now() - session.lastSeen.getTime() > 7 * 24 * 60 * 60 * 1000 // 7 days
    )
    
    if (oldSessions.length > 0) {
      warnings.push(`發現 ${oldSessions.length} 個長期未使用的會話`)
    }

    return {
      hasSuspiciousActivity: warnings.length > 0,
      warnings,
      suspiciousSessions: [...unknownDevices, ...oldSessions]
    }
  }, [activeSessions])

  // Terminate suspicious sessions
  const cleanupSuspiciousSessions = useCallback(async () => {
    const { suspiciousSessions } = checkSuspiciousActivity()
    let terminatedCount = 0

    for (const session of suspiciousSessions) {
      try {
        const success = await terminateSession(session.deviceId)
        if (success) terminatedCount++
      } catch (error) {
        console.error('Failed to terminate session:', error)
      }
    }

    return {
      attempted: suspiciousSessions.length,
      terminated: terminatedCount,
      success: terminatedCount === suspiciousSessions.length
    }
  }, [checkSuspiciousActivity, terminateSession])

  return {
    security,
    activeSessions,
    checkSuspiciousActivity,
    cleanupSuspiciousSessions,
    terminateSession,
    terminateAllOtherSessions
  }
}

// 🎯 Combined Session Management Hook
export const useSession = (options?: SessionManagerOptions) => {
  const sessionManager = useSessionManager(options)
  const sessionSecurity = useSessionSecurity()

  return {
    ...sessionManager,
    security: sessionSecurity
  }
}