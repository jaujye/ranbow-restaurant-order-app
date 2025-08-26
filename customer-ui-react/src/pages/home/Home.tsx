import React from 'react'
import { Card, Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Welcome Banner - 手機版優化 */}
      <Card className="bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 p-4 sm:p-6 text-white">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">🌈 歡迎來到彩虹餐廳</h1>
          <p className="text-white/90 text-sm sm:text-base">享受美味，享受生活</p>
        </div>
      </Card>

      {/* Quick Actions - 手機版緊湊化 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card 
          clickable 
          className="p-3 sm:p-4 text-center"
          onClick={() => navigate('/menu')}
        >
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🍽️</div>
          <h3 className="font-medium text-sm sm:text-base">瀏覽菜單</h3>
        </Card>
        
        <Card 
          clickable 
          className="p-3 sm:p-4 text-center"
          onClick={() => navigate('/cart')}
        >
          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🛒</div>
          <h3 className="font-medium text-sm sm:text-base">購物車</h3>
        </Card>
      </div>

      {/* Featured Section - 手機版優化 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">今日推薦</h2>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-lg sm:text-xl">
                🍔
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm sm:text-base">招牌漢堡 #{item}</h3>
                <p className="text-text-secondary text-xs sm:text-sm">美味多汁的招牌漢堡</p>
                <p className="text-primary-500 font-medium text-sm sm:text-base">NT$ 299</p>
              </div>
              <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3" onClick={() => navigate('/menu')}>
                查看
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders - 手機版優化 */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">最近訂單</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => navigate('/orders')}
          >
            查看全部
          </Button>
        </div>
        
        <Card className="p-3 sm:p-4">
          <div className="text-center text-text-secondary py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-2">📋</div>
            <p className="text-sm sm:text-base">暫無訂單記錄</p>
            <Button 
              className="mt-3 sm:mt-4 text-sm"
              onClick={() => navigate('/menu')}
            >
              開始點餐
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Home