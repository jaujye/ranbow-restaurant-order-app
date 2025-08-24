import React, { useEffect } from 'react';
import { useAuthSetup } from '../hooks/useAuthSetup';

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認證提供者組件
 * 
 * 負責在應用程式啟動時初始化認證系統：
 * - 設置 HTTP 攔截器
 * - 配置 Token 自動刷新
 * - 初始化認證狀態
 * 
 * 這個組件應該在應用的頂層使用，包裝所有需要認證的功能
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // 使用認證設置 Hook 來初始化認證系統
  const { isAuthenticated, currentStaff } = useAuthSetup();

  /**
   * 應用程式載入時的認證狀態日誌
   */
  useEffect(() => {
    console.log('[AuthProvider] Authentication system initialized', {
      isAuthenticated,
      hasUser: !!currentStaff,
      userId: currentStaff?.staffId,
      userName: currentStaff?.name,
    });
  }, [isAuthenticated, currentStaff]);

  // 直接渲染子組件，認證邏輯在 useAuthSetup 中處理
  return <>{children}</>;
}

export default AuthProvider;