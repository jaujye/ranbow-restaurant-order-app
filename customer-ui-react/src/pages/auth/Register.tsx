import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card } from '@/components/ui'
import { useAuthActions } from '@/store/authStore'
import { useFormValidation } from '@/hooks/useFormValidation'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, clearError } = useAuthActions()
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitError,
    setSubmitError
  } = useFormValidation<RegisterFormData>({
    schema: registerSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  })
  
  const handleRegister = async (data: RegisterFormData) => {
    try {
      clearError()
      setSubmitError(null)
      
      // 檢查密碼一致性
      if (data.password !== data.confirmPassword) {
        setSubmitError('密碼與確認密碼不一致')
        return
      }
      
      const success = await register({
        username: data.name,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password
      })
      
      if (success) {
        // 註冊成功，導航到首頁
        navigate('/', { replace: true })
      } else {
        setSubmitError('註冊失敗，請檢查您的資料')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setSubmitError(error.message || '註冊時發生錯誤，請重試')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌈</div>
          <h1 className="text-2xl font-bold text-rainbow mb-2">
            建立新帳號
          </h1>
          <p className="text-text-secondary">
            加入Ranbow Restaurant，享受美味之旅
          </p>
        </div>
        
        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}
        
        {/* Register Form */}
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          <Input
            label="姓名"
            type="text"
            placeholder="請輸入您的姓名"
            error={errors.name?.message}
            fullWidth
            {...registerField('name')}
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="請輸入您的Email"
            error={errors.email?.message}
            fullWidth
            {...registerField('email')}
          />
          
          <Input
            label="手機號碼"
            type="tel"
            placeholder="09xxxxxxxx"
            error={errors.phone?.message}
            fullWidth
            {...registerField('phone')}
          />
          
          <Input
            label="密碼"
            type="password"
            placeholder="至少6個字符"
            error={errors.password?.message}
            fullWidth
            showPasswordToggle
            {...registerField('password')}
          />
          
          <Input
            label="確認密碼"
            type="password"
            placeholder="請再次輸入密碼"
            error={errors.confirmPassword?.message}
            fullWidth
            showPasswordToggle
            {...registerField('confirmPassword')}
          />
          
          <div className="flex items-start gap-2 text-sm">
            <input 
              type="checkbox" 
              className="mt-1 rounded"
              {...registerField('agreeToTerms')}
            />
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
            {errors.agreeToTerms && (
              <p className="text-red-600 text-sm">{errors.agreeToTerms.message}</p>
            )}
          </div>
          
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '註冊中...' : '註冊'}
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