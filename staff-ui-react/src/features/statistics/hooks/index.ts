/**
 * Statistics Hooks Export Index
 * 統計功能Hooks統一導出
 */

export { useStaffStats } from './useStaffStats';
export { useTeamStats } from './useTeamStats';
export { useLeaderboard } from './useLeaderboard';

// 類型導出
// 類型重新定義以避免導出問題
export interface UseStaffStatsOptions {
  staffId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseTeamStatsOptions {
  department?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseLeaderboardOptions {
  period?: 'daily' | 'weekly' | 'monthly';
  department?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}