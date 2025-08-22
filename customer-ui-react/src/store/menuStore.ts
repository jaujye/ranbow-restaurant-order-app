import { create } from 'zustand'
import { MenuService, MenuItem, MenuCategory } from '@/services/api'

interface MenuState {
  // Data
  items: MenuItem[]
  categories: MenuCategory[]
  popularItems: MenuItem[]
  featuredItems: MenuItem[]
  
  // UI State
  selectedCategory: string
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Filters
  priceRange: [number, number]
  availableOnly: boolean
  
  // Actions
  fetchMenuItems: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchPopularItems: () => Promise<void>
  fetchFeaturedItems: () => Promise<void>
  searchMenuItems: (query: string) => Promise<void>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setPriceRange: (range: [number, number]) => void
  setAvailableOnly: (availableOnly: boolean) => void
  clearError: () => void
  
  // Getters
  filteredItems: MenuItem[]
  getCategoryItems: (categoryName: string) => MenuItem[]
  getItemById: (id: number) => MenuItem | undefined
  isItemAvailable: (id: number) => boolean
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  // Data
  items: [],
  categories: [],
  popularItems: [],
  featuredItems: [],
  
  // UI State
  selectedCategory: '全部',
  searchQuery: '',
  isLoading: false,
  error: null,
  
  // Filters
  priceRange: [0, 1000],
  availableOnly: true,

  // Actions
  fetchMenuItems: async (category?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      // 使用後端推薦的方式：直接調用 /api/menu?category=CATEGORY
      const url = category && category !== 'all' && category !== '全部' 
        ? `/menu?category=${category}` 
        : '/menu'
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.113:8087/api'}${url}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const items = await response.json()
      
      set({
        items: items || [],
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch menu items',
        isLoading: false
      })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await MenuService.getMenuCategories()
      
      if (response.success && response.data) {
        // 添加"全部"分類到開頭
        const allCategory: MenuCategory = {
          id: 0,
          name: 'all',
          displayName: '全部',
          order: 0
        }
        
        set({
          categories: [allCategory, ...response.data]
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
    }
  },

  fetchPopularItems: async () => {
    try {
      const response = await MenuService.getPopularItems(10)
      
      if (response.success && response.data) {
        set({ popularItems: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch popular items:', error)
    }
  },

  fetchFeaturedItems: async () => {
    try {
      const response = await MenuService.getFeaturedItems(6)
      
      if (response.success && response.data) {
        set({ featuredItems: response.data })
      }
    } catch (error: any) {
      console.error('Failed to fetch featured items:', error)
    }
  },

  searchMenuItems: async (query: string) => {
    if (!query.trim()) {
      get().fetchMenuItems()
      return
    }
    
    set({ isLoading: true, error: null, searchQuery: query })
    
    try {
      const response = await MenuService.searchMenuItems(query, {
        available: get().availableOnly
      })
      
      if (response.success && response.data) {
        set({
          items: response.data.data,
          isLoading: false
        })
      } else {
        set({
          error: response.error || 'Search failed',
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        error: error.message || 'Search failed',
        isLoading: false
      })
    }
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category })
    // 直接使用統一的fetchMenuItems方法
    get().fetchMenuItems(category)
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    
    if (query.trim()) {
      get().searchMenuItems(query)
    } else {
      get().fetchMenuItems()
    }
  },

  setPriceRange: (range: [number, number]) => {
    set({ priceRange: range })
  },

  setAvailableOnly: (availableOnly: boolean) => {
    set({ availableOnly })
    
    // 重新加載當前選擇的分類
    const { selectedCategory } = get()
    get().setSelectedCategory(selectedCategory)
  },

  clearError: () => set({ error: null }),

  // Getters
  get filteredItems() {
    const { items, priceRange, availableOnly } = get()
    
    return items.filter(item => {
      // 價格範圍過濾
      if (item.price < priceRange[0] || item.price > priceRange[1]) {
        return false
      }
      
      // 可用性過濾
      if (availableOnly && !item.available) {
        return false
      }
      
      return true
    })
  },

  getCategoryItems: (categoryName: string) => {
    const { items } = get()
    
    if (categoryName === '全部' || categoryName === 'all') {
      return items
    }
    
    return items.filter(item => item.category === categoryName)
  },

  getItemById: (id: number | string) => {
    return get().items.find(item => (item.itemId || item.id) === id)
  },

  isItemAvailable: (id: number | string) => {
    const item = get().getItemById(id)
    return item?.available ?? false
  }
}))

// Selectors for convenient access
export const useMenu = () => useMenuStore((state) => ({
  items: state.filteredItems,
  categories: state.categories,
  popularItems: state.popularItems,
  featuredItems: state.featuredItems,
  selectedCategory: state.selectedCategory,
  searchQuery: state.searchQuery,
  isLoading: state.isLoading,
  error: state.error,
  priceRange: state.priceRange,
  availableOnly: state.availableOnly
}))

export const useMenuActions = () => useMenuStore((state) => ({
  fetchMenuItems: state.fetchMenuItems,
  fetchCategories: state.fetchCategories,
  fetchPopularItems: state.fetchPopularItems,
  fetchFeaturedItems: state.fetchFeaturedItems,
  searchMenuItems: state.searchMenuItems,
  setSelectedCategory: state.setSelectedCategory,
  setSearchQuery: state.setSearchQuery,
  setPriceRange: state.setPriceRange,
  setAvailableOnly: state.setAvailableOnly,
  clearError: state.clearError,
  getCategoryItems: state.getCategoryItems,
  getItemById: state.getItemById,
  isItemAvailable: state.isItemAvailable
}))

// 工具函數
export const getCategoryDisplayName = (categoryName: string): string => {
  const categoryMap: Record<string, string> = {
    'APPETIZER': '前菜',
    'MAIN_COURSE': '主菜',
    'MAIN': '主菜', 
    'DESSERT': '甜點',
    'BEVERAGE': '飲料',
    'SOUP': '湯品',
    'SALAD': '沙拉',
    'SIDE_DISH': '配菜',
    // 向後兼容小寫
    'appetizer': '前菜',
    'main_course': '主菜',
    'main': '主菜', 
    'dessert': '甜點',
    'beverage': '飲料',
    'soup': '湯品',
    'salad': '沙拉',
    'side_dish': '配菜',
    'all': '全部'
  }
  
  return categoryMap[categoryName.toUpperCase()] || categoryMap[categoryName.toLowerCase()] || categoryName
}