/**
 * 🍳 Kitchen Page
 * Kitchen operations and cooking management
 */

import React from 'react'
import { Card } from '@/components/common/Card'

const KitchenPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900">廚房管理</h1>
        <p className="text-body text-gray-600 mt-1">廚房訂單處理和工作站管理</p>
      </div>

      <Card title="廚房工作台" className="min-h-96">
        <div className="flex items-center justify-center h-64 text-gray-500">
          廚房管理組件開發中...
        </div>
      </Card>
    </div>
  )
}

export default KitchenPage