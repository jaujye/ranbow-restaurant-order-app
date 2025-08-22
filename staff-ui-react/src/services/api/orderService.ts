/**
 * 📦 Order API Service  
 * API functions for order management and kitchen operations
 */

import { createAPIRequest, withRetry } from './client'
import type {
  Order,
  OrderQueue,
  QueueSummary,
  OrderFilters,
  OrderStatus,
  OrderPriority,
  CookingTimer,
  OrderAlert,
  KitchenOrder,
  Workstation,
  OrderAnalytics,
  OrderHistoryEntry
} from '@/types'

// 📦 Order Management APIs
export const orderManagementService = {
  /**
   * Get Order Queue
   */
  getQueue: async (filters?: {
    status?: OrderStatus[]
    priority?: OrderPriority[]
    assignedTo?: string
    page?: number
    size?: number
    sort?: string
  }): Promise<{
    orders: Order[]
    pagination: {
      currentPage: number
      totalPages: number
      totalElements: number
      hasNext: boolean
    }
    summary: QueueSummary
  }> => {
    const params = new URLSearchParams()
    
    if (filters?.status && filters.status.length > 0) {
      params.append('status', filters.status.join(','))
    }
    if (filters?.priority && filters.priority.length > 0) {
      params.append('priority', filters.priority.join(','))
    }
    if (filters?.assignedTo) {
      params.append('assignedTo', filters.assignedTo)
    }
    if (filters?.page !== undefined) {
      params.append('page', filters.page.toString())
    }
    if (filters?.size !== undefined) {
      params.append('size', filters.size.toString())
    }
    if (filters?.sort) {
      params.append('sort', filters.sort)
    }
    
    const response = await withRetry(() =>
      createAPIRequest.get<{
        orders: Order[]
        pagination: {
          currentPage: number
          totalPages: number
          totalElements: number
          hasNext: boolean
        }
        summary: QueueSummary
      }>(`/staff/orders/queue?${params}`)
    )
    return response.data.data!
  },

  /**
   * Get Order by ID
   */
  getOrder: async (orderId: number): Promise<Order> => {
    const response = await createAPIRequest.get<Order>(`/staff/orders/${orderId}`)
    return response.data.data!
  },

  /**
   * Update Order Status
   */
  updateStatus: async (
    orderId: number,
    newStatus: OrderStatus,
    staffId: string,
    note?: string,
    estimatedCompleteTime?: Date
  ): Promise<{
    orderId: number
    previousStatus: OrderStatus
    currentStatus: OrderStatus
    updatedBy: string
    updatedAt: string
    statusHistory: OrderHistoryEntry[]
  }> => {
    const response = await createAPIRequest.put<{
      orderId: number
      previousStatus: OrderStatus
      currentStatus: OrderStatus
      updatedBy: string
      updatedAt: string
      statusHistory: OrderHistoryEntry[]
    }>(`/staff/orders/${orderId}/status`, {
      newStatus,
      staffId,
      note,
      estimatedCompleteTime: estimatedCompleteTime?.toISOString()
    })
    return response.data.data!
  },

  /**
   * Assign Order to Staff
   */
  assignOrder: async (orderId: number, staffId: string, notes?: string): Promise<void> => {
    await createAPIRequest.post(`/staff/orders/${orderId}/assign`, {
      staffId,
      notes
    })
  },

  /**
   * Cancel Order
   */
  cancelOrder: async (orderId: number, reason: string, staffId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/orders/${orderId}/cancel`, {
      reason,
      staffId
    })
  },

  /**
   * Get Order History
   */
  getOrderHistory: async (orderId: number): Promise<OrderHistoryEntry[]> => {
    const response = await createAPIRequest.get<OrderHistoryEntry[]>(`/staff/orders/${orderId}/history`)
    return response.data.data!
  },

  /**
   * Bulk Update Orders
   */
  bulkUpdateStatus: async (
    orderIds: number[],
    newStatus: OrderStatus,
    staffId: string
  ): Promise<{ successCount: number; failedOrders: number[] }> => {
    const response = await createAPIRequest.patch<{
      successCount: number
      failedOrders: number[]
    }>('/staff/orders/bulk-update', {
      orderIds,
      newStatus,
      staffId
    })
    return response.data.data!
  }
}

// 🍳 Kitchen Operations APIs
export const kitchenOperationsService = {
  /**
   * Get Kitchen Orders
   */
  getKitchenOrders: async (): Promise<KitchenOrder[]> => {
    const response = await createAPIRequest.get<KitchenOrder[]>('/staff/kitchen/orders')
    return response.data.data!
  },

  /**
   * Start Cooking Order
   */
  startCooking: async (
    orderId: number,
    staffId: string,
    workstationId?: string,
    estimatedMinutes?: number,
    items?: number[]
  ): Promise<{
    cookingSessionId: string
    orderId: number
    startTime: string
    estimatedCompleteTime: string
    timer: CookingTimer
    assignedChef: string
  }> => {
    const response = await createAPIRequest.post<{
      cookingSessionId: string
      orderId: number
      startTime: string
      estimatedCompleteTime: string
      timer: CookingTimer
      assignedChef: string
    }>('/staff/kitchen/cooking/start', {
      orderId,
      staffId,
      workstationId,
      estimatedMinutes,
      items
    })
    return response.data.data!
  },

  /**
   * Complete Cooking
   */
  completeCooking: async (orderId: number, staffId: string): Promise<void> => {
    await createAPIRequest.post('/staff/kitchen/cooking/complete', {
      orderId,
      staffId
    })
  },

  /**
   * Get Kitchen Workload
   */
  getWorkload: async (): Promise<{
    currentCapacity: number
    activeOrders: number
    queuedOrders: number
    averageCookingTime: number
    stations: Workstation[]
    estimatedWaitTime: {
      newOrder: number
      inQueue: number
    }
  }> => {
    const response = await createAPIRequest.get<{
      currentCapacity: number
      activeOrders: number
      queuedOrders: number
      averageCookingTime: number
      stations: Workstation[]
      estimatedWaitTime: {
        newOrder: number
        inQueue: number
      }
    }>('/staff/kitchen/workload')
    return response.data.data!
  },

  /**
   * Update Workstation Status
   */
  updateWorkstationStatus: async (
    stationId: string,
    status: Workstation['status'],
    staffId: string
  ): Promise<void> => {
    await createAPIRequest.patch(`/staff/kitchen/workstations/${stationId}/status`, {
      status,
      staffId
    })
  },

  /**
   * Get Kitchen Analytics
   */
  getAnalytics: async (startDate: Date, endDate: Date): Promise<OrderAnalytics> => {
    const response = await createAPIRequest.post<OrderAnalytics>('/staff/kitchen/analytics', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    return response.data.data!
  }
}

// ⏱️ Cooking Timer APIs
export const cookingTimerService = {
  /**
   * Create Timer
   */
  createTimer: async (
    orderId: number,
    staffId: string,
    estimatedDuration: number,
    workstationId?: string
  ): Promise<CookingTimer> => {
    const response = await createAPIRequest.post<CookingTimer>('/staff/kitchen/timers', {
      orderId,
      staffId,
      estimatedDuration,
      workstationId
    })
    return response.data.data!
  },

  /**
   * Start Timer
   */
  startTimer: async (timerId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/kitchen/timers/${timerId}/start`)
  },

  /**
   * Pause Timer
   */
  pauseTimer: async (timerId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/kitchen/timers/${timerId}/pause`)
  },

  /**
   * Resume Timer
   */
  resumeTimer: async (timerId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/kitchen/timers/${timerId}/resume`)
  },

  /**
   * Complete Timer
   */
  completeTimer: async (timerId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/kitchen/timers/${timerId}/complete`)
  },

  /**
   * Cancel Timer
   */
  cancelTimer: async (timerId: string, reason?: string): Promise<void> => {
    await createAPIRequest.post(`/staff/kitchen/timers/${timerId}/cancel`, { reason })
  },

  /**
   * Get Active Timers
   */
  getActiveTimers: async (staffId?: string): Promise<CookingTimer[]> => {
    const params = staffId ? `?staffId=${staffId}` : ''
    const response = await createAPIRequest.get<CookingTimer[]>(`/staff/kitchen/timers/active${params}`)
    return response.data.data!
  },

  /**
   * Get Timer by ID
   */
  getTimer: async (timerId: string): Promise<CookingTimer> => {
    const response = await createAPIRequest.get<CookingTimer>(`/staff/kitchen/timers/${timerId}`)
    return response.data.data!
  }
}

// 🚨 Order Alert APIs
export const orderAlertService = {
  /**
   * Get Active Alerts
   */
  getActiveAlerts: async (): Promise<OrderAlert[]> => {
    const response = await createAPIRequest.get<OrderAlert[]>('/staff/orders/alerts/active')
    return response.data.data!
  },

  /**
   * Create Alert
   */
  createAlert: async (alert: {
    orderId: number
    type: OrderAlert['type']
    severity: OrderAlert['severity']
    message: string
  }): Promise<string> => {
    const response = await createAPIRequest.post<{ alertId: string }>('/staff/orders/alerts', alert)
    return response.data.data!.alertId
  },

  /**
   * Acknowledge Alert
   */
  acknowledgeAlert: async (alertId: string, staffId: string): Promise<void> => {
    await createAPIRequest.patch(`/staff/orders/alerts/${alertId}/acknowledge`, {
      staffId
    })
  },

  /**
   * Resolve Alert
   */
  resolveAlert: async (alertId: string, staffId: string, resolution?: string): Promise<void> => {
    await createAPIRequest.patch(`/staff/orders/alerts/${alertId}/resolve`, {
      staffId,
      resolution
    })
  },

  /**
   * Get Alert History
   */
  getAlertHistory: async (
    startDate: Date,
    endDate: Date,
    type?: OrderAlert['type']
  ): Promise<OrderAlert[]> => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    
    if (type) {
      params.append('type', type)
    }
    
    const response = await createAPIRequest.get<OrderAlert[]>(`/staff/orders/alerts/history?${params}`)
    return response.data.data!
  }
}

// 📊 Order Analytics APIs
export const orderAnalyticsService = {
  /**
   * Get Order Analytics
   */
  getAnalytics: async (
    startDate: Date,
    endDate: Date,
    type: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'
  ): Promise<OrderAnalytics> => {
    const response = await createAPIRequest.post<OrderAnalytics>('/staff/orders/analytics', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type
    })
    return response.data.data!
  },

  /**
   * Get Performance Summary
   */
  getPerformanceSummary: async (period: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY'): Promise<{
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    averageProcessingTime: number
    averageWaitTime: number
    completionRate: number
    onTimeRate: number
    customerSatisfaction: number
  }> => {
    const response = await createAPIRequest.get<{
      totalOrders: number
      completedOrders: number
      cancelledOrders: number
      averageProcessingTime: number
      averageWaitTime: number
      completionRate: number
      onTimeRate: number
      customerSatisfaction: number
    }>(`/staff/orders/performance?period=${period}`)
    return response.data.data!
  },

  /**
   * Get Hourly Distribution
   */
  getHourlyDistribution: async (date: Date): Promise<{
    hour: number
    orderCount: number
    revenue: number
    averageWaitTime: number
  }[]> => {
    const response = await createAPIRequest.get<{
      hour: number
      orderCount: number
      revenue: number
      averageWaitTime: number
    }[]>(`/staff/orders/hourly-distribution?date=${date.toISOString().split('T')[0]}`)
    return response.data.data!
  },

  /**
   * Get Popular Items
   */
  getPopularItems: async (
    period: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY',
    limit: number = 10
  ): Promise<{
    itemId: number
    name: string
    orderCount: number
    revenue: number
    averageRating?: number
  }[]> => {
    const response = await createAPIRequest.get<{
      itemId: number
      name: string
      orderCount: number
      revenue: number
      averageRating?: number
    }[]>(`/staff/orders/popular-items?period=${period}&limit=${limit}`)
    return response.data.data!
  }
}

// 🔍 Search & Filter APIs
export const orderSearchService = {
  /**
   * Search Orders
   */
  search: async (
    query: string,
    filters?: OrderFilters,
    page: number = 0,
    size: number = 20
  ): Promise<{
    orders: Order[]
    pagination: {
      page: number
      size: number
      total: number
      totalPages: number
    }
    suggestions: string[]
  }> => {
    const response = await createAPIRequest.post<{
      orders: Order[]
      pagination: {
        page: number
        size: number
        total: number
        totalPages: number
      }
      suggestions: string[]
    }>('/staff/orders/search', {
      query,
      filters,
      page,
      size
    })
    return response.data.data!
  },

  /**
   * Get Search Suggestions
   */
  getSuggestions: async (query: string): Promise<string[]> => {
    const response = await createAPIRequest.get<string[]>(`/staff/orders/search/suggestions?q=${encodeURIComponent(query)}`)
    return response.data.data!
  },

  /**
   * Save Search Filter
   */
  saveFilter: async (name: string, filters: OrderFilters, staffId: string): Promise<string> => {
    const response = await createAPIRequest.post<{ filterId: string }>('/staff/orders/filters', {
      name,
      filters,
      staffId
    })
    return response.data.data!.filterId
  },

  /**
   * Get Saved Filters
   */
  getSavedFilters: async (staffId: string): Promise<{
    filterId: string
    name: string
    filters: OrderFilters
    createdAt: string
  }[]> => {
    const response = await createAPIRequest.get<{
      filterId: string
      name: string
      filters: OrderFilters
      createdAt: string
    }[]>(`/staff/orders/filters?staffId=${staffId}`)
    return response.data.data!
  }
}

// Export all services
export const orderService = {
  management: orderManagementService,
  kitchen: kitchenOperationsService,
  timers: cookingTimerService,
  alerts: orderAlertService,
  analytics: orderAnalyticsService,
  search: orderSearchService
}

export default orderService