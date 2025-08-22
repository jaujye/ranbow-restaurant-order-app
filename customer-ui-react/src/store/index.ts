// Store exports
export * from './authStore'
export * from './cartStore'
export * from './menuStore'
export * from './orderStore'

// Combined store hooks for complex operations
import { useAuthStore } from './authStore'
import { useCartStore } from './cartStore'
import { useMenuStore } from './menuStore'
import { useOrderStore } from './orderStore'

/**
 * 組合 Hook - 用於需要多個 store 數據的場景
 */

// 結帳流程相關的 store 數據
export const useCheckoutStore = () => ({
  // Auth
  user: useAuthStore(state => state.user),
  isAuthenticated: useAuthStore(state => state.token !== null && state.user !== null),
  
  // Cart
  cartItems: useCartStore(state => state.items),
  cartTotal: useCartStore(state => state.totalAmount),
  subtotal: useCartStore(state => state.subtotal),
  tax: useCartStore(state => state.tax),
  serviceCharge: useCartStore(state => state.serviceCharge),
  clearCart: useCartStore(state => state.clearCart),
  
  // Order
  checkoutData: useOrderStore(state => state.checkoutData),
  isCreatingOrder: useOrderStore(state => state.isCreatingOrder),
  isProcessingPayment: useOrderStore(state => state.isProcessingPayment),
  setTableNumber: useOrderStore(state => state.setTableNumber),
  setPaymentMethod: useOrderStore(state => state.setPaymentMethod),
  setSpecialRequests: useOrderStore(state => state.setSpecialRequests),
  createOrder: useOrderStore(state => state.createOrder),
  createPayment: useOrderStore(state => state.createPayment),
  processPayment: useOrderStore(state => state.processPayment),
  resetCheckoutData: useOrderStore(state => state.resetCheckoutData),
})

// 菜單瀏覽相關的 store 數據
export const useMenuBrowserStore = () => ({
  // Menu
  menuItems: useMenuStore(state => state.filteredItems),
  categories: useMenuStore(state => state.categories),
  popularItems: useMenuStore(state => state.popularItems),
  selectedCategory: useMenuStore(state => state.selectedCategory),
  searchQuery: useMenuStore(state => state.searchQuery),
  isLoading: useMenuStore(state => state.isLoading),
  setSelectedCategory: useMenuStore(state => state.setSelectedCategory),
  setSearchQuery: useMenuStore(state => state.setSearchQuery),
  
  // Cart
  addToCart: useCartStore(state => state.addItem),
  cartItemCount: useCartStore(state => state.itemCount),
  getCartItemByMenuId: useCartStore(state => state.getItemByMenuId),
  
  // Auth (for checking login status)
  isAuthenticated: useAuthStore(state => state.token !== null && state.user !== null),
})

// 訂單管理相關的 store 數據
export const useOrderManagementStore = () => ({
  // Order
  orders: useOrderStore(state => state.orders),
  currentOrder: useOrderStore(state => state.currentOrder),
  isLoading: useOrderStore(state => state.isLoading),
  error: useOrderStore(state => state.error),
  hasActiveOrders: useOrderStore(state => state.hasActiveOrders),
  fetchUserOrders: useOrderStore(state => state.fetchUserOrders),
  fetchOrderById: useOrderStore(state => state.fetchOrderById),
  updateOrderStatus: useOrderStore(state => state.updateOrderStatus),
  cancelOrder: useOrderStore(state => state.cancelOrder),
  getOrdersByStatus: useOrderStore(state => state.getOrdersByStatus),
  
  // Auth
  user: useAuthStore(state => state.user),
  isAuthenticated: useAuthStore(state => state.token !== null && state.user !== null),
})

// 全局狀態重置 - 用於登出時清理所有狀態
export const useGlobalReset = () => {
  const authLogout = useAuthStore(state => state.logout)
  const clearCart = useCartStore(state => state.clearCart)
  const resetCheckoutData = useOrderStore(state => state.resetCheckoutData)
  const clearOrderError = useOrderStore(state => state.clearError)
  const clearMenuError = useMenuStore(state => state.clearError)
  
  return async () => {
    try {
      await authLogout()
      clearCart()
      resetCheckoutData()
      clearOrderError()
      clearMenuError()
    } catch (error) {
      console.error('Error during global reset:', error)
    }
  }
}

// 應用初始化 - 用於應用啟動時的數據預加載
export const useAppInitialization = () => {
  const fetchMenuItems = useMenuStore(state => state.fetchMenuItems)
  const fetchCategories = useMenuStore(state => state.fetchCategories)
  const fetchPopularItems = useMenuStore(state => state.fetchPopularItems)
  const fetchUserOrders = useOrderStore(state => state.fetchUserOrders)
  const isAuthenticated = useAuthStore(state => state.token !== null && state.user !== null)
  
  return async () => {
    try {
      // 並行加載基礎數據
      await Promise.all([
        fetchMenuItems(),
        fetchCategories(),
        fetchPopularItems()
      ])
      
      // 如果用戶已登入，加載用戶相關數據
      if (isAuthenticated) {
        await fetchUserOrders()
      }
    } catch (error) {
      console.error('Error during app initialization:', error)
    }
  }
}

// 購物車同步 - 用於確保購物車數據與後端同步
export const useCartSync = () => {
  const calculateTotals = useCartStore(state => state.calculateTotals)
  
  return () => {
    // 重新計算購物車總金額（以防價格或稅率有變更）
    calculateTotals()
  }
}

// Store 狀態監聽器類型定義
export type StoreListener<T> = (state: T) => void

// 通用的 store 狀態訂閱工具
export const createStoreSubscription = <T>(
  useStore: () => T,
  listener: StoreListener<T>
) => {
  let previousState = useStore()
  
  return () => {
    const currentState = useStore()
    if (currentState !== previousState) {
      listener(currentState)
      previousState = currentState
    }
  }
}