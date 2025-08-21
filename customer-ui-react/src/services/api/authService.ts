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
    const response = await HttpClient.post<AuthResponse>('/users/login', credentials)
    
    if (response.success && response.data) {
      // 保存認證信息到本地存儲
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      localStorage.setItem('tokenExpiry', (Date.now() + response.data.expiresIn * 1000).toString())
    }
    
    return response
  }

  /**
   * 快速登入（開發測試用）
   */
  static async quickLogin(role: 'customer' | 'staff' | 'admin'): Promise<ApiResponse<AuthResponse>> {
    const mockCredentials: LoginRequest = {
      email: `${role}@ranbow.com`,
      password: 'password123'
    }
    
    return this.login(mockCredentials)
  }

  /**
   * 用戶註冊
   */
  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await HttpClient.post<AuthResponse>('/users/register', userData)
    
    if (response.success && response.data) {
      // 註冊成功後自動登入
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      localStorage.setItem('tokenExpiry', (Date.now() + response.data.expiresIn * 1000).toString())
    }
    
    return response
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
    const response = await HttpClient.get<User>('/users/me')
    
    if (response.success && response.data) {
      localStorage.setItem('currentUser', JSON.stringify(response.data))
    }
    
    return response
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