/**
 * 🃏 Card Component
 * Reusable card component for displaying content with rainbow theme
 */

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CardProps } from '@/types'

// 📏 Card Padding Variants
const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
} as const

// 🃏 Card Component
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const cardClasses = twMerge(
    clsx(
      // Base styles
      'bg-white',
      'rounded-card',
      'shadow-card',
      'border border-gray-200',
      'transition-all duration-200',
      'hover:shadow-elevated',
      
      // Padding
      paddingVariants[padding],
      
      className
    )
  )

  const hasHeader = title || subtitle || actions

  return (
    <div className={cardClasses} {...props}>
      {/* Card Header */}
      {hasHeader && (
        <div className={clsx(
          'flex items-start justify-between',
          padding !== 'none' && 'mb-4'
        )}>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-h3 font-semibold text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-caption text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className={clsx(
        hasHeader && padding !== 'none' && '-mt-1'
      )}>
        {children}
      </div>
    </div>
  )
}

// 🎨 Card Variants for Different Use Cases

// 📊 Stats Card
export const StatsCard: React.FC<{
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  className?: string
}> = ({ title, value, change, changeType = 'neutral', icon, className }) => {
  const changeColors = {
    positive: 'text-completed bg-completed-50',
    negative: 'text-urgent bg-urgent-50',
    neutral: 'text-gray-600 bg-gray-50'
  }

  return (
    <Card className={className} padding="md">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-caption text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-h2 font-bold text-gray-900 mt-1">
            {value}
          </p>
          {change && (
            <p className={clsx(
              'text-small font-medium mt-1 inline-flex items-center px-2 py-1 rounded-full',
              changeColors[changeType]
            )}>
              {changeType === 'positive' && '↗'}
              {changeType === 'negative' && '↘'}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-primary opacity-20">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// 📋 Order Card
export const OrderCard: React.FC<{
  orderNumber: string
  tableNumber: string
  status: string
  totalAmount: number
  itemCount: number
  orderTime: Date
  isUrgent?: boolean
  onClick?: () => void
  className?: string
}> = ({
  orderNumber,
  tableNumber,
  status,
  totalAmount,
  itemCount,
  orderTime,
  isUrgent = false,
  onClick,
  className
}) => {
  const statusColors = {
    'PENDING': 'bg-pending text-white',
    'PROCESSING': 'bg-processing text-white',
    'READY': 'bg-completed text-white',
    'COMPLETED': 'bg-gray-400 text-white',
    'CANCELLED': 'bg-cancelled text-gray-800'
  }

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-400 text-white'
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card
      className={clsx(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-elevated hover:scale-[1.02]',
        isUrgent && 'ring-2 ring-urgent ring-opacity-50 shadow-status',
        className
      )}
      onClick={onClick}
      padding="md"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-order-number font-bold text-gray-900">
                {orderNumber}
              </span>
              {isUrgent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-small font-medium bg-urgent text-white">
                  緊急
                </span>
              )}
            </div>
            <p className="text-caption text-gray-500 mt-1">
              桌號 {tableNumber} • {formatTime(orderTime)}
            </p>
          </div>
          
          <span className={clsx(
            'inline-flex items-center px-2.5 py-1 rounded-full text-status-tag',
            getStatusColor(status)
          )}>
            {status === 'PENDING' && '待處理'}
            {status === 'PROCESSING' && '處理中'}
            {status === 'READY' && '已完成'}
            {status === 'COMPLETED' && '已送達'}
            {status === 'CANCELLED' && '已取消'}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-caption text-gray-500">
            {itemCount} 項商品
          </span>
          <span className="text-price font-semibold text-gray-900">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </Card>
  )
}

// 👤 Staff Card
export const StaffCard: React.FC<{
  name: string
  role: string
  avatar?: string
  status: 'ACTIVE' | 'BREAK' | 'BUSY' | 'OFFLINE'
  currentOrders?: number
  efficiency?: number
  onClick?: () => void
  className?: string
}> = ({
  name,
  role,
  avatar,
  status,
  currentOrders,
  efficiency,
  onClick,
  className
}) => {
  const statusColors = {
    'ACTIVE': 'bg-completed text-white',
    'BREAK': 'bg-processing text-white',
    'BUSY': 'bg-urgent text-white',
    'OFFLINE': 'bg-cancelled text-gray-800'
  }

  const statusLabels = {
    'ACTIVE': '在線',
    'BREAK': '休息',
    'BUSY': '忙碌',
    'OFFLINE': '離線'
  }

  return (
    <Card
      className={clsx(
        onClick && 'cursor-pointer hover:shadow-elevated',
        className
      )}
      onClick={onClick}
      padding="md"
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={avatar}
              alt={name}
            />
          ) : (
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-body font-semibold text-primary-600">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-gray-900 truncate">
            {name}
          </p>
          <p className="text-caption text-gray-500 truncate">
            {role}
          </p>
        </div>

        {/* Status & Metrics */}
        <div className="flex-shrink-0 text-right">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-small font-medium',
            statusColors[status]
          )}>
            {statusLabels[status]}
          </span>
          
          <div className="mt-1 space-y-1">
            {currentOrders !== undefined && (
              <p className="text-small text-gray-500">
                {currentOrders} 訂單
              </p>
            )}
            {efficiency !== undefined && (
              <p className="text-small text-gray-500">
                效率 {efficiency}%
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Card