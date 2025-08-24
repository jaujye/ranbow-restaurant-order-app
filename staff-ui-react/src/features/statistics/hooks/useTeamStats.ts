/**
 * useTeamStats Hook
 * 團隊統計數據管理Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { useStatisticsStore, TeamStats } from '../store/statisticsStore';
import { StatisticsApiService, handleApiError } from '../services/statisticsApi';

interface UseTeamStatsOptions {
  department?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // 秒
}

interface UseTeamStatsReturn {
  // 數據狀態
  teamStats: TeamStats | null;
  departmentComparison: Array<{
    department: string;
    totalOrders: number;
    totalRevenue: number;
    averageEfficiency: number;
    staffCount: number;
  }>;
  
  // 載入狀態
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // 操作方法
  refreshTeamStats: () => Promise<void>;
  loadTeamStats: (startDate?: string, endDate?: string) => Promise<void>;
  loadDepartmentComparison: (startDate: string, endDate: string) => Promise<void>;
  
  // 數據分析
  getTopPerformingDepartment: () => string | null;
  getDepartmentGrowth: () => Array<{
    department: string;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  
  getTeamEfficiencyMetrics: () => {
    overall: number;
    byDepartment: Record<string, number>;
    improvement: number;
  } | null;
}

export const useTeamStats = ({
  department,
  autoRefresh = false,
  refreshInterval = 300, // 5分鐘
}: UseTeamStatsOptions = {}): UseTeamStatsReturn => {
  const {
    teamStats,
    loading,
    error,
    lastUpdated,
    setTeamStats,
    setLoading,
    setError,
    setLastUpdated,
  } = useStatisticsStore();

  const [departmentComparison, setDepartmentComparison] = useState<Array<{
    department: string;
    totalOrders: number;
    totalRevenue: number;
    averageEfficiency: number;
    staffCount: number;
  }>>([]);

  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // 載入團隊統計數據
  const loadTeamStats = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await StatisticsApiService.getTeamStats(department, startDate, endDate);
      setTeamStats(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入團隊統計失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [department, setLoading, setError, setTeamStats]);

  // 載入部門對比數據
  const loadDepartmentComparison = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await StatisticsApiService.getDepartmentComparison(startDate, endDate);
      setDepartmentComparison(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入部門對比失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // 刷新團隊統計數據
  const refreshTeamStats = useCallback(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    
    // 並行載入團隊數據和部門對比
    await Promise.allSettled([
      loadTeamStats(startDate, endDate),
      loadDepartmentComparison(startDate, endDate),
    ]);
    
    setLastUpdated(new Date().toISOString());
  }, [loadTeamStats, loadDepartmentComparison, setLastUpdated]);

  // 獲取表現最佳的部門
  const getTopPerformingDepartment = useCallback((): string | null => {
    if (departmentComparison.length === 0) return null;
    
    const topDepartment = departmentComparison.reduce((top, current) => {
      return current.averageEfficiency > top.averageEfficiency ? current : top;
    });
    
    return topDepartment.department;
  }, [departmentComparison]);

  // 獲取部門成長數據
  const getDepartmentGrowth = useCallback((): Array<{
    department: string;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }> => {
    // 這裡需要歷史數據來計算成長，暫時返回模擬數據
    return departmentComparison.map(dept => {
      // 模擬成長計算（實際應該基於歷史數據）
      const growth = Math.random() * 20 - 10; // -10% to +10%
      const trend = Math.abs(growth) < 2 ? 'stable' : growth > 0 ? 'up' : 'down';
      
      return {
        department: dept.department,
        growth,
        trend,
      };
    });
  }, [departmentComparison]);

  // 獲取團隊效率指標
  const getTeamEfficiencyMetrics = useCallback((): {
    overall: number;
    byDepartment: Record<string, number>;
    improvement: number;
  } | null => {
    if (!teamStats || departmentComparison.length === 0) return null;
    
    const byDepartment: Record<string, number> = {};
    departmentComparison.forEach(dept => {
      byDepartment[dept.department] = dept.averageEfficiency;
    });
    
    // 計算總體效率改善（需要歷史數據，暫時使用模擬值）
    const improvement = Math.random() * 10; // 0-10% 改善
    
    return {
      overall: teamStats.averageTeamEfficiency,
      byDepartment,
      improvement,
    };
  }, [teamStats, departmentComparison]);

  // 設置自動刷新
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const timer = setInterval(refreshTeamStats, refreshInterval * 1000);
      setRefreshTimer(timer);
      
      return () => {
        clearInterval(timer);
        setRefreshTimer(null);
      };
    }
  }, [autoRefresh, refreshInterval, refreshTeamStats]);

  // 初始化載入數據
  useEffect(() => {
    refreshTeamStats();
  }, [department]); // 當部門變更時重新載入

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
    teamStats,
    departmentComparison,
    
    // 載入狀態
    loading,
    error,
    lastUpdated,
    
    // 操作方法
    refreshTeamStats,
    loadTeamStats,
    loadDepartmentComparison,
    
    // 數據分析
    getTopPerformingDepartment,
    getDepartmentGrowth,
    getTeamEfficiencyMetrics,
  };
};

export default useTeamStats;