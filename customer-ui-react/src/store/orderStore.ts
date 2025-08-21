import { create } from 'zustand'
import { OrderService, PaymentService, Order, Payment, CreateOrderRequest, PaymentMethod } from '@/services/api'

interface OrderState {
  // Data
  orders: Order[]
  currentOrder: Order | null
  currentPayment: Payment | null
  
  // UI State
  isLoading: boolean
  error: string | null
  isCreatingOrder: boolean
  isProcessingPayment: boolean
  
  // Checkout State
  checkoutData: {
    tableNumber: string
    paymentMethod: PaymentMethod | null
    specialRequests: string
  }
  
  // Actions
  fetchUserOrders: () => Promise<void>
  fetchOrderById: (id: number) => Promise<Order | null>
  createOrder: (orderData: CreateOrderRequest) => Promise<Order | null>
  updateOrderStatus: (id: number, status: Order['status']) => Promise<void>
  cancelOrder: (id: number, reason?: string) => Promise<void>
  
  // Payment Actions
  createPayment: (orderId: number, method: PaymentMethod) => Promise<Payment | null>
  processPayment: (paymentId: number, data: any) => Promise<boolean>
  
  // Checkout Actions
  setTableNumber: (tableNumber: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setSpecialRequests: (requests: string) => void
  resetCheckoutData: () => void
  
  // Utilities
  clearError: () => void
  clearCurrentOrder: () => void
  
  // Getters
  getOrderById: (id: number) => Order | undefined
  getOrdersByStatus: (status: Order['status']) => Order[]
  hasActiveOrders: boolean
}

const initialCheckoutData = {
  tableNumber: '',
  paymentMethod: null,
  specialRequests: ''
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  // Data
  orders: [],
  currentOrder: null,
  currentPayment: null,
  
  // UI State
  isLoading: false,
  error: null,
  isCreatingOrder: false,
  isProcessingPayment: false,
  
  // Checkout State
  checkoutData: initialCheckoutData,

  // Actions
  fetchUserOrders: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await OrderService.getUserOrders({
        limit: 50,
        page: 1
      })
      
      if (response.success && response.data) {
        set({
          orders: response.data.data,
          isLoading: false
        })
      } else {
        set({
          error: response.error || 'Failed to fetch orders',
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch orders',
        isLoading: false
      })
    }
  },

  fetchOrderById: async (id: number) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await OrderService.getOrder(id)
      
      if (response.success && response.data) {
        set({
          currentOrder: response.data,
          isLoading: false
        })
        return response.data
      } else {
        set({
          error: response.error || 'Failed to fetch order',
          isLoading: false
        })
        return null
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch order',
        isLoading: false
      })
      return null
    }
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    set({ isCreatingOrder: true, error: null })
    
    try {
      const response = await OrderService.createOrder(orderData)
      
      if (response.success && response.data) {
        const newOrder = response.data
        
        set((state) => ({
          orders: [newOrder, ...state.orders],
          currentOrder: newOrder,
          isCreatingOrder: false
        }))
        
        return newOrder
      } else {
        set({
          error: response.error || 'Failed to create order',
          isCreatingOrder: false
        })
        return null
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create order',
        isCreatingOrder: false
      })
      return null
    }
  },

  updateOrderStatus: async (id: number, status: Order['status']) => {
    try {
      const response = await OrderService.updateOrderStatus(id, { status })
      
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === id ? response.data! : order
          ),
          currentOrder: state.currentOrder?.id === id ? response.data : state.currentOrder
        }))
      } else {
        set({ error: response.error || 'Failed to update order status' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update order status' })
    }
  },

  cancelOrder: async (id: number, reason?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await OrderService.cancelOrder(id, reason)
      
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === id ? response.data! : order
          ),
          currentOrder: state.currentOrder?.id === id ? response.data : state.currentOrder,
          isLoading: false
        }))
      } else {
        set({
          error: response.error || 'Failed to cancel order',
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel order',
        isLoading: false
      })
    }
  },

  // Payment Actions
  createPayment: async (orderId: number, method: PaymentMethod) => {
    set({ isProcessingPayment: true, error: null })
    
    try {
      const order = get().getOrderById(orderId) || get().currentOrder
      if (!order) {
        set({
          error: 'Order not found',
          isProcessingPayment: false
        })
        return null
      }
      
      const response = await PaymentService.createPayment({
        orderId,
        method,
        amount: order.totalAmount
      })
      
      if (response.success && response.data) {
        set({
          currentPayment: response.data,
          isProcessingPayment: false
        })
        return response.data
      } else {
        set({
          error: response.error || 'Failed to create payment',
          isProcessingPayment: false
        })
        return null
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create payment',
        isProcessingPayment: false
      })
      return null
    }
  },

  processPayment: async (paymentId: number, data: any) => {
    set({ isProcessingPayment: true, error: null })
    
    try {
      const response = await PaymentService.processPayment(paymentId, data)
      
      if (response.success && response.data) {
        set({
          currentPayment: response.data,
          isProcessingPayment: false
        })
        
        // 如果支付成功，更新相關訂單狀態
        if (response.data.status === 'COMPLETED' && response.data.orderId) {
          get().updateOrderStatus(response.data.orderId, 'CONFIRMED')
        }
        
        return true
      } else {
        set({
          error: response.error || 'Payment processing failed',
          isProcessingPayment: false
        })
        return false
      }
    } catch (error: any) {
      set({
        error: error.message || 'Payment processing failed',
        isProcessingPayment: false
      })
      return false
    }
  },

  // Checkout Actions
  setTableNumber: (tableNumber: string) => {
    set((state) => ({
      checkoutData: {
        ...state.checkoutData,
        tableNumber
      }
    }))
  },

  setPaymentMethod: (method: PaymentMethod) => {
    set((state) => ({
      checkoutData: {
        ...state.checkoutData,
        paymentMethod: method
      }
    }))
  },

  setSpecialRequests: (requests: string) => {
    set((state) => ({
      checkoutData: {
        ...state.checkoutData,
        specialRequests: requests
      }
    }))
  },

  resetCheckoutData: () => {
    set({ checkoutData: initialCheckoutData })
  },

  // Utilities
  clearError: () => set({ error: null }),
  
  clearCurrentOrder: () => set({ 
    currentOrder: null, 
    currentPayment: null 
  }),

  // Getters
  getOrderById: (id: number) => {
    return get().orders.find(order => order.id === id)
  },

  getOrdersByStatus: (status: Order['status']) => {
    return get().orders.filter(order => order.status === status)
  },

  get hasActiveOrders() {
    const activeStatuses: Order['status'][] = ['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY']
    return get().orders.some(order => activeStatuses.includes(order.status))
  }
}))

// Selectors for convenient access
export const useOrders = () => useOrderStore((state) => ({
  orders: state.orders,
  currentOrder: state.currentOrder,
  currentPayment: state.currentPayment,
  isLoading: state.isLoading,
  error: state.error,
  isCreatingOrder: state.isCreatingOrder,
  isProcessingPayment: state.isProcessingPayment,
  checkoutData: state.checkoutData,
  hasActiveOrders: state.hasActiveOrders
}))

export const useOrderActions = () => useOrderStore((state) => ({
  fetchUserOrders: state.fetchUserOrders,
  fetchOrderById: state.fetchOrderById,
  createOrder: state.createOrder,
  updateOrderStatus: state.updateOrderStatus,
  cancelOrder: state.cancelOrder,
  createPayment: state.createPayment,
  processPayment: state.processPayment,
  setTableNumber: state.setTableNumber,
  setPaymentMethod: state.setPaymentMethod,
  setSpecialRequests: state.setSpecialRequests,
  resetCheckoutData: state.resetCheckoutData,
  clearError: state.clearError,
  clearCurrentOrder: state.clearCurrentOrder,
  getOrderById: state.getOrderById,
  getOrdersByStatus: state.getOrdersByStatus
}))

// 工具函數
export const getOrderStatusText = (status: Order['status']): string => {
  const statusMap: Record<Order['status'], string> = {
    'PENDING_PAYMENT': '待付款',
    'CONFIRMED': '已確認',
    'PREPARING': '準備中',
    'READY': '已完成',
    'COMPLETED': '已取餐',
    'CANCELLED': '已取消'
  }
  
  return statusMap[status] || status
}

export const getPaymentMethodText = (method: PaymentMethod): string => {
  const methodMap: Record<PaymentMethod, string> = {
    'CASH': '現金',
    'CREDIT_CARD': '信用卡',
    'LINE_PAY': 'LINE Pay',
    'APPLE_PAY': 'Apple Pay'
  }
  
  return methodMap[method] || method
}