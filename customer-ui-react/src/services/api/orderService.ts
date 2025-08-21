import { HttpClient, ApiResponse } from './client'
import { 
  Order, 
  OrderItem, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest, 
  OrderQueryParams, 
  PaginatedResponse,
  OrderStatus 
} from './types'

/**
 * 訂單服務 - 處理訂單相關的 API 調用
 */
export class OrderService {
  /**
   * 創建新訂單
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return HttpClient.post<Order>('/orders', orderData)
  }

  /**
   * 獲取訂單詳情
   */
  static async getOrder(id: number): Promise<ApiResponse<Order>> {
    return HttpClient.get<Order>(`/orders/${id}`)
  }

  /**
   * 獲取當前用戶的訂單列表
   */
  static async getUserOrders(params?: OrderQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get<PaginatedResponse<Order>>(`/orders/my-orders${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 獲取指定客戶的訂單（管理員功能）
   */
  static async getCustomerOrders(customerId: number, params?: OrderQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get<PaginatedResponse<Order>>(`/orders/customer/${customerId}${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 獲取所有訂單（管理員/員工功能）
   */
  static async getAllOrders(params?: OrderQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get<PaginatedResponse<Order>>(`/orders${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 更新訂單狀態
   */
  static async updateOrderStatus(id: number, statusData: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return HttpClient.put<Order>(`/orders/${id}/status`, statusData)
  }

  /**
   * 取消訂單
   */
  static async cancelOrder(id: number, reason?: string): Promise<ApiResponse<Order>> {
    return HttpClient.post<Order>(`/orders/${id}/cancel`, { reason })
  }

  /**
   * 確認訂單（客戶確認）
   */
  static async confirmOrder(id: number): Promise<ApiResponse<Order>> {
    return HttpClient.post<Order>(`/orders/${id}/confirm`)
  }

  /**
   * 完成訂單（餐廳方完成）
   */
  static async completeOrder(id: number): Promise<ApiResponse<Order>> {
    return HttpClient.post<Order>(`/orders/${id}/complete`)
  }

  /**
   * 獲取訂單項目列表
   */
  static async getOrderItems(orderId: number): Promise<ApiResponse<OrderItem[]>> {
    return HttpClient.get<OrderItem[]>(`/orders/${orderId}/items`)
  }

  /**
   * 修改訂單項目（僅限未確認的訂單）
   */
  static async updateOrderItem(orderId: number, itemId: number, updateData: {
    quantity?: number
    specialRequests?: string
  }): Promise<ApiResponse<OrderItem>> {
    return HttpClient.put<OrderItem>(`/orders/${orderId}/items/${itemId}`, updateData)
  }

  /**
   * 添加訂單項目到現有訂單
   */
  static async addOrderItem(orderId: number, itemData: {
    menuItemId: number
    quantity: number
    specialRequests?: string
  }): Promise<ApiResponse<OrderItem>> {
    return HttpClient.post<OrderItem>(`/orders/${orderId}/items`, itemData)
  }

  /**
   * 從訂單中移除項目
   */
  static async removeOrderItem(orderId: number, itemId: number): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/orders/${orderId}/items/${itemId}`)
  }

  /**
   * 獲取今日訂單
   */
  static async getTodayOrders(): Promise<ApiResponse<Order[]>> {
    const today = new Date().toISOString().split('T')[0]
    return HttpClient.get<Order[]>(`/orders/date/${today}`)
  }

  /**
   * 獲取正在準備中的訂單
   */
  static async getActiveOrders(): Promise<ApiResponse<Order[]>> {
    return HttpClient.get<Order[]>('/orders/active')
  }

  /**
   * 獲取待處理的訂單
   */
  static async getPendingOrders(): Promise<ApiResponse<Order[]>> {
    return HttpClient.get<Order[]>('/orders/pending')
  }

  /**
   * 獲取訂單歷史記錄
   */
  static async getOrderHistory(params?: {
    startDate?: string
    endDate?: string
    status?: OrderStatus
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get<PaginatedResponse<Order>>(`/orders/history${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 獲取訂單統計
   */
  static async getOrderStats(period?: 'today' | 'week' | 'month' | 'year'): Promise<ApiResponse<{
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    totalRevenue: number
    averageOrderValue: number
    topItems: Array<{ menuItem: string; quantity: number }>
  }>> {
    const queryString = period ? `?period=${period}` : ''
    return HttpClient.get(`/orders/stats${queryString}`)
  }

  /**
   * 搜索訂單
   */
  static async searchOrders(query: string, params?: OrderQueryParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const searchParams = new URLSearchParams({
      q: query,
      ...(params as any)
    }).toString()
    
    return HttpClient.get<PaginatedResponse<Order>>(`/orders/search?${searchParams}`)
  }

  /**
   * 獲取訂單收據
   */
  static async getOrderReceipt(id: number): Promise<ApiResponse<{
    order: Order
    receiptNumber: string
    issueDate: string
    taxDetails: {
      subtotal: number
      tax: number
      serviceCharge: number
      total: number
    }
  }>> {
    return HttpClient.get(`/orders/${id}/receipt`)
  }

  /**
   * 發送訂單確認郵件
   */
  static async sendOrderConfirmation(id: number): Promise<ApiResponse<void>> {
    return HttpClient.post<void>(`/orders/${id}/send-confirmation`)
  }

  /**
   * 獲取預估等待時間
   */
  static async getEstimatedTime(id: number): Promise<ApiResponse<{ estimatedMinutes: number }>> {
    return HttpClient.get(`/orders/${id}/estimated-time`)
  }

  /**
   * 更新訂單預估時間
   */
  static async updateEstimatedTime(id: number, minutes: number): Promise<ApiResponse<Order>> {
    return HttpClient.put<Order>(`/orders/${id}/estimated-time`, { estimatedMinutes: minutes })
  }

  /**
   * 獲取按桌號分組的訂單
   */
  static async getOrdersByTable(): Promise<ApiResponse<Record<string, Order[]>>> {
    return HttpClient.get('/orders/by-table')
  }
}