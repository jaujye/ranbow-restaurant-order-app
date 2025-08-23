/**
 * 🌐 API Client Configuration
 * Axios HTTP client with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-hot-toast'
import { API_CONFIG } from '@/config/api'

// 🌍 Environment Detection
const getBaseURL = (): string => {
  // Use environment variable or fallback to config
  const envApiUrl = import.meta.env.VITE_API_BASE_URL
  
  if (envApiUrl) {
    return envApiUrl
  }
  
  return API_CONFIG.BASE_URL
}

// 🔄 Request/Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface APIError {
  code: string
  message: string
  details?: any
  field?: string
  timestamp: string
}

// 📡 Create Axios Instance
const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseURL(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // 🔐 Request Interceptor - Add Auth Token
  client.interceptors.request.use(
    (config) => {
      // Get auth token from localStorage or auth store
      const token = localStorage.getItem('authToken')
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Add device information
      const deviceId = localStorage.getItem('deviceId')
      if (deviceId) {
        config.headers['X-Device-ID'] = deviceId
      }
      
      // Add request timestamp
      config.headers['X-Request-Time'] = new Date().toISOString()
      
      // Log requests in development
      if (import.meta.env.MODE === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          headers: config.headers
        })
      }
      
      return config
    },
    (error) => {
      console.error('❌ Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // 📥 Response Interceptor - Handle Responses & Errors
  client.interceptors.response.use(
    (response: AxiosResponse<APIResponse>) => {
      // Log responses in development
      if (import.meta.env.MODE === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data
        })
      }
      
      // Check if response indicates failure
      if (response.data && !response.data.success) {
        const error = new Error(response.data.message || 'API request failed')
        ;(error as any).apiError = response.data
        throw error
      }
      
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any
      
      // Log errors in development
      if (import.meta.env.MODE === 'development') {
        console.error('❌ API Error:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
      }
      
      // Handle specific HTTP status codes
      if (error.response) {
        const status = error.response.status
        const data = error.response.data as APIError
        
        switch (status) {
          case 401: // Unauthorized
            handleUnauthorized()
            break
            
          case 403: // Forbidden
            toast.error('您沒有執行此操作的權限')
            break
            
          case 404: // Not Found
            toast.error('請求的資源不存在')
            break
            
          case 429: // Too Many Requests
            toast.error('請求過於頻繁，請稍後再試')
            break
            
          case 500: // Internal Server Error
            toast.error('伺服器內部錯誤，請稍後再試')
            break
            
          case 502: // Bad Gateway
          case 503: // Service Unavailable
          case 504: // Gateway Timeout
            toast.error('服務暫時無法使用，請稍後再試')
            break
            
          default:
            if (data?.message) {
              toast.error(data.message)
            } else {
              toast.error(`請求失敗 (${status})`)
            }
        }
        
        // Add structured error information
        const enhancedError = new Error(data?.message || error.message)
        ;(enhancedError as any).status = status
        ;(enhancedError as any).apiError = data
        ;(enhancedError as any).originalRequest = originalRequest
        
        return Promise.reject(enhancedError)
      }
      
      // Network errors
      if (error.code === 'ECONNABORTED') {
        toast.error('請求超時，請檢查網路連線')
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('網路連線錯誤，請檢查網路設定')
      } else {
        toast.error('網路請求失敗')
      }
      
      return Promise.reject(error)
    }
  )

  return client
}

// 🔐 Handle Unauthorized Access
const handleUnauthorized = () => {
  // Clear stored auth data
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('staff-auth-storage')
  
  // Show error message
  toast.error('登入已過期，請重新登入')
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}

// 📡 Export API Client Instance
export const apiClient = createAPIClient()

// 🔄 Retry Mechanism Helper
export const withRetry = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx)
      if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break
      }
      
      // Wait before retry with exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      console.warn(`🔄 Retrying API request (attempt ${attempt + 1}/${maxAttempts})`)
    }
  }
  
  throw lastError!
}

// 📊 Request Helper Functions
export const createAPIRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<APIResponse<T>>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<APIResponse<T>>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<APIResponse<T>>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<APIResponse<T>>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<APIResponse<T>>(url, config)
}

// 🔍 Health Check Function
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health')
    return response.data.success
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}

// 📈 API Monitoring
export class APIMonitor {
  private static instance: APIMonitor
  private requestCount = 0
  private errorCount = 0
  private totalResponseTime = 0
  private startTime = Date.now()

  static getInstance(): APIMonitor {
    if (!APIMonitor.instance) {
      APIMonitor.instance = new APIMonitor()
    }
    return APIMonitor.instance
  }

  recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++
    this.totalResponseTime += responseTime
    
    if (isError) {
      this.errorCount++
    }
  }

  getStats(): {
    requestCount: number
    errorCount: number
    successRate: number
    averageResponseTime: number
    uptime: number
  } {
    const successRate = this.requestCount > 0 
      ? ((this.requestCount - this.errorCount) / this.requestCount) * 100 
      : 0
    
    const averageResponseTime = this.requestCount > 0 
      ? this.totalResponseTime / this.requestCount 
      : 0
    
    const uptime = Date.now() - this.startTime
    
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      uptime
    }
  }

  reset(): void {
    this.requestCount = 0
    this.errorCount = 0
    this.totalResponseTime = 0
    this.startTime = Date.now()
  }
}

// 🏠 Environment Info
export const getEnvironmentInfo = () => ({
  mode: import.meta.env.MODE,
  baseURL: getBaseURL(),
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  build: import.meta.env.VITE_BUILD_NUMBER || 'unknown'
})

// Export everything needed
export default apiClient