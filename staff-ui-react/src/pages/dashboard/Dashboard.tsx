/**
 * 📊 Dashboard Page
 * Staff dashboard with overview and key metrics
 */

import React from 'react'
import { Card, StatsCard } from '@/components/common/Card'

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900">儀表板</h1>
        <p className="text-body text-gray-600 mt-1">員工工作概覽</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="待處理訂單"
          value="12"
          change="+2 from last hour"
          changeType="positive"
        />
        
        <StatsCard
          title="處理中訂單"
          value="8"
          change="+3 from last hour"
          changeType="positive"
        />
        
        <StatsCard
          title="平均處理時間"
          value="15分"
          change="-2分 from yesterday"
          changeType="positive"
        />
        
        <StatsCard
          title="今日效率"
          value="94%"
          change="+5% from yesterday"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="最近訂單" className="h-96">
          <div className="flex items-center justify-center h-64 text-gray-500">
            訂單列表組件
          </div>
        </Card>

        <Card title="今日統計" className="h-96">
          <div className="flex items-center justify-center h-64 text-gray-500">
            統計圖表組件
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage