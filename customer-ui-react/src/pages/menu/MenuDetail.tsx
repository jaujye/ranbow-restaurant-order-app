import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input, useDialogContext } from '@/components/ui'
import { useMenuActions, useCartActions, formatPrice } from '@/store'
import { useAuth } from '@/store/authStore'
import { MenuItem } from '@/services/api'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Star, 
  Clock, 
  Users,
  ChefHat,
  Leaf,
  Flame,
  Heart,
  Share2
} from 'lucide-react'

const MenuDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { getItemById } = useMenuActions()
  const { addItem } = useCartActions()
  const { isAuthenticated } = useAuth()
  const { success, error } = useDialogContext()

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Mock data for demonstration - in real app this would come from API
  const mockItemDetails = {
    images: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
    ],
    rating: 4.5,
    reviews: 128,
    prepTime: 15,
    difficulty: '簡單',
    servings: 1,
    calories: 580,
    isVegetarian: false,
    isSpicy: false,
    isPopular: true,
    tags: ['招牌', '熱銷', '經典'],
    ingredients: [
      '牛肉餅 180g',
      '新鮮生菜',
      '番茄片',
      '洋蔥圈',
      '起司片',
      '特調醬料',
      '芝麻麵包'
    ],
    nutritionInfo: {
      calories: 580,
      protein: 32,
      carbs: 45,
      fat: 28,
      fiber: 4,
      sodium: 920
    },
    allergens: ['麩質', '乳製品', '雞蛋'],
    description: '使用100%純牛肉製作的經典漢堡，搭配新鮮蔬菜和特調醬料，口感豐富層次分明。牛肉餅經過精心調味並炭烤至完美熟度，外酥內嫩，搭配酥脆生菜、新鮮番茄和香甜洋蔥，每一口都是滿足。'
  }

  useEffect(() => {
    if (itemId) {
      // itemId是字符串UUID，直接使用而不是parseInt
      const item = getItemById(itemId)
      setMenuItem(item || null)
      setIsLoading(false)
    }
  }, [itemId, getItemById])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!menuItem) return

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    addItem(menuItem, quantity, specialRequests.trim() || undefined)
    
    // Show success feedback
    success(`已將 ${quantity} 份 ${menuItem.name} 加入購物車！`)
  }

  const handleShare = () => {
    if (navigator.share && menuItem) {
      navigator.share({
        title: menuItem.name,
        text: `看看這個美味的 ${menuItem.name}！`,
        url: window.location.href
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      success('連結已複製到剪貼板')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">載入中...</p>
        </div>
      </div>
    )
  }

  if (!menuItem) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/menu')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">商品詳情</h1>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4 opacity-50">❌</div>
          <h2 className="text-xl font-semibold mb-2">商品不存在</h2>
          <p className="text-text-secondary mb-6">
            找不到指定的商品
          </p>
          <Button onClick={() => navigate('/menu')}>
            返回菜單
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/menu')}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">商品詳情</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2"
        >
          <Share2 size={20} />
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">
                  {menuItem.category === 'dessert' ? '🧁' : 
                   menuItem.category === 'beverage' ? '🥤' : 
                   menuItem.category === 'appetizer' ? '🥗' : '🍔'}
                </div>
                <p className="text-text-secondary">商品圖片</p>
              </div>
            </div>
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex gap-2 overflow-x-auto">
            {mockItemDetails.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center text-2xl ${
                  activeImageIndex === index ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {menuItem.category === 'dessert' ? '🧁' : 
                 menuItem.category === 'beverage' ? '🥤' : 
                 menuItem.category === 'appetizer' ? '🥗' : '🍔'}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{menuItem.name}</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{mockItemDetails.rating}</span>
                    <span className="text-text-secondary text-sm">
                      ({mockItemDetails.reviews} 評價)
                    </span>
                  </div>
                  {mockItemDetails.isPopular && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      🔥 熱銷
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => error('加入最愛功能開發中...')}
                className="p-2"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-lg font-bold text-primary-500 mb-4">
              {formatPrice(menuItem.price)}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mockItemDetails.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-accent-100 text-accent-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{mockItemDetails.prepTime} 分鐘</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{mockItemDetails.servings} 人份</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                <span>{mockItemDetails.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">商品說明</h3>
            <p className="text-text-secondary leading-relaxed">
              {mockItemDetails.description}
            </p>
          </div>

          {/* Dietary Info */}
          <div className="flex items-center gap-4">
            {mockItemDetails.isVegetarian && (
              <div className="flex items-center gap-2 text-green-600">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">素食</span>
              </div>
            )}
            {mockItemDetails.isSpicy && (
              <div className="flex items-center gap-2 text-red-600">
                <Flame className="w-4 h-4" />
                <span className="text-sm">辣味</span>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium mb-2">
              特殊需求（選填）
            </label>
            <Input
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="例如：不要洋蔥、醬料另放..."
              className="text-sm"
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">數量</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 p-0"
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center font-medium text-lg">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99}
                  className="w-10 h-10 p-0"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!menuItem.available}
                className="flex-1 h-12 text-lg font-medium flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                {menuItem.available ? (
                  <>
                    加入購物車 • {formatPrice(menuItem.price * quantity)}
                  </>
                ) : (
                  '暫時缺貨'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid gap-6 lg:grid-cols-3 mt-12">
        {/* Ingredients */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">主要成分</h3>
          <ul className="space-y-2">
            {mockItemDetails.ingredients.map((ingredient, index) => (
              <li key={index} className="text-text-secondary text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                {ingredient}
              </li>
            ))}
          </ul>
        </Card>

        {/* Nutrition */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">營養資訊</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">熱量</span>
              <span className="font-medium">{mockItemDetails.nutritionInfo.calories} 卡</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">蛋白質</span>
              <span className="font-medium">{mockItemDetails.nutritionInfo.protein}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">碳水化合物</span>
              <span className="font-medium">{mockItemDetails.nutritionInfo.carbs}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm">脂肪</span>
              <span className="font-medium">{mockItemDetails.nutritionInfo.fat}g</span>
            </div>
          </div>
        </Card>

        {/* Allergens */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">過敏原資訊</h3>
          <div className="space-y-2">
            <p className="text-text-secondary text-sm mb-3">
              此商品可能含有以下過敏原：
            </p>
            {mockItemDetails.allergens.map((allergen, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="text-text-secondary text-sm">{allergen}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews Section - Placeholder */}
      <Card className="p-6 mt-6">
        <div className="text-center py-8">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">顧客評價</h3>
          <p className="text-text-secondary">
            評價功能開發中...
          </p>
        </div>
      </Card>
    </div>
  )
}

export default MenuDetail