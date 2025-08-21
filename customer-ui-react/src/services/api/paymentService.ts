import { HttpClient, ApiResponse } from './client'
import { 
  Payment, 
  CreatePaymentRequest, 
  ProcessPaymentRequest, 
  PaymentMethod, 
  PaymentStatus 
} from './types'

/**
 * 支付服務 - 處理支付相關的 API 調用
 */
export class PaymentService {
  /**
   * 創建支付記錄
   */
  static async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>('/payments', paymentData)
  }

  /**
   * 獲取支付詳情
   */
  static async getPayment(id: number): Promise<ApiResponse<Payment>> {
    return HttpClient.get<Payment>(`/payments/${id}`)
  }

  /**
   * 處理支付
   */
  static async processPayment(id: number, processData: ProcessPaymentRequest): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${id}/process`, processData)
  }

  /**
   * 獲取訂單的支付記錄
   */
  static async getOrderPayments(orderId: number): Promise<ApiResponse<Payment[]>> {
    return HttpClient.get<Payment[]>(`/payments/order/${orderId}`)
  }

  /**
   * 取消支付
   */
  static async cancelPayment(id: number, reason?: string): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${id}/cancel`, { reason })
  }

  /**
   * 申請退款
   */
  static async refundPayment(id: number, refundData: {
    amount?: number
    reason: string
  }): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${id}/refund`, refundData)
  }

  /**
   * 驗證支付狀態
   */
  static async verifyPayment(id: number): Promise<ApiResponse<{
    status: PaymentStatus
    verified: boolean
    transactionId?: string
  }>> {
    return HttpClient.get(`/payments/${id}/verify`)
  }

  /**
   * 獲取支付方式列表
   */
  static async getPaymentMethods(): Promise<ApiResponse<Array<{
    method: PaymentMethod
    name: string
    description: string
    enabled: boolean
    fee: number
    icon?: string
  }>>> {
    return HttpClient.get('/payments/methods')
  }

  /**
   * 現金支付處理
   */
  static async processCashPayment(paymentId: number, data: {
    receivedAmount: number
    changeAmount: number
  }): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${paymentId}/cash`, data)
  }

  /**
   * 信用卡支付處理
   */
  static async processCreditCardPayment(paymentId: number, data: {
    cardToken: string
    cardLast4: string
    cardBrand: string
  }): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${paymentId}/credit-card`, data)
  }

  /**
   * LINE Pay 支付處理
   */
  static async processLinePayPayment(paymentId: number): Promise<ApiResponse<{
    paymentUrl: string
    transactionId: string
    qrCode?: string
  }>> {
    return HttpClient.post(`/payments/${paymentId}/line-pay`)
  }

  /**
   * Apple Pay 支付處理
   */
  static async processApplePayPayment(paymentId: number, data: {
    paymentData: any
    signature: string
  }): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/${paymentId}/apple-pay`, data)
  }

  /**
   * 獲取 LINE Pay 支付狀態
   */
  static async getLinePayStatus(transactionId: string): Promise<ApiResponse<{
    status: PaymentStatus
    transactionId: string
    info: any
  }>> {
    return HttpClient.get(`/payments/line-pay/status/${transactionId}`)
  }

  /**
   * 確認 LINE Pay 支付
   */
  static async confirmLinePayPayment(transactionId: string, confirmationCode: string): Promise<ApiResponse<Payment>> {
    return HttpClient.post<Payment>(`/payments/line-pay/confirm/${transactionId}`, {
      confirmationCode
    })
  }

  /**
   * 獲取支付歷史記錄
   */
  static async getPaymentHistory(params?: {
    startDate?: string
    endDate?: string
    status?: PaymentStatus
    method?: PaymentMethod
    limit?: number
    page?: number
  }): Promise<ApiResponse<{
    payments: Payment[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get(`/payments/history${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 獲取支付統計
   */
  static async getPaymentStats(period?: 'today' | 'week' | 'month' | 'year'): Promise<ApiResponse<{
    totalAmount: number
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    methodBreakdown: Record<PaymentMethod, {
      count: number
      amount: number
      percentage: number
    }>
    averageTransactionValue: number
  }>> {
    const queryString = period ? `?period=${period}` : ''
    return HttpClient.get(`/payments/stats${queryString}`)
  }

  /**
   * 生成支付收據
   */
  static async generatePaymentReceipt(id: number): Promise<ApiResponse<{
    receiptUrl: string
    receiptNumber: string
    issueDate: string
  }>> {
    return HttpClient.post(`/payments/${id}/receipt`)
  }

  /**
   * 發送支付確認郵件
   */
  static async sendPaymentConfirmation(id: number, email?: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>(`/payments/${id}/send-confirmation`, { email })
  }

  /**
   * 檢查支付是否可以退款
   */
  static async canRefund(id: number): Promise<ApiResponse<{
    canRefund: boolean
    reason?: string
    maxRefundAmount: number
  }>> {
    return HttpClient.get(`/payments/${id}/can-refund`)
  }

  /**
   * 獲取退款歷史
   */
  static async getRefundHistory(paymentId: number): Promise<ApiResponse<Array<{
    id: number
    amount: number
    reason: string
    status: 'PENDING' | 'COMPLETED' | 'FAILED'
    createdAt: string
    completedAt?: string
  }>>> {
    return HttpClient.get(`/payments/${paymentId}/refunds`)
  }

  /**
   * 測試支付連接
   */
  static async testPaymentConnection(method: PaymentMethod): Promise<ApiResponse<{
    connected: boolean
    latency: number
    error?: string
  }>> {
    return HttpClient.post(`/payments/test/${method}`)
  }
}