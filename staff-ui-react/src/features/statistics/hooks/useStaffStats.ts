/**
 * useStaffStats Hook
 * 員工統計數據管理Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { useStatisticsStore, DailyStats, WeeklyStats, MonthlyStats } from '../store/statisticsStore';
import { StatisticsApiService, handleApiError } from '../services/statisticsApi';

interface UseStaffStatsOptions {
  staffId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // 秒
}

interface UseStaffStatsReturn {
  // 數據狀態
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  
  // 載入狀態
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // 操作方法
  refreshStats: () => Promise<void>;
  loadDailyStats: (startDate: string, endDate: string) => Promise<void>;
  loadWeeklyStats: (startDate: string, endDate: string) => Promise<void>;
  loadMonthlyStats: (year: number, month?: number) => Promise<void>;
  
  // 數據分析
  getStatsComparison: () => {
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    trends: {
      orders: 'up' | 'down' | 'stable';
      revenue: 'up' | 'down' | 'stable';
      efficiency: 'up' | 'down' | 'stable';
    };
  };
  
  getTodayStats: () => DailyStats | null;
  getThisWeekStats: () => WeeklyStats | null;
  getThisMonthStats: () => MonthlyStats | null;
}

export const useStaffStats = ({
  staffId,
  autoRefresh = false,
  refreshInterval = 300, // 5分鐘
}: UseStaffStatsOptions): UseStaffStatsReturn => {
  const {
    dailyStats,
    weeklyStats,
    monthlyStats,
    loading,
    error,
    lastUpdated,
    setDailyStats,
    setWeeklyStats,
    setMonthlyStats,
    setLoading,
    setError,
    setLastUpdated,
  } = useStatisticsStore();

  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // 載入每日統計數據
  const loadDailyStats = useCallback(async (startDate: string, endDate: string) => {
    if (!staffId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await StatisticsApiService.getDailyStats(staffId, startDate, endDate);
      setDailyStats(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入每日統計失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [staffId, setLoading, setError, setDailyStats]);

  // 載入每週統計數據
  const loadWeeklyStats = useCallback(async (startDate: string, endDate: string) => {
    if (!staffId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await StatisticsApiService.getWeeklyStats(staffId, startDate, endDate);
      setWeeklyStats(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入每週統計失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [staffId, setLoading, setError, setWeeklyStats]);

  // 載入每月統計數據
  const loadMonthlyStats = useCallback(async (year: number, month?: number) => {
    if (!staffId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await StatisticsApiService.getMonthlyStats(staffId, year, month);
      setMonthlyStats(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入每月統計失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [staffId, setLoading, setError, setMonthlyStats]);

  // 刷新所有統計數據
  const refreshStats = useCallback(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    
    // 並行載入所有數據
    await Promise.allSettled([
      loadDailyStats(startDate, endDate),
      loadWeeklyStats(startDate, endDate),
      loadMonthlyStats(now.getFullYear(), now.getMonth() + 1),
    ]);
    
    setLastUpdated(new Date().toISOString());
  }, [loadDailyStats, loadWeeklyStats, loadMonthlyStats, setLastUpdated]);

  // 獲取今日統計
  const getTodayStats = useCallback((): DailyStats | null => {
    const today = new Date().toISOString().split('T')[0];
    return dailyStats.find(stat => stat.date === today) || null;
  }, [dailyStats]);

  // 獲取本週統計
  const getThisWeekStats = useCallback((): WeeklyStats | null => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    return weeklyStats.find(stat => stat.weekStart === weekStart) || null;
  }, [weeklyStats]);

  // 獲取本月統計
  const getThisMonthStats = useCallback((): MonthlyStats | null => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return monthlyStats.find(stat => stat.month === currentMonth) || null;
  }, [monthlyStats]);

  // 獲取統計對比數據
  const getStatsComparison = useCallback(() => {
    const today = getTodayStats();
    const thisWeek = getThisWeekStats();
    const thisMonth = getThisMonthStats();
    
    // 計算變化百分比
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    // 計算趨勢
    const getTrend = (change: number): 'up' | 'down' | 'stable' => {
      if (Math.abs(change) < 2) return 'stable';
      return change > 0 ? 'up' : 'down';
    };

    const dailyChange = today ? calculateChange(today.totalOrders, today.previousDayOrders) : 0;
    const weeklyChange = thisWeek ? calculateChange(thisWeek.totalOrders, thisWeek.previousWeekComparison) : 0;
    const monthlyChange = thisMonth ? thisMonth.previousMonthComparison : 0;

    return {
      dailyChange,
      weeklyChange,
      monthlyChange,
      trends: {
        orders: getTrend(dailyChange),
        revenue: today ? today.revenueTrend : 'stable' as const,
        efficiency: getTrend(dailyChange), // 簡化處理，實際可能需要更複雜的邏輯
      },
    };
  }, [getTodayStats, getThisWeekStats, getThisMonthStats]);

  // 設置自動刷新
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const timer = setInterval(refreshStats, refreshInterval * 1000);
      setRefreshTimer(timer);
      
      return () => {
        clearInterval(timer);
        setRefreshTimer(null);
      };
    }
  }, [autoRefresh, refreshInterval, refreshStats]);

  // 初始化載入數據
  useEffect(() => {
    if (staffId) {
      refreshStats();
    }
  }, [staffId, refreshStats]);

  // 清理定時器
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [refreshTimer]);

  return {
    // 數據狀態
    dailyStats,
    weeklyStats,
    monthlyStats,
    
    // 載入狀態
    loading,
    error,
    lastUpdated,
    
    // 操作方法
    refreshStats,
    loadDailyStats,
    loadWeeklyStats,
    loadMonthlyStats,
    
    // 數據分析
    getStatsComparison,
    getTodayStats,
    getThisWeekStats,
    getThisMonthStats,
  };
};

export default useStaffStats;