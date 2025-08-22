/**
 * 🔐 useAuthValidation Hook
 * Custom hook for staff authentication form validation with real-time feedback
 */

import { useState, useCallback, useEffect } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  staffLoginSchema,
  quickSwitchSchema,
  pinLoginSchema,
  type StaffLoginFormData,
  type QuickSwitchFormData,
  type PinLoginFormData,
  validateEmployeeNumber,
  validateEmail,
  validatePassword,
  validatePin
} from '@/lib/validations'
import { useAuthStore } from '@/store/authStore'
import type { DeviceInfo } from '@/types'

// 📝 Validation State Interface
interface ValidationState {
  isValidating: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
  suggestions: string[]
}

// 🔐 Staff Login Hook
export const useStaffLoginValidation = (defaultDeviceInfo?: DeviceInfo) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    errors: {},
    warnings: {},
    suggestions: []
  })

  const security = useAuthStore(state => state.getSecurityStatus())
  const isAccountLocked = useAuthStore(state => state.checkAccountLockout())

  const form = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
    mode: 'onChange',
    defaultValues: {
      loginId: '',
      password: '',
      rememberMe: false,
      deviceInfo: defaultDeviceInfo || {
        deviceId: '',
        deviceType: 'DESKTOP',
        appVersion: '1.0.0'
      }
    }
  })

  // Real-time validation for login ID
  const validateLoginId = useCallback(async (value: string) => {
    if (!value) return

    setValidationState(prev => ({ ...prev, isValidating: true }))
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    const isEmployeeNumber = /^[A-Z0-9]{3,20}$/.test(value)
    
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    const suggestions: string[] = []

    if (!isEmail && !isEmployeeNumber) {
      if (value.includes('@')) {
        errors.loginId = '電子郵件格式無效'
        suggestions.push('請檢查郵件地址格式是否正確')
      } else {
        errors.loginId = '員工編號格式無效'
        suggestions.push('員工編號應為3-20位大寫字母和數字組合')
      }
    }

    // Check for common typos
    if (value.length > 0 && value.length < 3) {
      warnings.loginId = '輸入內容過短'
    }

    setValidationState({
      isValidating: false,
      errors,
      warnings,
      suggestions
    })
  }, [])

  // Real-time password strength validation
  const validatePasswordStrength = useCallback((password: string) => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    const suggestions: string[] = []

    if (!password) return { errors, warnings, suggestions }

    // Check minimum length
    if (password.length < 8) {
      errors.password = '密碼至少需要8個字符'
    }

    // Check complexity
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length >= 8) {
      let strength = 0
      if (hasLower) strength++
      if (hasUpper) strength++
      if (hasNumber) strength++
      if (hasSpecial) strength++

      if (strength < 3) {
        warnings.password = '密碼強度偏弱'
        suggestions.push('建議包含大小寫字母、數字和特殊字符')
      }
    }

    // Check for common passwords
    const commonPasswords = ['12345678', 'password', 'admin123', 'qwerty123']
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.password = '請避免使用常見密碼'
      suggestions.push('使用更複雜且不易猜測的密碼')
    }

    return { errors, warnings, suggestions }
  }, [])

  // Security status check
  useEffect(() => {
    if (isAccountLocked) {
      const lockoutTime = security.lockoutUntil
      const message = lockoutTime 
        ? `帳戶已鎖定至 ${lockoutTime.toLocaleTimeString()}`
        : '帳戶暫時鎖定'
      
      setValidationState(prev => ({
        ...prev,
        errors: { ...prev.errors, security: message },
        suggestions: ['請稍後再試或聯繫管理員']
      }))
    } else if (security.failedAttempts > 0) {
      const remaining = 5 - security.failedAttempts
      setValidationState(prev => ({
        ...prev,
        warnings: { 
          ...prev.warnings, 
          security: `剩餘嘗試次數: ${remaining}` 
        }
      }))
    }
  }, [security, isAccountLocked])

  return {
    form,
    validationState,
    validateLoginId,
    validatePasswordStrength,
    isAccountLocked,
    security
  }
}

// 🔄 Quick Switch Hook
export const useQuickSwitchValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    errors: {},
    warnings: {},
    suggestions: []
  })

  const currentStaff = useAuthStore(state => state.currentStaff)
  const availableStaff = useAuthStore(state => state.availableStaff)

  const form = useForm<QuickSwitchFormData>({
    resolver: zodResolver(quickSwitchSchema),
    mode: 'onChange',
    defaultValues: {
      currentStaffId: currentStaff?.staffId || '',
      targetStaffId: '',
      pin: ''
    }
  })

  // Validate PIN format and common patterns
  const validatePinSecurity = useCallback((pin: string, targetStaffId: string) => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    const suggestions: string[] = []

    if (!pin) return { errors, warnings, suggestions }

    // Check for weak PINs
    const weakPatterns = [
      /^(\d)\1+$/, // Repeated digits (1111, 2222)
      /^1234$/, /^4321$/, // Sequential
      /^0000$/, /^9999$/ // Common patterns
    ]

    const isWeak = weakPatterns.some(pattern => pattern.test(pin))
    
    if (isWeak) {
      warnings.pin = 'PIN過於簡單，建議設置更複雜的組合'
      suggestions.push('避免使用重複數字或連續數字')
    }

    // Check target staff availability
    const targetStaff = availableStaff.find(staff => staff.staffId === targetStaffId)
    if (targetStaff && !targetStaff.quickSwitchEnabled) {
      errors.targetStaffId = '目標員工未啟用快速切換功能'
    }

    return { errors, warnings, suggestions }
  }, [availableStaff])

  return {
    form,
    validationState,
    validatePinSecurity,
    availableStaff,
    currentStaff
  }
}

// 📱 PIN Login Hook
export const usePinLoginValidation = (defaultDeviceInfo?: DeviceInfo) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    errors: {},
    warnings: {},
    suggestions: []
  })

  const form = useForm<PinLoginFormData>({
    resolver: zodResolver(pinLoginSchema),
    mode: 'onChange',
    defaultValues: {
      employeeNumber: '',
      pin: '',
      deviceInfo: defaultDeviceInfo || {
        deviceId: '',
        deviceType: 'DESKTOP',
        appVersion: '1.0.0'
      }
    }
  })

  // Validate employee number format
  const validateEmployeeFormat = useCallback((value: string) => {
    const errors: Record<string, string> = {}
    const suggestions: string[] = []

    if (!value) return { errors, suggestions }

    if (!validateEmployeeNumber(value)) {
      errors.employeeNumber = '員工編號格式無效'
      suggestions.push('員工編號應為3-20位大寫字母和數字組合，例如: EMP001')
    }

    return { errors, suggestions }
  }, [])

  return {
    form,
    validationState,
    validateEmployeeFormat
  }
}

// 📊 Form State Management Hook
export const useFormState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const handleSubmit = useCallback(async (
    submitFn: () => Promise<boolean>,
    successMessage?: string
  ) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const success = await submitFn()
      
      if (success) {
        setSubmitSuccess(successMessage || '操作成功')
        return true
      } else {
        setSubmitError('操作失敗，請重試')
        return false
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤'
      setSubmitError(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setSubmitError(null)
    setSubmitSuccess(null)
  }, [])

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit,
    clearMessages
  }
}

// 🔒 Security Validation Utilities
export const useSecurityValidation = () => {
  const security = useAuthStore(state => state.getSecurityStatus())
  const activeSessions = useAuthStore(state => state.getActiveSessions())

  // Check if device is secure
  const isDeviceSecure = useCallback(() => {
    const checks = {
      httpsConnection: window.location.protocol === 'https:',
      sessionStorage: typeof(Storage) !== 'undefined',
      trustedDevice: security.deviceTrusted,
      recentActivity: security.lastFailedAttempt 
        ? Date.now() - security.lastFailedAttempt.getTime() > 60000 // 1 minute
        : true
    }

    return {
      isSecure: Object.values(checks).every(Boolean),
      checks,
      warnings: Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check]) => {
          switch (check) {
            case 'httpsConnection': return '建議使用HTTPS連接以確保安全性'
            case 'sessionStorage': return '瀏覽器不支持本地存儲功能'
            case 'trustedDevice': return '設備尚未建立信任關係'
            case 'recentActivity': return '檢測到最近有失敗的登入嘗試'
            default: return '安全檢查失敗'
          }
        })
    }
  }, [security])

  // Check session security
  const checkSessionSecurity = useCallback(() => {
    const warnings: string[] = []
    
    if (activeSessions.length > 3) {
      warnings.push('檢測到過多活躍會話，建議終止不必要的會話')
    }

    const oldSessions = activeSessions.filter(session => 
      Date.now() - session.lastSeen.getTime() > 24 * 60 * 60 * 1000 // 24 hours
    )
    
    if (oldSessions.length > 0) {
      warnings.push(`發現 ${oldSessions.length} 個長時間未活動的會話`)
    }

    return {
      isSecure: warnings.length === 0,
      warnings,
      sessionsCount: activeSessions.length,
      oldSessionsCount: oldSessions.length
    }
  }, [activeSessions])

  return {
    security,
    activeSessions,
    isDeviceSecure,
    checkSessionSecurity
  }
}

// 🎯 Combined Authentication Hook
export const useAuthentication = (defaultDeviceInfo?: DeviceInfo) => {
  const loginValidation = useStaffLoginValidation(defaultDeviceInfo)
  const quickSwitchValidation = useQuickSwitchValidation()
  const pinValidation = usePinLoginValidation(defaultDeviceInfo)
  const formState = useFormState()
  const securityValidation = useSecurityValidation()

  return {
    login: loginValidation,
    quickSwitch: quickSwitchValidation,
    pin: pinValidation,
    formState,
    security: securityValidation
  }
}