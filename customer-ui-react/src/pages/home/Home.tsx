import React from 'react'
import { Card, Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 p-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">🌈 歡迎來到彩虹餐廳</h1>
          <p className="text-white/90">享受美味，享受生活</p>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          clickable 
          className="p-4 text-center"
          onClick={() => navigate('/menu')}
        >
          <div className="text-3xl mb-2">🍽️</div>
          <h3 className="font-medium">瀏覽菜單</h3>
        </Card>
        
        <Card 
          clickable 
          className="p-4 text-center"
          onClick={() => navigate('/cart')}
        >
          <div className="text-3xl mb-2">🛒</div>
          <h3 className="font-medium">購物車</h3>
        </Card>
      </div>

      {/* Featured Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">今日推薦</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                🍔
              </div>
              <div className="flex-1">
                <h3 className="font-medium">招牌漢堡 #{item}</h3>
                <p className="text-text-secondary text-sm">美味多汁的招牌漢堡</p>
                <p className="text-primary-500 font-medium">NT$ 299</p>
              </div>
              <Button size="sm" onClick={() => navigate('/menu')}>
                查看
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近訂單</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/orders')}
          >
            查看全部
          </Button>
        </div>
        
        <Card className="p-4">
          <div className="text-center text-text-secondary py-8">
            <div className="text-4xl mb-2">📋</div>
            <p>暫無訂單記錄</p>
            <Button 
              className="mt-4"
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