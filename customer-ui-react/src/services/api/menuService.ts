import { HttpClient, ApiResponse } from './client'
import { 
  MenuItem, 
  MenuCategory, 
  MenuQueryParams, 
  PaginatedResponse 
} from './types'

/**
 * 菜單服務 - 處理菜單相關的 API 調用
 */
export class MenuService {
  /**
   * 獲取所有菜單項目
   */
  static async getMenuItems(params?: MenuQueryParams): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return HttpClient.get<PaginatedResponse<MenuItem>>(`/menu${queryString ? '?' + queryString : ''}`)
  }

  /**
   * 獲取單個菜單項目詳情
   */
  static async getMenuItem(id: number): Promise<ApiResponse<MenuItem>> {
    return HttpClient.get<MenuItem>(`/menu/${id}`)
  }

  /**
   * 獲取熱門菜品
   */
  static async getPopularItems(limit?: number): Promise<ApiResponse<MenuItem[]>> {
    const queryString = limit ? `?limit=${limit}` : ''
    return HttpClient.get<MenuItem[]>(`/menu/popular${queryString}`)
  }

  /**
   * 獲取推薦菜品
   */
  static async getFeaturedItems(limit?: number): Promise<ApiResponse<MenuItem[]>> {
    const queryString = limit ? `?limit=${limit}` : ''
    return HttpClient.get<MenuItem[]>(`/menu/featured${queryString}`)
  }

  /**
   * 搜索菜品
   */
  static async searchMenuItems(
    query: string, 
    params?: Omit<MenuQueryParams, 'search'>
  ): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const searchParams = new URLSearchParams({
      search: query,
      ...(params as any)
    }).toString()
    
    return HttpClient.get<PaginatedResponse<MenuItem>>(`/menu/search?${searchParams}`)
  }

  /**
   * 按分類獲取菜品
   */
  static async getMenuItemsByCategory(
    category: string, 
    params?: Omit<MenuQueryParams, 'category'>
  ): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const queryParams = new URLSearchParams({
      category,
      ...(params as any)
    }).toString()
    
    return HttpClient.get<PaginatedResponse<MenuItem>>(`/menu/category/${category}?${queryParams}`)
  }

  /**
   * 獲取所有菜單分類
   */
  static async getMenuCategories(): Promise<ApiResponse<MenuCategory[]>> {
    return HttpClient.get<MenuCategory[]>('/menu/categories')
  }

  /**
   * 獲取今日特色菜品
   */
  static async getTodaySpecials(): Promise<ApiResponse<MenuItem[]>> {
    return HttpClient.get<MenuItem[]>('/menu/specials/today')
  }

  /**
   * 獲取新品菜單
   */
  static async getNewItems(limit?: number): Promise<ApiResponse<MenuItem[]>> {
    const queryString = limit ? `?limit=${limit}` : ''
    return HttpClient.get<MenuItem[]>(`/menu/new${queryString}`)
  }

  /**
   * 獲取可用菜品（庫存充足的菜品）
   */
  static async getAvailableItems(params?: MenuQueryParams): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const queryParams = new URLSearchParams({
      available: 'true',
      ...(params as any)
    }).toString()
    
    return HttpClient.get<PaginatedResponse<MenuItem>>(`/menu?${queryParams}`)
  }

  /**
   * 管理員功能：創建新菜品
   */
  static async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MenuItem>> {
    return HttpClient.post<MenuItem>('/menu', menuItem)
  }

  /**
   * 管理員功能：更新菜品
   */
  static async updateMenuItem(id: number, menuItem: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    return HttpClient.put<MenuItem>(`/menu/${id}`, menuItem)
  }

  /**
   * 管理員功能：刪除菜品
   */
  static async deleteMenuItem(id: number): Promise<ApiResponse<void>> {
    return HttpClient.delete<void>(`/menu/${id}`)
  }

  /**
   * 管理員功能：批量更新菜品可用性
   */
  static async updateItemsAvailability(updates: Array<{ id: number; available: boolean }>): Promise<ApiResponse<void>> {
    return HttpClient.post<void>('/menu/batch/availability', { updates })
  }

  /**
   * 獲取菜品庫存狀態
   */
  static async getMenuItemStock(id: number): Promise<ApiResponse<{ available: boolean; stock: number }>> {
    return HttpClient.get<{ available: boolean; stock: number }>(`/menu/${id}/stock`)
  }

  /**
   * 獲取價格範圍過濾的菜品
   */
  static async getMenuItemsByPriceRange(
    minPrice: number, 
    maxPrice: number, 
    params?: MenuQueryParams
  ): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
    const queryParams = new URLSearchParams({
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      ...(params as any)
    }).toString()
    
    return HttpClient.get<PaginatedResponse<MenuItem>>(`/menu/price-range?${queryParams}`)
  }

  /**
   * 獲取菜單統計信息
   */
  static async getMenuStats(): Promise<ApiResponse<{
    totalItems: number
    availableItems: number
    categories: number
    popularItemsCount: number
    averagePrice: number
  }>> {
    return HttpClient.get('/menu/stats')
  }
}