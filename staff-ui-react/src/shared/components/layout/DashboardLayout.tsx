import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffNavigation } from './StaffNavigation';

/**
 * 員工儀表板佈局組件
 * 
 * 提供完整的員工系統佈局：
 * - 頂部導航欄（用戶信息、快速切換、登出）
 * - 底部功能導航（首頁、訂單、廚房、統計、通知）
 * - 響應式設計適配所有設備
 */
export function DashboardLayout() {
  return (
    <StaffNavigation>
      <Outlet />
    </StaffNavigation>
  );
}

export default DashboardLayout;