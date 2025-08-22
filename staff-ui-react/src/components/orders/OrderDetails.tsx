/**
 * 📋 Order Details Component
 * Expandable detailed view of order information
 */

import React, { useState } from 'react'
import { StaffOrder, OrderHistoryEntry, OrderStatus, CookingTimer } from '@/types/orders'
import { OrderTimer } from './OrderTimer'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderPriority } from './OrderPriority'

interface OrderDetailsProps {
  order: StaffOrder
  history?: OrderHistoryEntry[]
  cookingTimers?: CookingTimer[]
  onStatusUpdate?: (orderId: number, newStatus: OrderStatus, note?: string) => Promise<boolean>
  onAddNote?: (orderId: number, note: string) => Promise<boolean>
  onStartTimer?: (orderId: number, estimatedMinutes: number) => Promise<boolean>
  onUpdateEstimation?: (orderId: number, estimatedTime: Date) => Promise<boolean>
  isExpanded?: boolean
  onToggle?: () => void
  className?: string
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  history = [],
  cookingTimers = [],
  onStatusUpdate,
  onAddNote,
  onStartTimer,
  onUpdateEstimation,
  isExpanded = false,
  onToggle,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'timeline' | 'notes' | 'kitchen'>('items')
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [isStartingTimer, setIsStartingTimer] = useState(false)

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format date time
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return
    
    setIsAddingNote(true)
    try {
      await onAddNote(order.orderId, newNote.trim())
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }

  // Handle start timer
  const handleStartTimer = async () => {
    if (!onStartTimer) return
    
    setIsStartingTimer(true)
    try {
      await onStartTimer(order.orderId, estimatedMinutes)
    } catch (error) {
      console.error('Failed to start timer:', error)
    } finally {
      setIsStartingTimer(false)
    }
  }

  // Get active cooking timers for this order
  const activeTimers = cookingTimers.filter(timer => 
    timer.orderId === order.orderId && timer.status === 'RUNNING'
  )

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`.trim()}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Order Title */}
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-mono font-bold text-2xl text-gray-900">
                訂單 #{order.orderNumber}
              </h2>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                桌號 {order.tableNumber}
              </div>
            </div>

            {/* Status & Priority */}
            <div className="flex items-center gap-4 mb-3">
              <OrderStatusBadge status={order.status} size="lg" />
              <OrderPriority 
                priority={order.priority} 
                urgencyLevel={order.urgencyLevel} 
                variant="full" 
              />
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {order.customerName && (
                <div>
                  <span className="text-gray-600">客戶:</span>
                  <span className="font-semibold ml-2">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <span className="text-gray-600">電話:</span>
                  <span className="font-mono ml-2">{order.customerPhone}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">來源:</span>
                <span className="ml-2">
                  {order.source === 'DINE_IN' ? '內用' : 
                   order.source === 'TAKEAWAY' ? '外帶' : 
                   order.source === 'DELIVERY' ? '外送' : '線上訂餐'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">付款狀態:</span>
                <span className={`ml-2 font-semibold ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' : 
                  order.paymentStatus === 'PENDING' ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {order.paymentStatus === 'PAID' ? '已付款' : 
                   order.paymentStatus === 'PENDING' ? '待付款' : 
                   order.paymentStatus === 'PROCESSING' ? '處理中' :
                   order.paymentStatus === 'FAILED' ? '付款失敗' : '已退款'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount & Timer */}
          <div className="text-right">
            <div className="font-bold text-3xl text-gray-900 mb-2">
              {formatCurrency(order.totalAmount)}
            </div>
            <OrderTimer 
              order={order}
              variant="detailed"
              showElapsed={true}
              showRemaining={true}
              showProgress={true}
            />
          </div>
        </div>

        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>
              {isExpanded ? '收起詳細資訊' : '展開詳細資訊'}
            </span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'items', label: '訂單項目', icon: '🍽️' },
                { id: 'timeline', label: '處理時程', icon: '⏰' },
                { id: 'notes', label: '備註管理', icon: '📝' },
                { id: 'kitchen', label: '廚房資訊', icon: '👨‍🍳' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `.trim()}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  訂單項目 ({order.items.length} 項)
                </h3>
                
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${item.itemId}-${index}`} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {item.name}
                          </h4>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">數量:</span>
                              <span className="ml-2 font-mono">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="font-medium">單價:</span>
                              <span className="ml-2 font-mono">{formatCurrency(item.unitPrice)}</span>
                            </div>
                            <div>
                              <span className="font-medium">小計:</span>
                              <span className="ml-2 font-mono font-semibold">{formatCurrency(item.totalPrice)}</span>
                            </div>
                            <div>
                              <span className="font-medium">製作時間:</span>
                              <span className="ml-2">{item.preparationTime} 分鐘</span>
                            </div>
                          </div>

                          {item.specialRequests && (
                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-600 font-medium">特殊要求:</span>
                              </div>
                              <p className="text-sm text-yellow-800">
                                {item.specialRequests}
                              </p>
                            </div>
                          )}

                          {item.notes && (
                            <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <span className="font-medium">備註:</span> {item.notes}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <OrderStatusBadge status={item.status} size="sm" />
                          {item.assignedChef && (
                            <div className="mt-2 text-xs text-gray-600">
                              製作人員: {item.assignedChef}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">訂單總計:</span>
                    <span className="font-bold text-xl text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    總項目數: {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  處理時程
                </h3>

                {/* Order Timeline */}
                <div className="space-y-4">
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {entry.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(entry.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            操作人員: {entry.staffName}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {entry.notes}
                            </p>
                          )}
                          {entry.previousValue && entry.newValue && (
                            <p className="text-xs text-gray-400 mt-1">
                              {entry.previousValue} → {entry.newValue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <p>暫無處理記錄</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">
                    備註管理
                  </h3>
                </div>

                {/* Add New Note */}
                {onAddNote && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">新增員工備註</h4>
                    <div className="space-y-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="輸入備註內容..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || isAddingNote}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingNote ? '新增中...' : '新增備註'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Notes */}
                <div className="space-y-3">
                  {/* Staff Notes */}
                  {order.staffNotes && order.staffNotes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">員工備註</h4>
                      {order.staffNotes.map((note, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">特殊指示</h4>
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
                      <h4 className="font-medium text-gray-900 mb-2">過敏警告</h4>
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

                  {/* Customer Preferences */}
                  {order.customerPreferences && order.customerPreferences.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">客戶偏好</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {order.customerPreferences.map((preference, index) => (
                            <span key={index} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                              {preference}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kitchen Tab */}
            {activeTab === 'kitchen' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg text-gray-900">
                  廚房資訊
                </h3>

                {/* Cooking Timers */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">製作計時器</h4>
                  {activeTimers.length > 0 ? (
                    <div className="space-y-3">
                      {activeTimers.map(timer => (
                        <div key={timer.timerId} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-orange-800">
                                計時器 #{timer.timerId.split('-').pop()}
                              </div>
                              <div className="text-sm text-orange-600 mt-1">
                                預估時間: {Math.round(timer.estimatedDuration / 60)} 分鐘
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-mono font-bold text-orange-800">
                                {Math.floor((Date.now() - timer.startTime.getTime()) / (1000 * 60))} 分鐘
                              </div>
                              <div className="text-xs text-orange-600">
                                已經過時間
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-2xl mb-2">⏲️</div>
                      <p>目前沒有進行中的計時器</p>
                      
                      {onStartTimer && order.canStartCooking && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">啟動製作計時器</h5>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={estimatedMinutes}
                              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                              min="1"
                              max="180"
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-sm text-gray-600">分鐘</span>
                            <button
                              onClick={handleStartTimer}
                              disabled={isStartingTimer}
                              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isStartingTimer ? '啟動中...' : '開始計時'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Assigned Staff */}
                {order.assignedStaff && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">指派人員</h4>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">👨‍🍳</span>
                        <span className="font-medium text-green-800">
                          {order.assignedStaff}
                        </span>
                      </div>
                      {order.lastUpdateTime && (
                        <div className="text-xs text-green-600 mt-1">
                          最後更新: {formatDateTime(order.lastUpdateTime)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Estimated Completion */}
                {order.estimatedCompleteTime && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">預估完成時間</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-800">
                        {formatDateTime(order.estimatedCompleteTime)}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        剩餘時間: {order.estimatedRemainingTime} 分鐘
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetails