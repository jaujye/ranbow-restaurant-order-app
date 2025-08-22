/**
 * 📋 Order Queue Component
 * Main order management interface with filtering, sorting, and bulk operations
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  StaffOrder, 
  OrderStatus, 
  OrderSortField, 
  StaffOrderFilters,
  OrderSelectionState,
  BulkActionType,
  BulkOperationResult
} from '@/types/orders'
import { useOrderStore, useOrderActions } from '@/store/orderStore'
import { useAuthStore } from '@/store/authStore'
import OrderCard from './OrderCard'
import OrderFilters from './OrderFilters'
import OrderActions from './OrderActions'
import OrderDetails from './OrderDetails'

interface OrderQueueProps {
  className?: string
}

export const OrderQueue: React.FC<OrderQueueProps> = ({ className = '' }) => {
  const { user } = useAuthStore()
  const { 
    orders, 
    loading, 
    error, 
    filters, 
    searchQuery, 
    sortBy, 
    sortOrder, 
    selectedOrder 
  } = useOrderStore()
  
  const {
    fetchOrders,
    updateOrderStatus,
    assignOrder,
    setFilters,
    setSearchQuery,
    setSorting,
    setSelectedOrder,
    clearFilters
  } = useOrderActions()

  // Local state
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list')
  const [selectionState, setSelectionState] = useState<OrderSelectionState>({
    selectedOrderIds: [],
    isAllSelected: false,
    selectionMode: false,
    lastSelectedOrderId: undefined
  })
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [showActions, setShowActions] = useState(true)

  // Auto-refresh orders
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Transform orders to StaffOrder format
  const staffOrders: StaffOrder[] = useMemo(() => {
    return orders.map(order => ({
      ...order,
      canAccept: order.status === 'PENDING' || order.status === 'CONFIRMED',
      canReject: order.status === 'PENDING',
      canAssignToSelf: !order.assignedStaff && user ? true : false,
      canStartCooking: order.status === 'CONFIRMED' || order.status === 'PROCESSING',
      canMarkReady: order.status === 'PREPARING',
      canComplete: order.status === 'READY' || order.status === 'DELIVERED',
      urgencyLevel: order.isOverdue ? 'EMERGENCY' as const : 
                   order.priority === 'URGENT' ? 'URGENT' as const :
                   order.priority === 'HIGH' ? 'HIGH' as const :
                   'NORMAL' as const,
      estimatedRemainingTime: order.estimatedCompleteTime ? 
        Math.max(0, Math.floor((order.estimatedCompleteTime.getTime() - Date.now()) / (1000 * 60))) : 0,
      actualWaitTime: Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60)),
      delayedMinutes: order.isOverdue ? order.overdueMinutes : 0,
      staffNotes: [],
      lastUpdateBy: order.assignedStaff,
      lastUpdateTime: order.actualCompleteTime || new Date(),
      priorityReason: order.priority !== 'NORMAL' ? '高優先級訂單' : undefined,
      customerPreferences: [],
      allergyWarnings: []
    }))
  }, [orders, user])

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = staffOrders

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.tableNumber.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(order => filters.status!.includes(order.status))
    }
    
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(order => filters.priority!.includes(order.priority))
    }
    
    if (filters.isAssignedToMe && user) {
      filtered = filtered.filter(order => order.assignedStaff === user.staffId)
    }
    
    if (filters.isOverdue) {
      filtered = filtered.filter(order => order.isOverdue)
    }
    
    if (filters.isDelayed) {
      filtered = filtered.filter(order => order.delayedMinutes > 0)
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'orderTime':
          aValue = a.orderTime.getTime()
          bValue = b.orderTime.getTime()
          break
        case 'priority':
          const priorityOrder = { 'URGENT': 3, 'HIGH': 2, 'NORMAL': 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'tableNumber':
          aValue = parseInt(a.tableNumber) || 0
          bValue = parseInt(b.tableNumber) || 0
          break
        case 'totalAmount':
          aValue = a.totalAmount
          bValue = b.totalAmount
          break
        default:
          return 0
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [staffOrders, searchQuery, filters, sortBy, sortOrder, user])

  // Get selected orders
  const selectedOrders = useMemo(() => {
    return filteredAndSortedOrders.filter(order => 
      selectionState.selectedOrderIds.includes(order.orderId)
    )
  }, [filteredAndSortedOrders, selectionState.selectedOrderIds])

  // Count orders by status
  const orderCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      PENDING: 0, CONFIRMED: 0, PROCESSING: 0, PREPARING: 0,
      READY: 0, DELIVERED: 0, COMPLETED: 0, CANCELLED: 0, REFUNDED: 0
    }
    
    staffOrders.forEach(order => {
      counts[order.status]++
    })
    
    return counts
  }, [staffOrders])

  // Handle order selection
  const handleOrderSelect = useCallback((orderId: number, isSelected: boolean) => {
    setSelectionState(prev => {
      const newSelectedIds = isSelected
        ? [...prev.selectedOrderIds, orderId]
        : prev.selectedOrderIds.filter(id => id !== orderId)

      return {
        ...prev,
        selectedOrderIds: newSelectedIds,
        isAllSelected: newSelectedIds.length === filteredAndSortedOrders.length,
        lastSelectedOrderId: orderId
      }
    })
  }, [filteredAndSortedOrders.length])

  // Handle select all
  const handleSelectAll = useCallback(() => {
    setSelectionState(prev => {
      if (prev.isAllSelected) {
        return {
          ...prev,
          selectedOrderIds: [],
          isAllSelected: false
        }
      } else {
        return {
          ...prev,
          selectedOrderIds: filteredAndSortedOrders.map(order => order.orderId),
          isAllSelected: true
        }
      }
    })
  }, [filteredAndSortedOrders])

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedOrderIds: [],
      isAllSelected: false
    }))
  }, [])

  // Handle order status update
  const handleStatusUpdate = useCallback(async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }, [updateOrderStatus])

  // Handle assign to self
  const handleAssignToSelf = useCallback(async (orderId: number) => {
    if (!user) return
    
    try {
      await assignOrder(orderId, user.staffId)
    } catch (error) {
      console.error('Failed to assign order:', error)
    }
  }, [assignOrder, user])

  // Handle start cooking
  const handleStartCooking = useCallback(async (orderId: number) => {
    try {
      await updateOrderStatus(orderId, 'PREPARING')
    } catch (error) {
      console.error('Failed to start cooking:', error)
    }
  }, [updateOrderStatus])

  // Handle bulk action
  const handleBulkAction = useCallback(async (
    action: BulkActionType, 
    options?: any
  ): Promise<BulkOperationResult> => {
    try {
      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (const order of selectedOrders) {
        try {
          switch (action) {
            case 'ASSIGN_TO_SELF':
              if (user && order.canAssignToSelf) {
                await assignOrder(order.orderId, user.staffId)
                successCount++
              } else {
                failedCount++
                errors.push(`訂單 ${order.orderNumber}: 無法指派`)
              }
              break
            
            case 'UPDATE_STATUS':
              if (options?.newStatus) {
                await updateOrderStatus(order.orderId, options.newStatus, options.note)
                successCount++
              } else {
                failedCount++
                errors.push(`訂單 ${order.orderNumber}: 未指定狀態`)
              }
              break
            
            case 'PRINT_ORDERS':
              // Implement print functionality
              console.log('Printing order:', order.orderNumber)
              successCount++
              break
            
            case 'EXPORT_TO_CSV':
              // Implement CSV export functionality
              console.log('Exporting order to CSV:', order.orderNumber)
              successCount++
              break
            
            default:
              failedCount++
              errors.push(`不支援的操作: ${action}`)
          }
        } catch (error) {
          failedCount++
          errors.push(`訂單 ${order.orderNumber}: ${error instanceof Error ? error.message : '未知錯誤'}`)
        }
      }

      return {
        success: successCount > 0,
        processedCount: successCount,
        failedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `成功處理 ${successCount} 個訂單${failedCount > 0 ? `，${failedCount} 個失敗` : ''}`
      }
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        failedCount: selectedOrders.length,
        errors: [error instanceof Error ? error.message : '批量操作失敗'],
        message: '批量操作失敗'
      }
    }
  }, [selectedOrders, user, assignOrder, updateOrderStatus])

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              訂單管理佇列
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              共 {filteredAndSortedOrders.length} 個訂單
              {searchQuery && ` (搜尋: "${searchQuery}")`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { mode: 'list', icon: '☰', label: '清單' },
                { mode: 'grid', icon: '⊞', label: '網格' },
                { mode: 'kanban', icon: '📊', label: '看板' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
                    ${viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `.trim()}
                  title={label}
                >
                  <span className="mr-1">{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '刷新中...' : '🔄 刷新'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜尋訂單編號、桌號或客戶姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600 font-medium">排序依據:</label>
          <select
            value={sortBy}
            onChange={(e) => setSorting(e.target.value as OrderSortField, sortOrder)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="orderTime">下單時間</option>
            <option value="priority">優先級別</option>
            <option value="status">訂單狀態</option>
            <option value="tableNumber">桌號</option>
            <option value="totalAmount">訂單金額</option>
          </select>
          
          <button
            onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑ 升序' : '↓ 降序'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <OrderFilters
          filters={filters}
          orderCounts={orderCounts}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Bulk Actions */}
      {showActions && (
        <OrderActions
          selectedOrders={selectedOrders}
          selectionState={selectionState}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkAction={handleBulkAction}
          totalOrdersCount={filteredAndSortedOrders.length}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span className="text-red-800 font-medium">載入錯誤</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            重試
          </button>
        </div>
      )}

      {/* Order List */}
      <div className="space-y-4">
        {loading && filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p>載入訂單中...</p>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-lg font-medium mb-2">沒有找到符合條件的訂單</p>
            <p className="text-sm">請調整篩選條件或搜尋關鍵字</p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                清除篩選條件
              </button>
            )}
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}
          `.trim()}>
            {filteredAndSortedOrders.map(order => (
              <div key={order.orderId} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectionState.selectedOrderIds.includes(order.orderId)}
                    onChange={(e) => handleOrderSelect(order.orderId, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <OrderCard
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onAssignToSelf={handleAssignToSelf}
                  onStartCooking={handleStartCooking}
                  isSelected={selectionState.selectedOrderIds.includes(order.orderId)}
                  showQuickActions={true}
                  variant={viewMode === 'grid' ? 'compact' : 'standard'}
                />

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedOrderId(
                    expandedOrderId === order.orderId ? null : order.orderId
                  )}
                  className="absolute bottom-4 right-4 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  {expandedOrderId === order.orderId ? '收起' : '詳情'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Order Details */}
      {expandedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <OrderDetails
              order={staffOrders.find(o => o.orderId === expandedOrderId)!}
              isExpanded={true}
              onToggle={() => setExpandedOrderId(null)}
              onStatusUpdate={handleStatusUpdate}
            />
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setExpandedOrderId(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                關閉詳情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderQueue