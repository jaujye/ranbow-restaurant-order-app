/**
 * 404 Not Found Page
 * Error page for missing routes
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="text-center p-8 max-w-md">
        <div className="space-y-6">
          <div>
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-h2 font-bold text-gray-900 mb-2">
              頁面不存在
            </h2>
            <p className="text-body text-gray-600">
              抱歉，您尋找的頁面不存在或已被移動
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="w-full">
                返回儀表板
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" className="w-full">
                查看訂單
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default NotFoundPage