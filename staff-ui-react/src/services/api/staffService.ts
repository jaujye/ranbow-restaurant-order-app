/**
 * 👥 Staff API Service
 * API functions for staff authentication and management
 */

import { apiClient, createAPIRequest, withRetry, APIResponse } from './client'
import type {
  StaffMember,
  LoginCredentials,
  QuickSwitchCredentials,
  StaffLoginResponse,
  StaffPerformance,
  WorkShift,
  StaffActivity,
  StaffNotification
} from '@/types'

// 🔐 Authentication APIs
export const staffAuthService = {
  /**
   * Staff Login
   */
  login: async (credentials: LoginCredentials): Promise<StaffLoginResponse['data']> => {
    const response = await withRetry(() =>
      createAPIRequest.post<StaffLoginResponse['data']>('/staff/auth/login', credentials)
    )
    return response.data.data!
  },

  /**
   * Staff Logout
   */
  logout: async (): Promise<void> => {
    await createAPIRequest.post('/staff/auth/logout')
  },

  /**
   * Quick Staff Switch
   */
  quickSwitch: async (credentials: QuickSwitchCredentials): Promise<{
    newStaff: StaffMember
    newToken: string
    switchTime: string
  }> => {
    const response = await createAPIRequest.post<{
      newStaff: StaffMember
      newToken: string
      switchTime: string
    }>('/staff/auth/quick-switch', credentials)
    return response.data.data!
  },

  /**
   * Refresh Access Token
   */
  refreshToken: async (refreshToken: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> => {
    const response = await createAPIRequest.post<{
      accessToken: string
      refreshToken: string
      expiresIn: number
    }>('/staff/auth/refresh', { refreshToken })
    return response.data.data!
  },

  /**
   * Validate Token
   */
  validateToken: async (): Promise<{ valid: boolean; staff?: StaffMember }> => {
    try {
      const response = await createAPIRequest.get<{ valid: boolean; staff?: StaffMember }>('/staff/auth/validate')
      return response.data.data!
    } catch (error) {
      return { valid: false }
    }
  }
}

// 👤 Staff Management APIs
export const staffManagementService = {
  /**
   * Get Staff Profile
   */
  getProfile: async (staffId: string): Promise<StaffMember> => {
    const response = await createAPIRequest.get<StaffMember>(`/staff/${staffId}/profile`)
    return response.data.data!
  },

  /**
   * Update Staff Profile
   */
  updateProfile: async (staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await createAPIRequest.put<StaffMember>(`/staff/${staffId}/profile`, updates)
    return response.data.data!
  },

  /**
   * Get Available Staff for Quick Switch
   */
  getAvailableStaff: async (): Promise<StaffMember[]> => {
    const response = await createAPIRequest.get<StaffMember[]>('/staff/available')
    return response.data.data!
  },

  /**
   * Update Staff Status
   */
  updateStatus: async (staffId: string, status: 'ACTIVE' | 'BREAK' | 'BUSY' | 'OFFLINE'): Promise<void> => {
    await createAPIRequest.patch(`/staff/${staffId}/status`, { status })
  },

  /**
   * Get Staff Permissions
   */
  getPermissions: async (staffId: string): Promise<string[]> => {
    const response = await createAPIRequest.get<string[]>(`/staff/${staffId}/permissions`)
    return response.data.data!
  }
}

// 📊 Staff Performance APIs
export const staffPerformanceService = {
  /**
   * Get Staff Performance Data
   */
  getPerformance: async (
    staffId: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY',
    date?: string
  ): Promise<StaffPerformance> => {
    const params = new URLSearchParams({ period })
    if (date) params.append('date', date)
    
    const response = await createAPIRequest.get<StaffPerformance>(
      `/staff/${staffId}/performance?${params}`
    )
    return response.data.data!
  },

  /**
   * Get All Staff Performance (for managers)
   */
  getAllPerformance: async (
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY',
    date?: string
  ): Promise<StaffPerformance[]> => {
    const params = new URLSearchParams({ period })
    if (date) params.append('date', date)
    
    const response = await createAPIRequest.get<StaffPerformance[]>(
      `/staff/performance?${params}`
    )
    return response.data.data!
  },

  /**
   * Get Staff Rankings
   */
  getRankings: async (
    metric: 'efficiency' | 'orders' | 'revenue' = 'efficiency',
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'
  ): Promise<{ staffId: string; staffName: string; value: number; rank: number }[]> => {
    const response = await createAPIRequest.get<{ staffId: string; staffName: string; value: number; rank: number }[]>(
      `/staff/rankings?metric=${metric}&period=${period}`
    )
    return response.data.data!
  }
}

// 📅 Work Shift APIs
export const workShiftService = {
  /**
   * Get Current Work Shift
   */
  getCurrentShift: async (staffId: string): Promise<WorkShift | null> => {
    try {
      const response = await createAPIRequest.get<WorkShift>(`/staff/${staffId}/shift/current`)
      return response.data.data!
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Start Work Shift
   */
  startShift: async (staffId: string): Promise<WorkShift> => {
    const response = await createAPIRequest.post<WorkShift>(`/staff/${staffId}/shift/start`)
    return response.data.data!
  },

  /**
   * End Work Shift
   */
  endShift: async (staffId: string): Promise<WorkShift> => {
    const response = await createAPIRequest.post<WorkShift>(`/staff/${staffId}/shift/end`)
    return response.data.data!
  },

  /**
   * Start Break
   */
  startBreak: async (staffId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/${staffId}/break/start`)
  },

  /**
   * End Break
   */
  endBreak: async (staffId: string): Promise<void> => {
    await createAPIRequest.post(`/staff/${staffId}/break/end`)
  },

  /**
   * Get Shift History
   */
  getShiftHistory: async (
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkShift[]> => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
    
    const response = await createAPIRequest.get<WorkShift[]>(
      `/staff/${staffId}/shift/history?${params}`
    )
    return response.data.data!
  }
}

// 📈 Staff Activity APIs
export const staffActivityService = {
  /**
   * Log Staff Activity
   */
  logActivity: async (activity: Omit<StaffActivity, 'activityId' | 'createdAt'>): Promise<string> => {
    const response = await createAPIRequest.post<{ activityId: string }>('/staff/activity/log', activity)
    return response.data.data!.activityId
  },

  /**
   * Get Staff Activities
   */
  getActivities: async (
    staffId: string,
    startDate: Date,
    endDate: Date,
    activityType?: string
  ): Promise<StaffActivity[]> => {
    const params = new URLSearchParams({
      staffId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    
    if (activityType) {
      params.append('activityType', activityType)
    }
    
    const response = await createAPIRequest.get<StaffActivity[]>(`/staff/activities?${params}`)
    return response.data.data!
  },

  /**
   * Get Activity Summary
   */
  getActivitySummary: async (
    staffId: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY'
  ): Promise<Record<string, { count: number; totalDuration: number }>> => {
    const response = await createAPIRequest.get<Record<string, { count: number; totalDuration: number }>>(
      `/staff/${staffId}/activity/summary?period=${period}`
    )
    return response.data.data!
  }
}

// 🔔 Staff Notification APIs
export const staffNotificationService = {
  /**
   * Get Staff Notifications
   */
  getNotifications: async (
    staffId: string,
    page: number = 0,
    size: number = 20,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: StaffNotification[]
    pagination: {
      page: number
      size: number
      total: number
      totalPages: number
    }
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      unreadOnly: unreadOnly.toString()
    })
    
    const response = await createAPIRequest.get<{
      notifications: StaffNotification[]
      pagination: {
        page: number
        size: number
        total: number
        totalPages: number
      }
    }>(`/staff/${staffId}/notifications?${params}`)
    return response.data.data!
  },

  /**
   * Mark Notification as Read
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    await createAPIRequest.patch(`/staff/notifications/${notificationId}/read`)
  },

  /**
   * Mark All Notifications as Read
   */
  markAllAsRead: async (staffId: string): Promise<void> => {
    await createAPIRequest.patch(`/staff/${staffId}/notifications/read-all`)
  },

  /**
   * Delete Notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await createAPIRequest.delete(`/staff/notifications/${notificationId}`)
  },

  /**
   * Get Unread Count
   */
  getUnreadCount: async (staffId: string): Promise<number> => {
    const response = await createAPIRequest.get<{ count: number }>(`/staff/${staffId}/notifications/unread-count`)
    return response.data.data!.count
  }
}

// 📊 Staff Statistics APIs
export const staffStatsService = {
  /**
   * Get Dashboard Statistics
   */
  getDashboardStats: async (staffId: string): Promise<{
    todayStats: {
      ordersProcessed: number
      activeOrders: number
      pendingOrders: number
      avgProcessTime: number
      efficiency: number
    }
    weekStats: {
      totalOrders: number
      completionRate: number
      avgEfficiency: number
      rank: number
    }
  }> => {
    const response = await createAPIRequest.get<{
      todayStats: {
        ordersProcessed: number
        activeOrders: number
        pendingOrders: number
        avgProcessTime: number
        efficiency: number
      }
      weekStats: {
        totalOrders: number
        completionRate: number
        avgEfficiency: number
        rank: number
      }
    }>(`/staff/${staffId}/dashboard-stats`)
    return response.data.data!
  },

  /**
   * Get Efficiency Trends
   */
  getEfficiencyTrends: async (
    staffId: string,
    days: number = 7
  ): Promise<{ date: string; efficiency: number; orders: number }[]> => {
    const response = await createAPIRequest.get<{ date: string; efficiency: number; orders: number }[]>(
      `/staff/${staffId}/efficiency-trends?days=${days}`
    )
    return response.data.data!
  }
}

// 🔧 Staff Settings APIs
export const staffSettingsService = {
  /**
   * Get Staff Settings
   */
  getSettings: async (staffId: string): Promise<{
    notifications: {
      sound: boolean
      vibration: boolean
      desktop: boolean
    }
    preferences: {
      theme: 'light' | 'dark' | 'auto'
      language: string
      autoRefresh: boolean
    }
  }> => {
    const response = await createAPIRequest.get<{
      notifications: {
        sound: boolean
        vibration: boolean
        desktop: boolean
      }
      preferences: {
        theme: 'light' | 'dark' | 'auto'
        language: string
        autoRefresh: boolean
      }
    }>(`/staff/${staffId}/settings`)
    return response.data.data!
  },

  /**
   * Update Staff Settings
   */
  updateSettings: async (staffId: string, settings: {
    notifications?: {
      sound?: boolean
      vibration?: boolean
      desktop?: boolean
    }
    preferences?: {
      theme?: 'light' | 'dark' | 'auto'
      language?: string
      autoRefresh?: boolean
    }
  }): Promise<void> => {
    await createAPIRequest.patch(`/staff/${staffId}/settings`, settings)
  }
}

// Export all services
export const staffService = {
  auth: staffAuthService,
  management: staffManagementService,
  performance: staffPerformanceService,
  shifts: workShiftService,
  activities: staffActivityService,
  notifications: staffNotificationService,
  stats: staffStatsService,
  settings: staffSettingsService
}

export default staffService