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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  console.log('🎯 DashboardStats component rendered with currentStaff:', currentStaff);
  
  // 錯誤邊界保護
  if (!currentStaff) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">請先登入以查看統計數據</p>
        </div>
      </div>
    );
  }

  /**
   * 載入完整儀表板數據
   */
  const loadDashboardData = async () => {
    console.log('🔍 LoadDashboardData called with currentStaff:', currentStaff);
    
    const staffId = currentStaff?.staff?.staffId || currentStaff?.staffId;
    
    if (!staffId) {
      console.log('❌ No staffId found in currentStaff:', currentStaff);
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Loading dashboard data for staffId:', staffId);
      setLoading(true);
      setError(null);
      const data = await DashboardApi.getDashboardData(staffId);
      console.log('✅ Dashboard data loaded successfully:', data);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('❌ Failed to load dashboard data:', err);
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
   * 初始化數據載入 - 登入後立即載入所有數據
   */
  // 初始化數據載入
  useEffect(() => {
    const staffId = currentStaff?.staff?.staffId || currentStaff?.staffId;
    if (staffId) {
      console.log('🚀 初始化加載 Dashboard 數據, staffId:', staffId);
      loadDashboardData();
    }
  }, [currentStaff?.staff?.staffId, currentStaff?.staffId]);

  // 初始化概覽數據載入
  useEffect(() => {
    console.log('🚀 初始化加載 Overview 數據');
    loadOverviewData();
  }, []);

  // 設置輪詢更新
  useEffect(() => {
    const staffId = currentStaff?.staff?.staffId || currentStaff?.staffId;
    if (staffId) {
      console.log('🔄 設置數據輪詢更新');
      
      // 每15秒更新一次概覽數據
      const overviewInterval = setInterval(() => {
        console.log('🔄 輪詢更新: 載入概覽數據');
        loadOverviewData();
      }, 15000);
      
      // 每2分鐘更新一次完整儀表板數據
      const dashboardInterval = setInterval(() => {
        console.log('🔄 輪詢更新: 載入儀表板數據');
        loadDashboardData();
      }, 120000);

      return () => {
        console.log('🛑 清理輪詢定時器');
        clearInterval(overviewInterval);
        clearInterval(dashboardInterval);
      };
    }
  }, [currentStaff?.staff?.staffId, currentStaff?.staffId]);

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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-center text-center">
          <div>
            <svg className="h-12 w-12 text-yellow-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">目前沒有資料</h3>
            <p className="text-sm text-yellow-700 mb-4">
              系統暫時無法載入統計數據，請稍後再試
            </p>
            <button
              onClick={loadDashboardData}
              className="bg-yellow-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-yellow-700 transition-colors"
            >
              重新載入
            </button>
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
          value={(currentOrders?.pending || 0) + (currentOrders?.confirmed || 0)}
          subtitle={`待確認：${currentOrders?.pending || 0} | 已確認：${currentOrders?.confirmed || 0}`}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100 text-blue-600"
          trend={{
            value: `準備中：${currentOrders?.preparing || 0}`,
            isPositive: (currentOrders?.preparing || 0) > 0
          }}
        />

        {/* 廚房隊列 */}
        <StatCard
          title="廚房隊列"
          value={currentKitchen?.activeQueues || 0}
          subtitle={`隊列長度：${currentKitchen?.totalItems || 0} | 準備中：${currentOrders?.preparing || 0}`}
          icon={<ChefHat className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100 text-orange-600"
        />

        {/* 今日處理 */}
        <StatCard
          title="今日處理"
          value={dashboardData?.todayStats?.ordersProcessed || 0}
          subtitle={`平均處理：${dashboardData?.todayStats?.averageProcessingTime || 0}分鐘 | 效率：${dashboardData?.todayStats?.efficiencyRating || 0}%`}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          color="bg-green-100 text-green-600"
          trend={dashboardData?.todayStats?.efficiencyRating ? {
            value: `效率：${dashboardData.todayStats.efficiencyRating}%`,
            isPositive: (dashboardData.todayStats.efficiencyRating || 0) >= 80
          } : undefined}
        />

        {/* 待處理通知 */}
        <StatCard
          title="待處理通知"
          value={dashboardData?.notifications?.unread || 0}
          subtitle="需要您處理的系統通知"
          icon={<Bell className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* 團隊統計 */}
      {dashboardData?.team && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">團隊狀態</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.team?.activeStaff || 0}</p>
              <p className="text-sm text-gray-600">在職員工</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{dashboardData.team?.todayOrders || 0}</p>
              <p className="text-sm text-gray-600">今日訂單</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{(dashboardData.team?.avgEfficiency || 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-600">平均效率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{dashboardData.team?.totalStaff || 0}</p>
              <p className="text-sm text-gray-600">總員工數</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardStats;