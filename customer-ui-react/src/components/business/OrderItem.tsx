import React from 'react'
import { Card } from '@/components/ui'
import { OrderItem as OrderItemType } from '@/services/api'
import { formatPrice } from '@/store/cartStore'
import { 
  Package,
  Clock,
  Star,
  MessageSquare
} from 'lucide-react'

interface OrderItemProps {
  item: OrderItemType
  variant?: 'default' | 'compact' | 'detailed'
  showRating?: boolean
  className?: string
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  variant = 'default',
  showRating = false,
  className = ''
}) => {
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
      'appetizer': '前菜',
      'main': '主菜',
      'dessert': '甜點',
      'beverage': '飲料'
    }
    return categoryMap[category] || category
  }

  // Compact variant for order summaries
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 py-2 ${className}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getCategoryIcon(item.menuItem.category)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{formatPrice(item.unitPrice)} × {item.quantity}</span>
            <span className="font-medium text-text-primary">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
          
          {item.specialRequests && (
            <p className="text-xs text-text-secondary mt-1 truncate">
              備註: {item.specialRequests}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Detailed variant with all information
  if (variant === 'detailed') {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{getCategoryIcon(item.menuItem.category)}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-xl mb-2">{item.menuItem.name}</h3>
                <p className="text-text-secondary mb-2">
                  {item.menuItem.description || '美味的料理'}
                </p>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {getCategoryDisplayName(item.menuItem.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    15-20 分鐘
                  </span>
                </div>
              </div>
              
              {showRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.5</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-text-secondary">單價</span>
                <p className="font-semibold">{formatPrice(item.unitPrice)}</p>
              </div>
              <div>
                <span className="text-sm text-text-secondary">數量</span>
                <p className="font-semibold">{item.quantity}</p>
              </div>
            </div>
            
            {item.specialRequests && (
              <div className="mb-4 p-3 bg-background-light rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">特殊需求</p>
                    <p className="text-sm text-text-secondary">{item.specialRequests}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t border-border-light">
              <span className="text-text-secondary">小計</span>
              <span className="text-xl font-bold text-primary-500">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={`flex items-start gap-4 p-4 border-b border-border-light last:border-b-0 ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{getCategoryIcon(item.menuItem.category)}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
            <p className="text-text-secondary text-sm">
              {item.menuItem.description || '美味的料理'}
            </p>
          </div>
          
          {showRating && (
            <div className="flex items-center gap-1 ml-4">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">4.5</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">
              {formatPrice(item.unitPrice)} × {item.quantity}
            </span>
            <span className="text-text-secondary">
              {getCategoryDisplayName(item.menuItem.category)}
            </span>
          </div>
          <span className="font-semibold text-lg">
            {formatPrice(item.totalPrice)}
          </span>
        </div>
        
        {item.specialRequests && (
          <div className="mt-2 p-2 bg-background-light rounded text-sm">
            <span className="font-medium text-text-secondary">備註: </span>
            <span className="text-text-secondary">{item.specialRequests}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderItem