/**
 * ⏱️ Order Timer Component
 * Displays elapsed time and urgency indicators with real-time updates
 */

import React, { useState, useEffect } from 'react'
import { StaffOrder } from '@/types/orders'

interface OrderTimerProps {
  order: StaffOrder
  showElapsed?: boolean
  showRemaining?: boolean
  showProgress?: boolean
  variant?: 'compact' | 'detailed' | 'minimal'
  className?: string
}

interface TimeDisplay {
  hours: number
  minutes: number
  seconds: number
  totalMinutes: number
  isOverdue: boolean
  urgencyColor: string
}

export const OrderTimer: React.FC<OrderTimerProps> = ({
  order,
  showElapsed = true,
  showRemaining = true,
  showProgress = false,
  variant = 'detailed',
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate elapsed time
  const calculateElapsedTime = (): TimeDisplay => {
    const elapsed = Math.floor((currentTime.getTime() - order.orderTime.getTime()) / 1000)
    const hours = Math.floor(elapsed / 3600)
    const minutes = Math.floor((elapsed % 3600) / 60)
    const seconds = elapsed % 60
    const totalMinutes = Math.floor(elapsed / 60)

    // Determine urgency color based on elapsed time
    let urgencyColor = 'text-gray-600'
    if (totalMinutes > 45) urgencyColor = 'text-red-600'
    else if (totalMinutes > 30) urgencyColor = 'text-orange-500'
    else if (totalMinutes > 20) urgencyColor = 'text-yellow-600'
    else if (totalMinutes > 10) urgencyColor = 'text-blue-600'

    const isOverdue = order.isOverdue || totalMinutes > 30

    return {
      hours,
      minutes,
      seconds,
      totalMinutes,
      isOverdue,
      urgencyColor
    }
  }

  // Calculate remaining time
  const calculateRemainingTime = (): TimeDisplay | null => {
    if (!order.estimatedCompleteTime) return null

    const remaining = Math.floor((order.estimatedCompleteTime.getTime() - currentTime.getTime()) / 1000)
    
    if (remaining <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMinutes: 0,
        isOverdue: true,
        urgencyColor: 'text-red-600'
      }
    }

    const hours = Math.floor(remaining / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    const seconds = remaining % 60
    const totalMinutes = Math.floor(remaining / 60)

    let urgencyColor = 'text-green-600'
    if (totalMinutes < 5) urgencyColor = 'text-red-600'
    else if (totalMinutes < 10) urgencyColor = 'text-orange-500'
    else if (totalMinutes < 15) urgencyColor = 'text-yellow-600'

    return {
      hours,
      minutes,
      seconds,
      totalMinutes,
      isOverdue: false,
      urgencyColor
    }
  }

  // Format time for display
  const formatTime = (time: TimeDisplay): string => {
    if (time.hours > 0) {
      return `${time.hours}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`
    }
    return `${time.minutes}:${time.seconds.toString().padStart(2, '0')}`
  }

  // Format time in Chinese
  const formatTimeChinese = (time: TimeDisplay): string => {
    if (time.totalMinutes === 0) {
      return `${time.seconds}秒`
    }
    if (time.hours > 0) {
      return `${time.hours}小時${time.minutes}分`
    }
    return `${time.minutes}分鐘`
  }

  const elapsedTime = calculateElapsedTime()
  const remainingTime = calculateRemainingTime()

  // Progress calculation (0-100%)
  const progress = remainingTime && order.estimatedCompleteTime ? 
    Math.max(0, Math.min(100, 
      ((currentTime.getTime() - order.orderTime.getTime()) / 
       (order.estimatedCompleteTime.getTime() - order.orderTime.getTime())) * 100
    )) : 0

  // Render based on variant
  const renderCompact = () => (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {showElapsed && (
        <div className={`flex items-center gap-1 ${elapsedTime.urgencyColor}`}>
          <span className="text-xs">⏱️</span>
          <span className={`font-mono text-sm font-bold ${elapsedTime.isOverdue ? 'animate-pulse' : ''}`}>
            {formatTime(elapsedTime)}
          </span>
        </div>
      )}
      
      {showRemaining && remainingTime && (
        <div className={`flex items-center gap-1 ${remainingTime.urgencyColor}`}>
          <span className="text-xs">⏳</span>
          <span className={`font-mono text-sm font-bold ${remainingTime.isOverdue ? 'animate-pulse' : ''}`}>
            {remainingTime.isOverdue ? '超時!' : formatTime(remainingTime)}
          </span>
        </div>
      )}
    </div>
  )

  const renderMinimal = () => (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      <span className={`font-mono text-sm font-semibold ${elapsedTime.urgencyColor}`}>
        {formatTimeChinese(elapsedTime)}
      </span>
      {elapsedTime.isOverdue && (
        <span className="text-red-500 animate-pulse">⚠️</span>
      )}
    </div>
  )

  const renderDetailed = () => (
    <div className={`space-y-2 ${className}`.trim()}>
      {/* Elapsed Time */}
      {showElapsed && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">已經過時間:</span>
          <div className={`flex items-center gap-2 ${elapsedTime.urgencyColor}`}>
            <span className={`font-mono font-bold ${elapsedTime.isOverdue ? 'animate-pulse' : ''}`}>
              {formatTime(elapsedTime)}
            </span>
            <span className="text-xs">
              ({formatTimeChinese(elapsedTime)})
            </span>
            {elapsedTime.isOverdue && (
              <span className="text-red-500">⚠️</span>
            )}
          </div>
        </div>
      )}

      {/* Remaining Time */}
      {showRemaining && remainingTime && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">剩餘時間:</span>
          <div className={`flex items-center gap-2 ${remainingTime.urgencyColor}`}>
            <span className={`font-mono font-bold ${remainingTime.isOverdue ? 'animate-pulse' : ''}`}>
              {remainingTime.isOverdue ? '已超時!' : formatTime(remainingTime)}
            </span>
            {!remainingTime.isOverdue && (
              <span className="text-xs">
                ({formatTimeChinese(remainingTime)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && remainingTime && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>進度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                progress > 90 ? 'bg-red-500' :
                progress > 75 ? 'bg-orange-500' :
                progress > 50 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Delay Indicator */}
      {order.delayedMinutes > 0 && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm text-red-700 font-medium">
            延遲 {order.delayedMinutes} 分鐘
          </span>
        </div>
      )}
    </div>
  )

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompact()
    case 'minimal':
      return renderMinimal()
    case 'detailed':
    default:
      return renderDetailed()
  }
}

// 🚨 Urgency Alert Timer
interface UrgencyTimerProps {
  order: StaffOrder
  onUrgencyAlert?: (orderId: number, urgencyLevel: string) => void
  className?: string
}

export const UrgencyTimer: React.FC<UrgencyTimerProps> = ({
  order,
  onUrgencyAlert,
  className = ''
}) => {
  const [alertTriggered, setAlertTriggered] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkUrgency = () => {
      const elapsedMinutes = Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60))
      
      // Trigger alerts at different thresholds
      const urgencyThresholds = [
        { minutes: 30, level: 'HIGH', triggered: alertTriggered.high },
        { minutes: 45, level: 'URGENT', triggered: alertTriggered.urgent },
        { minutes: 60, level: 'EMERGENCY', triggered: alertTriggered.emergency }
      ]

      urgencyThresholds.forEach(({ minutes, level, triggered }) => {
        if (elapsedMinutes >= minutes && !triggered && onUrgencyAlert) {
          onUrgencyAlert(order.orderId, level)
          setAlertTriggered(prev => ({ ...prev, [level.toLowerCase()]: true }))
        }
      })
    }

    const interval = setInterval(checkUrgency, 30000) // Check every 30 seconds
    checkUrgency() // Check immediately

    return () => clearInterval(interval)
  }, [order.orderId, order.orderTime, onUrgencyAlert, alertTriggered])

  const elapsedMinutes = Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60))
  
  if (elapsedMinutes < 20) return null

  const urgencyConfig = {
    color: elapsedMinutes >= 60 ? 'bg-red-500 text-white animate-pulse' :
           elapsedMinutes >= 45 ? 'bg-orange-500 text-white' :
           elapsedMinutes >= 30 ? 'bg-yellow-500 text-black' :
           'bg-blue-500 text-white',
    icon: elapsedMinutes >= 60 ? '🚨' :
          elapsedMinutes >= 45 ? '⚠️' :
          elapsedMinutes >= 30 ? '⏰' : '🕐'
  }

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold
      ${urgencyConfig.color} ${className}
    `.trim()}>
      <span role="img" aria-label="urgency">
        {urgencyConfig.icon}
      </span>
      <span>已等待 {elapsedMinutes} 分鐘</span>
    </div>
  )
}

export default OrderTimer