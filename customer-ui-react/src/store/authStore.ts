import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService, User, LoginRequest, RegisterRequest } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
  
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  quickLogin: (role: 'customer' | 'staff' | 'admin') => Promise<boolean>
  register: (userData: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  clearError: () => void
  
  // Getters
  isAuthenticated: boolean
  isAdmin: boolean
  isStaffOrAdmin: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.login(credentials)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed'
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          })
          return false
        }
      },

      quickLogin: async (role: 'customer' | 'staff' | 'admin') => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.quickLogin(role)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              isLoading: false,
              error: response.error || 'Quick login failed'
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Quick login failed'
          })
          return false
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.register(userData)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              isLoading: false,
              error: response.error || 'Registration failed'
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          })
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await AuthService.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null
          })
        }
      },

      refreshUser: async () => {
        const { token } = get()
        if (!token) return
        
        set({ isLoading: true })
        
        try {
          const response = await AuthService.refreshUser()
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null
            })
          } else {
            // 如果 refreshUser 失敗，可能是 token 過期或無效
            // 檢查是否是 401 未授權錯誤
            if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
              // 清除認證狀態
              set({
                user: null,
                token: null,
                isLoading: false,
                error: null
              })
              console.warn('Authentication expired, clearing auth state')
            } else {
              set({ 
                isLoading: false,
                error: response.error || 'Failed to refresh user data'
              })
            }
          }
        } catch (error: any) {
          // 檢查是否是網絡錯誤中的 401
          if (error.message?.includes('401') || error.status === 401) {
            // 清除認證狀態
            set({
              user: null,
              token: null,
              isLoading: false,
              error: null
            })
            console.warn('Authentication expired, clearing auth state')
          } else {
            set({
              isLoading: false,
              error: error.message || 'Failed to refresh user data'
            })
          }
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.updateProfile(userData)
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              isLoading: false,
              error: response.error || 'Profile update failed'
            })
            return false
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed'
          })
          return false
        }
      },

      clearError: () => set({ error: null }),

      // Getters (computed values)
      get isAuthenticated() {
        return get().token !== null && get().user !== null
      },

      get isAdmin() {
        return get().user?.role === 'ADMIN'
      },

      get isStaffOrAdmin() {
        const role = get().user?.role
        return role === 'STAFF' || role === 'ADMIN'
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      }
    }
  )
)

// Selectors for convenient access
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  token: state.token,
  isLoading: state.isLoading,
  error: state.error,
  isAuthenticated: state.isAuthenticated,
  isAdmin: state.isAdmin,
  isStaffOrAdmin: state.isStaffOrAdmin,
  _hasHydrated: state._hasHydrated
}))

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  quickLogin: state.quickLogin,
  register: state.register,
  logout: state.logout,
  refreshUser: state.refreshUser,
  updateProfile: state.updateProfile,
  clearError: state.clearError
}))