import { HttpClient, ApiResponse } from './client'
import { User } from './types'

/**
 * 用戶個人資料更新請求
 */
export interface UpdateProfileRequest {
  username?: string
  phoneNumber?: string
  birthday?: string
  avatarUrl?: string
}

/**
 * 密碼修改請求
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * 用戶地址介面
 */
export interface UserAddress {
  id: string
  label: string
  recipientName: string
  phoneNumber: string
  address: string
  isDefault: boolean
}

/**
 * 優惠券介面
 */
export interface UserCoupon {
  id: string
  title: string
  description: string
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_ITEM'
  discountValue: number
  minOrderAmount: number
  expiryDate: string
  usedAt?: string
}

/**
 * 用戶評價介面
 */
export interface UserReview {
  id: string
  restaurantName: string
  rating: number
  content: string
  items: string[]
  date: string
}

/**
 * 會話資料介面
 */
export interface SessionData {
  sessionId: string
  deviceInfo: string
  ipAddress: string
  createdAt: string
  lastActivity: string
  isCurrentSession: boolean
}

/**
 * 個人資料服務 - 處理用戶個人資料相關的 API 調用
 */
export class ProfileService {
  /**
   * 獲取當前用戶資料
   */
  static async getCurrentUser(): Promise<ApiResponse<{user: User, sessionId: string}>> {
    return HttpClient.get<{user: User, sessionId: string}>('/users/me')
  }

  /**
   * 獲取用戶個人資料
   */
  static async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    return HttpClient.get<User>(`/users/${userId}/profile`)
  }

  /**
   * 更新用戶個人資料
   */
  static async updateProfile(userId: string, profileData: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return HttpClient.put<User>(`/users/${userId}/profile`, profileData)
  }

  /**
   * 更新當前用戶個人資料
   */
  static async updateCurrentUserProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<User>> {
    // 首先獲取當前用戶ID
    const currentUserResponse = await this.getCurrentUser()
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return {
        success: false,
        error: 'Failed to get current user'
      }
    }
    
    return this.updateProfile(currentUserResponse.data.user.id, profileData)
  }

  /**
   * 修改密碼
   */
  static async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<ApiResponse<{success: boolean, message: string}>> {
    return HttpClient.post<{success: boolean, message: string}>(`/users/${userId}/change-password`, passwordData)
  }

  /**
   * 修改當前用戶密碼
   */
  static async changeCurrentUserPassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<{success: boolean, message: string}>> {
    // 首先獲取當前用戶ID
    const currentUserResponse = await this.getCurrentUser()
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return {
        success: false,
        error: 'Failed to get current user'
      }
    }
    
    return this.changePassword(currentUserResponse.data.user.id, passwordData)
  }

  /**
   * 獲取用戶優惠券
   */
  static async getUserCoupons(userId: string): Promise<ApiResponse<{
    available: UserCoupon[]
    used: UserCoupon[]
  }>> {
    return HttpClient.get(`/users/${userId}/coupons`)
  }

  /**
   * 獲取當前用戶優惠券
   */
  static async getCurrentUserCoupons(): Promise<ApiResponse<{
    available: UserCoupon[]
    used: UserCoupon[]
  }>> {
    const currentUserResponse = await this.getCurrentUser()
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return {
        success: false,
        error: 'Failed to get current user'
      }
    }
    
    return this.getUserCoupons(currentUserResponse.data.user.id)
  }

  /**
   * 獲取用戶地址列表
   */
  static async getUserAddresses(userId: string): Promise<ApiResponse<UserAddress[]>> {
    return HttpClient.get<UserAddress[]>(`/users/${userId}/addresses`)
  }

  /**
   * 獲取當前用戶地址列表
   */
  static async getCurrentUserAddresses(): Promise<ApiResponse<UserAddress[]>> {
    const currentUserResponse = await this.getCurrentUser()
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return {
        success: false,
        error: 'Failed to get current user'
      }
    }
    
    return this.getUserAddresses(currentUserResponse.data.user.id)
  }

  /**
   * 獲取用戶評價列表
   */
  static async getUserReviews(userId: string): Promise<ApiResponse<UserReview[]>> {
    return HttpClient.get<UserReview[]>(`/users/${userId}/reviews`)
  }

  /**
   * 獲取當前用戶評價列表
   */
  static async getCurrentUserReviews(): Promise<ApiResponse<UserReview[]>> {
    const currentUserResponse = await this.getCurrentUser()
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return {
        success: false,
        error: 'Failed to get current user'
      }
    }
    
    return this.getUserReviews(currentUserResponse.data.user.id)
  }

  /**
   * 獲取用戶活動會話列表
   */
  static async getUserSessions(): Promise<ApiResponse<{sessions: SessionData[]}>> {
    return HttpClient.get('/users/sessions')
  }

  /**
   * 登出所有其他會話
   */
  static async logoutAllOtherSessions(): Promise<ApiResponse<{success: boolean, message: string}>> {
    return HttpClient.post<{success: boolean, message: string}>('/users/logout-all')
  }

  /**
   * 刷新令牌
   */
  static async refreshToken(): Promise<ApiResponse<{success: boolean, token: string}>> {
    return HttpClient.post<{success: boolean, token: string}>('/users/refresh-token')
  }

  /**
   * 獲取用戶統計資料
   */
  static async getUserStats(): Promise<ApiResponse<{
    totalOrders: number
    totalSpent: number
    favoriteItems: Array<{name: string, orderCount: number}>
    memberSince: string
    loyaltyPoints: number
  }>> {
    return HttpClient.get('/users/me/stats')
  }

  /**
   * 上傳頭像
   */
  static async uploadAvatar(file: File): Promise<ApiResponse<{avatarUrl: string}>> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return HttpClient.post<{avatarUrl: string}>('/users/me/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * 刪除頭像
   */
  static async deleteAvatar(): Promise<ApiResponse<{success: boolean}>> {
    return HttpClient.delete<{success: boolean}>('/users/me/avatar')
  }

  /**
   * 驗證當前密碼
   */
  static async verifyCurrentPassword(password: string): Promise<ApiResponse<{valid: boolean}>> {
    return HttpClient.post<{valid: boolean}>('/users/me/verify-password', { password })
  }

  /**
   * 更新個人偏好設定
   */
  static async updatePreferences(preferences: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    language?: string
    theme?: 'light' | 'dark' | 'auto'
  }): Promise<ApiResponse<{success: boolean}>> {
    return HttpClient.put<{success: boolean}>('/users/me/preferences', preferences)
  }

  /**
   * 獲取個人偏好設定
   */
  static async getPreferences(): Promise<ApiResponse<{
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    language: string
    theme: 'light' | 'dark' | 'auto'
  }>> {
    return HttpClient.get('/users/me/preferences')
  }

  /**
   * 申請刪除帳號
   */
  static async requestAccountDeletion(reason?: string): Promise<ApiResponse<{success: boolean, message: string}>> {
    return HttpClient.post<{success: boolean, message: string}>('/users/me/request-deletion', { reason })
  }

  /**
   * 取消刪除帳號申請
   */
  static async cancelAccountDeletion(): Promise<ApiResponse<{success: boolean, message: string}>> {
    return HttpClient.post<{success: boolean, message: string}>('/users/me/cancel-deletion')
  }
}