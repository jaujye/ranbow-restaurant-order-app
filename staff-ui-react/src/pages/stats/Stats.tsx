/**
 * 📊 Stats Page
 * Staff performance statistics and analytics
 */

import React from 'react'
import { Card } from '@/components/common/Card'

const StatsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900">統計分析</h1>
        <p className="text-body text-gray-600 mt-1">員工績效和餐廳營運統計</p>
      </div>

      <Card title="績效統計" className="min-h-96">
        <div className="flex items-center justify-center h-64 text-gray-500">
          統計分析組件開發中...
        </div>
      </Card>
    </div>
  )
}

export default StatsPage