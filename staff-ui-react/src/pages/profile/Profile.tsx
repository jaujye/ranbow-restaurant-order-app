/**
 * 👤 Profile Page
 * Staff profile and settings management
 */

import React from 'react'
import { Card } from '@/components/common/Card'

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-gray-900">個人資料</h1>
        <p className="text-body text-gray-600 mt-1">管理個人資料和系統設定</p>
      </div>

      <Card title="個人設定" className="min-h-96">
        <div className="flex items-center justify-center h-64 text-gray-500">
          個人資料組件開發中...
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage