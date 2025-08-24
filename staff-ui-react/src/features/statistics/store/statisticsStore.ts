/**
 * Statistics Store - Zustand狀態管理
 * 管理所有統計數據、篩選條件、圖表配置
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 統計數據類型定義
export interface DailyStats {
  id: string;
  date: string;
  totalOrders: number;
  completedOrders: number;
  completionRate: number;
  averageProcessingTime: number; // 分鐘
  totalRevenue: number;
  previousDayOrders: number;
  previousDayRevenue: number;
  ordersTrend: 'up' | 'down' | 'stable';
  revenueTrend: 'up' | 'down' | 'stable';
}

export interface WeeklyStats {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  peakDay: string;
  peakHour: number;
  previousWeekComparison: number; // 百分比變化
}

export interface MonthlyStats {
  id: string;
  month: string;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
  newCustomers: number;
  previousMonthComparison: number;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  position: string;
  ordersProcessed: number;
  averageProcessingTime: number;
  completionRate: number;
  customerRating: number;
  efficiency: number; // 效率分數 0-100
  rank: number;
  badge?: 'top_performer' | 'most_improved' | 'speed_demon' | 'quality_star';
}

export interface TeamStats {
  totalStaff: number;
  activeStaff: number;
  totalOrdersProcessed: number;
  averageTeamEfficiency: number;
  topPerformer: StaffPerformance;
  departmentBreakdown: {
    kitchen: number;
    service: number;
    management: number;
  };
}

export interface PerformanceMetrics {
  ordersPerHour: number;
  averageWaitTime: number;
  customerSatisfaction: number;
  errorRate: number;
  peakEfficiency: number;
  lowEfficiency: number;
  improvementAreas: string[];
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
  trend?: number;
}

export interface StatsFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  period: 'daily' | 'weekly' | 'monthly';
  staffIds: string[];
  departments: string[];
  metrics: string[];
}

export interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  showTrend: boolean;
  showComparison: boolean;
  colorScheme: 'rainbow' | 'professional' | 'performance';
  animations: boolean;
}

export interface ExportConfig {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface StatisticsStore {
  // 狀態數據
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  staffPerformance: StaffPerformance[];
  teamStats: TeamStats | null;
  performanceMetrics: PerformanceMetrics | null;
  
  // UI狀態
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // 篩選和配置
  filters: StatsFilters;
  chartConfig: ChartConfig;
  exportConfig: ExportConfig;
  
  // 用戶偏好
  userPreferences: {
    defaultPeriod: 'daily' | 'weekly' | 'monthly';
    favoriteMetrics: string[];
    dashboardLayout: string[];
    autoRefresh: boolean;
    refreshInterval: number; // 秒
  };
  
  // Actions
  setDailyStats: (stats: DailyStats[]) => void;
  setWeeklyStats: (stats: WeeklyStats[]) => void;
  setMonthlyStats: (stats: MonthlyStats[]) => void;
  setStaffPerformance: (performance: StaffPerformance[]) => void;
  setTeamStats: (stats: TeamStats) => void;
  setPerformanceMetrics: (metrics: PerformanceMetrics) => void;
  
  updateFilters: (filters: Partial<StatsFilters>) => void;
  updateChartConfig: (config: Partial<ChartConfig>) => void;
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  updateUserPreferences: (preferences: Partial<StatisticsStore['userPreferences']>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (timestamp: string) => void;
  
  // 數據處理方法
  getFilteredDailyStats: () => DailyStats[];
  getFilteredStaffPerformance: () => StaffPerformance[];
  getTopPerformers: (limit: number) => StaffPerformance[];
  getChartData: (metric: string) => ChartData[];
  
  // 計算方法
  calculateTrends: (current: number, previous: number) => 'up' | 'down' | 'stable';
  calculateEfficiencyScore: (staff: StaffPerformance) => number;
  
  // 重置和清理
  resetFilters: () => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// 預設狀態
const defaultFilters: StatsFilters = {
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
  period: 'daily',
  staffIds: [],
  departments: [],
  metrics: ['orders', 'revenue', 'efficiency'],
};

const defaultChartConfig: ChartConfig = {
  chartType: 'line',
  showTrend: true,
  showComparison: true,
  colorScheme: 'rainbow',
  animations: true,
};

const defaultExportConfig: ExportConfig = {
  format: 'csv',
  includeCharts: true,
  includeRawData: false,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
};

const defaultUserPreferences = {
  defaultPeriod: 'daily' as const,
  favoriteMetrics: ['orders', 'revenue', 'efficiency'],
  dashboardLayout: ['daily-stats', 'performance-chart', 'team-leaderboard', 'efficiency-metrics'],
  autoRefresh: true,
  refreshInterval: 300, // 5分鐘
};

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      // 初始狀態
      dailyStats: [],
      weeklyStats: [],
      monthlyStats: [],
      staffPerformance: [],
      teamStats: null,
      performanceMetrics: null,
      
      loading: false,
      error: null,
      lastUpdated: null,
      
      filters: defaultFilters,
      chartConfig: defaultChartConfig,
      exportConfig: defaultExportConfig,
      userPreferences: defaultUserPreferences,
      
      // 設置數據的Actions
      setDailyStats: (stats) => set({ dailyStats: stats, lastUpdated: new Date().toISOString() }),
      setWeeklyStats: (stats) => set({ weeklyStats: stats, lastUpdated: new Date().toISOString() }),
      setMonthlyStats: (stats) => set({ monthlyStats: stats, lastUpdated: new Date().toISOString() }),
      setStaffPerformance: (performance) => set({ staffPerformance: performance, lastUpdated: new Date().toISOString() }),
      setTeamStats: (stats) => set({ teamStats: stats, lastUpdated: new Date().toISOString() }),
      setPerformanceMetrics: (metrics) => set({ performanceMetrics: metrics, lastUpdated: new Date().toISOString() }),
      
      // 更新配置的Actions
      updateFilters: (newFilters) => 
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      
      updateChartConfig: (newConfig) =>
        set((state) => ({ chartConfig: { ...state.chartConfig, ...newConfig } })),
      
      updateExportConfig: (newConfig) =>
        set((state) => ({ exportConfig: { ...state.exportConfig, ...newConfig } })),
      
      updateUserPreferences: (newPreferences) =>
        set((state) => ({ 
          userPreferences: { ...state.userPreferences, ...newPreferences } 
        })),
      
      // UI狀態管理
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      
      // 數據處理方法
      getFilteredDailyStats: () => {
        const { dailyStats, filters } = get();
        const { startDate, endDate } = filters.dateRange;
        const { staffIds } = filters;
        
        return dailyStats.filter(stat => {
          const statDate = new Date(stat.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          const dateInRange = statDate >= start && statDate <= end;
          const staffMatch = staffIds.length === 0 || staffIds.includes(stat.id);
          
          return dateInRange && staffMatch;
        });
      },
      
      getFilteredStaffPerformance: () => {
        const { staffPerformance, filters } = get();
        const { staffIds, departments } = filters;
        
        return staffPerformance.filter(staff => {
          const staffMatch = staffIds.length === 0 || staffIds.includes(staff.staffId);
          const deptMatch = departments.length === 0 || departments.includes(staff.position);
          
          return staffMatch && deptMatch;
        });
      },
      
      getTopPerformers: (limit = 5) => {
        const filteredPerformance = get().getFilteredStaffPerformance();
        return filteredPerformance
          .sort((a, b) => b.efficiency - a.efficiency)
          .slice(0, limit);
      },
      
      getChartData: (metric) => {
        const filteredStats = get().getFilteredDailyStats();
        
        switch (metric) {
          case 'orders':
            return filteredStats.map(stat => ({
              name: stat.date,
              value: stat.totalOrders,
              date: stat.date,
            }));
          case 'revenue':
            return filteredStats.map(stat => ({
              name: stat.date,
              value: stat.totalRevenue,
              date: stat.date,
            }));
          case 'completion_rate':
            return filteredStats.map(stat => ({
              name: stat.date,
              value: stat.completionRate * 100,
              date: stat.date,
            }));
          default:
            return [];
        }
      },
      
      // 計算方法
      calculateTrends: (current, previous) => {
        const change = (current - previous) / previous * 100;
        if (Math.abs(change) < 2) return 'stable';
        return change > 0 ? 'up' : 'down';
      },
      
      calculateEfficiencyScore: (staff) => {
        // 效率分數計算邏輯
        const orderWeight = 0.3;
        const speedWeight = 0.25;
        const qualityWeight = 0.25;
        const completionWeight = 0.2;
        
        const orderScore = Math.min(staff.ordersProcessed / 50, 1) * 100;
        const speedScore = Math.max(0, (60 - staff.averageProcessingTime) / 60) * 100;
        const qualityScore = staff.customerRating * 20;
        const completionScore = staff.completionRate * 100;
        
        return Math.round(
          orderScore * orderWeight +
          speedScore * speedWeight +
          qualityScore * qualityWeight +
          completionScore * completionWeight
        );
      },
      
      // 重置和清理
      resetFilters: () => set({ filters: defaultFilters }),
      clearError: () => set({ error: null }),
      
      refreshData: async () => {
        set({ loading: true, error: null });
        try {
          // 這裡將由具體的API調用來刷新數據
          // 現在只是標記為已更新
          set({ lastUpdated: new Date().toISOString() });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '數據刷新失敗' });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'statistics-storage',
      // 只持久化用戶偏好和配置，不持久化數據
      partialize: (state) => ({
        filters: state.filters,
        chartConfig: state.chartConfig,
        exportConfig: state.exportConfig,
        userPreferences: state.userPreferences,
      }),
    }
  )
);

// 選擇器鉤子 - 用於性能優化
export const useStatisticsData = () => {
  return useStatisticsStore((state) => ({
    dailyStats: state.dailyStats,
    weeklyStats: state.weeklyStats,
    monthlyStats: state.monthlyStats,
    staffPerformance: state.staffPerformance,
    teamStats: state.teamStats,
    performanceMetrics: state.performanceMetrics,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
  }));
};

export const useStatisticsFilters = () => {
  return useStatisticsStore((state) => ({
    filters: state.filters,
    updateFilters: state.updateFilters,
    resetFilters: state.resetFilters,
  }));
};

export const useStatisticsConfig = () => {
  return useStatisticsStore((state) => ({
    chartConfig: state.chartConfig,
    exportConfig: state.exportConfig,
    userPreferences: state.userPreferences,
    updateChartConfig: state.updateChartConfig,
    updateExportConfig: state.updateExportConfig,
    updateUserPreferences: state.updateUserPreferences,
  }));
};

export default useStatisticsStore;