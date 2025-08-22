import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { MenuItem } from '@/services/api'
import { useCartActions, formatPrice } from '@/store/cartStore'
import { useAuth } from '@/store/authStore'
import { 
  Plus, 
  Star, 
  Clock, 
  Heart, 
  Eye,
  Minus,
  ShoppingCart
} from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
  variant?: 'default' | 'compact' | 'featured'
  showAddToCart?: boolean
  showViewButton?: boolean
  className?: string
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  variant = 'default',
  showAddToCart = true,
  showViewButton = true,
  className = ''
}) => {
  const navigate = useNavigate()
  const { addItem } = useCartActions()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleViewDetails = () => {
    navigate(`/menu/${item.itemId || item.id}`)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsAdding(true)
    try {
      addItem(item, quantity)
      
      // Show success feedback (in real app, this might be a toast notification)
      console.log(`已將 ${quantity} 份 ${item.name} 加入購物車`)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite functionality
  }

  const handleQuantityChange = (newQuantity: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dessert': return '🧁'
      case 'beverage': return '🥤'
      case 'appetizer': return '🥗'
      case 'main': return '🍔'
      default: return '🍽️'
    }
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
        className={`p-3 hover:shadow-md transition-all cursor-pointer ${className}`}
        onClick={handleViewDetails}
      >
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{getCategoryIcon(item.category)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-lg truncate">{item.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`p-1 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <p className="text-text-secondary text-sm mb-2 line-clamp-2">
              {item.description || '美味可口的料理'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-primary-500 font-semibold">
                {formatPrice(item.price)}
              </span>
              
              {showAddToCart && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                  className="px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  加入
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
        className={`p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200 ${className}`}
        onClick={handleViewDetails}
      >
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{getCategoryIcon(item.category)}</span>
          </div>
          
          <div className="mb-4">
            {item.popular && (
              <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full mb-2">
                🔥 熱銷
              </span>
            )}
            <h3 className="font-bold text-xl mb-2">{item.name}</h3>
            <p className="text-text-secondary text-sm line-clamp-2">
              {item.description || '美味可口的料理'}
            </p>
          </div>
          
          <div className="mb-4">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {formatPrice(item.price)}
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.5</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>15分</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {showAddToCart && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleQuantityChange(quantity - 1, e)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 p-0"
                >
                  <Minus size={14} />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleQuantityChange(quantity + 1, e)}
                  disabled={quantity >= 99}
                  className="w-8 h-8 p-0"
                >
                  <Plus size={14} />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              {showViewButton && (
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleViewDetails() }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  查看
                </Button>
              )}
              
              {showAddToCart && (
                <Button
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAdding ? '加入中...' : '加入購物車'}
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
      className={`p-4 hover:shadow-md transition-all cursor-pointer ${className}`}
      onClick={handleViewDetails}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">{getCategoryIcon(item.category)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.popular && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    熱銷
                  </span>
                )}
                {!item.available && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    缺貨
                  </span>
                )}
              </div>
              
              <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                {item.description || '美味可口的料理'}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                <span>{getCategoryDisplayName(item.category)}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>4.5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>15分</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-primary-500 font-semibold text-lg">
              {formatPrice(item.price)}
            </span>
            
            {showAddToCart && (
              <div className="flex items-center gap-2">
                {quantity > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleQuantityChange(quantity - 1, e)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleQuantityChange(quantity + 1, e)}
                      disabled={quantity >= 99}
                      className="w-8 h-8 p-0"
                    >
                      <Plus size={14} />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!item.available || isAdding}
                >
                  {quantity > 1 ? (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      加入 {quantity}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
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