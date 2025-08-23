/**
 * 🎛️ UI State Management Store
 * Manages application UI state including theme, sidebar, modals, and layout
 */

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface UIState {
  // Theme management
  theme: 'light' | 'dark' | 'system'
  
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modal management
  modals: {
    [key: string]: {
      isOpen: boolean
      data?: any
    }
  }
  
  // Loading states
  loading: {
    [key: string]: boolean
  }
  
  // Layout preferences
  layout: {
    compactMode: boolean
    density: 'comfortable' | 'compact' | 'spacious'
  }
}

export interface UIActions {
  // Theme actions
  setTheme: (theme: UIState['theme']) => void
  toggleTheme: () => void
  
  // Sidebar actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  
  // Modal actions
  openModal: (modalId: string, data?: any) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string, data?: any) => void
  closeAllModals: () => void
  
  // Loading actions
  setLoading: (key: string, loading: boolean) => void
  clearAllLoading: () => void
  
  // Layout actions
  setCompactMode: (compact: boolean) => void
  setDensity: (density: UIState['layout']['density']) => void
  
  // Reset action
  resetUI: () => void
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {},
  loading: {},
  layout: {
    compactMode: false,
    density: 'comfortable'
  }
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Theme actions
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        toggleTheme: () => {
          const current = get().theme
          const next = current === 'light' ? 'dark' : 'light'
          set({ theme: next }, false, 'ui/toggleTheme')
        },
        
        // Sidebar actions
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, 'ui/setSidebarOpen'),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }, false, 'ui/setSidebarCollapsed'),
        toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'ui/toggleSidebarCollapsed'),
        
        // Modal actions
        openModal: (modalId, data) => set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: true, data }
          }
        }), false, 'ui/openModal'),
        
        closeModal: (modalId) => set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: false }
          }
        }), false, 'ui/closeModal'),
        
        toggleModal: (modalId, data) => {
          const current = get().modals[modalId]
          if (current?.isOpen) {
            get().closeModal(modalId)
          } else {
            get().openModal(modalId, data)
          }
        },
        
        closeAllModals: () => set({ modals: {} }, false, 'ui/closeAllModals'),
        
        // Loading actions
        setLoading: (key, loading) => set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading
          }
        }), false, 'ui/setLoading'),
        
        clearAllLoading: () => set({ loading: {} }, false, 'ui/clearAllLoading'),
        
        // Layout actions
        setCompactMode: (compactMode) => set((state) => ({
          layout: { ...state.layout, compactMode }
        }), false, 'ui/setCompactMode'),
        
        setDensity: (density) => set((state) => ({
          layout: { ...state.layout, density }
        }), false, 'ui/setDensity'),
        
        // Reset action
        resetUI: () => set(initialState, false, 'ui/reset')
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          layout: state.layout
        })
      }
    ),
    {
      name: 'UI Store'
    }
  )
)

// Selector hooks for specific UI state
export const useTheme = () => useUIStore((state) => state.theme)
export const useSidebar = () => useUIStore((state) => ({
  open: state.sidebarOpen,
  collapsed: state.sidebarCollapsed,
  setOpen: state.setSidebarOpen,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed,
  toggleCollapsed: state.toggleSidebarCollapsed
}))

export const useModal = (modalId: string) => useUIStore((state) => ({
  isOpen: state.modals[modalId]?.isOpen || false,
  data: state.modals[modalId]?.data,
  open: (data?: any) => state.openModal(modalId, data),
  close: () => state.closeModal(modalId),
  toggle: (data?: any) => state.toggleModal(modalId, data)
}))

export const useUIActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
  toggleSidebarCollapsed: state.toggleSidebarCollapsed,
  openModal: state.openModal,
  closeModal: state.closeModal,
  toggleModal: state.toggleModal,
  closeAllModals: state.closeAllModals,
  setLoading: state.setLoading,
  clearAllLoading: state.clearAllLoading,
  setCompactMode: state.setCompactMode,
  setDensity: state.setDensity,
  resetUI: state.resetUI
}))