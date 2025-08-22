/**
 * 🏷️ Order Status Badge Component
 * Displays order status with color coding and animations
 */

import React from 'react'
import { OrderStatus } from '@/types/orders'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline' | 'subtle'
  showAnimation?: boolean
  className?: string
}

const statusConfig = {
  PENDING: {
    label: '待處理',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    outlineColor: 'border-blue-500 text-blue-600',
    subtleBg: 'bg-blue-50 text-blue-700',
    icon: '⏳',
    pulseColor: 'animate-pulse'
  },
  CONFIRMED: {
    label: '已確認',
    bgColor: 'bg-indigo-500',
    textColor: 'text-white',
    outlineColor: 'border-indigo-500 text-indigo-600',
    subtleBg: 'bg-indigo-50 text-indigo-700',
    icon: '✓',
    pulseColor: ''
  },
  PROCESSING: {
    label: '處理中',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    outlineColor: 'border-orange-500 text-orange-600',
    subtleBg: 'bg-orange-50 text-orange-700',
    icon: '🔄',
    pulseColor: 'animate-pulse'
  },
  PREPARING: {
    label: '製作中',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    outlineColor: 'border-yellow-500 text-yellow-600',
    subtleBg: 'bg-yellow-50 text-yellow-700',
    icon: '👨‍🍳',
    pulseColor: 'animate-pulse'
  },
  READY: {
    label: '準備完成',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    outlineColor: 'border-green-500 text-green-600',
    subtleBg: 'bg-green-50 text-green-700',
    icon: '✅',
    pulseColor: 'animate-bounce'
  },
  DELIVERED: {
    label: '已送達',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    outlineColor: 'border-emerald-500 text-emerald-600',
    subtleBg: 'bg-emerald-50 text-emerald-700',
    icon: '🚚',
    pulseColor: ''
  },
  COMPLETED: {
    label: '已完成',
    bgColor: 'bg-slate-500',
    textColor: 'text-white',
    outlineColor: 'border-slate-500 text-slate-600',
    subtleBg: 'bg-slate-50 text-slate-700',
    icon: '🏁',
    pulseColor: ''
  },
  CANCELLED: {
    label: '已取消',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    outlineColor: 'border-red-500 text-red-600',
    subtleBg: 'bg-red-50 text-red-700',
    icon: '❌',
    pulseColor: ''
  },
  REFUNDED: {
    label: '已退款',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    outlineColor: 'border-purple-500 text-purple-600',
    subtleBg: 'bg-purple-50 text-purple-700',
    icon: '💸',
    pulseColor: ''
  }
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs font-medium',
  md: 'px-3 py-1.5 text-sm font-semibold',
  lg: 'px-4 py-2 text-base font-bold'
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'solid',
  showAnimation = true,
  className = ''
}) => {
  const config = statusConfig[status]
  const sizeClass = sizeClasses[size]

  // Determine badge styling based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return `border-2 ${config.outlineColor} bg-transparent`
      case 'subtle':
        return config.subtleBg
      case 'solid':
      default:
        return `${config.bgColor} ${config.textColor}`
    }
  }

  // Animation classes
  const animationClass = showAnimation && config.pulseColor ? config.pulseColor : ''

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border-0
        ${sizeClass}
        ${getVariantClasses()}
        ${animationClass}
        transition-all duration-200 ease-in-out
        select-none whitespace-nowrap
        ${className}
      `.trim()}
      title={`狀態: ${config.label}`}
    >
      <span className="flex-shrink-0" role="img" aria-label={config.label}>
        {config.icon}
      </span>
      <span className="font-mono tracking-tight">
        {config.label}
      </span>
    </span>
  )
}

// 🎯 Status Badge with Quick Actions
interface StatusBadgeWithActionsProps extends OrderStatusBadgeProps {
  orderId: number
  availableActions?: OrderStatus[]
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void
  disabled?: boolean
}

export const StatusBadgeWithActions: React.FC<StatusBadgeWithActionsProps> = ({
  status,
  orderId,
  availableActions = [],
  onStatusChange,
  disabled = false,
  ...badgeProps
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!disabled && onStatusChange) {
      onStatusChange(orderId, newStatus)
    }
    setIsDropdownOpen(false)
  }

  if (!onStatusChange || availableActions.length === 0) {
    return <OrderStatusBadge status={status} {...badgeProps} />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className={`
          transition-transform duration-150
          ${isDropdownOpen ? 'scale-105' : 'hover:scale-102'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `.trim()}
      >
        <OrderStatusBadge 
          status={status} 
          {...badgeProps}
          className={`${badgeProps.className} ${!disabled ? 'hover:shadow-md' : ''}`}
        />
      </button>

      {isDropdownOpen && !disabled && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              更改狀態為：
            </div>
            {availableActions.map((actionStatus) => {
              const config = statusConfig[actionStatus]
              return (
                <button
                  key={actionStatus}
                  onClick={() => handleStatusChange(actionStatus)}
                  className={`
                    w-full px-3 py-2 text-left text-sm font-medium
                    hover:bg-gray-50 transition-colors duration-150
                    flex items-center gap-2
                  `.trim()}
                >
                  <span role="img" aria-label={config.label}>
                    {config.icon}
                  </span>
                  <span>{config.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default OrderStatusBadge