import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Card } from '@/components/ui'

const Register: React.FC = () => {
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register submitted')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌈</div>
          <h1 className="text-2xl font-bold text-rainbow mb-2">
            建立新帳號
          </h1>
          <p className="text-text-secondary">
            加入Ranbow Restaurant，享受美味之旅
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="姓名"
            type="text"
            placeholder="請輸入您的姓名"
            required
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="請輸入您的Email"
            required
            fullWidth
          />
          
          <Input
            label="手機號碼"
            type="tel"
            placeholder="09xxxxxxxx"
            required
            fullWidth
          />
          
          <Input
            label="密碼"
            type="password"
            placeholder="至少6個字符"
            required
            fullWidth
            showPasswordToggle
          />
          
          <Input
            label="確認密碼"
            type="password"
            placeholder="請再次輸入密碼"
            required
            fullWidth
            showPasswordToggle
          />
          
          <div className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1 rounded" />
            <span className="text-text-secondary">
              我同意
              <Link to="/terms" className="text-primary-500 hover:underline mx-1">
                服務條款
              </Link>
              和
              <Link to="/privacy" className="text-primary-500 hover:underline mx-1">
                隱私政策
              </Link>
            </span>
          </div>
          
          <Button type="submit" fullWidth>
            註冊
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-text-secondary">已有帳號？</span>
          <Link to="/login" className="ml-1 text-primary-500 hover:underline font-medium">
            立即登入
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Register