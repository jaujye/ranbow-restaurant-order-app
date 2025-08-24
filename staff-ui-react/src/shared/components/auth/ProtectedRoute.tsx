import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useStaffAuth } from '@/features/auth/store/authStore';
import type { StaffPosition } from '@/shared/types/api';

/**
 * ProtectedRoute Props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPositions?: StaffPosition[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

/**
 * 受保護的路由組件
 * 
 * 用於保護需要認證的頁面路由
 * 
 * 特性：
 * - 檢查用戶是否已登入
 * - 支援職位權限檢查
 * - 支援特定權限檢查
 * - 自動重定向到登入頁面
 * - 載入狀態處理
 */
export function ProtectedRoute({
  children,
  requiredPositions = [],
  requiredPermissions = [],
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { 
    isAuthenticated, 
    currentStaff, 
    isLoading 
  } = useStaffAuth();

  // 如果正在載入認證狀態，顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">驗證身份中...</p>
        </div>
      </div>
    );
  }

  // 如果用戶未登入，重定向到登入頁面
  if (!isAuthenticated || !currentStaff) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 檢查職位權限
  const hasRequiredPosition = () => {
    if (requiredPositions.length === 0) return true;
    return requiredPositions.includes(currentStaff.position);
  };

  // 檢查特定權限
  const hasRequiredPermissions = () => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(permission => 
      currentStaff.permissions.includes(permission)
    );
  };

  // 如果權限不足，顯示權限不足頁面
  if (!hasRequiredPosition() || !hasRequiredPermissions()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">權限不足</h3>
          <p className="text-gray-600 mb-4">
            您的帳戶權限不足以訪問此頁面，請聯繫系統管理員。
          </p>
          <div className="space-y-2">
            {requiredPositions.length > 0 && (
              <p className="text-sm text-gray-500">
                需要職位：{requiredPositions.join(', ')}
              </p>
            )}
            {requiredPermissions.length > 0 && (
              <p className="text-sm text-gray-500">
                需要權限：{requiredPermissions.join(', ')}
              </p>
            )}
            <p className="text-sm text-gray-500">
              當前職位：{currentStaff.position}
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回上頁
          </button>
        </div>
      </div>
    );
  }

  // 權限檢查通過，渲染子組件
  return <>{children}</>;
}

export default ProtectedRoute;