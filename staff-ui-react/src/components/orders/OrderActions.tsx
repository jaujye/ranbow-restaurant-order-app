/**
 * 🎛️ Order Actions Component
 * Bulk operations and order management actions
 */

import React, { useState } from 'react'
import { 
  BulkActionType, 
  BulkOperationResult, 
  StaffOrder, 
  OrderStatus, 
  OrderPriority,
  OrderSelectionState 
} from '@/types/orders'
import { useAuthStore } from '@/store/authStore'

interface OrderActionsProps {
  selectedOrders: StaffOrder[]
  selectionState: OrderSelectionState
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkAction: (action: BulkActionType, options?: any) => Promise<BulkOperationResult>
  totalOrdersCount: number
  className?: string
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  selectedOrders,
  selectionState,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  totalOrdersCount,
  className = ''
}) => {
  const { user } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPriorityModal, setShowPriorityModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [actionResult, setActionResult] = useState<BulkOperationResult | null>(null)

  const selectedCount = selectedOrders.length

  // Handle bulk action execution
  const executeBulkAction = async (action: BulkActionType, options?: any) => {
    if (selectedCount === 0 || isProcessing) return

    setIsProcessing(true)
    try {
      const result = await onBulkAction(action, options)
      setActionResult(result)
      
      // Auto-clear result after 3 seconds
      setTimeout(() => setActionResult(null), 3000)
      
      // Clear selection if successful
      if (result.success) {
        onClearSelection()
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      setActionResult({
        success: false,
        processedCount: 0,
        failedCount: selectedCount,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: '操作失敗'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Get available actions based on selected orders
  const getAvailableActions = (): Array<{ 
    action: BulkActionType; 
    label: string; 
    icon: string; 
    color: string;
    description: string;
  }> => {
    const actions = []

    // Assign to self - available if user has permission and orders can be assigned
    const canAssignToSelf = selectedOrders.some(order => order.canAssignToSelf)
    if (canAssignToSelf && user) {
      actions.push({
        action: 'ASSIGN_TO_SELF' as BulkActionType,
        label: '接手訂單',
        icon: '👤',
        color: 'bg-blue-500 hover:bg-blue-600',
        description: `將 ${selectedCount} 個訂單指派給自己`
      })
    }

    // Update status - available if orders have common next status
    actions.push({
      action: 'UPDATE_STATUS' as BulkActionType,
      label: '變更狀態',
      icon: '🔄',
      color: 'bg-green-500 hover:bg-green-600',
      description: `批量更新 ${selectedCount} 個訂單的狀態`
    })

    // Set priority - always available
    actions.push({
      action: 'SET_PRIORITY' as BulkActionType,
      label: '設定優先級',
      icon: '⭐',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: `設定 ${selectedCount} 個訂單的優先級`
    })

    // Add note - always available
    actions.push({
      action: 'ADD_NOTE' as BulkActionType,
      label: '新增備註',
      icon: '📝',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: `為 ${selectedCount} 個訂單新增員工備註`
    })

    // Print orders - always available
    actions.push({
      action: 'PRINT_ORDERS' as BulkActionType,
      label: '列印訂單',
      icon: '🖨️',
      color: 'bg-gray-500 hover:bg-gray-600',
      description: `列印 ${selectedCount} 個訂單詳細資訊`
    })

    // Export - always available
    actions.push({
      action: 'EXPORT_TO_CSV' as BulkActionType,
      label: '匯出CSV',
      icon: '📊',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: `匯出 ${selectedCount} 個訂單至CSV檔案`
    })

    return actions
  }

  const availableActions = getAvailableActions()

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`.trim()}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">批量操作</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            已選取 {selectedCount} / {totalOrdersCount}
          </span>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            disabled={isProcessing}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            {selectionState.isAllSelected ? '取消全選' : '全選'}
          </button>
          
          {selectedCount > 0 && (
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              清除選取
            </button>
          )}
        </div>
      </div>

      {/* Action Result Display */}
      {actionResult && (
        <div className={`
          p-3 border-b border-gray-200
          ${actionResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `.trim()}>
          <div className="flex items-center gap-2">
            <span>
              {actionResult.success ? '✅' : '❌'}
            </span>
            <span className="font-medium">
              {actionResult.message}
            </span>
          </div>
          <div className="text-sm mt-1">
            成功: {actionResult.processedCount} | 失敗: {actionResult.failedCount}
          </div>
          {actionResult.errors && actionResult.errors.length > 0 && (
            <div className="text-xs mt-2 space-y-1">
              {actionResult.errors.map((error, index) => (
                <div key={index} className="text-red-600">
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4">
        {selectedCount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👆</div>
            <p>請先選擇要操作的訂單</p>
            <p className="text-sm mt-1">可以點擊訂單卡片左上角的勾選框</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {availableActions.map(({ action, label, icon, color, description }) => (
              <button
                key={action}
                onClick={() => {
                  switch (action) {
                    case 'UPDATE_STATUS':
                      setShowStatusModal(true)
                      break
                    case 'SET_PRIORITY':
                      setShowPriorityModal(true)
                      break
                    case 'ADD_NOTE':
                      setShowNoteModal(true)
                      break
                    default:
                      executeBulkAction(action)
                  }
                }}
                disabled={isProcessing}
                className={`
                  p-4 rounded-lg text-white font-medium transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  ${color}
                `.trim()}
                title={description}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm">{label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-800 font-medium">處理中...</span>
          </div>
        )}

        {/* Selected Orders Summary */}
        {selectedCount > 0 && !isProcessing && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">已選取訂單摘要:</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">總金額:</span>
                <span className="font-mono font-semibold ml-1">
                  ${selectedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">平均等待:</span>
                <span className="font-mono font-semibold ml-1">
                  {Math.round(selectedOrders.reduce((sum, order) => sum + order.actualWaitTime, 0) / selectedCount)} 分鐘
                </span>
              </div>
              <div>
                <span className="text-gray-600">緊急訂單:</span>
                <span className="font-mono font-semibold ml-1 text-red-600">
                  {selectedOrders.filter(order => order.urgencyLevel === 'URGENT' || order.urgencyLevel === 'EMERGENCY').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">超時訂單:</span>
                <span className="font-mono font-semibold ml-1 text-orange-600">
                  {selectedOrders.filter(order => order.isOverdue).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal
          selectedOrders={selectedOrders}
          onConfirm={(status, note) => {
            executeBulkAction('UPDATE_STATUS', { newStatus: status, note })
            setShowStatusModal(false)
          }}
          onCancel={() => setShowStatusModal(false)}
        />
      )}

      {/* Priority Update Modal */}
      {showPriorityModal && (
        <PriorityUpdateModal
          selectedOrders={selectedOrders}
          onConfirm={(priority, reason) => {
            executeBulkAction('SET_PRIORITY', { newPriority: priority, reason })
            setShowPriorityModal(false)
          }}
          onCancel={() => setShowPriorityModal(false)}
        />
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          selectedOrders={selectedOrders}
          onConfirm={(note) => {
            executeBulkAction('ADD_NOTE', { note })
            setShowNoteModal(false)
          }}
          onCancel={() => setShowNoteModal(false)}
        />
      )}
    </div>
  )
}

// Status Update Modal
interface StatusUpdateModalProps {
  selectedOrders: StaffOrder[]
  onConfirm: (status: OrderStatus, note?: string) => void
  onCancel: () => void
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ selectedOrders, onConfirm, onCancel }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PROCESSING')
  const [note, setNote] = useState('')

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'CONFIRMED', label: '已確認' },
    { value: 'PROCESSING', label: '處理中' },
    { value: 'PREPARING', label: '製作中' },
    { value: 'READY', label: '準備完成' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'CANCELLED', label: '已取消' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            批量更新狀態
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            將 {selectedOrders.length} 個訂單的狀態更新為：
          </p>
          
          <div className="space-y-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <textarea
              placeholder="備註 (選填)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onConfirm(selectedStatus, note || undefined)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              確認更新
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Priority Update Modal
interface PriorityUpdateModalProps {
  selectedOrders: StaffOrder[]
  onConfirm: (priority: OrderPriority, reason?: string) => void
  onCancel: () => void
}

const PriorityUpdateModal: React.FC<PriorityUpdateModalProps> = ({ selectedOrders, onConfirm, onCancel }) => {
  const [selectedPriority, setSelectedPriority] = useState<OrderPriority>('NORMAL')
  const [reason, setReason] = useState('')

  const priorityOptions: { value: OrderPriority; label: string }[] = [
    { value: 'NORMAL', label: '一般' },
    { value: 'HIGH', label: '高優先' },
    { value: 'URGENT', label: '緊急' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            設定優先級
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            將 {selectedOrders.length} 個訂單的優先級設定為：
          </p>
          
          <div className="space-y-4">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as OrderPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {selectedPriority !== 'NORMAL' && (
              <textarea
                placeholder="請說明設定此優先級的原因"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onConfirm(selectedPriority, reason || undefined)}
              className="flex-1 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              確認設定
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Note Modal
interface NoteModalProps {
  selectedOrders: StaffOrder[]
  onConfirm: (note: string) => void
  onCancel: () => void
}

const NoteModal: React.FC<NoteModalProps> = ({ selectedOrders, onConfirm, onCancel }) => {
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            新增員工備註
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            為 {selectedOrders.length} 個訂單新增備註：
          </p>
          
          <textarea
            placeholder="請輸入備註內容"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onConfirm(note)}
              disabled={!note.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              確認新增
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderActions