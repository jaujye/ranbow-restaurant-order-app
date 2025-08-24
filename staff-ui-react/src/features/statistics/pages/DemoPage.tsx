/**
 * Statistics Demo Page
 * 統計系統演示頁面 - 展示所有組件功能
 */

import React, { useState } from 'react';
import {
  DailyStatsCard,
  PerformanceChart,
  TeamLeaderboard,
  EfficiencyMetrics,
  StatsFilters,
} from '../components';
import { useStatisticsStore } from '../store/statisticsStore';
import { BarChart3, Sparkles, TestTube } from 'lucide-react';

const DemoPage: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'all' | 'daily' | 'chart' | 'leaderboard' | 'efficiency' | 'filters'>('all');
  
  const {
    filters,
    chartConfig,
    updateFilters,
    updateChartConfig,
    getChartData,
    resetFilters,
  } = useStatisticsStore();

  // 模擬數據
  const mockDailyStats = {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    totalOrders: 45,
    completedOrders: 42,
    completionRate: 0.933,
    averageProcessingTime: 12,
    totalRevenue: 12500,
    previousDayOrders: 38,
    previousDayRevenue: 10800,
    ordersTrend: 'up' as const,
    revenueTrend: 'up' as const,
  };

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

  const mockLeaderboard = [
    {
      staffId: '1',
      staffName: '張小明',
      position: '廚房',
      ordersProcessed: 85,
      averageProcessingTime: 8.5,
      completionRate: 0.95,
      customerRating: 4.8,
      efficiency: 92,
      rank: 1,
      badge: 'top_performer' as const,
      change: 2,
      previousRank: 3,
      isRising: true,
      isFalling: false,
      isNew: false,
    },
    {
      staffId: '2',
      staffName: '李小華',
      position: '服務',
      ordersProcessed: 78,
      averageProcessingTime: 10.2,
      completionRate: 0.91,
      customerRating: 4.6,
      efficiency: 89,
      rank: 2,
      badge: 'quality_star' as const,
      change: -1,
      previousRank: 1,
      isRising: false,
      isFalling: true,
      isNew: false,
    },
    {
      staffId: '3',
      staffName: '王大衛',
      position: '管理',
      ordersProcessed: 65,
      averageProcessingTime: 15.0,
      completionRate: 0.88,
      customerRating: 4.4,
      efficiency: 85,
      rank: 3,
      change: 0,
      previousRank: 3,
      isRising: false,
      isFalling: false,
      isNew: false,
    },
  ];

  const mockChartData = [
    { name: '8/20', value: 32, date: '2024-08-20' },
    { name: '8/21', value: 28, date: '2024-08-21' },
    { name: '8/22', value: 45, date: '2024-08-22' },
    { name: '8/23', value: 52, date: '2024-08-23' },
    { name: '8/24', value: 45, date: '2024-08-24' },
  ];

  const demos = [
    { key: 'all', label: '完整展示', icon: BarChart3 },
    { key: 'daily', label: '每日統計', icon: TestTube },
    { key: 'chart', label: '績效圖表', icon: BarChart3 },
    { key: 'leaderboard', label: '團隊排行榜', icon: Sparkles },
    { key: 'efficiency', label: '效率指標', icon: TestTube },
    { key: 'filters', label: '篩選器', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* 標題和控制區域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl">
                <TestTube className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">統計系統演示</h1>
                <p className="text-gray-600">展示彩虹餐廳統計報表儀表板功能</p>
              </div>
            </div>

            {/* 演示模式選擇 */}
            <div className="flex flex-wrap gap-2">
              {demos.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentDemo(key as any)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentDemo === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 演示內容 */}
      <div className="space-y-6">
        {/* 每日統計卡片 */}
        {(currentDemo === 'all' || currentDemo === 'daily') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">📊 每日統計卡片</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DailyStatsCard stats={mockDailyStats} variant="default" />
              <DailyStatsCard stats={mockDailyStats} variant="compact" />
              <DailyStatsCard stats={mockDailyStats} variant="detailed" />
            </div>
          </div>
        )}

        {/* 績效圖表 */}
        {(currentDemo === 'all' || currentDemo === 'chart') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">📈 績效圖表</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                data={mockChartData}
                chartConfig={{ ...chartConfig, chartType: 'line' }}
                title="訂單趨勢 - 折線圖"
                onConfigChange={updateChartConfig}
                showControls={true}
              />
              <PerformanceChart
                data={mockChartData}
                chartConfig={{ ...chartConfig, chartType: 'bar' }}
                title="訂單分析 - 柱狀圖"
                onConfigChange={updateChartConfig}
                showControls={true}
              />
            </div>
          </div>
        )}

        {/* 團隊排行榜 */}
        {(currentDemo === 'all' || currentDemo === 'leaderboard') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">🏆 團隊排行榜</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamLeaderboard
                leaderboard={mockLeaderboard}
                totalStaff={15}
                averagePerformance={82.5}
                variant="default"
              />
              <TeamLeaderboard
                leaderboard={mockLeaderboard}
                totalStaff={15}
                averagePerformance={82.5}
                variant="detailed"
              />
            </div>
          </div>
        )}

        {/* 效率指標 */}
        {(currentDemo === 'all' || currentDemo === 'efficiency') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">⚡ 效率指標</h2>
            <div className="grid grid-cols-1 gap-6">
              <EfficiencyMetrics
                metrics={mockPerformanceMetrics}
                variant="detailed"
                showTargets={true}
              />
            </div>
          </div>
        )}

        {/* 篩選器 */}
        {(currentDemo === 'all' || currentDemo === 'filters') && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">🔍 篩選器</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatsFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                variant="default"
                availableStaff={[
                  { id: '1', name: '張小明', department: '廚房' },
                  { id: '2', name: '李小華', department: '服務' },
                  { id: '3', name: '王大衛', department: '管理' },
                ]}
              />
              <StatsFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
                variant="compact"
                showFilters={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* 功能特色說明 */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🌈 系統特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-blue-900">數據視覺化</h3>
              <p className="text-sm text-blue-700 mt-1">Recharts互動式圖表系統</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-green-900">響應式設計</h3>
              <p className="text-sm text-green-700 mt-1">支援所有設備尺寸</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-purple-900">彩虹主題</h3>
              <p className="text-sm text-purple-700 mt-1">現代化色彩設計</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-orange-900">即時更新</h3>
              <p className="text-sm text-orange-700 mt-1">自動刷新和緩存</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;