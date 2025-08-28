import { useEffect } from 'react';
import { setupAuthInterceptor } from '../services/authApi';
import { useStaffAuth, useStaffAuthActions, useStaffAuthStore } from '../store/authStore';

/**
 * 認證設置 Hook
 * 
 * 用於應用程式啟動時初始化認證相關的設置：
 * - 設置 HTTP 客戶端的 Token 攔截器
 * - 自動刷新過期的 Token
 * - 初始化認證狀態
 */
export function useAuthSetup() {
  const { token, currentStaff, isAuthenticated } = useStaffAuth();
  const { refreshAuth } = useStaffAuthActions();

  /**
   * 設置 HTTP 客戶端的 Token 提供者
   */
  useEffect(() => {
    const tokenProvider = () => {
      // 從 Zustand store 獲取最新的 token
      const state = useStaffAuthStore.getState();
      return state.token;
    };

    // 設置 Token 攔截器
    setupAuthInterceptor(tokenProvider);
  }, []);

  /**
   * Token 自動刷新邏輯
   */
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // 解析 JWT Token 的過期時間（簡單實現）
    const getTokenExpirationTime = (token: string): number | null => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // 轉換為毫秒
      } catch (error) {
        console.warn('Failed to parse JWT token:', error);
        return null;
      }
    };

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return;

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // 如果 token 即將在 5 分鐘內過期，提前刷新
    const refreshThreshold = 5 * 60 * 1000; // 5 分鐘
    const timeUntilRefresh = Math.max(0, timeUntilExpiration - refreshThreshold);

    const refreshTimer = setTimeout(async () => {
      try {
        console.log('[Auth] Attempting to refresh token...');
        const success = await refreshAuth();
        if (success) {
          console.log('[Auth] Token refreshed successfully');
        } else {
          console.warn('[Auth] Token refresh failed - user will need to re-login');
        }
      } catch (error) {
        console.error('[Auth] Token refresh error:', error);
      }
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [token, isAuthenticated, refreshAuth]);

  /**
   * 監聽 Token 變化，更新攔截器
   */
  useEffect(() => {
    // 當 token 變化時，攔截器會自動使用新的 token
    // 這裡可以添加額外的日誌記錄
    if (token) {
      console.log('[Auth] Token updated, HTTP interceptor will use new token');
    } else {
      console.log('[Auth] Token cleared, HTTP requests will not include authorization');
    }
  }, [token]);

  /**
   * 初始化時的認證狀態檢查
   */
  useEffect(() => {
    if (currentStaff) {
      console.log(`[Auth] Authenticated as: ${currentStaff.name} (${currentStaff.staffId})`);
    } else {
      console.log('[Auth] No authenticated user');
    }
  }, [currentStaff]);

  return {
    isAuthenticated,
    currentStaff,
    token: !!token, // 返回布爾值，不暴露實際 token
  };
}

export default useAuthSetup;