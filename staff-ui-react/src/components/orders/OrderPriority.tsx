/**
 * 🎯 Order Priority Component
 * Displays priority levels with visual indicators and animations
 */

import React from 'react'
import { OrderPriority as PriorityType, StaffOrder } from '@/types/orders'

interface OrderPriorityProps {
  priority: PriorityType
  urgencyLevel?: StaffOrder['urgencyLevel']
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'indicator' | 'full'
  showAnimation?: boolean
  className?: string
}

const priorityConfig = {
  NORMAL: {
    label: '一般',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: '📋',
    urgencyClass: ''
  },
  HIGH: {
    label: '高優先',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: '⭐',
    urgencyClass: 'shadow-orange-200'
  },
  URGENT: {
    label: '緊急',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: '🔥',
    urgencyClass: 'shadow-red-200 animate-pulse'
  }
}

const urgencyLevelConfig = {
  LOW: {
    label: '低',
    intensity: 1,
    pulseClass: '',
    shadowClass: 'shadow-sm'
  },
  NORMAL: {
    label: '正常',
    intensity: 2,
    pulseClass: '',
    shadowClass: 'shadow-md'
  },
  HIGH: {
    label: '高',
    intensity: 3,
    pulseClass: 'animate-pulse',
    shadowClass: 'shadow-lg'
  },
  URGENT: {
    label: '緊急',
    intensity: 4,
    pulseClass: 'animate-pulse',
    shadowClass: 'shadow-xl shadow-red-200'
  },
  EMERGENCY: {
    label: '極緊急',
    intensity: 5,
    pulseClass: 'animate-bounce',
    shadowClass: 'shadow-2xl shadow-red-300'
  }
}

export const OrderPriority: React.FC<OrderPriorityProps> = ({
  priority,
  urgencyLevel,
  size = 'md',
  variant = 'badge',
  showAnimation = true,
  className = ''
}) => {
  const config = priorityConfig[priority]
  const urgencyConfig = urgencyLevel ? urgencyLevelConfig[urgencyLevel] : null

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  // Determine final animation class
  const animationClass = showAnimation && urgencyConfig?.pulseClass ? urgencyConfig.pulseClass : 
                        showAnimation && config.urgencyClass.includes('animate') ? config.urgencyClass : ''

  // Render badge variant
  const renderBadge = () => (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        ${sizeClasses[size]}
        ${config.color} ${config.bgColor} ${config.borderColor}
        ${animationClass}
        ${urgencyConfig?.shadowClass || ''}
        transition-all duration-200
        ${className}
      `.trim()}
      title={`優先級: ${config.label} ${urgencyConfig ? `(急迫度: ${urgencyConfig.label})` : ''}`}
    >
      <span role="img" aria-label={config.label}>
        {config.icon}
      </span>
      <span>{config.label}</span>
      {urgencyLevel && urgencyLevel !== 'NORMAL' && (
        <span className="text-xs opacity-75">
          [{urgencyConfig?.label}]
        </span>
      )}
    </span>
  )

  // Render indicator variant (minimal visual indicator)
  const renderIndicator = () => {
    if (priority === 'NORMAL' && (!urgencyLevel || urgencyLevel === 'NORMAL')) {
      return null // No indicator for normal priority
    }

    return (
      <div
        className={`
          flex items-center justify-center w-6 h-6 rounded-full text-xs
          ${config.bgColor} ${config.color}
          ${animationClass}
          ${urgencyConfig?.shadowClass || ''}
          ${className}
        `.trim()}
        title={`優先級: ${config.label}`}
      >
        <span role="img" aria-label={config.label}>
          {config.icon}
        </span>
      </div>
    )
  }

  // Render full variant with detailed information
  const renderFull = () => (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border-l-4
        ${config.bgColor} ${config.borderColor}
        ${animationClass}
        ${urgencyConfig?.shadowClass || ''}
        ${className}
      `.trim()}
    >
      <span className="text-2xl" role="img" aria-label={config.label}>
        {config.icon}
      </span>
      <div className="flex-1">
        <div className={`font-bold ${config.color}`}>
          {config.label} 優先級
        </div>
        {urgencyLevel && urgencyLevel !== 'NORMAL' && (
          <div className="text-xs text-gray-600 mt-1">
            急迫度: {urgencyConfig?.label}
          </div>
        )}
      </div>
      {urgencyConfig && urgencyConfig.intensity >= 4 && (
        <div className="flex items-center gap-1">
          {[...Array(urgencyConfig.intensity - 2)].map((_, i) => (
            <span key={i} className="text-red-500 animate-pulse">
              ⚠️
            </span>
          ))}
        </div>
      )}
    </div>
  )

  // Render based on variant
  switch (variant) {
    case 'indicator':
      return renderIndicator()
    case 'full':
      return renderFull()
    case 'badge':
    default:
      return renderBadge()
  }
}

// 🔄 Interactive Priority Selector
interface PrioritySelectorProps {
  currentPriority: PriorityType
  orderId: number
  onPriorityChange?: (orderId: number, newPriority: PriorityType) => void
  disabled?: boolean
  className?: string
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  currentPriority,
  orderId,
  onPriorityChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePriorityChange = (newPriority: PriorityType) => {
    if (!disabled && onPriorityChange) {
      onPriorityChange(orderId, newPriority)
    }
    setIsOpen(false)
  }

  if (!onPriorityChange) {
    return <OrderPriority priority={currentPriority} className={className} />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          transition-transform duration-150
          ${isOpen ? 'scale-105' : 'hover:scale-102'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `.trim()}
      >
        <OrderPriority 
          priority={currentPriority}
          className={`${className} ${!disabled ? 'hover:shadow-md' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              變更優先級為：
            </div>
            {Object.entries(priorityConfig).map(([priority, config]) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority as PriorityType)}
                className={`
                  w-full px-3 py-2 text-left text-sm font-medium
                  hover:bg-gray-50 transition-colors duration-150
                  flex items-center gap-3
                  ${currentPriority === priority ? 'bg-blue-50 text-blue-700' : ''}
                `.trim()}
              >
                <span role="img" aria-label={config.label}>
                  {config.icon}
                </span>
                <span>{config.label}</span>
                {currentPriority === priority && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 🚨 Emergency Priority Alert
interface EmergencyAlertProps {
  order: StaffOrder
  onAcknowledge?: (orderId: number) => void
  className?: string
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  order,
  onAcknowledge,
  className = ''
}) => {
  if (!order.urgencyLevel || order.urgencyLevel !== 'EMERGENCY') {
    return null
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 border-red-500
        bg-red-50 shadow-2xl max-w-sm animate-bounce
        ${className}
      `.trim()}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl animate-pulse" role="img" aria-label="emergency">
          🚨
        </span>
        <div className="flex-1">
          <h4 className="font-bold text-red-800">
            緊急訂單警報
          </h4>
          <p className="text-sm text-red-700 mt-1">
            訂單 #{order.orderNumber} 需要立即處理
          </p>
          <p className="text-xs text-red-600 mt-2">
            桌號: {order.tableNumber} | 已等待: {Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60))} 分鐘
          </p>
          {order.priorityReason && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              原因: {order.priorityReason}
            </p>
          )}
        </div>
        {onAcknowledge && (
          <button
            onClick={() => onAcknowledge(order.orderId)}
            className="text-red-600 hover:text-red-800 font-bold text-sm"
            title="確認已知"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderPriority