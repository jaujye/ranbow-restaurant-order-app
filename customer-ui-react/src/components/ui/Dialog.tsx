import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/solid'
import { Button } from './Button'
import { cn } from '@/utils/cn'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'rainbow' | 'glass'
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
}

export const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  className = '',
  size = 'md',
  variant = 'default',
  closeOnEscape = true,
  closeOnBackdrop = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  // 處理 ESC 鍵關閉
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Focus管理 - 將焦點移到對話框
      setTimeout(() => {
        dialogRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  if (!isOpen) return null

  const getVariantClasses = () => {
    switch (variant) {
      case 'rainbow':
        return 'bg-white/95 backdrop-blur-xl border-2 border-transparent bg-clip-padding shadow-rainbow-lg'
      case 'glass':
        return 'glass-light shadow-large'
      default:
        return 'bg-white shadow-large border border-border-light'
    }
  }

  return (
    <>
      {/* Enhanced Backdrop */}
      <div 
        className="modal-backdrop animate-fade-in"
        onClick={handleBackdropClick}
      />
      
      {/* Dialog Container */}
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        <div 
          ref={dialogRef}
          tabIndex={-1}
          className={cn(
            'modal-content w-full max-h-[90vh] overflow-hidden',
            'focus:outline-none',
            sizeClasses[size],
            getVariantClasses(),
            className
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
        >
          {/* Rainbow border effect for rainbow variant */}
          {variant === 'rainbow' && (
            <div className="absolute inset-0 rounded-large p-0.5 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient-shift">
              <div className="w-full h-full bg-white rounded-large" />
            </div>
          )}
          
          {/* Content Container */}
          <div className="relative z-10 flex flex-col max-h-full">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                {title && (
                  <h2 
                    id="dialog-title" 
                    className="text-xl font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-2 hover:bg-gray-100 rounded-medium transition-all duration-fast',
                      'focus-visible:ring-2 focus-visible:ring-primary-500/50',
                      'hover:scale-110 active:scale-95'
                    )}
                    aria-label="關閉對話框"
                  >
                    <XMarkIcon className="w-5 h-5 text-text-secondary" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Enhanced Alert Dialog
export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  variant?: 'default' | 'rainbow'
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = '確定',
  variant = 'default'
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-success-500',
          bgColor: 'from-success-50 to-success-100',
          borderColor: 'border-success-200',
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-warning-500',
          bgColor: 'from-warning-50 to-warning-100',
          borderColor: 'border-warning-200',
        }
      case 'error':
        return {
          icon: XCircleIcon,
          iconColor: 'text-error-500',
          bgColor: 'from-error-50 to-error-100',
          borderColor: 'border-error-200',
        }
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-info-500',
          bgColor: 'from-info-50 to-info-100',
          borderColor: 'border-info-200',
        }
    }
  }

  const typeConfig = getTypeConfig()
  const TypeIcon = typeConfig.icon

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      showCloseButton={false}
      size="sm"
      variant={variant}
    >
      <div className="text-center">
        {/* Icon with background */}
        <div className={cn(
          'mx-auto mb-4 w-16 h-16 rounded-full',
          'bg-gradient-to-br', typeConfig.bgColor,
          'border-2', typeConfig.borderColor,
          'flex items-center justify-center',
          'animate-bounce-gentle'
        )}>
          <TypeIcon className={cn('w-8 h-8', typeConfig.iconColor)} />
        </div>
        
        {/* Message */}
        <p className="text-lg mb-6 text-text-primary leading-relaxed">
          {message}
        </p>
        
        {/* Action Button */}
        <Button 
          onClick={onClose}
          variant={variant === 'rainbow' ? 'rainbow' : 'primary'}
          size="lg"
          fullWidth
          className="font-semibold"
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  )
}

// Enhanced Confirm Dialog
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error'
  variant?: 'default' | 'rainbow'
  loading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確定',
  cancelText = '取消',
  type = 'info',
  variant = 'default',
  loading = false
}) => {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-warning-500',
          bgColor: 'from-warning-50 to-warning-100',
          borderColor: 'border-warning-200',
          confirmVariant: 'accent' as const,
        }
      case 'error':
        return {
          icon: XCircleIcon,
          iconColor: 'text-error-500',
          bgColor: 'from-error-50 to-error-100',
          borderColor: 'border-error-200',
          confirmVariant: 'primary' as const,
        }
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-info-500',
          bgColor: 'from-info-50 to-info-100',
          borderColor: 'border-info-200',
          confirmVariant: 'primary' as const,
        }
    }
  }

  const typeConfig = getTypeConfig()
  const TypeIcon = typeConfig.icon

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      showCloseButton={false}
      size="sm"
      variant={variant}
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
    >
      <div className="text-center">
        {/* Icon with background */}
        <div className={cn(
          'mx-auto mb-4 w-16 h-16 rounded-full',
          'bg-gradient-to-br', typeConfig.bgColor,
          'border-2', typeConfig.borderColor,
          'flex items-center justify-center',
          'animate-pulse-glow'
        )}>
          <TypeIcon className={cn('w-8 h-8', typeConfig.iconColor)} />
        </div>
        
        {/* Message */}
        <p className="text-lg mb-6 text-text-primary leading-relaxed">
          {message}
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            fullWidth
            size="lg"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'rainbow' ? 'rainbow' : typeConfig.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
            fullWidth
            size="lg"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default Dialog