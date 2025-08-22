/**
 * 📋 Order Card Component
 * Main order display component with full functionality
 */

import React, { useState } from 'react'
import { OrderCardProps, StaffOrder, OrderStatus } from '@/types/orders'
import { OrderStatusBadge, StatusBadgeWithActions } from './OrderStatusBadge'
import { OrderTimer, UrgencyTimer } from './OrderTimer'
import { OrderPriority, PrioritySelector } from './OrderPriority'

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusUpdate,
  onAssignToSelf,
  onStartCooking,
  isSelected = false,
  showQuickActions = true,
  variant = 'standard',
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Available status transitions based on current status
  const getAvailableStatusTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED']
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED']
      case 'PROCESSING':
        return ['PREPARING', 'CANCELLED']
      case 'PREPARING':
        return ['READY', 'PROCESSING']
      case 'READY':
        return ['DELIVERED', 'COMPLETED']
      case 'DELIVERED':
        return ['COMPLETED']
      default:
        return []
    }
  }

  // Handle status update with loading state
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (disabled || isProcessing) return
    
    setIsProcessing(true)
    try {
      await onStatusUpdate(order.orderId, newStatus)
    } catch (error) {
      console.error('Status update failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle assign to self
  const handleAssignToSelf = async () => {
    if (disabled || isProcessing || !order.canAssignToSelf) return
    
    setIsProcessing(true)
    try {
      await onAssignToSelf(order.orderId)
    } catch (error) {
      console.error('Assign to self failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle start cooking
  const handleStartCooking = async () => {
    if (disabled || isProcessing || !order.canStartCooking) return
    
    setIsProcessing(true)
    try {
      await onStartCooking(order.orderId)
    } catch (error) {
      console.error('Start cooking failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Get urgency styling
  const getUrgencyStyle = () => {
    if (order.urgencyLevel === 'EMERGENCY') {
      return 'ring-4 ring-red-500 ring-opacity-50 shadow-2xl shadow-red-200'
    }
    if (order.urgencyLevel === 'URGENT') {
      return 'ring-2 ring-orange-500 ring-opacity-50 shadow-xl shadow-orange-200'
    }
    if (order.delayedMinutes > 0) {
      return 'ring-2 ring-yellow-500 ring-opacity-50 shadow-lg shadow-yellow-200'
    }
    return 'shadow-md hover:shadow-lg'
  }

  // Render compact variant
  const renderCompact = () => (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'}
        ${getUrgencyStyle()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `.trim()}
      onClick={() => !disabled && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Order Number & Table */}
          <div>
            <div className="font-mono font-bold text-lg text-gray-900">
              #{order.orderNumber}
            </div>
            <div className="text-sm text-gray-600">
              桌號 {order.tableNumber}
            </div>
          </div>
          
          {/* Status & Priority */}
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} size="sm" />
            <OrderPriority priority={order.priority} urgencyLevel={order.urgencyLevel} size="sm" />
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </div>
          <OrderTimer order={order} variant="minimal" />
        </div>
      </div>
    </div>
  )

  // Render detailed variant
  const renderDetailed = () => (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all duration-300 
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
        ${getUrgencyStyle()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isProcessing ? 'animate-pulse' : ''}
      `.trim()}
    >
      {/* Emergency Alert */}
      {order.urgencyLevel === 'EMERGENCY' && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg animate-pulse">🚨</span>
            <span className="text-red-800 font-bold">緊急訂單 - 需立即處理</span>
          </div>
          {order.priorityReason && (
            <p className="text-sm text-red-700 mt-1">
              原因: {order.priorityReason}
            </p>
          )}
        </div>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Order Number & Table */}
          <div className="flex items-center gap-4 mb-2">
            <h3 className="font-mono font-bold text-2xl text-gray-900">
              #{order.orderNumber}
            </h3>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              桌號 {order.tableNumber}
            </div>
          </div>

          {/* Customer Info */}
          {order.customerName && (
            <div className="text-sm text-gray-600 mb-2">
              客戶: {order.customerName}
              {order.customerPhone && ` • ${order.customerPhone}`}
            </div>
          )}

          {/* Order Source & Type */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {order.source === 'DINE_IN' ? '內用' : 
               order.source === 'TAKEAWAY' ? '外帶' : 
               order.source === 'DELIVERY' ? '外送' : '線上訂餐'}
            </span>
            <span>•</span>
            <span>{order.items.length} 項商品</span>
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="text-right">
          <div className="font-bold text-2xl text-gray-900 mb-2">
            {formatCurrency(order.totalAmount)}
          </div>
          {showQuickActions && (
            <div className="flex gap-2">
              {order.canAssignToSelf && (
                <button
                  onClick={handleAssignToSelf}
                  disabled={disabled || isProcessing}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  接手
                </button>
              )}
              {order.canStartCooking && (
                <button
                  onClick={handleStartCooking}
                  disabled={disabled || isProcessing}
                  className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  開始製作
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status & Priority Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StatusBadgeWithActions
            status={order.status}
            orderId={order.orderId}
            availableActions={getAvailableStatusTransitions(order.status)}
            onStatusChange={handleStatusUpdate}
            disabled={disabled || isProcessing}
            size="md"
          />
          <PrioritySelector
            currentPriority={order.priority}
            orderId={order.orderId}
            disabled={disabled || isProcessing}
          />
        </div>
        
        <UrgencyTimer 
          order={order}
          className="text-right"
        />
      </div>

      {/* Timer Row */}
      <div className="mb-4">
        <OrderTimer 
          order={order}
          variant="detailed"
          showElapsed={true}
          showRemaining={true}
          showProgress={true}
        />
      </div>

      {/* Special Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {order.allergyWarnings && order.allergyWarnings.length > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            🚨 過敏警告
          </span>
        )}
        {order.specialInstructions && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            📝 特殊需求
          </span>
        )}
        {order.assignedStaff && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            👨‍🍳 {order.assignedStaff}
          </span>
        )}
        {order.delayedMinutes > 0 && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium animate-pulse">
            ⏰ 延遲 {order.delayedMinutes} 分鐘
          </span>
        )}
      </div>

      {/* Expandable Details */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          disabled={disabled}
        >
          <span>
            {isExpanded ? '收起詳細資訊' : '展開詳細資訊'}
          </span>
          <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">訂單項目:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={`${item.itemId}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.specialRequests && (
                        <div className="text-sm text-orange-600 mt-1">
                          特殊要求: {item.specialRequests}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono">x{item.quantity}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">特殊指示:</h4>
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="text-sm text-yellow-800">
                    {order.specialInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Allergy Warnings */}
            {order.allergyWarnings && order.allergyWarnings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">過敏警告:</h4>
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex flex-wrap gap-2">
                    {order.allergyWarnings.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Staff Notes */}
            {order.staffNotes && order.staffNotes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">員工備註:</h4>
                <div className="space-y-2">
                  {order.staffNotes.map((note, index) => (
                    <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompact()
    case 'detailed':
    default:
      return renderDetailed()
  }
}

export default OrderCard