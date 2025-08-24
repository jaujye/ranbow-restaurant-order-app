import React, { useEffect, useState } from 'react';
import { Clock, ShoppingCart, ChefHat, Bell, TrendingUp } from 'lucide-react';
import { DashboardApi, type DashboardData, type RealTimeOverview } from '../services/dashboardApi';
import { useStaffAuth } from '@/features/auth/store/authStore';

/**
 * 統計卡片組件
 */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <p className={`ml-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </p>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard 統計組件
 * 顯示實時的訂單、廚房狀態等關鍵數據
 */
export function DashboardStats() {
  const { currentStaff } = useStaffAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [overview, setOverview] = useState<RealTimeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  /**
   * 載入完整儀表板數據
   */
  const loadDashboardData = async () => {
    if (!currentStaff?.staffId) return;

    try {
      setError(null);
      const data = await DashboardApi.getDashboardData(currentStaff.staffId);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 載入即時概覽數據
   */
  const loadOverviewData = async () => {
    try {
      const data = await DashboardApi.getRealTimeOverview();
      setOverview(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load overview data:', err);
    }
  };

  /**
   * 初始化數據載入
   */
  useEffect(() => {
    loadDashboardData();
  }, [currentStaff?.staffId]);

  /**
   * 設置實時數據更新
   */
  useEffect(() => {
    // 每30秒更新一次概覽數據
    const overviewInterval = setInterval(loadOverviewData, 30000);
    
    // 每5分鐘更新一次完整儀表板數據
    const dashboardInterval = setInterval(loadDashboardData, 300000);

    return () => {
      clearInterval(overviewInterval);
      clearInterval(dashboardInterval);
    };
  }, [currentStaff?.staffId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">載入數據時發生錯誤</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadDashboardData}
                className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 使用即時數據或儀表板數據
  const currentOrders = overview?.orders || dashboardData?.orders;
  const currentKitchen = overview?.kitchen || dashboardData?.kitchen;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">即時概覽</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>最後更新：{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 待處理訂單 */}
        <StatCard
          title="待處理訂單"
          value={currentOrders?.total || 0}
          subtitle={`待確認：${currentOrders?.pending || 0} | 準備中：${currentOrders?.preparing || 0}`}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
          trend={{
            value: `+${currentOrders?.confirmed || 0}`,
            isPositive: (currentOrders?.confirmed || 0) > 0
          }}
        />

        {/* 廚房狀態 */}
        <StatCard
          title="廚房隊列"
          value={currentKitchen?.activeQueues || 0}
          subtitle={`總項目：${currentKitchen?.totalItems || 0}`}
          icon={<ChefHat className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100"
        />

        {/* 今日統計 */}
        <StatCard
          title="今日處理"
          value={dashboardData?.todayStats?.ordersProcessed || 0}
          subtitle={`平均處理時間：${dashboardData?.todayStats?.averageProcessingTime || 0}分鐘`}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
          trend={dashboardData?.todayStats?.efficiencyRating ? {
            value: `${dashboardData.todayStats.efficiencyRating}%`,
            isPositive: dashboardData.todayStats.efficiencyRating >= 80
          } : undefined}
        />

        {/* 通知 */}
        <StatCard
          title="待處理通知"
          value={dashboardData?.notifications?.unread || 0}
          subtitle="需要處理的通知"
          icon={<Bell className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      {/* 團隊統計 */}
      {dashboardData?.team && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">團隊狀態</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.team.activeStaff}</p>
              <p className="text-sm text-gray-600">在職員工</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{dashboardData.team.todayOrders}</p>
              <p className="text-sm text-gray-600">今日訂單</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{dashboardData.team.avgEfficiency.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">平均效率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{dashboardData.team.totalStaff}</p>
              <p className="text-sm text-gray-600">總員工數</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardStats;