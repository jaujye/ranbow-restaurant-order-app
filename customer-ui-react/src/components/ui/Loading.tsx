import React from 'react'
import { cn } from '@/utils/cn'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'rainbow'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}) => {
  const renderSpinner = () => (
    <div
      className={cn(
        'loading-spinner',
        sizeClasses[size],
        className
      )}
    />
  )

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-primary-500 rounded-full animate-bounce',
            size === 'sm' && 'w-1 h-1',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div
      className={cn(
        'bg-primary-500 rounded-full animate-pulse-glow',
        sizeClasses[size],
        className
      )}
    />
  )

  const renderRainbow = () => (
    <div
      className={cn(
        'bg-rainbow-horizontal rounded-full animate-rainbow-float',
        sizeClasses[size],
        className
      )}
    />
  )

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'rainbow':
        return renderRainbow()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {renderLoading()}
      {text && (
        <p className="text-sm text-text-secondary animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// 全屏加載組件
export interface FullscreenLoadingProps {
  isLoading: boolean
  text?: string
  backdrop?: boolean
}

export const FullscreenLoading: React.FC<FullscreenLoadingProps> = ({
  isLoading,
  text = '載入中...',
  backdrop = true,
}) => {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center z-modal',
        backdrop && 'bg-background-overlay backdrop-blur-sm'
      )}
    >
      <div className="bg-white p-6 rounded-large shadow-large">
        <Loading variant="rainbow" size="lg" text={text} />
      </div>
    </div>
  )
}

// 頁面載入組件
export const PageLoading: React.FC<{ text?: string }> = ({ 
  text = '載入頁面中...' 
}) => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading variant="rainbow" size="xl" text={text} />
  </div>
)

// 按鈕載入組件
export const ButtonLoading: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => (
  <Loading variant="spinner" size={size} />
)

// 卡片載入骨架
export const CardLoading: React.FC = () => (
  <div className="card animate-pulse">
    <div className="p-4">
      <div className="loading-skeleton h-4 w-3/4 mb-3" />
      <div className="loading-skeleton h-4 w-1/2 mb-4" />
      <div className="loading-skeleton h-20 w-full mb-4" />
      <div className="flex space-x-2">
        <div className="loading-skeleton h-8 w-20" />
        <div className="loading-skeleton h-8 w-16" />
      </div>
    </div>
  </div>
)

// 列表載入骨架
export const ListLoading: React.FC<{ items?: number }> = ({ 
  items = 3 
}) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <CardLoading key={i} />
    ))}
  </div>
)