import React, { useEffect, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import MenuItemCard from '@/components/business/MenuItemCard'
import { Button } from '@/components/ui'
import { useMenuStore } from '@/store/menuStore'

// 分類映射
const CATEGORY_MAP: Record<string, string> = {
  '全部': 'all',
  '前菜': 'APPETIZER',
  '主菜': 'MAIN_COURSE',
  '甜點': 'DESSERT',
  '飲料': 'BEVERAGE'
}

const CATEGORY_DISPLAY: Record<string, string> = {
  'all': '全部',
  'APPETIZER': '前菜',
  'MAIN_COURSE': '主菜',
  'DESSERT': '甜點',
  'BEVERAGE': '飲料'
}

const MenuList: React.FC = () => {
  const {
    items,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    fetchMenuItems,
    setSelectedCategory,
    setSearchQuery,
    clearError
  } = useMenuStore()

  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState<typeof items>([])  // 初始化為空陣列，類型與items相同

  // 初始化數據
  useEffect(() => {
    fetchMenuItems()
  }, [])

  // 處理分類篩選和搜尋
  useEffect(() => {
    let filtered = items

    // 分類篩選 - 檢查'全部'和'all'兩種情況
    if (selectedCategory !== 'all' && selectedCategory !== '全部') {
      filtered = filtered.filter(item => 
        item.category?.toUpperCase() === selectedCategory.toUpperCase()
      )
    }

    // 搜尋篩選
    const query = localSearchQuery.trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    setFilteredItems(filtered)
  }, [items, selectedCategory, localSearchQuery])

  const handleCategoryChange = (categoryDisplay: string) => {
    const categoryValue = CATEGORY_MAP[categoryDisplay] || categoryDisplay
    setSelectedCategory(categoryValue)
    clearError()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocalSearchQuery(query)
    setSearchQuery(query) // 更新store中的搜尋狀態
  }

  const clearSearch = () => {
    setLocalSearchQuery('')
    setSearchQuery('')
  }

  // 可用的分類
  const availableCategories = ['全部', '前菜', '主菜', '甜點', '飲料']
  const currentCategoryDisplay = CATEGORY_DISPLAY[selectedCategory] || '全部'

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">❌ 載入菜單時發生錯誤</div>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={() => {
            clearError()
            fetchMenuItems()
          }}>
            重新載入
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="search"
          placeholder="搜尋菜品..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {localSearchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {availableCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${currentCategoryDisplay === category
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-text-secondary">載入菜單中...</p>
        </div>
      )}

      {/* Search Results Info */}
      {!isLoading && localSearchQuery && (
        <div className="mb-4 text-sm text-text-secondary">
          搜尋 "{localSearchQuery}" 找到 {filteredItems.length} 個結果
        </div>
      )}

      {/* Menu Items */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard
                key={item.itemId || item.id || `item-${Math.random()}`}
                item={item}
                variant="default"
                showAddToCart={true}
                showViewButton={true}
                className="mb-4"
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">
                {localSearchQuery ? '沒有找到相關菜品' : '暫無菜品'}
              </h3>
              <p className="text-text-secondary">
                {localSearchQuery
                  ? '請嘗試其他關鍵字或瀏覽其他分類'
                  : '請稍後再試或聯絡客服'
                }
              </p>
              {localSearchQuery && (
                <Button
                  variant="ghost"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  清除搜尋
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MenuList