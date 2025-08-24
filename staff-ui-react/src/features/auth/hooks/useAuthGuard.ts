import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../store/authStore';
import type { StaffPosition } from '@/shared/types/api';

/**
 * 權限守衛配置
 */
interface AuthGuardOptions {
  requireAuth?: boolean;
  requiredPositions?: StaffPosition[];
  requiredPermissions?: string[];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

/**
 * 認證守衛 Hook
 * 
 * 用於保護頁面路由，確保用戶有適當的認證和權限
 * 
 * @param options 權限配置選項
 * @returns 認證狀態和權限檢查結果
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const {
    requireAuth = true,
    requiredPositions = [],
    requiredPermissions = [],
    redirectTo = '/login',
    onUnauthorized,
  } = options;

  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    currentStaff, 
    isLoading 
  } = useStaffAuth();

  /**
   * 檢查職位權限
   */
  const hasRequiredPosition = () => {
    if (requiredPositions.length === 0) return true;
    if (!currentStaff) return false;
    return requiredPositions.includes(currentStaff.position);
  };

  /**
   * 檢查特定權限
   */
  const hasRequiredPermissions = () => {
    if (requiredPermissions.length === 0) return true;
    if (!currentStaff) return false;
    return requiredPermissions.every(permission => 
      currentStaff.permissions.includes(permission)
    );
  };

  /**
   * 整體授權檢查
   */
  const isAuthorized = () => {
    if (!requireAuth) return true;
    if (!isAuthenticated || !currentStaff) return false;
    return hasRequiredPosition() && hasRequiredPermissions();
  };

  /**
   * 執行權限檢查和重定向邏輯
   */
  useEffect(() => {
    // 等待載入完成
    if (isLoading) return;

    const authorized = isAuthorized();
    
    if (!authorized) {
      // 執行自定義回調
      onUnauthorized?.();
      
      // 重定向到指定頁面
      navigate(redirectTo, { 
        replace: true,
        state: { from: window.location.pathname }
      });
    }
  }, [
    isLoading, 
    isAuthenticated, 
    currentStaff, 
    requireAuth, 
    requiredPositions, 
    requiredPermissions,
    navigate,
    redirectTo,
    onUnauthorized
  ]);

  return {
    isLoading,
    isAuthenticated,
    currentStaff,
    isAuthorized: isAuthorized(),
    hasRequiredPosition: hasRequiredPosition(),
    hasRequiredPermissions: hasRequiredPermissions(),
  };
}

export default useAuthGuard;