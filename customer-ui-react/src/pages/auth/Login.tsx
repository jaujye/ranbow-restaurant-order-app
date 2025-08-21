import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components/ui'

const Login: React.FC = () => {
  const navigate = useNavigate()
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual login logic
    console.log('Login submitted')
    navigate('/')
  }
  
  const handleQuickLogin = (role: string) => {
    console.log(`Quick login as ${role}`)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌈</div>
          <h1 className="text-2xl font-bold text-rainbow mb-2">
            Ranbow Restaurant
          </h1>
          <p className="text-text-secondary">
            歡迎回來，請登入您的帳號
          </p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="請輸入您的Email"
            required
            fullWidth
          />
          
          <Input
            label="密碼"
            type="password"
            placeholder="請輸入密碼"
            required
            fullWidth
            showPasswordToggle
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              記住我
            </label>
            <Link to="/forgot-password" className="text-primary-500 hover:underline">
              忘記密碼？
            </Link>
          </div>
          
          <Button type="submit" fullWidth>
            登入
          </Button>
        </form>
        
        {/* Quick Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-text-secondary">或快速登入</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickLogin('customer')}
            >
              顧客
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickLogin('staff')}
            >
              員工
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickLogin('admin')}
            >
              管理員
            </Button>
          </div>
        </div>
        
        {/* Register Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-text-secondary">還沒有帳號？</span>
          <Link to="/register" className="ml-1 text-primary-500 hover:underline font-medium">
            立即註冊
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Login