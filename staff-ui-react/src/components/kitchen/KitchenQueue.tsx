/**
 * 📋 Kitchen Queue Component
 * Advanced queue management with drag-and-drop, priority sorting, and batch operations
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Clock,
  AlertTriangle,
  ChefHat,
  Users,
  Timer,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  GripVertical,
  Zap,
  MapPin
} from 'lucide-react'
import { cn } from '../../utils'
import { 
  useKitchenStore, 
  CookingOrder, 
  CookingStage,
  useKitchenActions,
  useCookingQueue
} from '../../store/kitchenStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StageIndicator, StageProgressSummary } from './StageIndicator'

interface KitchenQueueProps {
  maxHeight?: number
  showFilters?: boolean
  showBatchControls?: boolean
  enableDragDrop?: boolean
  onOrderSelect?: (orderId: number) => void
  className?: string
}

type SortOption = 'PRIORITY' | 'TIME' | 'STATION' | 'WAIT_TIME' | 'STAGE'
type FilterStage = CookingStage | 'ALL'

interface QueueFilters {
  stage: FilterStage
  priority: number | null
  station: string | null
  overdue: boolean
}

export const KitchenQueue: React.FC<KitchenQueueProps> = ({
  maxHeight = 600,
  showFilters = true,
  showBatchControls = true,
  enableDragDrop = true,
  onOrderSelect,
  className
}) => {
  const cookingQueue = useCookingQueue()
  const { 
    reorderQueue, 
    assignToStation, 
    updateOrderPriority, 
    startTimer 
  } = useKitchenActions()

  // Local state
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('PRIORITY')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<QueueFilters>({
    stage: 'ALL',
    priority: null,
    station: null,
    overdue: false
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Calculate queue statistics
  const queueStats = useMemo(() => {
    const total = cookingQueue.length
    const overdue = cookingQueue.filter(order => 
      order.waitTime > order.estimatedTime
    ).length
    const highPriority = cookingQueue.filter(order => order.priority >= 4).length
    const avgWaitTime = total > 0 
      ? cookingQueue.reduce((acc, order) => acc + order.waitTime, 0) / total 
      : 0

    return { total, overdue, highPriority, avgWaitTime }
  }, [cookingQueue])

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = cookingQueue.filter(order => {
      if (filters.stage !== 'ALL' && order.stage !== filters.stage) return false
      if (filters.priority !== null && order.priority < filters.priority) return false
      if (filters.station && order.assignedStation !== filters.station) return false
      if (filters.overdue && order.waitTime <= order.estimatedTime) return false
      return true
    })

    return filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'PRIORITY':
          comparison = b.priority - a.priority
          break
        case 'TIME':
          comparison = a.estimatedTime - b.estimatedTime
          break
        case 'WAIT_TIME':
          comparison = b.waitTime - a.waitTime
          break
        case 'STATION':
          comparison = (a.assignedStation || '').localeCompare(b.assignedStation || '')
          break
        case 'STAGE':
          const stageOrder = { 'PREP': 0, 'COOKING': 1, 'PLATING': 2, 'READY': 3 }
          comparison = stageOrder[a.stage] - stageOrder[b.stage]
          break
        default:
          comparison = 0
      }

      return sortDirection === 'desc' ? comparison : -comparison
    })
  }, [cookingQueue, filters, sortBy, sortDirection])

  // Handle drag and drop reorder
  const handleReorder = useCallback((newOrder: CookingOrder[]) => {
    if (!enableDragDrop) return
    
    newOrder.forEach((order, index) => {
      const currentIndex = cookingQueue.findIndex(o => o.id === order.id)
      if (currentIndex !== index) {
        reorderQueue(order.id, index)
      }
    })
  }, [cookingQueue, reorderQueue, enableDragDrop])

  // Selection handlers
  const toggleOrderSelection = useCallback((orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }, [])

  const selectAllOrders = useCallback(() => {
    setSelectedOrders(filteredAndSortedOrders.map(order => order.id))
  }, [filteredAndSortedOrders])

  const clearSelection = useCallback(() => {
    setSelectedOrders([])
  }, [])

  // Batch operations
  const handleBatchStart = useCallback(() => {
    selectedOrders.forEach(orderId => {
      const order = cookingQueue.find(o => o.id === orderId)
      if (order) {
        startTimer(orderId, order.estimatedTime)
      }
    })
    clearSelection()
  }, [selectedOrders, cookingQueue, startTimer, clearSelection])

  const handleBatchPriorityUpdate = useCallback((priority: number) => {
    selectedOrders.forEach(orderId => {
      updateOrderPriority(orderId, priority)
    })
    clearSelection()
  }, [selectedOrders, updateOrderPriority, clearSelection])

  // Get priority color
  const getPriorityColor = useCallback((priority: number) => {
    if (priority >= 5) return 'text-red-500'
    if (priority >= 4) return 'text-orange-500'
    if (priority >= 3) return 'text-yellow-500'
    return 'text-green-500'
  }, [])

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }, [])

  // Get estimated completion time
  const getEstimatedCompletion = useCallback((order: CookingOrder) => {
    const now = new Date()
    const completionTime = new Date(now.getTime() + (order.estimatedTime * 1000))
    return completionTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [])

  return (
    <Card className={cn('flex flex-col', className)}>
      {/* Header with Stats */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-800">Kitchen Queue</h2>
            {selectedOrders.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {selectedOrders.length} selected
              </span>
            )}
          </div>
          
          {/* Filter and Sort Controls */}
          {showFilters && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-1"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Queue Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{queueStats.total}</div>
            <div className="text-xs text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{queueStats.overdue}</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{queueStats.highPriority}</div>
            <div className="text-xs text-gray-500">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {formatTime(queueStats.avgWaitTime)}
            </div>
            <div className="text-xs text-gray-500">Avg Wait</div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b bg-gray-50"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    stage: e.target.value as FilterStage 
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Stages</option>
                  <option value="PREP">Preparation</option>
                  <option value="COOKING">Cooking</option>
                  <option value="PLATING">Plating</option>
                  <option value="READY">Ready</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PRIORITY">Priority</option>
                  <option value="TIME">Est. Time</option>
                  <option value="WAIT_TIME">Wait Time</option>
                  <option value="STATION">Station</option>
                  <option value="STAGE">Stage</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.overdue}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      overdue: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show overdue only</span>
                </label>
              </div>
              
              <div className="flex items-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilters({
                    stage: 'ALL',
                    priority: null,
                    station: null,
                    overdue: false
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Controls */}
      {showBatchControls && selectedOrders.length > 0 && (
        <div className="p-3 border-b bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedOrders.length} orders selected
            </span>
            
            <div className="flex gap-1 ml-auto">
              <Button size="sm" onClick={handleBatchStart}>
                <Play className="w-3 h-3 mr-1" />
                Start All
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBatchPriorityUpdate(5)}
              >
                <Star className="w-3 h-3 mr-1" />
                High Priority
              </Button>
              
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div 
        className="flex-1 overflow-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {enableDragDrop ? (
          <Reorder.Group
            axis="y"
            values={filteredAndSortedOrders}
            onReorder={handleReorder}
            className="p-2 space-y-2"
          >
            <AnimatePresence>
              {filteredAndSortedOrders.map((order) => (
                <QueueItem
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  onSelect={() => toggleOrderSelection(order.id)}
                  onOrderClick={onOrderSelect}
                  draggable={enableDragDrop}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <div className="p-2 space-y-2">
            <AnimatePresence>
              {filteredAndSortedOrders.map((order) => (
                <QueueItem
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  onSelect={() => toggleOrderSelection(order.id)}
                  onOrderClick={onOrderSelect}
                  draggable={false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredAndSortedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ChefHat className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No orders in queue</p>
            {queueStats.total > 0 && (
              <p className="text-xs mt-1">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>

      {/* Selection Controls */}
      {filteredAndSortedOrders.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs">
            <Button size="sm" variant="ghost" onClick={selectAllOrders}>
              Select All ({filteredAndSortedOrders.length})
            </Button>
            {selectedOrders.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear Selection
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * 📄 Queue Item Component
 * Individual order item in the queue with drag-and-drop support
 */
const QueueItem: React.FC<{
  order: CookingOrder
  isSelected: boolean
  draggable: boolean
  onSelect: () => void
  onOrderClick?: (orderId: number) => void
}> = ({
  order,
  isSelected,
  draggable,
  onSelect,
  onOrderClick
}) => {
  const isOverdue = order.waitTime > order.estimatedTime
  const progress = Math.min(100, (order.waitTime / order.estimatedTime) * 100)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const ItemContent = (
    <motion.div
      className={cn(
        'relative p-3 rounded-lg border transition-all duration-200 cursor-pointer',
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-gray-300',
        isOverdue && 'ring-2 ring-red-500 bg-red-50 border-red-200',
        'group'
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onOrderClick?.(order.id)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Drag Handle */}
      {draggable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Priority Indicator */}
      {order.priority >= 4 && (
        <div className="absolute top-1 right-8">
          <div className="flex items-center gap-1 px-1 py-0.5 bg-orange-500 text-white text-xs rounded">
            <Zap className="w-3 h-3" />
            <span>HIGH</span>
          </div>
        </div>
      )}

      <div className="ml-8">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              Order #{order.id}
            </span>
            {order.tableNumber && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>Table {order.tableNumber}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium',
              isOverdue ? 'text-red-600' : 'text-gray-600'
            )}>
              {formatTime(order.waitTime)}
            </span>
            <Timer className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Stage Progress */}
        <div className="mb-3">
          <StageProgressSummary
            currentStage={order.stage}
            progress={progress}
            showPercentage={false}
            className="mb-2"
          />
        </div>

        {/* Order Items Summary */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 3).map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-xs rounded"
              >
                {item.quantity}x {item.name}
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                +{order.items.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Est: {formatTime(order.estimatedTime)}</span>
            </div>
            {order.assignedStation && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{order.assignedStation}</span>
              </div>
            )}
          </div>
          
          {isOverdue && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="w-3 h-3" />
              <span>OVERDUE</span>
            </div>
          )}
        </div>

        {/* Special Instructions */}
        {(order.specialInstructions || order.allergies?.length) && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            {order.specialInstructions && (
              <div className="mb-1">
                <span className="font-medium">Note:</span> {order.specialInstructions}
              </div>
            )}
            {order.allergies?.length && (
              <div>
                <span className="font-medium text-red-600">Allergies:</span>{' '}
                {order.allergies.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )

  return draggable ? (
    <Reorder.Item value={order} dragListener={false}>
      {ItemContent}
    </Reorder.Item>
  ) : (
    ItemContent
  )
}

export default KitchenQueue