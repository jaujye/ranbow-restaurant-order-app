import React from 'react'
import { Card, Button } from '@/components/ui'

const MenuList: React.FC = () => {
  const categories = ['全部', '前菜', '主菜', '甜點', '飲料']
  const menuItems = [
    { id: 1, name: '經典漢堡', price: 299, category: '主菜' },
    { id: 2, name: '炸雞翅', price: 199, category: '前菜' },
    { id: 3, name: '巧克力蛋糕', price: 149, category: '甜點' },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="搜尋菜品..."
          className="w-full input"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium
              ${category === '全部' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              🍔
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{item.name}</h3>
              <p className="text-text-secondary text-sm mb-2">美味可口的{item.name}</p>
              <span className="text-primary-500 font-semibold">NT$ {item.price}</span>
            </div>
            <Button size="sm">
              加入購物車
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MenuList