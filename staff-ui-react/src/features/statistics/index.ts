/**
 * Statistics Feature Export Index
 * 統計功能模組統一導出
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export { default as StatisticsApiService, statisticsApi, handleApiError, formatStatsData } from './services/statisticsApi';

// Store
export * from './store/statisticsStore';

// Pages
export { default as PerformanceReportPage } from './pages/PerformanceReportPage';

// Types (re-export from store)
export type {
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  StaffPerformance,
  TeamStats,
  PerformanceMetrics,
  ChartData,
  ChartConfig,
  StatsFilters,
  ExportConfig,
} from './store/statisticsStore';