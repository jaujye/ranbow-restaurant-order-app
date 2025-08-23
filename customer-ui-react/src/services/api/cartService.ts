import { HttpClient, ApiResponse } from './client'
import { MenuItem, CreateOrderRequest, PaymentMethod } from './types'

/**
 * 購物車項目介面
 */
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  specialRequests?: string
  subtotal: number
}

/**
 * 購物車介面
 */
export interface Cart {
  items: CartItem[]
  totalItems: number
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  appliedCoupons?: string[]
}

/**
 * 加入購物車請求
 */
export interface AddToCartRequest {
  menuItemId: number
  quantity: number
  specialRequests?: string
}

/**
 * 更新購物車項目請求
 */
export interface UpdateCartItemRequest {
  quantity: number
  specialRequests?: string
}

/**
 * 購物車服務 - 處理購物車相關的 API 調用
 * 注意：購物車通常在前端管理，後端主要提供菜單數據和訂單創建
 */
export class CartService {
  /**
   * 獲取菜單項目詳情（用於購物車顯示）
   */
  static async getMenuItem(id: number): Promise<ApiResponse<MenuItem>> {
    return HttpClient.get<MenuItem>(`/menu/items/${id}`)
  }

  /**
   * 獲取多個菜單項目詳情
   */
  static async getMenuItems(ids: number[]): Promise<ApiResponse<MenuItem[]>> {
    const idsParam = ids.join(',')
    return HttpClient.get<MenuItem[]>(`/menu/items?ids=${idsParam}`)
  }

  /**
   * 驗證購物車項目是否仍然有效（價格、可用性等）
   */
  static async validateCartItems(items: Array<{menuItemId: number, quantity: number}>): Promise<ApiResponse<{
    validItems: Array<{menuItemId: number, currentPrice: number, available: boolean}>
    invalidItems: Array<{menuItemId: number, reason: string}>
  }>> {
    return HttpClient.post('/menu/validate-items', { items })
  }

  /**
   * 計算購物車總價（包含稅費和服務費）
   */
  static async calculateTotal(items: Array<{menuItemId: number, quantity: number}>): Promise<ApiResponse<{
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
    breakdown: Array<{menuItemId: number, itemTotal: number}>
  }>> {
    return HttpClient.post('/orders/calculate-total', { items })
  }

  /**
   * 應用優惠券到購物車
   */
  static async applyCoupon(couponCode: string, items: Array<{menuItemId: number, quantity: number}>): Promise<ApiResponse<{
    valid: boolean
    discount: number
    newTotal: number
    message: string
  }>> {
    return HttpClient.post('/coupons/apply', { 
      couponCode, 
      items 
    })
  }

  /**
   * 創建訂單（從購物車結帳）
   */
  static async checkout(cartData: {
    items: Array<{
      menuItemId: number
      quantity: number
      specialRequests?: string
    }>
    customerInfo?: {
      name?: string
      phone?: string
      address?: string
    }
    paymentMethod?: string
    appliedCoupons?: string[]
    notes?: string
  }): Promise<ApiResponse<{orderId: number, total: number}>> {
    const orderRequest: CreateOrderRequest = {
      customerId: cartData.customerInfo?.id || 'guest-user',
      tableNumber: cartData.tableNumber || '1',
      items: cartData.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialRequests: item.specialRequests || ''
      })),
      paymentMethod: (cartData.paymentMethod || 'CASH') as PaymentMethod,
      specialInstructions: cartData.notes || ''
    }

    return HttpClient.post<{orderId: number, total: number}>('/orders', orderRequest)
  }

  /**
   * 獲取推薦商品（基於購物車內容）
   */
  static async getRecommendations(cartItems: Array<{menuItemId: number}>): Promise<ApiResponse<MenuItem[]>> {
    const itemIds = cartItems.map(item => item.menuItemId)
    return HttpClient.post<MenuItem[]>('/menu/recommendations', { currentItems: itemIds })
  }

  /**
   * 保存購物車到用戶賬戶（登入用戶）
   */
  static async saveCart(items: Array<{
    menuItemId: number
    quantity: number
    specialRequests?: string
  }>): Promise<ApiResponse<{success: boolean}>> {
    return HttpClient.post<{success: boolean}>('/users/me/cart', { items })
  }

  /**
   * 從用戶賬戶加載已保存的購物車
   */
  static async loadSavedCart(): Promise<ApiResponse<Array<{
    menuItemId: number
    quantity: number
    specialRequests?: string
    savedAt: string
  }>>> {
    return HttpClient.get('/users/me/cart')
  }

  /**
   * 清空已保存的購物車
   */
  static async clearSavedCart(): Promise<ApiResponse<{success: boolean}>> {
    return HttpClient.delete<{success: boolean}>('/users/me/cart')
  }
}