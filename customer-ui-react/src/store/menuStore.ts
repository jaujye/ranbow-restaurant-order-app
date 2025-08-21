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
  fetchMenuItems: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await MenuService.getMenuItems()
      
      if (response.success && response.data) {
        set({
          items: response.data.data,
          isLoading: false
        })
      } else {
        set({
          error: response.error || 'Failed to fetch menu items',
          isLoading: false
        })
      }
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
    
    if (category === '全部' || category === 'all') {
      get().fetchMenuItems()
    } else {
      // 獲取特定分類的商品
      const fetchCategoryItems = async () => {
        set({ isLoading: true })
        
        try {
          const response = await MenuService.getMenuItemsByCategory(category, {
            available: get().availableOnly
          })
          
          if (response.success && response.data) {
            set({
              items: response.data.data,
              isLoading: false
            })
          } else {
            set({
              error: response.error || 'Failed to fetch category items',
              isLoading: false
            })
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch category items',
            isLoading: false
          })
        }
      }
      
      fetchCategoryItems()
    }
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

  getItemById: (id: number) => {
    return get().items.find(item => item.id === id)
  },

  isItemAvailable: (id: number) => {
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
    'appetizer': '前菜',
    'main': '主菜', 
    'dessert': '甜點',
    'beverage': '飲料',
    'all': '全部'
  }
  
  return categoryMap[categoryName] || categoryName
}