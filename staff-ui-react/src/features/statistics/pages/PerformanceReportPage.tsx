/**
 * PerformanceReportPage Component
 * 績效報告主頁面 - 統合所有統計組件的主要頁面
 */

import React, { useState, useEffect } from 'react';
import { useStaffStats, useTeamStats, useLeaderboard } from '../hooks';
import { useStatisticsStore } from '../store/statisticsStore';
import DailyStatsCard from '../components/DailyStatsCard';
import PerformanceChart from '../components/PerformanceChart';
import TeamLeaderboard from '../components/TeamLeaderboard';
import EfficiencyMetrics from '../components/EfficiencyMetrics';
import StatsFilters from '../components/StatsFilters';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Maximize2,
  Settings
} from 'lucide-react';

interface PerformanceReportPageProps {
  staffId?: string;
  isTeamView?: boolean;
}

const PerformanceReportPage: React.FC<PerformanceReportPageProps> = ({
  staffId,
  isTeamView = false,
}) => {
  // 狀態管理
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleSections, setVisibleSections] = useState({
    dailyStats: true,
    performanceChart: true,
    teamLeaderboard: true,
    efficiencyMetrics: true,
    filters: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Store和Hooks
  const {
    filters,
    chartConfig,
    userPreferences,
    updateFilters,
    updateChartConfig,
    updateUserPreferences,
    getChartData,
  } = useStatisticsStore();

  // 獲取當前用戶ID（如果沒有傳入staffId）
  const currentStaffId = staffId || 'current-staff-id'; // 實際應該從認證狀態獲取

  // 使用自定義Hooks
  const {
    dailyStats,
    weeklyStats,
    monthlyStats,
    loading: statsLoading,
    error: statsError,
    refreshStats,
    getTodayStats,
    getStatsComparison,
  } = useStaffStats({
    staffId: currentStaffId,
    autoRefresh: userPreferences.autoRefresh,
    refreshInterval: userPreferences.refreshInterval,
  });

  const {
    teamStats,
    loading: teamLoading,
    refreshTeamStats,
  } = useTeamStats({
    autoRefresh: userPreferences.autoRefresh,
    refreshInterval: userPreferences.refreshInterval,
  });

  const {
    leaderboard,
    totalStaff,
    averagePerformance,
    loading: leaderboardLoading,
    refreshLeaderboard,
  } = useLeaderboard({
    period: filters.period,
    limit: 10,
    autoRefresh: userPreferences.autoRefresh,
    refreshInterval: userPreferences.refreshInterval,
  });

  // 模擬績效指標數據（實際應該從API獲取）
  const mockPerformanceMetrics = {
    ordersPerHour: 6.5,
    averageWaitTime: 12,
    customerSatisfaction: 4.3,
    errorRate: 3.2,
    peakEfficiency: 87,
    lowEfficiency: 62,
    improvementAreas: [
      '優化訂單處理流程',
      '縮短客戶等待時間',
      '提升客戶服務質量',
    ],
  };

  // 處理篩選變更
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  // 重置篩選
  const handleResetFilters = () => {
    updateFilters({
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      period: 'daily',
      staffIds: [],
      departments: [],
      metrics: ['orders', 'revenue', 'efficiency'],
    });
  };

  // 處理數據匯出
  const handleExport = async (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    setIsExporting(true);
    try {
      // 這裡實際應該調用匯出API
      console.log('匯出數據:', { format, filters });
      
      // 模擬匯出延遲
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 實際匯出邏輯...
      alert(`數據已匯出為 ${format.toUpperCase()} 格式`);
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請稍後再試');
    } finally {
      setIsExporting(false);
    }
  };

  // 刷新所有數據
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        refreshStats(),
        refreshTeamStats(),
        refreshLeaderboard(),
      ]);
    } catch (error) {
      console.error('刷新數據失敗:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 切換區塊顯示/隱藏
  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 獲取今日統計數據
  const todayStats = getTodayStats();
  const comparison = getStatsComparison();

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* 頁面標題和控制區域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isTeamView ? '團隊績效報告' : '個人績效報告'}
                </h1>
                <p className="text-gray-600">
                  {isTeamView ? '團隊整體統計數據和績效分析' : '個人工作表現統計和分析報告'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* 視圖模式切換 */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="網格視圖"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="列表視圖"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* 操作按鈕 */}
              <button
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">刷新</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isExporting ? '匯出中...' : '匯出'}
                </span>
              </button>

              <button
                onClick={() => toggleSection('filters')}
                className={`p-2 rounded-lg transition-colors ${
                  visibleSections.filters
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="切換篩選器"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 快速統計概覽 */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {todayStats?.totalOrders || 0}
              </div>
              <div className="text-sm text-blue-600">今日訂單</div>
              <div className={`text-xs mt-1 flex items-center justify-center space-x-1 ${
                comparison.trends.orders === 'up' ? 'text-green-600' :
                comparison.trends.orders === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp className="w-3 h-3" />
                <span>{Math.abs(comparison.dailyChange).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {todayStats?.completionRate ? `${(todayStats.completionRate * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-green-600">完成率</div>
              <div className="text-xs text-gray-500 mt-1">目標: 85%</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalStaff}</div>
              <div className="text-sm text-purple-600">團隊成員</div>
              <div className="text-xs text-gray-500 mt-1">
                平均: {averagePerformance.toFixed(1)} 分
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {mockPerformanceMetrics.peakEfficiency}%
              </div>
              <div className="text-sm text-orange-600">巔峰效率</div>
              <div className="text-xs text-gray-500 mt-1">今日最佳</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${viewMode === 'grid' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* 左側主要內容區域 */}
        <div className={`space-y-6 ${viewMode === 'grid' ? 'lg:col-span-8' : ''}`}>
          {/* 每日統計卡片 */}
          {visibleSections.dailyStats && (
            <div className="relative">
              <button
                onClick={() => toggleSection('dailyStats')}
                className="absolute top-4 right-4 z-10 p-1 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="隱藏每日統計"
              >
                <EyeOff className="w-4 h-4 text-gray-500" />
              </button>
              <DailyStatsCard
                stats={todayStats}
                loading={statsLoading}
                showComparison={true}
                variant="detailed"
              />
            </div>
          )}

          {/* 績效圖表 */}
          {visibleSections.performanceChart && (
            <div className="relative">
              <button
                onClick={() => toggleSection('performanceChart')}
                className="absolute top-4 right-16 z-10 p-1 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="隱藏績效圖表"
              >
                <EyeOff className="w-4 h-4 text-gray-500" />
              </button>
              <PerformanceChart
                data={getChartData('orders')}
                chartConfig={chartConfig}
                title="訂單處理趨勢"
                subtitle="過去30天的訂單處理統計"
                onConfigChange={updateChartConfig}
                onExport={(format) => handleExport(format as any)}
                showControls={true}
                showFullscreen={true}
              />
            </div>
          )}

          {/* 效率指標 */}
          {visibleSections.efficiencyMetrics && (
            <div className="relative">
              <button
                onClick={() => toggleSection('efficiencyMetrics')}
                className="absolute top-4 right-4 z-10 p-1 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="隱藏效率指標"
              >
                <EyeOff className="w-4 h-4 text-gray-500" />
              </button>
              <EfficiencyMetrics
                metrics={mockPerformanceMetrics}
                loading={statsLoading}
                variant="detailed"
                showTargets={true}
              />
            </div>
          )}
        </div>

        {/* 右側邊欄 */}
        <div className={`space-y-6 ${viewMode === 'grid' ? 'lg:col-span-4' : ''}`}>
          {/* 篩選器 */}
          {visibleSections.filters && (
            <StatsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              onExport={() => handleExport('csv')}
              loading={statsLoading || teamLoading || leaderboardLoading}
              variant={viewMode === 'grid' ? 'default' : 'compact'}
              availableStaff={[
                { id: '1', name: '張小明', department: '廚房' },
                { id: '2', name: '李小華', department: '服務' },
                { id: '3', name: '王大衛', department: '管理' },
              ]}
            />
          )}

          {/* 團隊排行榜 */}
          {visibleSections.teamLeaderboard && (
            <div className="relative">
              <button
                onClick={() => toggleSection('teamLeaderboard')}
                className="absolute top-4 right-4 z-10 p-1 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="隱藏排行榜"
              >
                <EyeOff className="w-4 h-4 text-gray-500" />
              </button>
              <TeamLeaderboard
                leaderboard={leaderboard}
                totalStaff={totalStaff}
                averagePerformance={averagePerformance}
                loading={leaderboardLoading}
                variant={viewMode === 'grid' ? 'default' : 'compact'}
                maxDisplay={8}
                onStaffClick={(staffId) => console.log('查看員工詳情:', staffId)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 隱藏的區塊快速恢復 */}
      {Object.values(visibleSections).includes(false) && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">已隱藏的區塊</h4>
          <div className="space-y-2">
            {!visibleSections.dailyStats && (
              <button
                onClick={() => toggleSection('dailyStats')}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                <span>每日統計</span>
              </button>
            )}
            {!visibleSections.performanceChart && (
              <button
                onClick={() => toggleSection('performanceChart')}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                <span>績效圖表</span>
              </button>
            )}
            {!visibleSections.teamLeaderboard && (
              <button
                onClick={() => toggleSection('teamLeaderboard')}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                <span>團隊排行榜</span>
              </button>
            )}
            {!visibleSections.efficiencyMetrics && (
              <button
                onClick={() => toggleSection('efficiencyMetrics')}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                <span>效率指標</span>
              </button>
            )}
            {!visibleSections.filters && (
              <button
                onClick={() => toggleSection('filters')}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
                <span>篩選器</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReportPage;