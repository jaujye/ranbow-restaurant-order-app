import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input, Card } from '@/components/ui'
import { useAuthActions } from '@/store/authStore'
import { useFormValidation } from '@/hooks/useFormValidation'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, quickLogin, clearError } = useAuthActions()
  const [isQuickLoading, setIsQuickLoading] = useState(false)
  
  const from = (location.state as any)?.from?.pathname || '/'
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitError,
    setSubmitError
  } = useFormValidation<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })
  
  const handleLogin = async (data: LoginFormData) => {
    try {
      clearError()
      const success = await login({
        email: data.email,
        password: data.password
      })
      
      if (success) {
        navigate(from, { replace: true })
      } else {
        setSubmitError('登入失敗，請檢查您的帳號密碼')
      }
    } catch (error: any) {
      setSubmitError(error.message || '登入時發生錯誤，請重試')
    }
  }
  
  const handleQuickLogin = async (role: 'customer' | 'staff' | 'admin') => {
    try {
      setIsQuickLoading(true)
      clearError()
      setSubmitError(null) // 清除之前的錯誤
      
      const success = await quickLogin(role)
      
      if (success) {
        // 快速登入成功，導航到首頁或之前的頁面
        navigate(from, { replace: true })
      } else {
        setSubmitError(`${role} 快速登入失敗`)
      }
    } catch (error: any) {
      console.error('Quick login error:', error)
      setSubmitError(error.message || '快速登入時發生錯誤')
    } finally {
      setIsQuickLoading(false)
    }
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
        
        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="請輸入您的Email"
            error={!!errors.email?.message}
            errorMessage={errors.email?.message}
            fullWidth
            {...register('email')}
          />
          
          <Input
            label="密碼"
            type="password"
            placeholder="請輸入密碼"
            error={!!errors.password?.message}
            errorMessage={errors.password?.message}
            fullWidth
            showPasswordToggle
            {...register('password')}
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded"
                {...register('rememberMe')}
              />
              記住我
            </label>
            <Link to="/forgot-password" className="text-primary-500 hover:underline">
              忘記密碼？
            </Link>
          </div>
          
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '登入中...' : '登入'}
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
              disabled={isQuickLoading}
            >
              {isQuickLoading ? '登入中...' : '顧客'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickLogin('staff')}
              disabled={isQuickLoading}
            >
              {isQuickLoading ? '登入中...' : '員工'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickLogin('admin')}
              disabled={isQuickLoading}
            >
              {isQuickLoading ? '登入中...' : '管理員'}
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