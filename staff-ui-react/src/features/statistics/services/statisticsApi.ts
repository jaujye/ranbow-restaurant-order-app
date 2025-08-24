/**
 * Statistics API Service
 * 統計數據API服務層 - 與Spring Boot後端整合
 */

import axios, { AxiosResponse } from 'axios';
import { DailyStats, WeeklyStats, MonthlyStats, StaffPerformance, TeamStats, PerformanceMetrics } from '../store/statisticsStore';

// API基礎配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// API響應類型定義
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface StaffStatsResponse {
  dailyStats: DailyStats;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
}

interface LeaderboardResponse {
  leaderboard: StaffPerformance[];
  totalStaff: number;
  averagePerformance: number;
}

interface PerformanceReportResponse {
  metrics: PerformanceMetrics;
  chartData: {
    hourly: Array<{ hour: number; orders: number; efficiency: number }>;
    daily: Array<{ date: string; orders: number; revenue: number }>;
    weekly: Array<{ week: string; performance: number; trend: number }>;
  };
}

// 統計數據API服務類
export class StatisticsApiService {
  /**
   * 獲取員工每日統計數據
   */
  static async getDailyStats(
    staffId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyStats[]> {
    try {
      const response: AxiosResponse<ApiResponse<DailyStats[]>> = await api.get(
        `/staff/${staffId}/stats/daily`,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('獲取每日統計失敗:', error);
      throw new Error('無法獲取每日統計數據');
    }
  }

  /**
   * 獲取員工每週統計數據
   */
  static async getWeeklyStats(
    staffId: string, 
    startDate: string, 
    endDate: string
  ): Promise<WeeklyStats[]> {
    try {
      const response: AxiosResponse<ApiResponse<WeeklyStats[]>> = await api.get(
        `/staff/${staffId}/stats/weekly`,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('獲取每週統計失敗:', error);
      throw new Error('無法獲取每週統計數據');
    }
  }

  /**
   * 獲取員工每月統計數據
   */
  static async getMonthlyStats(
    staffId: string, 
    year: number, 
    month?: number
  ): Promise<MonthlyStats[]> {
    try {
      const response: AxiosResponse<ApiResponse<MonthlyStats[]>> = await api.get(
        `/staff/${staffId}/stats/monthly`,
        {
          params: { year, month }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('獲取每月統計失敗:', error);
      throw new Error('無法獲取每月統計數據');
    }
  }

  /**
   * 獲取個人綜合統計報告
   */
  static async getPersonalStatsReport(staffId: string): Promise<StaffStatsResponse> {
    try {
      const response: AxiosResponse<ApiResponse<StaffStatsResponse>> = await api.get(
        `/staff/${staffId}/stats/report`
      );
      
      return response.data.data;
    } catch (error) {
      console.error('獲取個人統計報告失敗:', error);
      throw new Error('無法獲取個人統計報告');
    }
  }

  /**
   * 獲取團隊統計數據
   */
  static async getTeamStats(
    department?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<TeamStats> {
    try {
      const response: AxiosResponse<ApiResponse<TeamStats>> = await api.get(
        '/staff/team/stats',
        {
          params: { department, startDate, endDate }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('獲取團隊統計失敗:', error);
      throw new Error('無法獲取團隊統計數據');
    }
  }

  /**
   * 獲取員工排行榜
   */
  static async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    department?: string,
    limit: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      const response: AxiosResponse<ApiResponse<LeaderboardResponse>> = await api.get(
        '/staff/leaderboard',
        {
          params: { period, department, limit }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      throw new Error('無法獲取員工排行榜');
    }
  }

  /**
   * 獲取績效指標
   */
  static async getPerformanceMetrics(
    staffId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PerformanceMetrics> {
    try {
      const endpoint = staffId 
        ? `/staff/${staffId}/performance/metrics`
        : '/staff/performance/metrics';
        
      const response: AxiosResponse<ApiResponse<PerformanceMetrics>> = await api.get(
        endpoint,
        {
          params: { startDate, endDate }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('獲取績效指標失敗:', error);
      throw new Error('無法獲取績效指標');
    }
  }

  /**
   * 獲取績效報告
   */
  static async getPerformanceReport(
    staffId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<PerformanceReportResponse> {
    try {
      const response: AxiosResponse<ApiResponse<PerformanceReportResponse>> = await api.get(
        `/staff/${staffId}/performance/report`,
        {
          params: { period }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('獲取績效報告失敗:', error);
      throw new Error('無法獲取績效報告');
    }
  }

  /**
   * 獲取部門統計對比
   */
  static async getDepartmentComparison(
    startDate: string,
    endDate: string
  ): Promise<Array<{
    department: string;
    totalOrders: number;
    totalRevenue: number;
    averageEfficiency: number;
    staffCount: number;
  }>> {
    try {
      const response = await api.get('/staff/departments/comparison', {
        params: { startDate, endDate }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('獲取部門對比失敗:', error);
      throw new Error('無法獲取部門統計對比');
    }
  }

  /**
   * 匯出統計報告
   */
  static async exportStatistics(
    format: 'csv' | 'pdf' | 'excel',
    config: {
      staffId?: string;
      startDate: string;
      endDate: string;
      includeCharts?: boolean;
      includeRawData?: boolean;
      metrics?: string[];
    }
  ): Promise<Blob> {
    try {
      const response = await api.post('/staff/stats/export', config, {
        params: { format },
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error) {
      console.error('匯出統計報告失敗:', error);
      throw new Error('無法匯出統計報告');
    }
  }

  /**
   * 更新績效目標
   */
  static async updatePerformanceGoals(
    staffId: string,
    goals: {
      dailyOrdersTarget: number;
      averageProcessingTimeTarget: number;
      completionRateTarget: number;
      customerRatingTarget: number;
    }
  ): Promise<boolean> {
    try {
      const response = await api.put(`/staff/${staffId}/performance/goals`, goals);
      return response.data.success;
    } catch (error) {
      console.error('更新績效目標失敗:', error);
      throw new Error('無法更新績效目標');
    }
  }

  /**
   * 獲取即時統計數據（WebSocket支援）
   */
  static async getRealTimeStats(staffId: string): Promise<{
    currentOrders: number;
    todayOrders: number;
    currentEfficiency: number;
    status: 'active' | 'break' | 'offline';
  }> {
    try {
      const response = await api.get(`/staff/${staffId}/stats/realtime`);
      return response.data.data;
    } catch (error) {
      console.error('獲取即時統計失敗:', error);
      throw new Error('無法獲取即時統計數據');
    }
  }

  /**
   * 提交績效評估
   */
  static async submitPerformanceReview(
    staffId: string,
    review: {
      period: string;
      selfRating: number;
      strengths: string[];
      improvements: string[];
      goals: string[];
      comments: string;
    }
  ): Promise<boolean> {
    try {
      const response = await api.post(`/staff/${staffId}/performance/review`, review);
      return response.data.success;
    } catch (error) {
      console.error('提交績效評估失敗:', error);
      throw new Error('無法提交績效評估');
    }
  }

  /**
   * 獲取歷史績效趨勢
   */
  static async getPerformanceTrends(
    staffId: string,
    months: number = 6
  ): Promise<Array<{
    month: string;
    efficiency: number;
    orders: number;
    revenue: number;
    rating: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    try {
      const response = await api.get(`/staff/${staffId}/performance/trends`, {
        params: { months }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('獲取績效趨勢失敗:', error);
      throw new Error('無法獲取績效趨勢');
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
  getPerformanceMetrics: StatisticsApiService.getPerformanceMetrics,
  exportStatistics: StatisticsApiService.exportStatistics,
};

// 輔助函數 - 錯誤處理
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.status === 404) {
    return '找不到請求的資源';
  }
  
  if (error.response?.status === 403) {
    return '沒有權限執行此操作';
  }
  
  if (error.response?.status >= 500) {
    return '服務器內部錯誤，請稍後再試';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return '網絡連接失敗，請檢查網絡設置';
  }
  
  return error.message || '未知錯誤';
};

// 輔助函數 - 數據格式化
export const formatStatsData = {
  /**
   * 格式化數字顯示
   */
  formatNumber: (num: number, decimals: number = 0): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  },

  /**
   * 格式化百分比
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * 格式化時間（分鐘）
   */
  formatTime: (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  },

  /**
   * 格式化貨幣
   */
  formatCurrency: (amount: number): string => {
    return `NT$${amount.toLocaleString()}`;
  },
};