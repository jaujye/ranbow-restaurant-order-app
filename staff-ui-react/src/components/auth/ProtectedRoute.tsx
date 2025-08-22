/**
 * 🛡️ Protected Route Component
 * Route protection for authenticated staff members
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallbackPath = '/auth/login'
}) => {
  const location = useLocation()
  const { isAuthenticated, currentStaff, hasPermission } = useAuthStore()

  // Check if user is authenticated
  if (!isAuthenticated || !currentStaff) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    )

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-h2 font-bold text-gray-900 mb-2">權限不足</h2>
            <p className="text-body text-gray-600">您沒有權限訪問此頁面</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute