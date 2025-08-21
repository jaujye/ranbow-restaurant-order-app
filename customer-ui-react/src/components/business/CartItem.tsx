import React, { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { CartItem as CartItemType } from '@/store/cartStore'
import { useCartActions, formatPrice } from '@/store/cartStore'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Image as ImageIcon
} from 'lucide-react'

interface CartItemProps {
  item: CartItemType
  variant?: 'default' | 'compact' | 'checkout'
  showControls?: boolean
  showRemove?: boolean
  className?: string
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  variant = 'default',
  showControls = true,
  showRemove = true,
  className = ''
}) => {
  const { updateItem, removeItem } = useCartActions()
  
  const [isEditingRequests, setIsEditingRequests] = useState(false)
  const [editRequests, setEditRequests] = useState(item.specialRequests || '')

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      if (window.confirm('確定要從購物車中移除此商品嗎？')) {
        removeItem(item.id)
      }
      return
    }
    
    if (newQuantity <= 99) {
      updateItem(item.id, newQuantity, item.specialRequests)
    }
  }

  const handleRemoveItem = () => {
    if (window.confirm('確定要從購物車中移除此商品嗎？')) {
      removeItem(item.id)
    }
  }

  const handleEditSpecialRequests = () => {
    setIsEditingRequests(true)
    setEditRequests(item.specialRequests || '')
  }

  const handleSaveSpecialRequests = () => {
    updateItem(item.id, item.quantity, editRequests.trim() || undefined)
    setIsEditingRequests(false)
  }

  const handleCancelEdit = () => {
    setIsEditingRequests(false)
    setEditRequests(item.specialRequests || '')
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

  const formatAddedTime = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '剛剛加入'
    if (diffMinutes < 60) return `${diffMinutes} 分鐘前`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} 小時前`
    
    return date.toLocaleDateString()
  }

  // Compact variant for mini cart or sidebars
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 border-b border-border-light last:border-b-0 ${className}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getCategoryIcon(item.menuItem.category)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-text-secondary text-xs">
              {formatPrice(item.unitPrice)} × {item.quantity}
            </span>
            <span className="font-medium text-sm">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        </div>
        
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveItem}
            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={12} />
          </Button>
        )}
      </div>
    )
  }

  // Checkout variant for order confirmation
  if (variant === 'checkout') {
    return (
      <div className={`flex items-start gap-4 p-4 border-b border-border-light last:border-b-0 ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{getCategoryIcon(item.menuItem.category)}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{item.menuItem.name}</h3>
          <p className="text-text-secondary text-sm mb-2">
            {item.menuItem.description || '美味的料理'}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-secondary">
              {formatPrice(item.unitPrice)} × {item.quantity}
            </div>
            <div className="font-semibold">
              {formatPrice(item.totalPrice)}
            </div>
          </div>
          
          {item.specialRequests && (
            <div className="text-sm text-text-secondary bg-background-light p-2 rounded">
              <strong>備註:</strong> {item.specialRequests}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default variant - full featured
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{getCategoryIcon(item.menuItem.category)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-text-primary">
                {item.menuItem.name}
              </h3>
              <p className="text-text-secondary text-sm">
                {item.menuItem.description || '美味可口的料理'}
              </p>
            </div>
            
            {showRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveItem}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary-500 font-semibold">
                {formatPrice(item.unitPrice)}
              </span>
              <span className="text-text-secondary text-sm">
                × {item.quantity}
              </span>
            </div>
            
            {showControls && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  className="w-8 h-8 p-0"
                >
                  <Minus size={14} />
                </Button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= 99}
                  className="w-8 h-8 p-0"
                >
                  <Plus size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            {isEditingRequests ? (
              <div className="space-y-2">
                <Input
                  value={editRequests}
                  onChange={(e) => setEditRequests(e.target.value)}
                  placeholder="特殊需求或備註..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveSpecialRequests}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {item.specialRequests ? (
                    <p className="text-sm text-text-secondary">
                      <strong>備註:</strong> {item.specialRequests}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">
                      點擊添加特殊需求
                    </p>
                  )}
                </div>
                
                {showControls && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditSpecialRequests}
                    className="text-text-secondary hover:text-primary-500 p-1"
                  >
                    <Edit3 size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Item Total and Metadata */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-light">
            <div className="text-xs text-text-secondary">
              {formatAddedTime(item.addedAt)}
            </div>
            <div className="font-semibold text-text-primary">
              小計: {formatPrice(item.totalPrice)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CartItem