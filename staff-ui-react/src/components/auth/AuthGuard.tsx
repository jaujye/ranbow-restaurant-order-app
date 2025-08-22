/**
 * 🛡️ AuthGuard Component
 * Protected route wrapper with permission-based access control and loading states
 */

import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, AlertTriangle, Loader2, Lock, UserX, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuthStore, useCurrentStaff, useAuthActions } from '@/store/authStore'
import type { StaffPermission } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  permissions?: StaffPermission[]  // Required permissions (OR logic)
  requiredRole?: string            // Specific role required
  fallbackPath?: string           // Where to redirect if unauthorized
  showUnauthorized?: boolean      // Show unauthorized message instead of redirect
  className?: string
}

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  hasPermission: boolean
  error: string | null
  retryCount: number
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  permissions = [],
  requiredRole,
  fallbackPath = '/login',
  showUnauthorized = false,
  className = ''
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    hasPermission: false,
    error: null,
    retryCount: 0
  })

  const location = useLocation()
  const currentStaff = useCurrentStaff()
  const { isAuthenticated, authToken, checkSessionExpiry, hasPermission: storeHasPermission } = useAuthStore()
  const { refreshToken, logout } = useAuthActions()

  // Check authentication and permissions
  useEffect(() => {
    const checkAuth = async () => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // First check if we have basic authentication
        if (!isAuthenticated || !authToken || !currentStaff) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            hasPermission: false,
            error: 'User not authenticated',
            retryCount: 0
          })
          return
        }

        // Check if session is expired
        if (checkSessionExpiry()) {
          // Try to refresh token
          const refreshSuccess = await refreshToken()
          
          if (!refreshSuccess) {
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              hasPermission: false,
              error: 'Session expired',
              retryCount: 0
            })
            return
          }
        }

        // Check role permission (if required)
        if (requiredRole && currentStaff.role !== requiredRole) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            hasPermission: false,
            error: `Access denied. Required role: ${requiredRole}`,
            retryCount: 0
          })
          return
        }

        // Check specific permissions (OR logic - user needs at least one)
        let hasRequiredPermission = true
        if (permissions.length > 0) {
          hasRequiredPermission = permissions.some(permission => 
            storeHasPermission(permission)
          )
        }

        if (!hasRequiredPermission) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            hasPermission: false,
            error: `Access denied. Required permissions: ${permissions.join(', ')}`,
            retryCount: 0
          })
          return
        }

        // All checks passed
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          hasPermission: true,
          error: null,
          retryCount: 0
        })

      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState(prev => ({
          isLoading: false,
          isAuthenticated: false,
          hasPermission: false,
          error: error instanceof Error ? error.message : 'Authentication check failed',
          retryCount: prev.retryCount + 1
        }))
      }
    }

    checkAuth()
  }, [
    isAuthenticated, 
    authToken, 
    currentStaff, 
    permissions, 
    requiredRole, 
    checkSessionExpiry, 
    storeHasPermission,
    refreshToken
  ])

  // Handle retry authentication
  const handleRetry = async () => {
    if (authState.retryCount >= 3) {
      // Too many retries, force logout
      await logout()
      return
    }

    // Retry authentication check
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    setTimeout(() => {
      // Trigger re-check by updating retry count
      setAuthState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        isLoading: false 
      }))
    }, 1000)
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
  }

  // Loading state
  if (authState.isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
        <Card className="p-8 text-center max-w-md mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          
          <h3 className="text-h3 font-bold text-gray-800 mb-2">
            驗證身份中
          </h3>
          <p className="text-body text-gray-600">
            正在檢查您的權限...
          </p>
          
          {/* Progress indicator */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </Card>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Authenticated but no permission
  if (!authState.hasPermission) {
    if (showUnauthorized) {
      return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
          <Card className="p-8 text-center max-w-md mx-4">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-error/10 border-2 border-error/20">
                <Shield className="h-8 w-8 text-error" />
              </div>
            </div>

            {/* Error Message */}
            <h3 className="text-h3 font-bold text-gray-800 mb-2">
              存取被拒絕
            </h3>
            <p className="text-body text-gray-600 mb-4">
              {authState.error || '您沒有權限存取此頁面'}
            </p>

            {/* Staff Info */}
            {currentStaff && (
              <div className="bg-gray-50 rounded-staff p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={currentStaff.avatar || '/default-avatar.jpg'}
                    alt={currentStaff.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div className="text-left">
                    <p className="text-body font-medium text-gray-800">
                      {currentStaff.name}
                    </p>
                    <p className="text-small text-gray-600">
                      {currentStaff.role} • {currentStaff.employeeNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Required Permissions */}
            {permissions.length > 0 && (
              <div className="text-left mb-6">
                <h4 className="text-body font-medium text-gray-800 mb-2">
                  所需權限：
                </h4>
                <ul className="space-y-1">
                  {permissions.map(permission => (
                    <li key={permission} className="flex items-center gap-2 text-small text-gray-600">
                      <Lock className="h-3 w-3" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Role */}
            {requiredRole && (
              <div className="text-left mb-6">
                <h4 className="text-body font-medium text-gray-800 mb-2">
                  所需角色：
                </h4>
                <div className="flex items-center gap-2 text-small text-gray-600">
                  <UserX className="h-3 w-3" />
                  {requiredRole}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                返回上頁
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1"
              >
                重新登入
              </Button>
            </div>
          </Card>
        </div>
      )
    } else {
      // Redirect to fallback path
      return <Navigate to={fallbackPath} state={{ from: location, error: authState.error }} replace />
    }
  }

  // Error state with retry option
  if (authState.error && authState.retryCount > 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
        <Card className="p-8 text-center max-w-md mx-4">
          {/* Error Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-warning/10 border-2 border-warning/20">
              {authState.retryCount >= 3 ? (
                <WifiOff className="h-8 w-8 text-error" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-warning" />
              )}
            </div>
          </div>

          <h3 className="text-h3 font-bold text-gray-800 mb-2">
            {authState.retryCount >= 3 ? '連接失敗' : '驗證失敗'}
          </h3>
          <p className="text-body text-gray-600 mb-4">
            {authState.retryCount >= 3 
              ? '多次嘗試失敗，請重新登入'
              : authState.error || '身份驗證時發生錯誤'
            }
          </p>

          {/* Retry Count */}
          <div className="bg-gray-50 rounded-staff p-3 mb-4">
            <p className="text-small text-gray-600">
              重試次數: {authState.retryCount} / 3
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {authState.retryCount < 3 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  重新登入
                </Button>
                <Button
                  onClick={handleRetry}
                  className="flex-1"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  重試
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                className="w-full"
              >
                重新登入
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // All checks passed - render children
  return <div className={className}>{children}</div>
}

export default AuthGuard

// Higher-order component for easier usage
export const withAuthGuard = (
  Component: React.ComponentType,
  guardProps: Omit<AuthGuardProps, 'children'>
) => {
  return (props: any) => (
    <AuthGuard {...guardProps}>
      <Component {...props} />
    </AuthGuard>
  )
}

// Common permission guards
export const ManagerGuard: React.FC<Omit<AuthGuardProps, 'requiredRole'>> = (props) => (
  <AuthGuard {...props} requiredRole="MANAGER" />
)

export const KitchenGuard: React.FC<Omit<AuthGuardProps, 'permissions'>> = (props) => (
  <AuthGuard {...props} permissions={['KITCHEN_MANAGE', 'ORDER_UPDATE']} />
)

export const ServiceGuard: React.FC<Omit<AuthGuardProps, 'permissions'>> = (props) => (
  <AuthGuard {...props} permissions={['ORDER_VIEW', 'ORDER_UPDATE']} />
)