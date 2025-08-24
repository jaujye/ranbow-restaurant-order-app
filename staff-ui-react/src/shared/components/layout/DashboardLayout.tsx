import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * 簡單的儀表板佈局組件
 * 
 * 為了測試認證功能而創建的臨時佈局組件
 * 後續可以擴展為完整的導航和側邊欄佈局
 */
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 簡單的頂部導航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">彩虹餐廳員工系統</h1>
            </div>
            <div className="text-sm text-gray-600">
              員工作業平台
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;