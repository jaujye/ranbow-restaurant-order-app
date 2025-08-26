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

  // 空購物車狀態 - 手機版優化
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-1.5 sm:p-2"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold">購物車</h1>
        </div>

        <Card className="p-6 sm:p-8 text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 opacity-50">
            🛒
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-text-primary">
            購物車是空的
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
            還沒有添加任何商品，快去看看我們的美味菜單吧！
          </p>
          <Button onClick={handleContinueShopping} className="px-6 sm:px-8 text-sm sm:text-base">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            開始購物
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6 max-w-4xl">
      {/* Header - 手機版緊湊化 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-1.5 sm:p-2"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">購物車</h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              {itemCount} 個商品
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
        >
          <Trash2 size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
          清空
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Cart Items - 手機版緊湊間距 */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 border-l-4 border-l-primary-500 shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
            >
              {/* 背景裝飾 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50/30 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
              
              <div className="flex gap-3 sm:gap-4 relative z-10">
                {/* Product Image - 增強視覺效果 */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-rainbow transform hover:scale-105 transition-transform duration-300">
                  <span className="text-xl sm:text-3xl drop-shadow-sm">
                    {item.menuItem.category === 'dessert' ? '🧁' : 
                     item.menuItem.category === 'beverage' ? '🥤' : 
                     item.menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                  </span>
                </div>

                {/* Product Details - 增強對比度設計 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate mb-1">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {item.menuItem.description || '美味可口的料理'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-white hover:bg-red-500 p-2 ml-3 rounded-full transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </Button>
                  </div>

                  {/* Price and Quantity - 增強視覺設計 */}
                  <div className="flex justify-between items-center mb-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-primary-50/20 rounded-lg border border-primary-100/50">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-600 font-bold text-lg sm:text-xl bg-primary-50 px-2 py-1 rounded-md">
                        {formatPrice(item.unitPrice)}
                      </span>
                      <span className="text-gray-500 font-medium text-sm sm:text-base">
                        × {item.quantity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-all duration-200"
                      >
                        <Minus size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                      <span className="w-8 sm:w-10 text-center font-bold text-base sm:text-lg text-gray-900 bg-primary-50 rounded-full py-1">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-7 h-7 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                      >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Special Requests - 優化設計 */}
                  <div className="space-y-2 mb-2">
                    {editingItem === item.id ? (
                      <div className="space-y-2 p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Input
                          value={editRequests}
                          onChange={(e) => setEditRequests(e.target.value)}
                          placeholder="特殊需求或備註..."
                          className="text-sm border-amber-300 focus:border-amber-500 focus:ring-amber-200"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveSpecialRequests(item.id)}
                            className="text-sm px-4 py-1.5 bg-green-600 hover:bg-green-700"
                          >
                            保存
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-sm px-4 py-1.5 hover:bg-gray-100"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${item.specialRequests ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}>
                        {item.specialRequests ? (
                          <p className="text-sm text-amber-800 flex-1 leading-relaxed font-medium">
                            📝 {item.specialRequests}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 flex-1 italic">
                            點擊添加特殊需求
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSpecialRequests(item)}
                          className="text-gray-400 hover:text-amber-600 p-2 rounded-full hover:bg-amber-100 transition-all duration-200"
                        >
                          <Edit3 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Item Total - 突出顯示 */}
                  <div className="flex justify-end pt-2 sm:pt-3 border-t-2 border-primary-200">
                    <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md">
                      <span className="font-bold text-base sm:text-lg">
                        小計: {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Shopping - 優化設計 */}
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-secondary-50 to-primary-50 border border-primary-200 hover:shadow-lg transition-all duration-300">
            <Button
              variant="ghost"
              onClick={handleContinueShopping}
              className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 hover:bg-white/50 py-3 text-base font-semibold rounded-lg border-2 border-dashed border-primary-300 hover:border-primary-500 transition-all duration-200"
            >
              <Plus size={18} className="animate-pulse" />
              繼續購物
            </Button>
          </Card>
        </div>

        {/* Order Summary - 優化手機版設計 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-primary-50/30 shadow-large border border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">訂單摘要</h2>
              </div>
              
              <div className="space-y-3 mb-6 bg-white/70 rounded-lg p-4 border border-primary-100">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-medium">小計</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="text-sm">稅金 (5%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="text-sm">服務費 (10%)</span>
                  <span className="font-medium">{formatPrice(serviceCharge)}</span>
                </div>
                <div className="border-t-2 border-primary-300 pt-3 bg-primary-50/50 -mx-4 px-4 py-3 rounded-b-lg">
                  <div className="flex justify-between items-center font-bold text-lg sm:text-xl">
                    <span className="text-gray-900">總計</span>
                    <span className="text-primary-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  size="lg"
                >
                  🛒 前往結帳
                </Button>
                
                <div className="text-center text-sm">
                  {!isAuthenticated ? (
                    <p className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                      ⚠️ 需要登入才能完成結帳
                    </p>
                  ) : (
                    <p className="text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      ✅ 已登入，可以結帳
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Additional Info - 優化設計 */}
            <Card className="p-3 sm:p-4 mt-4 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 shadow-md">
              <div className="text-sm text-primary-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💡</span>
                  <p className="font-bold text-primary-900">溫馨提示</p>
                </div>
                <ul className="space-y-2 text-primary-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    價格已包含5%稅金和10%服務費
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    可在備註中說明特殊需求
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    支援多種付款方式
                  </li>
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