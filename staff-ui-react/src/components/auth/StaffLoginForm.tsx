/**
 * 🔐 StaffLoginForm Component
 * Enhanced staff authentication form with real-time validation, device registration, and PIN login
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Smartphone, Lock, User, Wifi, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useAuthActions } from '@/store/authStore'
import { 
  staffLoginSchema, 
  pinLoginSchema, 
  FormFieldConfig,
  type StaffLoginFormData, 
  type PinLoginFormData 
} from '@/lib/validations'
import type { DeviceInfo } from '@/types'

interface StaffLoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  showQuickSwitch?: boolean
  className?: string
}

type LoginMode = 'password' | 'pin'

const StaffLoginForm: React.FC<StaffLoginFormProps> = ({
  onSuccess,
  onError,
  showQuickSwitch = true,
  className = ''
}) => {
  const [loginMode, setLoginMode] = useState<LoginMode>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  const { login } = useAuthActions()

  // Password login form
  const passwordForm = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
    mode: 'onChange',
    defaultValues: {
      loginId: '',
      password: '',
      rememberMe: false,
      deviceInfo: {
        deviceId: '',
        deviceType: 'DESKTOP',
        appVersion: '1.0.0'
      }
    }
  })

  // PIN login form
  const pinForm = useForm<PinLoginFormData>({
    resolver: zodResolver(pinLoginSchema),
    mode: 'onChange',
    defaultValues: {
      employeeNumber: '',
      pin: '',
      deviceInfo: {
        deviceId: '',
        deviceType: 'DESKTOP',
        appVersion: '1.0.0'
      }
    }
  })

  // Initialize device info
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const userAgent = navigator.userAgent
        let deviceType: DeviceInfo['deviceType'] = 'DESKTOP'
        
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
          deviceType = 'TABLET'
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
          deviceType = 'PHONE'
        }

        const storedDeviceId = localStorage.getItem('staffDeviceId')
        const deviceId = storedDeviceId || `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        if (!storedDeviceId) {
          localStorage.setItem('staffDeviceId', deviceId)
        }

        const device: DeviceInfo = {
          deviceId,
          deviceType,
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
          platform: navigator.platform
        }

        setDeviceInfo(device)
        
        // Update forms with device info
        passwordForm.setValue('deviceInfo', device)
        pinForm.setValue('deviceInfo', device)

        // Check connection status
        setConnectionStatus('connected')
      } catch (error) {
        console.error('Device initialization error:', error)
        setConnectionStatus('disconnected')
      }
    }

    initializeDevice()
  }, [passwordForm, pinForm])

  // Handle password login
  const handlePasswordLogin = useCallback(async (data: StaffLoginFormData) => {
    setIsLoading(true)
    try {
      const success = await login({
        loginId: data.loginId,
        password: data.password,
        deviceInfo: data.deviceInfo,
        rememberMe: data.rememberMe
      })

      if (success) {
        onSuccess?.()
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      onError?.(message)
      passwordForm.setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }, [login, onSuccess, onError, passwordForm])

  // Handle PIN login
  const handlePinLogin = useCallback(async (data: PinLoginFormData) => {
    setIsLoading(true)
    try {
      // Convert PIN login to standard login format
      const success = await login({
        loginId: data.employeeNumber,
        password: '', // PIN login uses different endpoint
        deviceInfo: data.deviceInfo,
        rememberMe: false,
        isPinLogin: true,
        pin: data.pin
      } as any)

      if (success) {
        onSuccess?.()
      } else {
        throw new Error('PIN login failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PIN login failed'
      onError?.(message)
      pinForm.setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }, [login, onSuccess, onError, pinForm])

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  // Switch login mode
  const switchLoginMode = useCallback((mode: LoginMode) => {
    setLoginMode(mode)
    // Clear form errors when switching modes
    passwordForm.clearErrors()
    pinForm.clearErrors()
  }, [passwordForm, pinForm])

  // Get current form based on mode
  const currentForm = loginMode === 'password' ? passwordForm : pinForm
  const currentErrors = currentForm.formState.errors
  const isFormValid = currentForm.formState.isValid && deviceInfo !== null

  return (
    <Card className={`p-6 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
            <User className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-h2 font-bold bg-rainbow-gradient bg-clip-text text-transparent">
          員工登入
        </h1>
        <p className="text-caption text-gray-600 mt-1">
          彩虹餐廳管理系統
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-staff bg-gray-50">
        <div className="flex items-center gap-2">
          <Wifi className={`h-4 w-4 ${
            connectionStatus === 'connected' ? 'text-completed' : 
            connectionStatus === 'disconnected' ? 'text-error' : 'text-processing'
          }`} />
          <span className="text-small">
            {connectionStatus === 'connected' && '已連接'}
            {connectionStatus === 'disconnected' && '連接失敗'}
            {connectionStatus === 'checking' && '檢查連接中...'}
          </span>
        </div>
        {deviceInfo && (
          <div className="flex items-center gap-1 text-small text-gray-500">
            <Smartphone className="h-3 w-3" />
            {deviceInfo.deviceType}
          </div>
        )}
      </div>

      {/* Login Mode Toggle */}
      <div className="flex rounded-staff overflow-hidden mb-6 bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => switchLoginMode('password')}
          className={`flex-1 px-4 py-2 text-small font-medium rounded-staff transition-all duration-200 ${
            loginMode === 'password'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Lock className="h-4 w-4 inline mr-2" />
          密碼登入
        </button>
        <button
          type="button"
          onClick={() => switchLoginMode('pin')}
          className={`flex-1 px-4 py-2 text-small font-medium rounded-staff transition-all duration-200 ${
            loginMode === 'pin'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Smartphone className="h-4 w-4 inline mr-2" />
          PIN快速登入
        </button>
      </div>

      {/* Password Login Form */}
      {loginMode === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
          {/* Login ID Field */}
          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              員工編號或電子郵件
            </label>
            <input
              {...passwordForm.register('loginId')}
              type="text"
              className={`w-full px-4 py-3 border rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                currentErrors.loginId ? 'border-error' : 'border-gray-300'
              }`}
              placeholder={FormFieldConfig.employeeNumber.placeholder}
              autoComplete={FormFieldConfig.employeeNumber.autoComplete}
              disabled={isLoading}
            />
            {currentErrors.loginId && (
              <div className="flex items-center gap-2 mt-1 text-small text-error">
                <AlertCircle className="h-4 w-4" />
                {currentErrors.loginId.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div className="relative">
              <input
                {...passwordForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 pr-12 border rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  currentErrors.password ? 'border-error' : 'border-gray-300'
                }`}
                placeholder={FormFieldConfig.password.placeholder}
                autoComplete={FormFieldConfig.password.autoComplete}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {currentErrors.password && (
              <div className="flex items-center gap-2 mt-1 text-small text-error">
                <AlertCircle className="h-4 w-4" />
                {currentErrors.password.message}
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <input
              {...passwordForm.register('rememberMe')}
              type="checkbox"
              id="rememberMe"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="text-body text-gray-700">
              記住登入狀態
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isLoading || connectionStatus !== 'connected'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                登入中...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                登入
              </>
            )}
          </Button>
        </form>
      )}

      {/* PIN Login Form */}
      {loginMode === 'pin' && (
        <form onSubmit={pinForm.handleSubmit(handlePinLogin)} className="space-y-4">
          {/* Employee Number Field */}
          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              員工編號
            </label>
            <input
              {...pinForm.register('employeeNumber')}
              type="text"
              className={`w-full px-4 py-3 border rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                pinForm.formState.errors.employeeNumber ? 'border-error' : 'border-gray-300'
              }`}
              placeholder={FormFieldConfig.employeeNumber.placeholder}
              autoComplete={FormFieldConfig.employeeNumber.autoComplete}
              disabled={isLoading}
            />
            {pinForm.formState.errors.employeeNumber && (
              <div className="flex items-center gap-2 mt-1 text-small text-error">
                <AlertCircle className="h-4 w-4" />
                {pinForm.formState.errors.employeeNumber.message}
              </div>
            )}
          </div>

          {/* PIN Field */}
          <div>
            <label className="block text-body font-medium text-gray-700 mb-2">
              PIN碼
            </label>
            <input
              {...pinForm.register('pin')}
              type="password"
              inputMode="numeric"
              maxLength={6}
              className={`w-full px-4 py-3 border rounded-staff focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-center text-h3 tracking-widest ${
                pinForm.formState.errors.pin ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="••••••"
              autoComplete="off"
              disabled={isLoading}
            />
            {pinForm.formState.errors.pin && (
              <div className="flex items-center gap-2 mt-1 text-small text-error">
                <AlertCircle className="h-4 w-4" />
                {pinForm.formState.errors.pin.message}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!pinForm.formState.isValid || isLoading || connectionStatus !== 'connected'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                驗證中...
              </>
            ) : (
              <>
                <Smartphone className="h-5 w-5 mr-2" />
                PIN登入
              </>
            )}
          </Button>
        </form>
      )}

      {/* Form Errors */}
      {(currentErrors.root || currentErrors.deviceInfo) && (
        <div className="mt-4 p-3 rounded-staff bg-error/10 border border-error/20">
          <div className="flex items-center gap-2 text-small text-error">
            <AlertCircle className="h-4 w-4" />
            {currentErrors.root?.message || '設備信息無效，請重新整理頁面'}
          </div>
        </div>
      )}

      {/* Connection Error */}
      {connectionStatus === 'disconnected' && (
        <div className="mt-4 p-3 rounded-staff bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 text-small text-warning">
            <AlertCircle className="h-4 w-4" />
            網絡連接失敗，請檢查網絡設置
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 text-small text-gray-500">
          {deviceInfo && (
            <>
              <span>設備ID: {deviceInfo.deviceId.substring(0, 8)}...</span>
              <span>版本: {deviceInfo.appVersion}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default StaffLoginForm