/**
 * 🔐 Enhanced Staff Login Page
 * Complete staff authentication with enhanced security features
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, Shield, Smartphone, AlertTriangle } from 'lucide-react'
import StaffLoginForm from '@/components/auth/StaffLoginForm'
import QuickStaffSwitch from '@/components/auth/QuickStaffSwitch'
import { AuthLoading, PageLoading } from '@/components/ui/Loading'
import { ErrorDisplay, NetworkError } from '@/components/ui/ErrorDisplay'
import { useAuthStore, useCurrentStaff, useIsAuthenticated } from '@/store/authStore'
import { useSession } from '@/hooks/useSessionManager'
import type { StaffMember } from '@/types'

interface LoginPageProps {
  className?: string
}

const LoginPage: React.FC<LoginPageProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'quickSwitch'>('login')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [networkError, setNetworkError] = useState<boolean>(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const currentStaff = useCurrentStaff()
  const isAuthenticated = useIsAuthenticated()
  const security = useAuthStore(state => state.getSecurityStatus())
  const { checkSuspiciousActivity } = useSession().security

  // Check if already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated && currentStaff) {
          // User is already authenticated, redirect
          navigate(from, { replace: true })
          return
        }

        // Check for network connectivity
        try {
          const response = await fetch('http://localhost:8081/api/health', {
            method: 'GET',
            timeout: 5000
          } as any)
          
          if (!response.ok) {
            setNetworkError(true)
          }
        } catch (error) {
          console.warn('Network check failed:', error)
          setNetworkError(true)
        }

        // Initialize page
        setIsInitializing(false)
      } catch (error) {
        console.error('Auth status check failed:', error)
        setIsInitializing(false)
      }
    }

    checkAuthStatus()
  }, [isAuthenticated, currentStaff, navigate, from])

  // Check for suspicious activity
  useEffect(() => {
    if (isAuthenticated) {
      const { hasSuspiciousActivity, warnings } = checkSuspiciousActivity()
      
      if (hasSuspiciousActivity) {
        console.warn('Suspicious activity detected:', warnings)
        // Could show additional security warnings here
      }
    }
  }, [isAuthenticated, checkSuspiciousActivity])

  // Handle successful login
  const handleLoginSuccess = useCallback(() => {
    setLoginError(null)
    
    // Small delay to show success feedback
    setTimeout(() => {
      navigate(from, { replace: true })
    }, 500)
  }, [navigate, from])

  // Handle login error
  const handleLoginError = useCallback((error: string) => {
    setLoginError(error)
    
    // Clear error after 10 seconds
    setTimeout(() => {
      setLoginError(null)
    }, 10000)
  }, [])

  // Handle quick switch success
  const handleQuickSwitchSuccess = useCallback((newStaff: StaffMember) => {
    setLoginError(null)
    
    // Show brief success message
    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 500)
  }, [navigate])

  // Handle quick switch error
  const handleQuickSwitchError = useCallback((error: string) => {
    setLoginError(error)
  }, [])

  // Handle network retry
  const handleNetworkRetry = useCallback(async () => {
    setNetworkError(false)
    setIsInitializing(true)
    
    try {
      const response = await fetch('http://localhost:8081/api/health')
      if (response.ok) {
        setNetworkError(false)
      } else {
        setNetworkError(true)
      }
    } catch (error) {
      setNetworkError(true)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <PageLoading
        title="初始化中"
        message="正在檢查系統狀態..."
        showLogo={true}
      />
    )
  }

  // Show network error
  if (networkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-h1 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
              彩虹餐廳
            </h1>
            <p className="text-body text-gray-600 mt-1">
              員工管理系統
            </p>
          </div>

          {/* Network Error */}
          <NetworkError
            title="無法連接到服務器"
            message="請檢查網絡連接或聯繫技術支援"
            showRetry={true}
            onRetry={handleNetworkRetry}
            isOnline={navigator.onLine}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,107,53,0.15)_1px,transparent_0)] [background-size:20px_20px]" />
      
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-h1 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
              彩虹餐廳
            </h1>
            <p className="text-body text-gray-600 mt-2">
              員工管理系統
            </p>
          </div>

          {/* Security Status */}
          {security.failedAttempts > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-card p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-small text-warning">
                  檢測到 {security.failedAttempts} 次失敗嘗試
                </span>
              </div>
            </div>
          )}

          {/* Account Lockout Warning */}
          {security.accountLocked && security.lockoutUntil && (
            <ErrorDisplay
              type="security"
              title="帳戶暫時鎖定"
              message={`請等待至 ${security.lockoutUntil.toLocaleTimeString()} 後再試`}
              showRetry={false}
            />
          )}

          {/* Tab Navigation */}
          <div className="flex rounded-staff overflow-hidden bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-4 py-2 text-small font-medium rounded-staff transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              登入
            </button>
            <button
              onClick={() => setActiveTab('quickSwitch')}
              className={`flex-1 px-4 py-2 text-small font-medium rounded-staff transition-all duration-200 ${
                activeTab === 'quickSwitch'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              快速切換
            </button>
          </div>

          {/* Login Error Display */}
          {loginError && (
            <ErrorDisplay
              type="authentication"
              title="登入失敗"
              message={loginError}
              showRetry={false}
            />
          )}

          {/* Login Forms */}
          <div className="space-y-6">
            {activeTab === 'login' && (
              <StaffLoginForm
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                showQuickSwitch={false}
              />
            )}

            {activeTab === 'quickSwitch' && (
              <div className="bg-white rounded-card shadow-card border border-gray-200 p-6">
                <QuickStaffSwitch
                  onSuccess={handleQuickSwitchSuccess}
                  onError={handleQuickSwitchError}
                />
              </div>
            )}
          </div>

          {/* Help Links */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-small text-gray-500">
              <button className="hover:text-primary transition-colors">
                忘記密碼？
              </button>
              <span>•</span>
              <button className="hover:text-primary transition-colors">
                需要協助？
              </button>
            </div>
            
            {/* Device Security Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>安全連接已建立</span>
              {window.location.protocol === 'https:' && (
                <>
                  <span>•</span>
                  <span>SSL加密</span>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>版本 v1.0.0</span>
                <span>•</span>
                <span>© 2024 彩虹餐廳</span>
              </div>
              
              {/* Browser Compatibility Warning */}
              {!/Chrome|Firefox|Safari|Edge/.test(navigator.userAgent) && (
                <div className="text-xs text-warning">
                  建議使用 Chrome、Firefox、Safari 或 Edge 瀏覽器以獲得最佳體驗
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage