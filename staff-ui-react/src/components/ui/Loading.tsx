/**
 * ⏳ Loading Components
 * Enhanced loading indicators with rainbow theme and animations
 */

import React from 'react'
import { Loader2, Shield, RefreshCw, Clock, Wifi } from 'lucide-react'

// 🎯 Base Loading Props
interface BaseLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// 📏 Size Configuration
const sizeConfig = {
  sm: {
    spinner: 'h-4 w-4',
    container: 'p-2',
    text: 'text-small'
  },
  md: {
    spinner: 'h-6 w-6',
    container: 'p-4',
    text: 'text-body'
  },
  lg: {
    spinner: 'h-8 w-8',
    container: 'p-6',
    text: 'text-body-large'
  },
  xl: {
    spinner: 'h-12 w-12',
    container: 'p-8',
    text: 'text-h3'
  }
}

// 🌈 Basic Loading Spinner
export const LoadingSpinner: React.FC<BaseLoadingProps & { color?: string }> = ({ 
  size = 'md', 
  className = '',
  color = 'text-primary'
}) => {
  const config = sizeConfig[size]
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Loader2 className={`${config.spinner} ${color} animate-spin`} />
    </div>
  )
}

// 📦 Loading Card
export const LoadingCard: React.FC<BaseLoadingProps & {
  title?: string
  message?: string
  showProgress?: boolean
  progress?: number
}> = ({ 
  size = 'md',
  title = '載入中',
  message = '請稍候...',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const config = sizeConfig[size]
  
  return (
    <div className={`bg-white rounded-card shadow-card border border-gray-200 ${config.container} ${className}`}>
      <div className="text-center space-y-4">
        {/* Loading Icon */}
        <div className="flex items-center justify-center">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
            <Loader2 className={`${config.spinner} text-primary animate-spin`} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className={`${config.text} font-semibold text-gray-800`}>
            {title}
          </h3>
          {message && (
            <p className="text-caption text-gray-600 mt-1">
              {message}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// 🔐 Authentication Loading
export const AuthLoading: React.FC<BaseLoadingProps & {
  stage?: 'connecting' | 'authenticating' | 'loading' | 'verifying'
  message?: string
}> = ({ 
  size = 'lg',
  stage = 'authenticating',
  message,
  className = ''
}) => {
  const config = sizeConfig[size]
  
  const stageConfig = {
    connecting: {
      icon: Wifi,
      title: '連接中',
      defaultMessage: '正在連接到服務器...',
      color: 'text-info'
    },
    authenticating: {
      icon: Shield,
      title: '驗證中',
      defaultMessage: '正在驗證您的身份...',
      color: 'text-primary'
    },
    loading: {
      icon: Loader2,
      title: '載入中',
      defaultMessage: '正在載入用戶資料...',
      color: 'text-secondary'
    },
    verifying: {
      icon: RefreshCw,
      title: '檢查中',
      defaultMessage: '正在檢查權限和會話...',
      color: 'text-processing'
    }
  }

  const currentStage = stageConfig[stage]
  const Icon = currentStage.icon

  return (
    <div className={`bg-white rounded-card shadow-elevated border border-gray-200 ${config.container} max-w-md mx-auto ${className}`}>
      <div className="text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
            <div className="relative p-4 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30">
              <Icon className={`${config.spinner} ${currentStage.color} animate-spin`} />
            </div>
          </div>
        </div>

        {/* Title and Message */}
        <div>
          <h3 className={`${config.text} font-bold text-gray-800`}>
            {currentStage.title}
          </h3>
          <p className="text-body text-gray-600 mt-2">
            {message || currentStage.defaultMessage}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index <= Object.keys(stageConfig).indexOf(stage)
                  ? 'bg-primary'
                  : 'bg-gray-300'
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: index <= Object.keys(stageConfig).indexOf(stage) 
                  ? 'pulse 1s ease-in-out infinite' 
                  : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ⏱️ Session Loading
export const SessionLoading: React.FC<BaseLoadingProps & {
  timeRemaining?: number
  action?: 'extending' | 'refreshing' | 'logging-out'
}> = ({
  size = 'md',
  timeRemaining,
  action = 'extending',
  className = ''
}) => {
  const config = sizeConfig[size]
  
  const actionConfig = {
    extending: {
      title: '延長會話中',
      message: '正在延長您的會話時間...',
      color: 'text-completed'
    },
    refreshing: {
      title: '重新整理中',
      message: '正在重新整理認證令牌...',
      color: 'text-processing'
    },
    'logging-out': {
      title: '登出中',
      message: '正在安全登出...',
      color: 'text-error'
    }
  }

  const currentAction = actionConfig[action]
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${seconds}秒`
  }

  return (
    <div className={`bg-white rounded-staff shadow-card border border-gray-200 ${config.container} ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Animated Clock Icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Clock className={`${config.spinner} ${currentAction.color} animate-pulse`} />
            {timeRemaining && (
              <div className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full h-4 w-4 flex items-center justify-center">
                !
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={`${config.text} font-medium text-gray-800`}>
            {currentAction.title}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <p className="text-caption text-gray-600">
              {currentAction.message}
            </p>
            {timeRemaining && (
              <span className="text-small font-medium text-warning">
                {formatTime(timeRemaining)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar for Logout */}
      {action === 'logging-out' && timeRemaining && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-error h-1 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(0, (5000 - timeRemaining) / 5000 * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// 📱 Page Loading Overlay
export const PageLoading: React.FC<{
  title?: string
  message?: string
  showLogo?: boolean
  className?: string
}> = ({
  title = '載入中',
  message = '正在載入頁面內容...',
  showLogo = true,
  className = ''
}) => {
  return (
    <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6 px-4">
        {showLogo && (
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <h1 className="text-h1 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
                彩虹餐廳
              </h1>
              <p className="text-body text-gray-600 mt-1">
                員工管理系統
              </p>
            </div>
          </div>
        )}

        <AuthLoading 
          size="xl"
          stage="loading"
          message={message}
        />

        <div className="flex items-center justify-center space-x-1 text-caption text-gray-500">
          <span>系統版本</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

// 🔄 Inline Loading
export const InlineLoading: React.FC<BaseLoadingProps & {
  text?: string
  showIcon?: boolean
}> = ({
  size = 'sm',
  text = '載入中...',
  showIcon = true,
  className = ''
}) => {
  const config = sizeConfig[size]
  
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <Loader2 className={`${config.spinner} text-gray-400 animate-spin`} />
      )}
      <span className={`${config.text} text-gray-600`}>
        {text}
      </span>
    </div>
  )
}

// 🎯 Button Loading State
export const ButtonLoading: React.FC<BaseLoadingProps & {
  text?: string
  originalText?: string
  variant?: 'primary' | 'secondary'
}> = ({
  size = 'sm',
  text = '處理中...',
  originalText = '確認',
  variant = 'primary',
  className = ''
}) => {
  const config = sizeConfig[size]
  const color = variant === 'primary' ? 'text-white' : 'text-gray-600'
  
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Loader2 className={`${config.spinner} ${color} animate-spin`} />
      <span className={color}>
        {text}
      </span>
    </div>
  )
}

// 🌈 Rainbow Loading (Special Animation)
export const RainbowLoading: React.FC<BaseLoadingProps> = ({
  size = 'lg',
  className = ''
}) => {
  const config = sizeConfig[size]
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${config.spinner} border-4 border-gray-200 rounded-full`}></div>
        
        {/* Rainbow Ring */}
        <div className={`absolute inset-0 ${config.spinner} border-4 border-transparent border-t-primary border-r-secondary border-b-accent border-l-completed rounded-full animate-spin`}></div>
        
        {/* Inner Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}