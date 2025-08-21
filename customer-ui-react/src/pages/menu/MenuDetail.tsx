import React from 'react'
import { Card, Button } from '@/components/ui'

const MenuDetail: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-2xl font-bold mb-2">菜品詳情</h1>
          <p className="text-text-secondary">Coming Soon...</p>
          <Button className="mt-4">返回菜單</Button>
        </div>
      </Card>
    </div>
  )
}

export default MenuDetail