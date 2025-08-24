import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { MenuItem } from '@/services/api'
import { useCartActions, formatPrice } from '@/store/cartStore'
import { useAuth } from '@/store/authStore'
import { cn } from '@/utils/cn'
import { 
  PlusIcon, 
  StarIcon, 
  ClockIcon, 
  HeartIcon, 
  EyeIcon,
  MinusIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid'

interface MenuItemCardProps {
  item: MenuItem
  variant?: 'default' | 'compact' | 'featured'
  showAddToCart?: boolean
  showViewButton?: boolean
  className?: string
  onAddToCart?: (item: MenuItem, quantity: number) => void
  onFavoriteToggle?: (item: MenuItem, isFavorite: boolean) => void
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  variant = 'default',
  showAddToCart = true,
  showViewButton = true,
  className = '',
  onAddToCart,
  onFavoriteToggle,
}) => {
  const navigate = useNavigate()
  const { addItem } = useCartActions()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [addButtonClicked, setAddButtonClicked] = useState(false)

  const handleViewDetails = useCallback(() => {
    navigate(`/menu/${item.itemId || item.id}`)
  }, [navigate, item])

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!item.available) return
    
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsAdding(true)
    setAddButtonClicked(true)
    
    try {
      addItem(item, quantity)
      onAddToCart?.(item, quantity)
      
      // Visual feedback animation
      setTimeout(() => setAddButtonClicked(false), 300)
      
      console.log(`已將 ${quantity} 份 ${item.name} 加入購物車`)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setTimeout(() => setIsAdding(false), 500)
    }
  }, [isAuthenticated, navigate, addItem, item, quantity, onAddToCart])

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onFavoriteToggle?.(item, newFavoriteState)
  }, [isFavorite, item, onFavoriteToggle])

  const handleQuantityChange = useCallback((newQuantity: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }, [])

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'DESSERT': '🧁',
      'BEVERAGE': '🥤', 
      'APPETIZER': '🥗',
      'MAIN_COURSE': '🍔',
      'MAIN': '🍔',
      'SOUP': '🍲',
      'SALAD': '🥗',
      'SIDE_DISH': '🍟',
      // 小寫兼容
      'dessert': '🧁',
      'beverage': '🥤',
      'appetizer': '🥗',
      'main_course': '🍔',
      'main': '🍔',
      'soup': '🍲',
      'salad': '🥗',
      'side_dish': '🍟',
    }
    return iconMap[category] || '🍽️'
  }

  const getCategoryDisplayName = (category: string) => {
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
      'side_dish': '配菜'
    }
    return categoryMap[category.toUpperCase()] || categoryMap[category.toLowerCase()] || category
  }

  // Compact variant for search results or lists
  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          'p-4 transition-all duration-base cursor-pointer group',
          'hover:shadow-medium hover:scale-[1.02]',
          'card-hover',
          !item.available && 'opacity-75',
          className
        )}
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          {/* Item Image/Icon */}
          <div className={cn(
            'w-16 h-16 rounded-medium flex items-center justify-center flex-shrink-0',
            'bg-gradient-to-br from-primary-100 to-accent-100',
            'group-hover:shadow-medium transition-all duration-base',
            'group-hover:scale-110'
          )}>
            <span className="text-2xl transition-transform duration-base group-hover:scale-110">
              {getCategoryIcon(item.category)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={cn(
                'font-semibold text-base truncate',
                'group-hover:text-primary-600 transition-colors duration-base'
              )}>
                {item.name}
              </h3>
              
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'p-1 rounded-medium transition-all duration-base',
                  'hover:scale-110 active:scale-95',
                  'focus-visible:ring-2 focus-visible:ring-primary-500/50',
                  isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                )}
                aria-label={isFavorite ? '取消收藏' : '加入收藏'}
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-4 h-4 animate-bounce-gentle" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <p className="text-text-secondary text-sm mb-3 text-ellipsis-2">
              {item.description || '美味可口的料理'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-primary-500 font-bold text-lg">
                {formatPrice(item.price)}
              </span>
              
              {showAddToCart && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                  loading={isAdding}
                  className={cn(
                    'transition-all duration-base',
                    addButtonClicked && 'animate-bounce-gentle',
                    !item.available && 'cursor-not-allowed'
                  )}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  {isAdding ? '加入中' : '加入'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Featured variant for promotions or highlights
  if (variant === 'featured') {
    return (
      <Card 
        className={cn(
          'p-6 transition-all duration-base cursor-pointer group',
          'hover:shadow-rainbow-lg hover:scale-[1.03]',
          'bg-gradient-to-br from-primary-50/80 to-accent-50/80',
          'border-2 border-transparent hover:border-primary-200',
          !item.available && 'opacity-75 grayscale',
          className
        )}
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center">
          {/* Item Image/Icon */}
          <div className={cn(
            'w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4',
            'bg-gradient-to-br from-primary-200 to-accent-200',
            'transition-all duration-base',
            'group-hover:shadow-rainbow group-hover:scale-110 group-hover:rotate-3'
          )}>
            <span className="text-4xl transition-transform duration-base group-hover:scale-110">
              {getCategoryIcon(item.category)}
            </span>
          </div>
          
          <div className="mb-4">
            {/* Badges */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {item.popular && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full animate-pulse">
                  🔥 熱銷
                </span>
              )}
              {!item.available && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  暫時缺貨
                </span>
              )}
            </div>
            
            <h3 className={cn(
              'font-bold text-xl mb-2 transition-colors duration-base',
              'group-hover:text-primary-600'
            )}>
              {item.name}
            </h3>
            <p className="text-text-secondary text-sm text-ellipsis-2">
              {item.description || '美味可口的料理'}
            </p>
          </div>
          
          {/* Pricing and Ratings */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-primary-500 mb-3">
              {formatPrice(item.price)}
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <StarIconSolid className="w-4 h-4 text-yellow-500" />
                <span>4.5</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>15分</span>
              </div>
            </div>
          </div>
          
          {/* Quantity Selector and Actions */}
          <div className="space-y-4">
            {showAddToCart && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleQuantityChange(quantity - 1, e)}
                  disabled={quantity <= 1}
                  className={cn(
                    'w-10 h-10 p-0 rounded-full',
                    'hover:scale-110 active:scale-95 transition-transform duration-fast'
                  )}
                  aria-label="減少數量"
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg select-none">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleQuantityChange(quantity + 1, e)}
                  disabled={quantity >= 99}
                  className={cn(
                    'w-10 h-10 p-0 rounded-full',
                    'hover:scale-110 active:scale-95 transition-transform duration-fast'
                  )}
                  aria-label="增加數量"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {showViewButton && (
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleViewDetails() }}
                  className="flex-1"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  查看詳情
                </Button>
              )}
              
              {showAddToCart && (
                <Button
                  variant={item.available ? 'rainbow' : 'ghost'}
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                  loading={isAdding}
                  className={cn(
                    'flex-1 font-semibold',
                    addButtonClicked && 'animate-pulse-glow',
                    !item.available && 'cursor-not-allowed'
                  )}
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  {isAdding ? '加入中...' : `加入購物車 ${quantity > 1 ? `(${quantity})` : ''}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default variant
  return (
    <Card 
      className={cn(
        'p-5 transition-all duration-base cursor-pointer group',
        'hover:shadow-medium hover:scale-[1.01]',
        'card-hover',
        !item.available && 'opacity-75',
        className
      )}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-5">
        {/* Item Image/Icon */}
        <div className={cn(
          'w-20 h-20 rounded-large flex items-center justify-center flex-shrink-0',
          'bg-gradient-to-br from-primary-100 to-accent-100',
          'transition-all duration-base',
          'group-hover:shadow-medium group-hover:scale-105'
        )}>
          <span className="text-3xl transition-transform duration-base group-hover:scale-110">
            {getCategoryIcon(item.category)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {/* Title and Badges */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  'font-semibold text-lg transition-colors duration-base',
                  'group-hover:text-primary-600'
                )}>
                  {item.name}
                </h3>
                {item.popular && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full animate-pulse">
                    熱銷
                  </span>
                )}
                {!item.available && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    缺貨
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-text-secondary text-sm mb-3 text-ellipsis-2 leading-relaxed">
                {item.description || '美味可口的料理'}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                <span className="flex items-center gap-1">
                  {getCategoryDisplayName(item.category)}
                </span>
                <div className="flex items-center gap-1">
                  <StarIconSolid className="w-3 h-3 text-yellow-500" />
                  <span>4.5</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>15分</span>
                </div>
              </div>
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-2 rounded-medium transition-all duration-base',
                'hover:scale-110 active:scale-95',
                'focus-visible:ring-2 focus-visible:ring-primary-500/50',
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              )}
              aria-label={isFavorite ? '取消收藏' : '加入收藏'}
            >
              {isFavorite ? (
                <HeartIconSolid className="w-5 h-5 animate-bounce-gentle" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <span className="text-primary-500 font-bold text-xl">
              {formatPrice(item.price)}
            </span>
            
            {showAddToCart && (
              <div className="flex items-center gap-2">
                {/* Quantity Selector (shown when quantity > 1 or hovered) */}
                {(quantity > 1 || isHovered) && (
                  <div className={cn(
                    'flex items-center gap-2 transition-all duration-base',
                    isHovered ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
                  )}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleQuantityChange(quantity - 1, e)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 p-0 rounded-full hover:scale-110 active:scale-95"
                      aria-label="減少數量"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold select-none">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleQuantityChange(quantity + 1, e)}
                      disabled={quantity >= 99}
                      className="w-8 h-8 p-0 rounded-full hover:scale-110 active:scale-95"
                      aria-label="增加數量"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                  loading={isAdding}
                  className={cn(
                    'font-medium transition-all duration-base',
                    'hover:scale-105 active:scale-95',
                    addButtonClicked && 'animate-pulse-glow',
                    !item.available && 'cursor-not-allowed'
                  )}
                >
                  {quantity > 1 ? (
                    <>
                      <ShoppingCartIcon className="w-4 h-4 mr-1" />
                      加入 {quantity}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4 mr-1" />
                      {isAdding ? '加入中...' : '加入購物車'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MenuItemCard