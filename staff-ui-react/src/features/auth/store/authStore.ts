import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StaffAuthApi } from '../services/authApi';
import type { Staff, StaffProfile, StaffLoginRequest } from '@/shared/types/api';

/**
 * 員工認證響應介面
 */
export interface StaffAuthResponse {
  staff: Staff;
  token: string;
  sessionId: string;
  expiresIn: number;
  refreshToken?: string;
}

/**
 * 員工認證狀態介面
 */
interface StaffAuthState {
  // 狀態數據
  currentStaff: Staff | null;
  staffProfile: StaffProfile | null;
  token: string | null;
  sessionId: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions - 認證相關
  login: (credentials: StaffLoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
  
  // Actions - 快速切換
  switchToStaff: (targetStaffId: string) => Promise<boolean>;
  getAvailableStaff: (currentStaffId: string) => Promise<Staff[]>;
  
  // Actions - 個人資料
  loadProfile: (staffId: string) => Promise<StaffProfile | null>;
  updateProfile: (updates: Partial<Staff>) => Promise<boolean>;
  
  // Computed Properties
  isAuthenticated: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  hasPermission: (permission: string) => boolean;
}

/**
 * 員工認證 Zustand Store
 * 
 * 特性：
 * - JWT Token 管理
 * - 員工快速切換
 * - 個人資料同步
 * - 權限檢查
 * - 持久化存儲
 */
export const useStaffAuthStore = create<StaffAuthState>()(
  persist(
    (set, get) => ({
      // 初始狀態
      currentStaff: null,
      staffProfile: null,
      token: null,
      sessionId: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // 員工登入
      login: async (credentials: StaffLoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await StaffAuthApi.login(credentials);
          
          if (response.success && response.data) {
            // 設置認證狀態
            const staff = response.data.staff;
            set({
              currentStaff: staff,
              token: response.data.token,
              sessionId: response.data.sessionId,
              refreshToken: response.data.refreshToken,
              isLoading: false,
              error: null,
            });

            // 自動載入個人資料
            try {
              const profile = await StaffAuthApi.getProfile(staff.staffId);
              if (profile.success && profile.data) {
                set({ staffProfile: profile.data });
              }
            } catch (profileError) {
              console.warn('Failed to load staff profile after login:', profileError);
            }

            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '登入失敗，請檢查帳號密碼'
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || '登入失敗，請稍後再試';
          set({
            isLoading: false,
            error: errorMessage
          });
          return false;
        }
      },

      // 員工登出
      logout: async () => {
        const { sessionId } = get();
        set({ isLoading: true });
        
        try {
          // 調用後端登出 API
          if (sessionId) {
            await StaffAuthApi.logout(sessionId);
          }
        } catch (error) {
          console.warn('Logout API call failed, but continuing with local logout:', error);
        } finally {
          // 清除所有認證狀態
          set({
            currentStaff: null,
            staffProfile: null,
            token: null,
            sessionId: null,
            refreshToken: null,
            isLoading: false,
            error: null,
          });
        }
      },

      // 刷新認證
      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        set({ isLoading: true });
        
        try {
          const response = await StaffAuthApi.refreshToken(refreshToken);
          
          if (response.success && response.data) {
            const staff = response.data.staff;
            set({
              currentStaff: staff,
              token: response.data.token,
              sessionId: response.data.sessionId,
              refreshToken: response.data.refreshToken,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            // 刷新失敗，清除認證狀態
            set({
              currentStaff: null,
              staffProfile: null,
              token: null,
              sessionId: null,
              refreshToken: null,
              isLoading: false,
              error: 'Authentication expired',
            });
            return false;
          }
        } catch (error: any) {
          console.error('Token refresh failed:', error);
          // 清除認證狀態
          set({
            currentStaff: null,
            staffProfile: null,
            token: null,
            sessionId: null,
            refreshToken: null,
            isLoading: false,
            error: 'Authentication expired',
          });
          return false;
        }
      },

      // 快速切換員工
      switchToStaff: async (targetStaffId: string) => {
        const { currentStaff } = get();
        if (!currentStaff) return false;

        set({ isLoading: true, error: null });
        
        try {
          const response = await StaffAuthApi.switchStaff({
            fromStaffId: currentStaff.staffId,
            toStaffId: targetStaffId
          });
          
          if (response.success && response.data) {
            set({
              currentStaff: response.data.staff,
              token: response.data.token,
              sessionId: response.data.sessionId,
              refreshToken: response.data.refreshToken,
              isLoading: false,
              error: null
            });

            // 載入新員工的個人資料
            try {
              const profile = await StaffAuthApi.getProfile(response.data.staff.staffId);
              if (profile.success && profile.data) {
                set({ staffProfile: profile.data });
              }
            } catch (profileError) {
              console.warn('Failed to load profile after staff switch:', profileError);
            }

            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '切換員工失敗'
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || '切換員工失敗';
          set({
            isLoading: false,
            error: errorMessage
          });
          return false;
        }
      },

      // 獲取可切換的員工列表
      getAvailableStaff: async (currentStaffId: string) => {
        try {
          const response = await StaffAuthApi.getAvailableStaff(currentStaffId);
          if (response.success && response.data) {
            return response.data;
          }
          return [];
        } catch (error) {
          console.error('Failed to get available staff:', error);
          return [];
        }
      },

      // 載入員工個人資料
      loadProfile: async (staffId: string) => {
        set({ isLoading: true });
        
        try {
          const response = await StaffAuthApi.getProfile(staffId);
          
          if (response.success && response.data) {
            set({ 
              staffProfile: response.data,
              isLoading: false
            });
            return response.data;
          } else {
            set({ 
              isLoading: false,
              error: response.error || '載入個人資料失敗'
            });
            return null;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || '載入個人資料失敗';
          set({
            isLoading: false,
            error: errorMessage
          });
          return null;
        }
      },

      // 更新個人資料
      updateProfile: async (updates: Partial<Staff>) => {
        const { currentStaff } = get();
        if (!currentStaff) return false;

        set({ isLoading: true, error: null });
        
        try {
          const response = await StaffAuthApi.updateProfile(currentStaff.staffId, updates);
          
          if (response.success && response.data) {
            // 更新當前員工數據
            set({
              currentStaff: { ...currentStaff, ...response.data },
              isLoading: false
            });

            // 如果有個人資料，也要更新
            const { staffProfile } = get();
            if (staffProfile) {
              set({
                staffProfile: { ...staffProfile, ...response.data }
              });
            }

            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || '更新個人資料失敗'
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || '更新個人資料失敗';
          set({
            isLoading: false,
            error: errorMessage
          });
          return false;
        }
      },

      // 清除錯誤
      clearError: () => set({ error: null }),

      // Computed Properties - 使用直接屬性避免hydration錯誤
      isAuthenticated: false,
      isManager: false,
      isSupervisor: false,

      // 權限檢查
      hasPermission: (permission: string) => {
        const state = get();
        return state.currentStaff?.permissions.includes(permission) || false;
      },
    }),
    {
      name: 'staff-auth-store',
      // 只持久化必要的認證數據
      partialize: (state) => ({
        currentStaff: state.currentStaff,
        token: state.token,
        sessionId: state.sessionId,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[StaffAuthStore] Rehydration error:', error);
          return;
        }
        
        if (state && state.token && state.currentStaff) {
          // 檢查token是否過期
          const isTokenValid = () => {
            try {
              const payload = JSON.parse(atob(state.token.split('.')[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              return payload.exp > currentTime;
            } catch (error) {
              console.warn('Failed to validate token:', error);
              return false;
            }
          };

          if (isTokenValid()) {
            // Token有效，重新計算computed properties
            const isAuthenticated = true;
            const isManager = state.currentStaff?.position === 'MANAGER' || false;
            const isSupervisor = state.currentStaff?.position === 'SUPERVISOR' || state.currentStaff?.position === 'MANAGER' || false;
            
            // 更新state中的computed properties
            Object.assign(state, {
              isAuthenticated,
              isManager,
              isSupervisor,
              isLoading: false,
              error: null,
              staffProfile: null, // rehydration後重新載入
            });

            console.log('[StaffAuthStore] Rehydrated successfully with valid token', {
              staffId: state.currentStaff?.staffId,
              staffName: state.currentStaff?.name,
              isAuthenticated: true
            });
          } else {
            // Token已過期，清除認證狀態
            Object.assign(state, {
              currentStaff: null,
              token: null,
              sessionId: null,
              refreshToken: null,
              staffProfile: null,
              isAuthenticated: false,
              isManager: false,
              isSupervisor: false,
              isLoading: false,
              error: 'Token expired'
            });

            console.log('[StaffAuthStore] Rehydrated but token expired, cleared auth state');
          }
        } else {
          // 沒有有效的認證數據
          console.log('[StaffAuthStore] Rehydrated without valid auth data');
        }
      },
    }
  )
);

// 選擇器 Hooks - 提供便捷的狀態訪問

/**
 * 員工認證狀態 Hook
 */
export const useStaffAuth = () => {
  const state = useStaffAuthStore();
  
  // 確保computed properties正確反映當前狀態
  const isAuthenticated = !!(state.token && state.currentStaff);
  const isManager = state.currentStaff?.position === 'MANAGER' || false;
  const isSupervisor = state.currentStaff?.position === 'SUPERVISOR' || state.currentStaff?.position === 'MANAGER' || false;
  
  return {
    currentStaff: state.currentStaff,
    staffProfile: state.staffProfile,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated,
    isManager,
    isSupervisor,
  };
};

/**
 * 員工認證操作 Hook
 */
export const useStaffAuthActions = () => 
  useStaffAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    refreshAuth: state.refreshAuth,
    switchToStaff: state.switchToStaff,
    getAvailableStaff: state.getAvailableStaff,
    loadProfile: state.loadProfile,
    updateProfile: state.updateProfile,
    clearError: state.clearError,
    hasPermission: state.hasPermission,
  }));