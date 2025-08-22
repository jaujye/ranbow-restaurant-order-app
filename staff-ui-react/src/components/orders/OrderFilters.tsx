/**
 * 🔍 Order Filters Component
 * Advanced filtering system for order management
 */

import React, { useState } from 'react'
import { OrderStatus, OrderPriority, OrderSource, StaffOrderFilters, StaffOrder } from '@/types/orders'
import { useAuthStore } from '@/store/authStore'

interface OrderFiltersProps {
  filters: StaffOrderFilters
  orderCounts?: Record<OrderStatus, number>
  onFiltersChange: (filters: StaffOrderFilters) => void
  onClearFilters: () => void
  className?: string
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  orderCounts = {},
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const { user } = useAuthStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<StaffOrderFilters>(filters)

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  // Reset to default filters
  const resetFilters = () => {
    const defaultFilters: StaffOrderFilters = {}
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onClearFilters()
  }

  // Update local filter state
  const updateFilter = <K extends keyof StaffOrderFilters>(
    key: K,
    value: StaffOrderFilters[K]
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Toggle array filter values
  const toggleArrayFilter = <T extends string>(
    filterKey: keyof StaffOrderFilters,
    value: T,
    currentArray: T[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(filterKey as keyof StaffOrderFilters, newArray.length > 0 ? newArray : undefined)
  }

  // Status filter options
  const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'PENDING', label: '待處理', color: 'bg-blue-100 text-blue-800' },
    { value: 'CONFIRMED', label: '已確認', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'PROCESSING', label: '處理中', color: 'bg-orange-100 text-orange-800' },
    { value: 'PREPARING', label: '製作中', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'READY', label: '準備完成', color: 'bg-green-100 text-green-800' },
    { value: 'DELIVERED', label: '已送達', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'COMPLETED', label: '已完成', color: 'bg-slate-100 text-slate-800' },
    { value: 'CANCELLED', label: '已取消', color: 'bg-red-100 text-red-800' }
  ]

  // Priority filter options
  const priorityOptions: { value: OrderPriority; label: string; color: string }[] = [
    { value: 'NORMAL', label: '一般', color: 'bg-gray-100 text-gray-800' },
    { value: 'HIGH', label: '高優先', color: 'bg-orange-100 text-orange-800' },
    { value: 'URGENT', label: '緊急', color: 'bg-red-100 text-red-800' }
  ]

  // Urgency level options
  const urgencyOptions: { value: StaffOrder['urgencyLevel']; label: string; color: string }[] = [
    { value: 'LOW', label: '低', color: 'bg-gray-100 text-gray-600' },
    { value: 'NORMAL', label: '正常', color: 'bg-blue-100 text-blue-800' },
    { value: 'HIGH', label: '高', color: 'bg-orange-100 text-orange-800' },
    { value: 'URGENT', label: '緊急', color: 'bg-red-100 text-red-800' },
    { value: 'EMERGENCY', label: '極緊急', color: 'bg-red-200 text-red-900' }
  ]

  // Order source options
  const sourceOptions: { value: OrderSource; label: string }[] = [
    { value: 'DINE_IN', label: '內用' },
    { value: 'TAKEAWAY', label: '外帶' },
    { value: 'DELIVERY', label: '外送' },
    { value: 'ONLINE', label: '線上訂餐' },
    { value: 'APP', label: '手機App' }
  ]

  // Count active filters
  const activeFilterCount = Object.entries(localFilters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`.trim()}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">篩選條件</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {activeFilterCount} 個已套用
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? '收起' : '展開'}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              清除全部
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Status Quick Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">狀態:</span>
            {statusOptions.slice(0, 4).map(option => {
              const isActive = localFilters.status?.includes(option.value) || false
              const count = orderCounts[option.value] || 0
              
              return (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter('status', option.value, localFilters.status)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
                    ${isActive 
                      ? `${option.color} border-current shadow-md` 
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                    }
                  `.trim()}
                >
                  {option.label}
                  {count > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      ({count})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Action Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* My Orders */}
          <button
            onClick={() => updateFilter('isAssignedToMe', !localFilters.isAssignedToMe)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${localFilters.isAssignedToMe
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }
            `.trim()}
          >
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span>我的訂單</span>
            </div>
          </button>

          {/* Overdue Orders */}
          <button
            onClick={() => updateFilter('isOverdue', !localFilters.isOverdue)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${localFilters.isOverdue
                ? 'bg-red-50 text-red-800 border-red-300'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }
            `.trim()}
          >
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>超時訂單</span>
            </div>
          </button>

          {/* Delayed Orders */}
          <button
            onClick={() => updateFilter('isDelayed', !localFilters.isDelayed)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${localFilters.isDelayed
                ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }
            `.trim()}
          >
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>延遲訂單</span>
            </div>
          </button>

          {/* Special Requests */}
          <button
            onClick={() => updateFilter('hasSpecialRequests', !localFilters.hasSpecialRequests)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${localFilters.hasSpecialRequests
                ? 'bg-orange-50 text-orange-800 border-orange-300'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }
            `.trim()}
          >
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>特殊需求</span>
            </div>
          </button>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Priority Filters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">優先級別</h4>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(option => {
                const isActive = localFilters.priority?.includes(option.value) || false
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('priority', option.value, localFilters.priority)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                      ${isActive 
                        ? `${option.color} border-current shadow-md` 
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                      }
                    `.trim()}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">急迫程度</h4>
            <div className="flex flex-wrap gap-2">
              {urgencyOptions.map(option => {
                const isActive = localFilters.urgencyLevel?.includes(option.value) || false
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('urgencyLevel', option.value, localFilters.urgencyLevel)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                      ${isActive 
                        ? `${option.color} border-current shadow-md` 
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                      }
                    `.trim()}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Order Source */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">訂單來源</h4>
            <div className="flex flex-wrap gap-2">
              {sourceOptions.map(option => {
                const isActive = localFilters.orderSource?.includes(option.value) || false
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('orderSource', option.value, localFilters.orderSource)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-md' 
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                      }
                    `.trim()}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table Number Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">桌號</h4>
            <input
              type="text"
              placeholder="輸入桌號或桌號範圍 (例如: 1, 3-5, 10)"
              value={localFilters.tableNumber || ''}
              onChange={(e) => updateFilter('tableNumber', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Amount Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">訂單金額</h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="最低金額"
                value={localFilters.minAmount || ''}
                onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">到</span>
              <input
                type="number"
                placeholder="最高金額"
                value={localFilters.maxAmount || ''}
                onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Time Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">等待時間 (分鐘)</h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="最短等待"
                value={localFilters.estimatedTimeRange?.min || ''}
                onChange={(e) => updateFilter('estimatedTimeRange', {
                  ...localFilters.estimatedTimeRange,
                  min: e.target.value ? Number(e.target.value) : undefined
                } as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">到</span>
              <input
                type="number"
                placeholder="最長等待"
                value={localFilters.estimatedTimeRange?.max || ''}
                onChange={(e) => updateFilter('estimatedTimeRange', {
                  ...localFilters.estimatedTimeRange,
                  max: e.target.value ? Number(e.target.value) : undefined
                } as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">其他條件</h4>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hasAllergyWarnings || false}
                  onChange={(e) => updateFilter('hasAllergyWarnings', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">有過敏警告</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hasSpecialRequests || false}
                  onChange={(e) => updateFilter('hasSpecialRequests', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">有特殊需求</span>
              </label>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              設定篩選條件後點擊套用
            </span>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              套用篩選
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderFilters