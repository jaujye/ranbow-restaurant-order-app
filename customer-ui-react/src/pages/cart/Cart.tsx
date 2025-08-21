import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '@/components/ui'
import { useCart, useCartActions, formatPrice, CartItem } from '@/store/cartStore'
import { useAuth } from '@/store/authStore'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Edit3 } from 'lucide-react'

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { items, subtotal, tax, serviceCharge, totalAmount, itemCount } = useCart()
  const { updateItem, removeItem, clearCart } = useCartActions()
  const { isAuthenticated } = useAuth()
  
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editRequests, setEditRequests] = useState<string>('')

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      updateItem(itemId, newQuantity, item.specialRequests)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  const handleEditSpecialRequests = (item: CartItem) => {
    setEditingItem(item.id)
    setEditRequests(item.specialRequests || '')
  }

  const handleSaveSpecialRequests = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      updateItem(itemId, item.quantity, editRequests)
      setEditingItem(null)
      setEditRequests('')
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditRequests('')
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
      return
    }
    navigate('/checkout')
  }

  const handleClearCart = () => {
    if (window.confirm('確定要清空購物車嗎？')) {
      clearCart()
    }
  }

  const handleContinueShopping = () => {
    navigate('/menu')
  }

  // 空購物車狀態
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">購物車</h1>
        </div>

        <Card className="p-8 text-center">
          <div className="text-6xl mb-4 opacity-50">
            🛒
          </div>
          <h2 className="text-xl font-semibold mb-2 text-text-primary">
            購物車是空的
          </h2>
          <p className="text-text-secondary mb-6">
            還沒有添加任何商品，快去看看我們的美味菜單吧！
          </p>
          <Button onClick={handleContinueShopping} className="px-8">
            <ShoppingBag className="w-5 h-5 mr-2" />
            開始購物
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">購物車</h1>
            <p className="text-text-secondary text-sm">
              {itemCount} 個商品
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} className="mr-2" />
          清空
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">
                    {item.menuItem.category === 'dessert' ? '🧁' : 
                     item.menuItem.category === 'beverage' ? '🥤' : 
                     item.menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-text-primary">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {item.menuItem.description || '美味可口的料理'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-500 font-semibold">
                        {formatPrice(item.unitPrice)}
                      </span>
                      <span className="text-text-secondary text-sm">
                        × {item.quantity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
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
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    {editingItem === item.id ? (
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
                            onClick={() => handleSaveSpecialRequests(item.id)}
                          >
                            保存
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.specialRequests ? (
                          <p className="text-sm text-text-secondary flex-1">
                            備註: {item.specialRequests}
                          </p>
                        ) : (
                          <p className="text-sm text-text-muted flex-1">
                            點擊添加特殊需求
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSpecialRequests(item)}
                          className="text-text-secondary hover:text-primary-500 p-1"
                        >
                          <Edit3 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="flex justify-end mt-3 pt-3 border-t border-border-light">
                    <span className="font-semibold text-text-primary">
                      小計: {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Shopping */}
          <Card className="p-4">
            <Button
              variant="ghost"
              onClick={handleContinueShopping}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              繼續購物
            </Button>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">訂單摘要</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>稅金 (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>服務費 (10%)</span>
                  <span>{formatPrice(serviceCharge)}</span>
                </div>
                <div className="border-t border-border-light pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>總計</span>
                    <span className="text-primary-500">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  前往結帳
                </Button>
                
                <div className="text-center text-sm text-text-secondary">
                  {!isAuthenticated && (
                    <p>需要登入才能完成結帳</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Additional Info */}
            <Card className="p-4 mt-4 bg-primary-50 border-primary-200">
              <div className="text-sm text-primary-700">
                <p className="font-medium mb-2">💡 溫馨提示</p>
                <ul className="space-y-1">
                  <li>• 價格已包含5%稅金和10%服務費</li>
                  <li>• 可在備註中說明特殊需求</li>
                  <li>• 支援多種付款方式</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart