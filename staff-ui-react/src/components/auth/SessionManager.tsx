/**
 * ⏰ SessionManager Component
 * Manages staff session timeout with countdown timer and extension options
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, AlertTriangle, RefreshCw, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAuthStore, useAuthActions, useCurrentStaff } from '@/store/authStore'

interface SessionManagerProps {
  warningThreshold?: number  // Minutes before expiry to show warning
  idleThreshold?: number     // Minutes of inactivity before auto-logout
  checkInterval?: number     // Seconds between checks
  className?: string
}

interface SessionStatus {
  remainingTime: number      // Milliseconds remaining
  isExpiringSoon: boolean    // Within warning threshold
  isIdle: boolean           // User is idle
  lastActivity: Date        // Last user activity
}

const SessionManager: React.FC<SessionManagerProps> = ({
  warningThreshold = 15,    // 15 minutes warning
  idleThreshold = 30,       // 30 minutes auto-logout  
  checkInterval = 30,       // Check every 30 seconds
  className = ''
}) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    remainingTime: 0,
    isExpiringSoon: false,
    isIdle: false,
    lastActivity: new Date()
  })
  const [showWarning, setShowWarning] = useState(false)
  const [isExtending, setIsExtending] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const warningTimeoutRef = useRef<NodeJS.Timeout>()
  
  const currentStaff = useCurrentStaff()
  const {
    sessionStartTime,
    lastActivityTime,
    isAuthenticated,
    getSessionDuration,
    isSessionExpiringSoon
  } = useAuthStore()
  const { logout, refreshToken, updateActivity, extendSession } = useAuthActions()

  // Constants
  const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours
  const WARNING_THRESHOLD = warningThreshold * 60 * 1000 // Convert to milliseconds
  const IDLE_THRESHOLD = idleThreshold * 60 * 1000 // Convert to milliseconds

  // Format time remaining for display
  const formatTimeRemaining = useCallback((milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`
    } else if (minutes > 0) {
      return `${minutes}分鐘${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }, [])

  // Calculate session status
  const calculateSessionStatus = useCallback((): SessionStatus => {
    if (!sessionStartTime || !lastActivityTime) {
      return {
        remainingTime: 0,
        isExpiringSoon: false,
        isIdle: false,
        lastActivity: new Date()
      }
    }

    const now = Date.now()
    const sessionAge = now - sessionStartTime.getTime()
    const activityAge = now - lastActivityTime.getTime()
    const remainingTime = Math.max(0, SESSION_DURATION - sessionAge)
    
    return {
      remainingTime,
      isExpiringSoon: remainingTime <= WARNING_THRESHOLD,
      isIdle: activityAge >= IDLE_THRESHOLD,
      lastActivity: lastActivityTime
    }
  }, [sessionStartTime, lastActivityTime, SESSION_DURATION, WARNING_THRESHOLD, IDLE_THRESHOLD])

  // Handle session expiry
  const handleSessionExpiry = useCallback(async () => {
    console.warn('Session expired, logging out user')
    await logout()
  }, [logout])

  // Handle idle timeout
  const handleIdleTimeout = useCallback(async () => {
    console.warn('User idle timeout, logging out')
    await logout()
  }, [logout])

  // Extend session
  const handleExtendSession = useCallback(async () => {
    setIsExtending(true)
    try {
      // Try to refresh token first
      const refreshSuccess = await refreshToken()
      
      if (refreshSuccess) {
        // If refresh successful, extend session
        extendSession()
        setShowWarning(false)
        
        // Update activity to reset idle timer
        updateActivity()
      } else {
        // If refresh failed, logout
        await handleSessionExpiry()
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
      await handleSessionExpiry()
    } finally {
      setIsExtending(false)
    }
  }, [refreshToken, extendSession, updateActivity, handleSessionExpiry])

  // Handle logout
  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  // Main session check loop
  useEffect(() => {
    if (!isAuthenticated || !currentStaff) {
      return
    }

    const checkSession = () => {
      const status = calculateSessionStatus()
      setSessionStatus(status)

      // Handle session expiry
      if (status.remainingTime <= 0) {
        handleSessionExpiry()
        return
      }

      // Handle idle timeout
      if (status.isIdle) {
        handleIdleTimeout()
        return
      }

      // Show warning if session expiring soon
      if (status.isExpiringSoon && !showWarning) {
        setShowWarning(true)
      }
    }

    // Initial check
    checkSession()

    // Set up interval
    intervalRef.current = setInterval(checkSession, checkInterval * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    isAuthenticated,
    currentStaff,
    calculateSessionStatus,
    handleSessionExpiry,
    handleIdleTimeout,
    showWarning,
    checkInterval
  ])

  // Auto-extend session when warning is dismissed
  useEffect(() => {
    if (showWarning) {
      // Auto-extend after 5 minutes if user doesn't respond
      warningTimeoutRef.current = setTimeout(() => {
        handleExtendSession()
      }, 5 * 60 * 1000)

      return () => {
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current)
        }
      }
    }
  }, [showWarning, handleExtendSession])

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      updateActivity()
      
      // Dismiss warning if user becomes active
      if (showWarning) {
        setShowWarning(false)
      }
    }

    // Add event listeners with throttling
    let lastActivity = 0
    const throttledHandler = () => {
      const now = Date.now()
      if (now - lastActivity > 5000) { // Throttle to every 5 seconds
        lastActivity = now
        handleActivity()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandler, { passive: true })
    })

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandler)
      })
    }
  }, [isAuthenticated, updateActivity, showWarning])

  // Don't render if not authenticated
  if (!isAuthenticated || !currentStaff) {
    return null
  }

  // Session Warning Modal
  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-card shadow-elevated max-w-md w-full p-6 animate-standard-scale">
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-warning/10 border-2 border-warning/20">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="text-center mb-6">
            <h3 className="text-h3 font-bold text-gray-800 mb-2">
              會話即將過期
            </h3>
            <p className="text-body text-gray-600 mb-4">
              您的會話將在 <span className="font-semibold text-warning">
                {formatTimeRemaining(sessionStatus.remainingTime)}
              </span> 後過期
            </p>
            <div className="p-3 rounded-staff bg-gray-50">
              <div className="flex items-center justify-center gap-2 text-small text-gray-600">
                <Clock className="h-4 w-4" />
                上次活動: {sessionStatus.lastActivity.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="flex-1"
              disabled={isExtending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
            <Button
              onClick={handleExtendSession}
              disabled={isExtending}
              className="flex-1"
            >
              {isExtending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  延長中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  延長會話
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 rounded-staff bg-info/10 border border-info/20">
            <p className="text-small text-info text-center">
              💡 移動鼠標或觸摸屏幕可自動延長會話
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Session Status Indicator (Non-intrusive)
  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      {sessionStatus.isExpiringSoon && (
        <div className="bg-white border border-warning/20 rounded-staff shadow-card px-4 py-2 animate-bounce-notification">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-small text-gray-700">
              會話剩餘: <span className="font-medium text-warning">
                {formatTimeRemaining(sessionStatus.remainingTime)}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionManager