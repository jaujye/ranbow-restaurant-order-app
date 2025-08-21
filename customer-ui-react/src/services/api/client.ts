import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API 環境配置
const API_CONFIG = {
  development: 'http://localhost:8080/api',
  production: 'http://192.168.0.113:8087/api'
}

// 獲取當前環境的 API URL
const getApiUrl = (): string => {
  return process.env.NODE_ENV === 'production' 
    ? API_CONFIG.production 
    : API_CONFIG.development
}

// HTTP 客戶端實例
const httpClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    }
    
    // 添加請求時間戳
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
httpClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[API Response Error]', error)
    
    // 處理常見錯誤狀態
    if (error.response) {
      const { status } = error.response
      
      switch (status) {
        case 401:
          // 未授權，清除本地存儲並重新導向到登入頁
          localStorage.removeItem('authToken')
          localStorage.removeItem('currentUser')
          window.location.href = '/login'
          break
        case 403:
          // 禁止訪問
          console.error('Access denied')
          break
        case 404:
          // 資源未找到
          console.error('Resource not found')
          break
        case 500:
          // 服務器錯誤
          console.error('Internal server error')
          break
        default:
          console.error(`HTTP Error: ${status}`)
      }
    } else if (error.request) {
      // 網絡錯誤
      console.error('Network error - no response received')
    }
    
    return Promise.reject(error)
  }
)

// API 響應包裝器
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// HTTP 方法包裝器
export class HttpClient {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.get<T>(url, config)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed'
      }
    }
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.post<T>(url, data, config)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed'
      }
    }
  }

  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.put<T>(url, data, config)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed'
      }
    }
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await httpClient.delete<T>(url, config)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Request failed'
      }
    }
  }
}

export default httpClient