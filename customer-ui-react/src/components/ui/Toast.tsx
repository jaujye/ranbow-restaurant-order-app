import React from 'react'
import toast, { Toaster, ToastBar } from 'react-hot-toast'
import { cn } from '@/utils/cn'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

// Toast 類型定義
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Toast 選項
export interface ToastOptions {
  duration?: number
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  id?: string
  icon?: React.ReactNode
  className?: string
}

// Toast 圖標映射
const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="w-5 h-5" />,
  error: <XCircleIcon className="w-5 h-5" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5" />,
  info: <InformationCircleIcon className="w-5 h-5" />,
}

// Toast 樣式映射
const toastStyles: Record<ToastType, string> = {
  success: 'toast-success',
  error: 'toast-error', 
  warning: 'toast-warning',
  info: 'toast-info',
}

// Toast 工具函數
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 4000,
      icon: options?.icon || toastIcons.success as any,
      className: cn('toast', toastStyles.success, options?.className),
      id: options?.id,
    })
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 5000,
      icon: options?.icon || toastIcons.error as any,
      className: cn('toast', toastStyles.error, options?.className),
      id: options?.id,
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4500,
      icon: options?.icon || toastIcons.warning as any,
      className: cn('toast', toastStyles.warning, options?.className),
      id: options?.id,
    })
  },

  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      icon: options?.icon || toastIcons.info as any,
      className: cn('toast', toastStyles.info, options?.className),
      id: options?.id,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        className: options?.className,
        id: options?.id,
      }
    )
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      className: cn('toast', 'bg-gray-600 text-white', options?.className),
      id: options?.id,
    })
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },
}

// Toast 容器組件
export const ToastContainer: React.FC<{
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  reverseOrder?: boolean
  gutter?: number
}> = ({ 
  position = 'top-center', 
  reverseOrder = false,
  gutter = 8 
}) => {
  return (
    <Toaster
      position={position}
      reverseOrder={reverseOrder}
      gutter={gutter}
      containerStyle={{
        top: position.includes('top') ? 20 : undefined,
        bottom: position.includes('bottom') ? 20 : undefined,
        left: position.includes('center') ? '50%' : undefined,
        right: position.includes('right') ? 20 : undefined,
        transform: position.includes('center') ? 'translateX(-50%)' : undefined,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
        className: 'toast-container',
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={cn(
                'toast',
                'flex items-center gap-3 p-4 rounded-medium shadow-medium',
                'bg-white border border-border-light',
                'min-w-0 max-w-md',
                'transition-all duration-300 ease-out',
                t.visible ? 'animate-fade-in' : 'animate-slide-out-right'
              )}
            >
              {/* 圖標 */}
              <div className="flex-shrink-0">
                {icon}
              </div>
              
              {/* 消息內容 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {message}
                </div>
              </div>
              
              {/* 關閉按鈕 */}
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 p-1 rounded-small hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  aria-label="關閉通知"
                >
                  <XMarkIcon className="w-4 h-4 text-text-disabled" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}

// 自定義 Toast 組件
export interface CustomToastProps {
  title: string
  description?: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

export const CustomToast: React.FC<CustomToastProps> = ({
  title,
  description,
  type = 'info',
  duration = 4000,
  action,
  onDismiss,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div className={cn('toast', toastStyles[type], 'max-w-sm')}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {toastIcons[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {title}
          </div>
          {description && (
            <div className="text-xs opacity-90 mt-1">
              {description}
            </div>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-medium underline mt-2 hover:no-underline focus:outline-none focus:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-small opacity-70 hover:opacity-100 focus:outline-none focus:opacity-100 transition-opacity"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// 使用 Toast 的 Hook
export const useToast = () => {
  return {
    toast: showToast,
    dismiss: toast.dismiss,
    remove: toast.remove,
  }
}