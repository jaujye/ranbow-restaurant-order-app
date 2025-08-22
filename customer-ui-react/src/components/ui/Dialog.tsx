import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  className?: string
}

export const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  className = ''
}) => {
  // 處理 ESC 鍵關閉
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // 防止背景滾動
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`
            bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto
            transform transition-all duration-200 scale-100 opacity-100
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-border-light">
              {title && (
                <h2 className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="關閉對話框"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Alert Dialog - 用於替換 alert()
export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = '確定'
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      showCloseButton={false}
      className="max-w-sm"
    >
      <div className="text-center">
        <div className="text-4xl mb-4">
          {getTypeIcon()}
        </div>
        <p className={`text-lg mb-6 ${getTypeColor()}`}>
          {message}
        </p>
        <Button 
          onClick={onClose}
          className="w-full"
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  )
}

// Confirm Dialog - 用於需要確認的操作
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確定',
  cancelText = '取消',
  type = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'warning'
      default:
        return 'primary'
    }
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      showCloseButton={false}
      className="max-w-sm"
    >
      <div className="text-center">
        <div className="text-4xl mb-4">
          {getTypeIcon()}
        </div>
        <p className="text-lg mb-6 text-text-primary">
          {message}
        </p>
        <div className="flex gap-3">
          <Button 
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmButtonVariant() as any}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default Dialog