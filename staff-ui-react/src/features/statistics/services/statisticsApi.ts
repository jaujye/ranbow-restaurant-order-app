/**
 * Statistics API Service - 完全對齊後端StaffController API
 * 統計數據API服務層 - 與Spring Boot後端整合
 */

import axios, { AxiosResponse } from 'axios';
import { DailyStats, WeeklyStats, MonthlyStats, TeamStats, LeaderboardEntry } from '../store/statisticsStore';

// API基礎配置 - 對齊環境變量配置
const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8081/ws',
};

const api = axios.create({
  baseURL: ENV_CONFIG.API_BASE_URL,
  timeout: ENV_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staff-token') || sessionStorage.getItem('staff-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 統一錯誤處理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token過期或無效，重定向到登入頁面
      localStorage.removeItem('staff-token');
      sessionStorage.removeItem('staff-token');
      window.location.href = '/staff/login';
    }
    
    return Promise.reject(error);
  }
);

// API端點常量 - 對齊後端StaffController
export const STATS_API_ENDPOINTS = {
  // 個人統計
  STATS_DAILY: (staffId: string) => `/staff/${staffId}/stats/daily`,
  STATS_WEEKLY: (staffId: string) => `/staff/${staffId}/stats/weekly`,
  STATS_MONTHLY: (staffId: string) => `/staff/${staffId}/stats/monthly`,
  
  // 團隊統計
  TEAM_STATS: '/staff/team/stats',
  LEADERBOARD: '/staff/leaderboard',
} as const;

// 統計數據API服務類 - 對齊後端StaffController
export class StatisticsApiService {
  /**
   * 獲取員工每日統計數據
   * 對應後端: GET /api/staff/{staffId}/stats/daily?date={date}
   */
  static async getDailyStats(
    staffId: string, 
    date?: string
  ): Promise<DailyStats> {
    try {
      const response: AxiosResponse<DailyStats> = await api.get(
        STATS_API_ENDPOINTS.STATS_DAILY(staffId),
        {
          params: date ? { date } : {}
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('獲取每日統計失敗:', error);
      throw new Error('無法獲取每日統計數據');
    }
  }

  /**
   * 獲取員工每週統計數據
   * 對應後端: GET /api/staff/{staffId}/stats/weekly?weekStart={weekStart}
   */
  static async getWeeklyStats(
    staffId: string, 
    weekStart?: string
  ): Promise<WeeklyStats> {
    try {
      const response: AxiosResponse<WeeklyStats> = await api.get(
        STATS_API_ENDPOINTS.STATS_WEEKLY(staffId),
        {
          params: weekStart ? { weekStart } : {}
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('獲取每週統計失敗:', error);
      throw new Error('無法獲取每週統計數據');
    }
  }

  /**
   * 獲取員工每月統計數據
   * 對應後端: GET /api/staff/{staffId}/stats/monthly?monthStart={monthStart}
   */
  static async getMonthlyStats(
    staffId: string, 
    monthStart?: string
  ): Promise<MonthlyStats> {
    try {
      const response: AxiosResponse<MonthlyStats> = await api.get(
        STATS_API_ENDPOINTS.STATS_MONTHLY(staffId),
        {
          params: monthStart ? { monthStart } : {}
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('獲取每月統計失敗:', error);
      throw new Error('無法獲取每月統計數據');
    }
  }

  /**
   * 獲取團隊統計數據
   * 對應後端: GET /api/staff/team/stats
   */
  static async getTeamStats(): Promise<TeamStats> {
    try {
      const response: AxiosResponse<TeamStats> = await api.get(
        STATS_API_ENDPOINTS.TEAM_STATS
      );
      
      return response.data;
    } catch (error) {
      console.error('獲取團隊統計失敗:', error);
      throw new Error('無法獲取團隊統計數據');
    }
  }

  /**
   * 獲取員工排行榜
   * 對應後端: GET /api/staff/leaderboard?period={period}&limit={limit}
   */
  static async getLeaderboard(
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY',
    limit: number = 10
  ): Promise<{ period: string; leaderboard: LeaderboardEntry[]; totalEntries: number }> {
    try {
      const response: AxiosResponse<{ period: string; leaderboard: LeaderboardEntry[]; totalEntries: number }> = await api.get(
        STATS_API_ENDPOINTS.LEADERBOARD,
        {
          params: { period, limit }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      throw new Error('無法獲取員工排行榜');
    }
  }
}

// 默認導出
export default StatisticsApiService;

// 命名導出，用於特定功能
export const statisticsApi = {
  getDailyStats: StatisticsApiService.getDailyStats,
  getWeeklyStats: StatisticsApiService.getWeeklyStats,
  getMonthlyStats: StatisticsApiService.getMonthlyStats,
  getTeamStats: StatisticsApiService.getTeamStats,
  getLeaderboard: StatisticsApiService.getLeaderboard,
};

// 輔助函數 - 錯誤處理
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '發生未知錯誤，請稍後再試';
};

// 數據格式化工具 - 與後端API響應格式匹配
export const formatStatsData = {
  // 格式化數字
  formatNumber: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },

  // 格式化貨幣
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(value);
  },

  // 格式化百分比
  formatPercentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  },

  // 格式化時間（分鐘）
  formatTime: (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}分鐘`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}小時${remainingMinutes > 0 ? remainingMinutes + '分鐘' : ''}`;
  },

  // 格式化評分
  formatRating: (rating: number): string => {
    return `${rating.toFixed(1)}/5.0`;
  },

  // 格式化日期
  formatDate: (date: string, format: 'short' | 'long' = 'short'): string => {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('zh-TW');
    }
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  },

  // 計算趨勢
  calculateTrend: (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (previous === 0) return 'stable';
    const changePercent = ((current - previous) / previous) * 100;
    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'stable';
  },

  // 格式化變化百分比
  formatChangePercent: (current: number, previous: number): string => {
    if (previous === 0) return '0%';
    const changePercent = ((current - previous) / previous) * 100;
    const sign = changePercent > 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(1)}%`;
  },

  // 從後端DailyStats響應中提取UI需要的數據
  extractDailyStatsForUI: (apiResponse: DailyStats): {
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    averageProcessingTime: number;
    totalRevenue: number;
    efficiencyScore: number;
    hoursWorked: number;
    customerRating: number;
  } => {
    if (!apiResponse.hasData) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        completionRate: 0,
        averageProcessingTime: 0,
        totalRevenue: 0,
        efficiencyScore: 0,
        hoursWorked: 0,
        customerRating: 0,
      };
    }

    const stats = apiResponse.statistics;
    return {
      totalOrders: stats.ordersProcessed,
      completedOrders: stats.ordersCompleted,
      completionRate: stats.ordersCompleted / stats.ordersProcessed,
      averageProcessingTime: stats.averageProcessingTime,
      totalRevenue: stats.totalRevenue,
      efficiencyScore: stats.efficiencyScore,
      hoursWorked: stats.hoursWorked,
      customerRating: stats.customerRating,
    };
  },

  // 從後端TeamStats響應中提取UI需要的數據
  extractTeamStatsForUI: (apiResponse: TeamStats): {
    totalStaff: number;
    activeStaff: number;
    todayOrdersProcessed: number;
    todayAverageProcessingTime: number;
    todayEfficiencyScore: number;
    todayRevenue: number;
    topPerformers: Array<{
      staffId: string;
      name: string;
      ordersProcessed: number;
      efficiencyScore: number;
    }>;
    departmentStats: {
      [department: string]: {
        staffCount: number;
        ordersProcessed: number;
        averageTime: number;
      };
    };
  } => {
    return {
      totalStaff: apiResponse.totalStaff,
      activeStaff: apiResponse.activeStaff,
      todayOrdersProcessed: apiResponse.todayOrdersProcessed,
      todayAverageProcessingTime: apiResponse.todayAverageProcessingTime,
      todayEfficiencyScore: apiResponse.todayEfficiencyScore,
      todayRevenue: apiResponse.todayRevenue,
      topPerformers: apiResponse.topPerformers,
      departmentStats: apiResponse.departmentStats,
    };
  },
};

// 測試API連接性的函數
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/staff/test-connection');
    return response.status === 200;
  } catch (error) {
    console.warn('API連接測試失敗:', error);
    return false;
  }
};