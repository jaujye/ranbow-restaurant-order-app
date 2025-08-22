/**
 * 🔐 Login Page
 * Staff authentication page
 */

import React from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

const LoginPage: React.FC = () => {
  return (
    <Card className="p-8" title="員工登入">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-h1 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
            彩虹餐廳
          </h1>
          <p className="text-body text-gray-600 mt-2">
            員工管理系統
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              員工編號
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="請輸入員工編號"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              密碼
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="請輸入密碼"
            />
          </div>

          <Button type="submit" className="w-full">
            登入
          </Button>
        </form>
      </div>
    </Card>
  )
}

export default LoginPage