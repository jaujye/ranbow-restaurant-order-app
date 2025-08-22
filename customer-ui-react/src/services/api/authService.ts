import { HttpClient, ApiResponse } from './client'
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from './types'

/**
 * 認證服務 - 處理用戶登入、註冊、登出等功能
 */
export class AuthService {
  /**
   * 用戶登入
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await HttpClient.post<{success: boolean, token: string, user: User, sessionId: string}>('/users/login', credentials)
    
    // 處理後端返回的格式：{success: true, token: "...", user: {...}, sessionId: "..."}
    if (response.success && response.data?.success && response.data.token && response.data.user) {
      // 保存認證信息到本地存儲
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      localStorage.setItem('sessionId', response.data.sessionId)
      // 設置默認過期時間為24小時（86400秒）
      localStorage.setItem('tokenExpiry', (Date.now() + 86400 * 1000).toString())
      
      // 返回標準化的格式
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
          expiresIn: 86400 // 24 hours
        }
      }
    }
    
    // 如果登入失敗，返回錯誤信息
    return {
      success: false,
      error: response.error || 'Login failed'
    }
  }

  /**
   * 快速登入（開發測試用）
   */
  static async quickLogin(role: 'customer' | 'staff' | 'admin'): Promise<ApiResponse<AuthResponse>> {
    // 創建測試用戶資料
    const mockUsers = {
      customer: {
        id: '503f3c93-e229-4a53-9671-1f12cc375c27',
        email: 'customer@ranbow.com',
        name: '測試顧客',
        phone: '0912345678',
        role: 'CUSTOMER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      staff: {
        id: 'mock-staff-001',
        email: 'staff@ranbow.com',
        name: '測試員工',
        phone: '0923456789',
        role: 'STAFF' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      admin: {
        id: 'mock-admin-001',
        email: 'admin@ranbow.com',
        name: '系統管理員',
        phone: '0934567890',
        role: 'ADMIN' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    // 生成模擬的 JWT token
    const mockToken = `mock-jwt-token-${role}-${Date.now()}`
    const mockExpiresIn = 86400 // 24 hours

    // 創建模擬響應
    const mockResponse: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: mockUsers[role],
        token: mockToken,
        expiresIn: mockExpiresIn
      }
    }

    // 保存認證信息到本地存儲
    if (mockResponse.success && mockResponse.data) {
      localStorage.setItem('authToken', mockResponse.data.token)
      localStorage.setItem('currentUser', JSON.stringify(mockResponse.data.user))
      localStorage.setItem('tokenExpiry', (Date.now() + mockResponse.data.expiresIn * 1000).toString())
    }

    // 模擬網絡延遲
    await new Promise(resolve => setTimeout(resolve, 500))

    return mockResponse
  }

  /**
   * 用戶註冊
   */
  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await HttpClient.post<{success: boolean, message: string, token?: string, user?: User, sessionId?: string}>('/users/register', userData)
    
    // 處理後端返回的格式：{success: true, message: "...", token: "...", user: {...}, sessionId: "..."}
    if (response.success && response.data?.success && response.data.token && response.data.user) {
      // 註冊成功後自動登入
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      localStorage.setItem('sessionId', response.data.sessionId || '')
      // 設置默認過期時間為24小時（86400秒）
      localStorage.setItem('tokenExpiry', (Date.now() + 86400 * 1000).toString())
      
      // 返回標準化的格式
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
          expiresIn: 86400 // 24 hours
        }
      }
    }
    
    // 如果註冊失敗，返回錯誤信息
    return {
      success: false,
      error: response.error || 'Registration failed'
    }
  }

  /**
   * 用戶登出
   */
  static async logout(): Promise<void> {
    try {
      // 可選：調用後端登出 API
      await HttpClient.post('/users/logout')
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout')
    } finally {
      // 清除本地存儲
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('tokenExpiry')
      localStorage.removeItem('cart')
    }
  }

  /**
   * 獲取當前用戶信息
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing current user:', error)
      return null
    }
  }

  /**
   * 檢查用戶是否已登入
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    const expiry = localStorage.getItem('tokenExpiry')
    
    if (!token || !expiry) {
      return false
    }
    
    // 檢查 token 是否過期
    const expiryTime = parseInt(expiry)
    if (Date.now() > expiryTime) {
      this.logout() // 清除過期的認證信息
      return false
    }
    
    return true
  }

  /**
   * 檢查用戶角色權限
   */
  static hasRole(requiredRole: User['role']): boolean {
    const user = this.getCurrentUser()
    return user?.role === requiredRole
  }

  /**
   * 檢查是否為管理員
   */
  static isAdmin(): boolean {
    return this.hasRole('ADMIN')
  }

  /**
   * 檢查是否為員工或管理員
   */
  static isStaffOrAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'STAFF' || user?.role === 'ADMIN'
  }

  /**
   * 獲取認證 token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  /**
   * 刷新用戶信息
   */
  static async refreshUser(): Promise<ApiResponse<User>> {
    // 檢查是否使用模擬 token（開發測試模式）
    const currentToken = localStorage.getItem('authToken')
    const currentUser = localStorage.getItem('currentUser')
    
    if (currentToken && currentToken.startsWith('mock-jwt-token-')) {
      // 如果是模擬 token，直接返回本地存儲的用戶資料，不調用後端 API
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser)
          return {
            success: true,
            data: user
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          return {
            success: false,
            error: 'Invalid stored user data'
          }
        }
      } else {
        return {
          success: false,
          error: 'No user data found for mock token'
        }
      }
    }
    
    // 對於真實 token，調用後端 API 進行驗證和刷新
    const response = await HttpClient.get<{success: boolean, user: User, sessionId: string}>('/users/me')
    
    // 處理後端返回的嵌套格式：{success: true, user: {...}, sessionId: "..."}
    if (response.success && response.data?.success && response.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      localStorage.setItem('sessionId', response.data.sessionId)
      
      // 返回標準化的格式，將 user 提取到 data 層級
      return {
        success: true,
        data: response.data.user
      }
    }
    
    // 如果後端返回錯誤或無效響應
    return {
      success: false,
      error: response.error || 'Failed to refresh user data'
    }
  }

  /**
   * 更新用戶資料
   */
  static async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await HttpClient.put<User>('/users/profile', userData)
    
    if (response.success && response.data) {
      localStorage.setItem('currentUser', JSON.stringify(response.data))
    }
    
    return response
  }

  /**
   * 修改密碼
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/users/change-password', {
      oldPassword,
      newPassword
    })
  }

  /**
   * 忘記密碼
   */
  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/users/forgot-password', { email })
  }

  /**
   * 重置密碼
   */
  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/users/reset-password', { token, newPassword })
  }
}