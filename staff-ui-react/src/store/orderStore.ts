/**
 * 📦 Order Management Store
 * Zustand store for managing orders, queue, and kitchen operations
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { 
  Order, 
  OrderQueue, 
  QueueSummary, 
  OrderFilters, 
  OrderAlert,
  CookingTimer,
  OrderStatus,
  OrderPriority,
  KitchenOrder,
  Workstation
} from '@/types'

interface OrderStore {
  // 📊 Core State
  orders: Order[]
  queue: OrderQueue
  summary: QueueSummary
  alerts: OrderAlert[]
  cookingTimers: CookingTimer[]
  workstations: Workstation[]
  
  // 🔍 Filtering & Search
  filters: OrderFilters
  searchQuery: string
  sortBy: 'orderTime' | 'priority' | 'status' | 'tableNumber'
  sortOrder: 'asc' | 'desc'
  
  // 📱 UI State
  selectedOrder: Order | null
  viewMode: 'list' | 'grid' | 'kanban'
  loading: boolean
  error: string | null
  autoRefresh: boolean
  refreshInterval: number
  
  // 🔄 Data Actions
  fetchOrders: () => Promise<void>
  refreshOrders: () => Promise<void>
  createOrder: (orderData: Partial<Order>) => Promise<number | null>
  updateOrderStatus: (orderId: number, status: OrderStatus, note?: string) => Promise<boolean>
  assignOrder: (orderId: number, staffId: string) => Promise<boolean>
  cancelOrder: (orderId: number, reason: string) => Promise<boolean>
  
  // ⏱️ Timer Actions
  startCookingTimer: (orderId: number, estimatedMinutes: number) => CookingTimer | null
  pauseCookingTimer: (timerId: string) => boolean
  resumeCookingTimer: (timerId: string) => boolean
  completeCookingTimer: (timerId: string) => boolean
  
  // 🚨 Alert Management
  addAlert: (alert: Omit<OrderAlert, 'id' | 'createdAt'>) => string
  acknowledgeAlert: (alertId: string, staffId: string) => boolean
  clearAlert: (alertId: string) => boolean
  clearAllAlerts: () => void
  
  // 🔍 Filtering & Search
  setFilters: (filters: Partial<OrderFilters>) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  setSorting: (sortBy: OrderStore['sortBy'], sortOrder: OrderStore['sortOrder']) => void
  
  // 📱 UI Actions
  setSelectedOrder: (order: Order | null) => void
  setViewMode: (mode: OrderStore['viewMode']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleAutoRefresh: () => void
  
  // 📊 Computed Properties
  getFilteredOrders: () => Order[]
  getOrderById: (orderId: number) => Order | null
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getOrdersByPriority: (priority: OrderPriority) => Order[]
  getUrgentOrders: () => Order[]
  getOverdueOrders: () => Order[]
  getOrdersForStaff: (staffId: string) => Order[]
  
  // 🍳 Kitchen Operations
  getKitchenOrders: () => KitchenOrder[]
  getActiveTimers: () => CookingTimer[]
  getWorkstationLoad: (stationId: string) => number
  updateWorkstationStatus: (stationId: string, status: Workstation['status']) => void
}

// 🏪 Order Store Implementation
export const useOrderStore = create<OrderStore>()(
  subscribeWithSelector((set, get) => ({
    // 📊 Initial State
    orders: [],
    queue: {
      pending: [],
      processing: [],
      ready: [],
      completed: [],
      cancelled: []
    },
    summary: {
      pendingCount: 0,
      processingCount: 0,
      urgentCount: 0,
      overdueCount: 0,
      averageWaitTime: 0,
      totalRevenue: 0,
      completionRate: 0
    },
    alerts: [],
    cookingTimers: [],
    workstations: [
      { stationId: 'GRILL', name: '燒烤區', type: 'GRILL', capacity: 4, currentLoad: 0, assignedStaff: [], activeOrders: [], status: 'ACTIVE' },
      { stationId: 'WOK', name: '炒鍋區', type: 'WOK', capacity: 3, currentLoad: 0, assignedStaff: [], activeOrders: [], status: 'ACTIVE' },
      { stationId: 'FRYER', name: '油炸區', type: 'FRYER', capacity: 2, currentLoad: 0, assignedStaff: [], activeOrders: [], status: 'ACTIVE' },
      { stationId: 'PREP', name: '備菜區', type: 'PREP', capacity: 6, currentLoad: 0, assignedStaff: [], activeOrders: [], status: 'ACTIVE' }
    ],
    
    // 🔍 Filter State
    filters: {},
    searchQuery: '',
    sortBy: 'orderTime',
    sortOrder: 'desc',
    
    // 📱 UI State
    selectedOrder: null,
    viewMode: 'list',
    loading: false,
    error: null,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds

    // 🔄 Data Actions
    fetchOrders: async (): Promise<void> => {
      try {
        set({ loading: true, error: null })
        
        // TODO: Replace with actual API call
        const response = await fetch('/api/staff/orders/queue', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          const orders = data.data.orders
          const summary = data.data.summary
          
          set({
            orders,
            summary,
            queue: {
              pending: orders.filter((o: Order) => o.status === 'PENDING'),
              processing: orders.filter((o: Order) => o.status === 'PROCESSING'),
              ready: orders.filter((o: Order) => o.status === 'READY'),
              completed: orders.filter((o: Order) => o.status === 'COMPLETED'),
              cancelled: orders.filter((o: Order) => o.status === 'CANCELLED')
            },
            loading: false
          })
          
          // Check for urgent orders and create alerts
          const urgentOrders = orders.filter((o: Order) => o.priority === 'URGENT' || o.isOverdue)
          urgentOrders.forEach((order: Order) => {
            if (order.isOverdue) {
              get().addAlert({
                orderId: order.orderId,
                type: 'OVERDUE',
                severity: 'HIGH',
                message: `訂單 ${order.orderNumber} 已超時 ${order.overdueMinutes} 分鐘`,
                acknowledged: false
              })
            }
          })
        } else {
          throw new Error(data.message || 'Failed to fetch orders')
        }
      } catch (error) {
        console.error('Fetch orders error:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch orders',
          loading: false 
        })
      }
    },

    refreshOrders: async (): Promise<void> => {
      // Refresh without showing loading state
      const { fetchOrders } = get()
      const currentLoading = get().loading
      
      await fetchOrders()
      
      if (!currentLoading) {
        set({ loading: false })
      }
    },

    createOrder: async (orderData: Partial<Order>): Promise<number | null> => {
      try {
        const response = await fetch('/api/staff/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Refresh orders to get the new order
          await get().refreshOrders()
          return data.data.orderId
        } else {
          throw new Error(data.message || 'Failed to create order')
        }
      } catch (error) {
        console.error('Create order error:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to create order' })
        return null
      }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus, note?: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/staff/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            newStatus: status,
            staffId: 'current-staff-id', // TODO: Get from auth store
            note
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Update local state
          set(state => ({
            orders: state.orders.map(order => 
              order.orderId === orderId 
                ? { ...order, status, updatedAt: new Date() }
                : order
            )
          }))
          
          // Refresh to get updated data
          await get().refreshOrders()
          return true
        } else {
          throw new Error(data.message || 'Failed to update order status')
        }
      } catch (error) {
        console.error('Update order status error:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to update order status' })
        return false
      }
    },

    assignOrder: async (orderId: number, staffId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/staff/orders/${orderId}/assign`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ staffId })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Update local state
          set(state => ({
            orders: state.orders.map(order => 
              order.orderId === orderId 
                ? { ...order, assignedStaff: staffId }
                : order
            )
          }))
          return true
        } else {
          throw new Error(data.message || 'Failed to assign order')
        }
      } catch (error) {
        console.error('Assign order error:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to assign order' })
        return false
      }
    },

    cancelOrder: async (orderId: number, reason: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/staff/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          await get().refreshOrders()
          return true
        } else {
          throw new Error(data.message || 'Failed to cancel order')
        }
      } catch (error) {
        console.error('Cancel order error:', error)
        set({ error: error instanceof Error ? error.message : 'Failed to cancel order' })
        return false
      }
    },

    // ⏱️ Timer Actions
    startCookingTimer: (orderId: number, estimatedMinutes: number): CookingTimer | null => {
      const timer: CookingTimer = {
        timerId: `timer-${orderId}-${Date.now()}`,
        orderId,
        staffId: 'current-staff-id', // TODO: Get from auth store
        startTime: new Date(),
        totalPausedDuration: 0,
        estimatedDuration: estimatedMinutes * 60, // Convert to seconds
        status: 'RUNNING',
        alerts: {
          halfTime: false,
          nearComplete: false,
          overdue: false
        }
      }
      
      set(state => ({
        cookingTimers: [...state.cookingTimers, timer]
      }))
      
      return timer
    },

    pauseCookingTimer: (timerId: string): boolean => {
      set(state => ({
        cookingTimers: state.cookingTimers.map(timer => 
          timer.timerId === timerId && timer.status === 'RUNNING'
            ? { ...timer, status: 'PAUSED', pausedTime: new Date() }
            : timer
        )
      }))
      return true
    },

    resumeCookingTimer: (timerId: string): boolean => {
      set(state => ({
        cookingTimers: state.cookingTimers.map(timer => {
          if (timer.timerId === timerId && timer.status === 'PAUSED' && timer.pausedTime) {
            const pauseDuration = Date.now() - timer.pausedTime.getTime()
            return {
              ...timer,
              status: 'RUNNING',
              totalPausedDuration: timer.totalPausedDuration + pauseDuration,
              pausedTime: undefined,
              resumeTime: new Date()
            }
          }
          return timer
        })
      }))
      return true
    },

    completeCookingTimer: (timerId: string): boolean => {
      set(state => ({
        cookingTimers: state.cookingTimers.map(timer => {
          if (timer.timerId === timerId && timer.status !== 'COMPLETED') {
            const now = new Date()
            const actualDuration = (now.getTime() - timer.startTime.getTime()) / 1000 - timer.totalPausedDuration
            return {
              ...timer,
              status: 'COMPLETED',
              endTime: now,
              actualDuration
            }
          }
          return timer
        })
      }))
      return true
    },

    // 🚨 Alert Management
    addAlert: (alertData: Omit<OrderAlert, 'id' | 'createdAt'>): string => {
      const alert: OrderAlert = {
        ...alertData,
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
      
      set(state => ({
        alerts: [...state.alerts, alert]
      }))
      
      return alert.id
    },

    acknowledgeAlert: (alertId: string, staffId: string): boolean => {
      set(state => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedBy: staffId }
            : alert
        )
      }))
      return true
    },

    clearAlert: (alertId: string): boolean => {
      set(state => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      }))
      return true
    },

    clearAllAlerts: (): void => {
      set({ alerts: [] })
    },

    // 🔍 Filtering & Search Actions
    setFilters: (filters: Partial<OrderFilters>): void => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }))
    },

    clearFilters: (): void => {
      set({ filters: {}, searchQuery: '' })
    },

    setSearchQuery: (query: string): void => {
      set({ searchQuery: query })
    },

    setSorting: (sortBy: OrderStore['sortBy'], sortOrder: OrderStore['sortOrder']): void => {
      set({ sortBy, sortOrder })
    },

    // 📱 UI Actions
    setSelectedOrder: (order: Order | null): void => {
      set({ selectedOrder: order })
    },

    setViewMode: (mode: OrderStore['viewMode']): void => {
      set({ viewMode: mode })
    },

    setLoading: (loading: boolean): void => {
      set({ loading })
    },

    setError: (error: string | null): void => {
      set({ error })
    },

    toggleAutoRefresh: (): void => {
      set(state => ({ autoRefresh: !state.autoRefresh }))
    },

    // 📊 Computed Properties
    getFilteredOrders: (): Order[] => {
      const { orders, filters, searchQuery, sortBy, sortOrder } = get()
      
      let filteredOrders = orders
      
      // Apply filters
      if (filters.status && filters.status.length > 0) {
        filteredOrders = filteredOrders.filter(order => filters.status!.includes(order.status))
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filteredOrders = filteredOrders.filter(order => filters.priority!.includes(order.priority))
      }
      
      if (filters.assignedTo) {
        filteredOrders = filteredOrders.filter(order => order.assignedStaff === filters.assignedTo)
      }
      
      if (filters.tableNumber) {
        filteredOrders = filteredOrders.filter(order => 
          order.tableNumber.toLowerCase().includes(filters.tableNumber!.toLowerCase())
        )
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.tableNumber.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query)
        )
      }
      
      // Apply sorting
      filteredOrders.sort((a, b) => {
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
          default:
            return 0
        }
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return sortOrder === 'asc' ? comparison : -comparison
      })
      
      return filteredOrders
    },

    getOrderById: (orderId: number): Order | null => {
      return get().orders.find(order => order.orderId === orderId) || null
    },

    getOrdersByStatus: (status: OrderStatus): Order[] => {
      return get().orders.filter(order => order.status === status)
    },

    getOrdersByPriority: (priority: OrderPriority): Order[] => {
      return get().orders.filter(order => order.priority === priority)
    },

    getUrgentOrders: (): Order[] => {
      return get().orders.filter(order => order.priority === 'URGENT' || order.isOverdue)
    },

    getOverdueOrders: (): Order[] => {
      return get().orders.filter(order => order.isOverdue)
    },

    getOrdersForStaff: (staffId: string): Order[] => {
      return get().orders.filter(order => order.assignedStaff === staffId)
    },

    // 🍳 Kitchen Operations
    getKitchenOrders: (): KitchenOrder[] => {
      const { orders } = get()
      return orders
        .filter(order => ['PROCESSING', 'PREPARING'].includes(order.status))
        .map(order => ({
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          items: order.items.map(item => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            cookingTime: item.preparationTime,
            specialRequests: item.specialRequests,
            status: item.status,
            ingredients: [] // TODO: Add ingredients data
          })),
          priority: order.priority,
          orderTime: order.orderTime,
          estimatedCompleteTime: order.estimatedCompleteTime || new Date(),
          specialInstructions: order.specialInstructions,
          assignedChef: order.assignedStaff,
          cookingStatus: 'COOKING',
          elapsedTime: Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60)),
          remainingTime: order.estimatedCompleteTime ? 
            Math.max(0, Math.floor((order.estimatedCompleteTime.getTime() - Date.now()) / (1000 * 60))) : 0
        }))
    },

    getActiveTimers: (): CookingTimer[] => {
      return get().cookingTimers.filter(timer => 
        timer.status === 'RUNNING' || timer.status === 'PAUSED'
      )
    },

    getWorkstationLoad: (stationId: string): number => {
      const { workstations } = get()
      const workstation = workstations.find(ws => ws.stationId === stationId)
      return workstation ? (workstation.currentLoad / workstation.capacity) * 100 : 0
    },

    updateWorkstationStatus: (stationId: string, status: Workstation['status']): void => {
      set(state => ({
        workstations: state.workstations.map(ws => 
          ws.stationId === stationId ? { ...ws, status } : ws
        )
      }))
    }
  }))
)

// 🔗 Order Hooks & Selectors
export const useOrders = () => useOrderStore(state => state.orders)
export const useOrderQueue = () => useOrderStore(state => state.queue)
export const useOrderSummary = () => useOrderStore(state => state.summary)
export const useOrderAlerts = () => useOrderStore(state => state.alerts)
export const useSelectedOrder = () => useOrderStore(state => state.selectedOrder)
export const useCookingTimers = () => useOrderStore(state => state.cookingTimers)
export const useWorkstations = () => useOrderStore(state => state.workstations)

// 🎯 Order Actions Hook
export const useOrderActions = () => {
  const store = useOrderStore()
  return {
    fetchOrders: store.fetchOrders,
    refreshOrders: store.refreshOrders,
    updateOrderStatus: store.updateOrderStatus,
    assignOrder: store.assignOrder,
    cancelOrder: store.cancelOrder,
    startCookingTimer: store.startCookingTimer,
    setSelectedOrder: store.setSelectedOrder
  }
}