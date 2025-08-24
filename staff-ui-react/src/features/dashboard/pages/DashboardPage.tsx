import React from 'react';
import { useStaffAuth } from '@/features/auth/store/authStore';
import { DashboardStats } from '../components/DashboardStats';

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

        {/* 近期活動 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">近期活動</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">新訂單通知</p>
                <p className="text-xs text-blue-700">訂單 #12345 需要處理</p>
              </div>
              <span className="text-xs text-blue-600 ml-auto">2分鐘前</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-900">廚房完成</p>
                <p className="text-xs text-green-700">訂單 #12340 已準備完成</p>
              </div>
              <span className="text-xs text-green-600 ml-auto">5分鐘前</span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-orange-900">系統提醒</p>
                <p className="text-xs text-orange-700">今日效率已達成目標 85%</p>
              </div>
              <span className="text-xs text-orange-600 ml-auto">10分鐘前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;