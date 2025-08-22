/**
 * 🏠 Enhanced Main Layout Component
 * Primary layout for authenticated staff interface with session management
 */

import React from 'react'
import SessionManager from '@/components/auth/SessionManager'
import AuthGuard from '@/components/auth/AuthGuard'
import { useCurrentStaff } from '@/store/authStore'

interface MainLayoutProps {
  children: React.ReactNode
  permissions?: string[]
  requiredRole?: string
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  permissions,
  requiredRole,
  className = '' 
}) => {
  const currentStaff = useCurrentStaff()

  return (
    <AuthGuard permissions={permissions} requiredRole={requiredRole}>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Session Manager - monitors session expiry and idle time */}
        <SessionManager />
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && currentStaff && (
            <div className="mb-4 p-2 bg-info/10 rounded-staff border border-info/20 text-small">
              <strong>Debug:</strong> {currentStaff.name} ({currentStaff.role}) - 
              Permissions: {currentStaff.permissions.join(', ')}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}

export default MainLayout