import React from 'react';
import { useStaffAuth } from '@/features/auth/store/authStore';
import { StaffProfileCard } from '@/features/auth/components/StaffProfileCard';
import { QuickSwitchPanel } from '@/features/auth/components/QuickSwitchPanel';

/**
 * 員工儀表板頁面
 * 
 * 用於測試認證功能的簡單儀表板
 * 展示已登入員工的資訊和快速切換功能
 */
export function DashboardPage() {
  const { currentStaff } = useStaffAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-600">
          歡迎回來，{currentStaff?.name}！
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要內容區域 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">今日概覽</h2>
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p>員工認證系統已成功整合！</p>
              <p className="text-sm mt-2">其他功能模組開發中...</p>
            </div>
          </div>
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 員工資訊卡片 */}
          <StaffProfileCard />
          
          {/* 快速切換面板 */}
          <QuickSwitchPanel 
            maxDisplay={5}
            onSwitchSuccess={(staff) => {
              console.log('Switched to:', staff.name);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;