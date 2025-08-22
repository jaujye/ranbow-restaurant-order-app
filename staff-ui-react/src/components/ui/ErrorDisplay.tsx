/**
 * ⚠️ Error Display Components
 * Enhanced error handling UI with rainbow theme and user-friendly messages
 */

import React from 'react'
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  Home, 
  Shield,
  Wifi,
  WifiOff,
  Lock,
  Clock,
  ServerCrash,
  Bug
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

// 🎯 Error Types
export type ErrorType = 
  | 'network' 
  | 'authentication' 
  | 'authorization' 
  | 'validation' 
  | 'server' 
  | 'session'
  | 'security'
  | 'not-found'
  | 'timeout'
  | 'unknown'

// 📊 Error Severity
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

// 🔧 Error Props Interface
interface BaseErrorProps {
  type?: ErrorType
  severity?: ErrorSeverity
  title?: string
  message?: string
  details?: string
  errorCode?: string
  timestamp?: Date
  className?: string
  showRetry?: boolean
  showHome?: boolean
  onRetry?: () => void
  onHome?: () => void
}

// 🎨 Error Configuration
const errorConfig: Record<ErrorType, {
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  defaultTitle: string
  defaultMessage: string
}> = {
  network: {
    icon: WifiOff,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    defaultTitle: '網絡連接失敗',
    defaultMessage: '無法連接到服務器，請檢查網絡設置'
  },
  authentication: {
    icon: Lock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    defaultTitle: '身份驗證失敗',
    defaultMessage: '登入憑據無效或已過期'
  },
  authorization: {
    icon: Shield,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    defaultTitle: '權限不足',
    defaultMessage: '您沒有權限執行此操作'
  },
  validation: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    defaultTitle: '輸入驗證失敗',
    defaultMessage: '請檢查並修正輸入的資料'
  },
  server: {
    icon: ServerCrash,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    defaultTitle: '服務器錯誤',
    defaultMessage: '服務器遇到問題，請稍後再試'
  },
  session: {
    icon: Clock,
    color: 'text-processing',
    bgColor: 'bg-processing/10',
    borderColor: 'border-processing/20',
    defaultTitle: '會話問題',
    defaultMessage: '會話已過期或無效，請重新登入'
  },
  security: {
    icon: Shield,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    defaultTitle: '安全問題',
    defaultMessage: '檢測到安全問題，操作被阻止'
  },
  'not-found': {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    defaultTitle: '頁面未找到',
    defaultMessage: '請求的頁面或資源不存在'
  },
  timeout: {
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    defaultTitle: '請求超時',
    defaultMessage: '操作花費時間過長，請重試'
  },
  unknown: {
    icon: Bug,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/20',
    defaultTitle: '未知錯誤',
    defaultMessage: '發生了未預期的錯誤'
  }
}

// 💥 Basic Error Display
export const ErrorDisplay: React.FC<BaseErrorProps> = ({
  type = 'unknown',
  severity = 'medium',
  title,
  message,
  details,
  errorCode,
  timestamp,
  showRetry = true,
  showHome = false,
  onRetry,
  onHome,
  className = ''
}) => {
  const config = errorConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-card p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-full ${config.bgColor} border ${config.borderColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-body font-semibold text-gray-800">
              {displayTitle}
            </h4>
            {severity === 'critical' && (
              <span className="inline-flex items-center px-2 py-1 rounded-staff text-xs font-medium bg-error text-white">
                緊急
              </span>
            )}
          </div>
          
          <p className="text-small text-gray-600 mt-1">
            {displayMessage}
          </p>

          {/* Error Details */}
          {details && (
            <details className="mt-2 text-small text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">
                詳細信息
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-staff border">
                <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                  {details}
                </pre>
              </div>
            </details>
          )}

          {/* Error Code and Timestamp */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            {errorCode && (
              <span className="font-mono">錯誤碼: {errorCode}</span>
            )}
            {timestamp && (
              <span>時間: {timestamp.toLocaleTimeString()}</span>
            )}
          </div>

          {/* Action Buttons */}
          {(showRetry || showHome) && (
            <div className="flex items-center space-x-3 mt-4">
              {showRetry && onRetry && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                  className="inline-flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重試
                </Button>
              )}
              {showHome && onHome && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onHome}
                  className="inline-flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 📄 Full Page Error
export const FullPageError: React.FC<BaseErrorProps & {
  showLogo?: boolean
}> = ({
  type = 'unknown',
  severity = 'high',
  title,
  message,
  details,
  errorCode,
  showRetry = true,
  showHome = true,
  showLogo = true,
  onRetry,
  onHome,
  className = ''
}) => {
  const config = errorConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 ${className}`}>
      <Card className="max-w-2xl w-full text-center p-8">
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <h1 className="text-h2 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
              彩虹餐廳
            </h1>
            <p className="text-body text-gray-600 mt-1">
              員工管理系統
            </p>
          </div>
        )}

        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className={`p-4 rounded-full ${config.bgColor} border-2 ${config.borderColor}`}>
            <Icon className={`h-12 w-12 ${config.color}`} />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <div>
            <h2 className="text-h2 font-bold text-gray-800 mb-2">
              {displayTitle}
            </h2>
            <p className="text-body-large text-gray-600 mb-4">
              {displayMessage}
            </p>
          </div>

          {/* Severity Indicator */}
          {severity === 'critical' && (
            <div className="inline-flex items-center px-4 py-2 rounded-staff bg-error/10 border border-error/20">
              <AlertTriangle className="h-4 w-4 text-error mr-2" />
              <span className="text-small font-medium text-error">
                系統發生嚴重錯誤，請聯繫技術支援
              </span>
            </div>
          )}

          {/* Error Details */}
          {details && (
            <details className="text-left max-w-md mx-auto">
              <summary className="cursor-pointer text-body text-gray-600 hover:text-gray-800">
                顯示技術詳情
              </summary>
              <div className="mt-4 p-4 bg-gray-100 rounded-staff border">
                <pre className="whitespace-pre-wrap break-words text-small font-mono text-gray-700">
                  {details}
                </pre>
              </div>
            </details>
          )}

          {/* Error Code */}
          {errorCode && (
            <div className="text-small text-gray-400 font-mono">
              錯誤代碼: {errorCode}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(showRetry || showHome) && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            {showRetry && onRetry && (
              <Button
                variant="secondary"
                onClick={onRetry}
                className="inline-flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                重新嘗試
              </Button>
            )}
            {showHome && onHome && (
              <Button
                variant="primary"
                onClick={onHome}
                className="inline-flex items-center"
              >
                <Home className="h-5 w-5 mr-2" />
                返回首頁
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-small text-gray-500">
            <span>系統版本 v1.0.0</span>
            <span>•</span>
            <span>技術支援: support@rainbow-restaurant.com</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

// 🔐 Authentication Error
export const AuthError: React.FC<BaseErrorProps & {
  showLoginButton?: boolean
  onLogin?: () => void
}> = ({
  type = 'authentication',
  title,
  message,
  showRetry = false,
  showLoginButton = true,
  onRetry,
  onLogin,
  className = ''
}) => {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <Card className={`max-w-md mx-auto text-center p-6 ${className}`}>
      {/* Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={`p-3 rounded-full ${config.bgColor} border-2 ${config.borderColor}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-h3 font-bold text-gray-800">
            {title || config.defaultTitle}
          </h3>
          <p className="text-body text-gray-600 mt-2">
            {message || config.defaultMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {showLoginButton && onLogin && (
            <Button
              onClick={onLogin}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              重新登入
            </Button>
          )}
          {showRetry && onRetry && (
            <Button
              variant="secondary"
              onClick={onRetry}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重試
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// 🌐 Network Error
export const NetworkError: React.FC<BaseErrorProps & {
  showStatus?: boolean
  isOnline?: boolean
}> = ({
  title,
  message,
  showRetry = true,
  showStatus = true,
  isOnline = navigator.onLine,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-error/10 border border-error/20 rounded-card p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Network Status Icon */}
        <div className="flex-shrink-0">
          <div className="p-2 rounded-full bg-error/10 border border-error/20">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-warning" />
            ) : (
              <WifiOff className="h-5 w-5 text-error" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-body font-semibold text-gray-800">
              {title || '網絡連接問題'}
            </h4>
            {showStatus && (
              <span className={`inline-flex items-center px-2 py-1 rounded-staff text-xs font-medium ${
                isOnline ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
              }`}>
                {isOnline ? '連接異常' : '離線'}
              </span>
            )}
          </div>
          
          <p className="text-small text-gray-600 mt-1">
            {message || (isOnline 
              ? '網絡連接不穩定，請檢查網絡設置' 
              : '設備已離線，請檢查網絡連接'
            )}
          </p>

          {/* Retry Button */}
          {showRetry && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="mt-3 inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新連接
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 💡 Info Display (Success/Info variant)
export const InfoDisplay: React.FC<{
  type?: 'info' | 'success' | 'warning'
  title: string
  message?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}> = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20'
    },
    success: {
      icon: RefreshCw,
      color: 'text-completed',
      bgColor: 'bg-completed/10',
      borderColor: 'border-completed/20'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-card p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <h4 className="text-body font-semibold text-gray-800">
              {title}
            </h4>
            {message && (
              <p className="text-small text-gray-600 mt-1">
                {message}
              </p>
            )}
          </div>
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}