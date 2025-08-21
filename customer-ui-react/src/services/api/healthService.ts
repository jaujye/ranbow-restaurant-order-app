import { HttpClient, ApiResponse } from './client'
import { HealthCheckResponse, DashboardStats } from './types'

/**
 * 系統健康檢查服務
 */
export class HealthService {
  /**
   * 檢查系統健康狀態
   */
  static async checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
    return HttpClient.get<HealthCheckResponse>('/health')
  }

  /**
   * 檢查 API 連接狀態
   */
  static async checkApiConnection(): Promise<boolean> {
    try {
      const response = await this.checkHealth()
      return response.success && response.data?.status === 'UP'
    } catch (error) {
      console.error('API connection check failed:', error)
      return false
    }
  }

  /**
   * 檢查數據庫連接狀態
   */
  static async checkDatabaseConnection(): Promise<ApiResponse<{ connected: boolean; latency: number }>> {
    return HttpClient.get('/health/database')
  }

  /**
   * 檢查 Redis 連接狀態
   */
  static async checkRedisConnection(): Promise<ApiResponse<{ connected: boolean; latency: number }>> {
    return HttpClient.get('/health/redis')
  }

  /**
   * 獲取系統信息
   */
  static async getSystemInfo(): Promise<ApiResponse<{
    version: string
    buildDate: string
    uptime: number
    environment: string
    javaVersion: string
    memoryUsage: {
      used: number
      max: number
      free: number
      percentage: number
    }
  }>> {
    return HttpClient.get('/health/info')
  }

  /**
   * 獲取儀表板統計數據
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return HttpClient.get<DashboardStats>('/dashboard/stats')
  }

  /**
   * 獲取服務器性能指標
   */
  static async getPerformanceMetrics(): Promise<ApiResponse<{
    cpu: {
      usage: number
      cores: number
    }
    memory: {
      used: number
      total: number
      free: number
      percentage: number
    }
    disk: {
      used: number
      total: number
      free: number
      percentage: number
    }
    network: {
      bytesIn: number
      bytesOut: number
    }
  }>> {
    return HttpClient.get('/health/metrics')
  }

  /**
   * 執行系統診斷
   */
  static async runDiagnostics(): Promise<ApiResponse<{
    overall: 'HEALTHY' | 'WARNING' | 'ERROR'
    checks: Array<{
      name: string
      status: 'PASS' | 'WARN' | 'FAIL'
      message: string
      duration: number
    }>
    recommendations: string[]
  }>> {
    return HttpClient.post('/health/diagnostics')
  }

  /**
   * 檢查外部服務連接
   */
  static async checkExternalServices(): Promise<ApiResponse<{
    services: Array<{
      name: string
      url: string
      status: 'UP' | 'DOWN'
      responseTime: number
      lastChecked: string
    }>
  }>> {
    return HttpClient.get('/health/external')
  }

  /**
   * 獲取錯誤日誌摘要
   */
  static async getErrorSummary(hours = 24): Promise<ApiResponse<{
    totalErrors: number
    errorsByType: Record<string, number>
    recentErrors: Array<{
      timestamp: string
      level: string
      message: string
      exception?: string
    }>
  }>> {
    return HttpClient.get(`/health/errors?hours=${hours}`)
  }

  /**
   * 清除系統緩存
   */
  static async clearCache(): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/health/cache/clear')
  }

  /**
   * 重新加載配置
   */
  static async reloadConfiguration(): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/health/config/reload')
  }

  /**
   * 獲取 API 端點狀態
   */
  static async getEndpointStatus(): Promise<ApiResponse<Array<{
    endpoint: string
    method: string
    status: 'ACTIVE' | 'DEPRECATED' | 'DISABLED'
    responseTime: number
    errorRate: number
    lastAccessed: string
  }>>> {
    return HttpClient.get('/health/endpoints')
  }
}