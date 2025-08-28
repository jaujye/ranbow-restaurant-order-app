/**
 * useLeaderboard Hook
 * 排行榜數據管理Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { useStatisticsStore, StaffPerformance } from '../store/statisticsStore';
import { StatisticsApiService, handleApiError } from '../services/statisticsApi';

interface UseLeaderboardOptions {
  period?: 'daily' | 'weekly' | 'monthly';
  department?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // 秒
}

interface LeaderboardEntry extends StaffPerformance {
  change: number; // 排名變化
  previousRank: number;
  isRising: boolean;
  isFalling: boolean;
  isNew: boolean;
}

interface UseLeaderboardReturn {
  // 數據狀態
  leaderboard: LeaderboardEntry[];
  totalStaff: number;
  averagePerformance: number;
  
  // 載入狀態
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // 操作方法
  refreshLeaderboard: () => Promise<void>;
  changePeriod: (period: 'daily' | 'weekly' | 'monthly') => void;
  changeDepartment: (department: string | undefined) => void;
  changeLimit: (limit: number) => void;
  
  // 數據分析
  getTopPerformers: (count: number) => LeaderboardEntry[];
  getBadgeHolders: (badge: string) => LeaderboardEntry[];
  getRankingTrends: () => {
    rising: number;
    falling: number;
    stable: number;
    newEntries: number;
  };
  
  getPerformanceDistribution: () => {
    excellent: number; // 90-100
    good: number;      // 70-89
    average: number;   // 50-69
    needsImprovement: number; // <50
  };
  
  // 個人排名查詢
  getPersonalRanking: (staffId: string) => {
    rank: number;
    percentile: number;
    change: number;
    nearbyRanks: LeaderboardEntry[];
  } | null;
}

export const useLeaderboard = ({
  period = 'daily',
  department,
  limit = 10,
  autoRefresh = false,
  refreshInterval = 300, // 5分鐘
}: UseLeaderboardOptions = {}): UseLeaderboardReturn => {
  const {
    staffPerformance,
    loading,
    error,
    lastUpdated,
    setStaffPerformance,
    setLoading,
    setError,
    setLastUpdated,
  } = useStatisticsStore();

  const [currentPeriod, setCurrentPeriod] = useState(period);
  const [currentDepartment, setCurrentDepartment] = useState(department);
  const [currentLimit, setCurrentLimit] = useState(limit);
  const [totalStaff, setTotalStaff] = useState(0);
  const [averagePerformance, setAveragePerformance] = useState(0);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 模擬歷史排名數據（實際應該從API獲取）
  const [historicalRanks] = useState<Record<string, number>>({});

  // 載入排行榜數據
  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await StatisticsApiService.getLeaderboard(
        currentPeriod,
        currentDepartment,
        currentLimit
      );
      
      setStaffPerformance(response.leaderboard);
      setTotalStaff(response.totalStaff);
      setAveragePerformance(response.averagePerformance);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('載入排行榜失敗:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPeriod, currentDepartment, currentLimit, setLoading, setError, setStaffPerformance]);

  // 刷新排行榜
  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
    setLastUpdated(new Date().toISOString());
  }, [loadLeaderboard, setLastUpdated]);

  // 變更時期
  const changePeriod = useCallback((newPeriod: 'daily' | 'weekly' | 'monthly') => {
    setCurrentPeriod(newPeriod);
  }, []);

  // 變更部門
  const changeDepartment = useCallback((newDepartment: string | undefined) => {
    setCurrentDepartment(newDepartment);
  }, []);

  // 變更顯示數量
  const changeLimit = useCallback((newLimit: number) => {
    setCurrentLimit(newLimit);
  }, []);

  // 轉換為增強型排行榜條目
  const getEnhancedLeaderboard = useCallback((): LeaderboardEntry[] => {
    return staffPerformance.map((staff, index) => {
      const previousRank = historicalRanks[staff.staffId] || staff.rank;
      const change = previousRank - staff.rank; // 正數表示排名上升
      
      return {
        ...staff,
        change,
        previousRank,
        isRising: change > 0,
        isFalling: change < 0,
        isNew: !(staff.staffId in historicalRanks),
      };
    });
  }, [staffPerformance, historicalRanks]);

  // 獲取頂級表現者
  const getTopPerformers = useCallback((count: number): LeaderboardEntry[] => {
    const enhanced = getEnhancedLeaderboard();
    return enhanced.slice(0, count);
  }, [getEnhancedLeaderboard]);

  // 獲取徽章持有者
  const getBadgeHolders = useCallback((badge: string): LeaderboardEntry[] => {
    const enhanced = getEnhancedLeaderboard();
    return enhanced.filter(staff => staff.badge === badge);
  }, [getEnhancedLeaderboard]);

  // 獲取排名趨勢
  const getRankingTrends = useCallback(() => {
    const enhanced = getEnhancedLeaderboard();
    
    const trends = enhanced.reduce(
      (acc, staff) => {
        if (staff.isNew) {
          acc.newEntries++;
        } else if (staff.isRising) {
          acc.rising++;
        } else if (staff.isFalling) {
          acc.falling++;
        } else {
          acc.stable++;
        }
        return acc;
      },
      { rising: 0, falling: 0, stable: 0, newEntries: 0 }
    );
    
    return trends;
  }, [getEnhancedLeaderboard]);

  // 獲取績效分布
  const getPerformanceDistribution = useCallback(() => {
    const enhanced = getEnhancedLeaderboard();
    
    const distribution = enhanced.reduce(
      (acc, staff) => {
        if (staff.efficiency >= 90) {
          acc.excellent++;
        } else if (staff.efficiency >= 70) {
          acc.good++;
        } else if (staff.efficiency >= 50) {
          acc.average++;
        } else {
          acc.needsImprovement++;
        }
        return acc;
      },
      { excellent: 0, good: 0, average: 0, needsImprovement: 0 }
    );
    
    return distribution;
  }, [getEnhancedLeaderboard]);

  // 獲取個人排名信息
  const getPersonalRanking = useCallback((staffId: string) => {
    const enhanced = getEnhancedLeaderboard();
    const staffIndex = enhanced.findIndex(staff => staff.staffId === staffId);
    
    if (staffIndex === -1) return null;
    
    const staff = enhanced[staffIndex];
    const percentile = ((totalStaff - staff.rank) / totalStaff) * 100;
    
    // 獲取附近排名（前後各2名）
    const start = Math.max(0, staffIndex - 2);
    const end = Math.min(enhanced.length, staffIndex + 3);
    const nearbyRanks = enhanced.slice(start, end);
    
    return {
      rank: staff.rank,
      percentile: Math.round(percentile),
      change: staff.change,
      nearbyRanks,
    };
  }, [getEnhancedLeaderboard, totalStaff]);

  // 設置自動刷新
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const timer = setInterval(refreshLeaderboard, refreshInterval * 1000);
      setRefreshTimer(timer);
      
      return () => {
        clearInterval(timer);
        setRefreshTimer(null);
      };
    }
  }, [autoRefresh, refreshInterval, refreshLeaderboard]);

  // 當配置變更時重新載入
  useEffect(() => {
    loadLeaderboard();
  }, [currentPeriod, currentDepartment, currentLimit]);

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
    leaderboard: getEnhancedLeaderboard(),
    totalStaff,
    averagePerformance,
    
    // 載入狀態
    loading,
    error,
    lastUpdated,
    
    // 操作方法
    refreshLeaderboard,
    changePeriod,
    changeDepartment,
    changeLimit,
    
    // 數據分析
    getTopPerformers,
    getBadgeHolders,
    getRankingTrends,
    getPerformanceDistribution,
    getPersonalRanking,
  };
};

export default useLeaderboard;