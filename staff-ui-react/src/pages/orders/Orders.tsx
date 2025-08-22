/**
 * 📦 Orders Page
 * Order management and queue interface
 */

import React from 'react'
import { Card } from '@/components/common/Card'

const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900">訂單管理</h1>
        <p className="text-body text-gray-600 mt-1">管理餐廳訂單和處理狀態</p>
      </div>

      <Card title="訂單列表" className="min-h-96">
        <div className="flex items-center justify-center h-64 text-gray-500">
          訂單管理組件開發中...
        </div>
      </Card>
    </div>
  )
}

export default OrdersPage