import React from 'react';
import { useStaffAuth } from '@/features/auth/store/authStore';
import { DashboardStats } from '../components/DashboardStats';
import { RecentNotifications } from '../components/RecentNotifications';

/**
 * 員工儀表板頁面
 * 
 * 顯示員工的實時工作台數據，包括：
 * - 實時訂單統計
 * - 廚房狀態監控
 * - 個人績效數據
 * - 團隊協作工具
 */
export function DashboardPage() {
  const { currentStaff } = useStaffAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-600">
          歡迎回來，{currentStaff?.name}！今日為您提供即時的營運數據。
        </p>
      </div>

      <div className="space-y-8">
        {/* 實時統計數據 */}
        <DashboardStats />

        {/* 重要系統通知 */}
        <RecentNotifications />
      </div>
    </div>
  );
}

export default DashboardPage;