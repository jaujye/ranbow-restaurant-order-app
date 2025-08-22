import React, { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { formatPrice } from '@/store/cartStore'
import { 
  Wallet, 
  Fingerprint, 
  Eye,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react'

interface ApplePayAuthProps {
  amount: number
  onSuccess: () => void
  onCancel: () => void
  isProcessing?: boolean
}

type AuthStep = 'device_check' | 'biometric_prompt' | 'authenticating' | 'success' | 'failed'

const ApplePayAuth: React.FC<ApplePayAuthProps> = ({
  amount,
  onSuccess,
  onCancel,
  isProcessing = false
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('device_check')
  const [authMethod, setAuthMethod] = useState<'touch_id' | 'face_id'>('touch_id')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 檢測設備類型 (模擬)
  useEffect(() => {
    // 模擬設備檢測
    const deviceCheck = setTimeout(() => {
      // 隨機選擇驗證方式
      const haseFaceId = Math.random() > 0.5
      setAuthMethod(haseFaceId ? 'face_id' : 'touch_id')
      setCurrentStep('biometric_prompt')
    }, 1000)

    return () => clearTimeout(deviceCheck)
  }, [])

  const handleStartAuth = () => {
    setCurrentStep('authenticating')
    
    // 模擬生物識別驗證過程
    const authTimer = setTimeout(() => {
      // 90% 成功率
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        setIsAuthenticated(true)
        setCurrentStep('success')
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        setCurrentStep('failed')
      }
    }, 3000)

    return () => clearTimeout(authTimer)
  }

  const handleRetry = () => {
    setCurrentStep('biometric_prompt')
    setIsAuthenticated(false)
  }

  const renderBiometricIcon = () => {
    if (authMethod === 'face_id') {
      return (
        <div className="relative">
          <Eye className="w-16 h-16 text-gray-800" />
          {currentStep === 'authenticating' && (
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping" />
          )}
        </div>
      )
    } else {
      return (
        <div className="relative">
          <Fingerprint className="w-16 h-16 text-gray-800" />
          {currentStep === 'authenticating' && (
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping" />
          )}
        </div>
      )
    }
  }

  if (currentStep === 'device_check') {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-600 mb-6">
          <Smartphone className="w-16 h-16 mx-auto animate-pulse" />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">檢測設備能力</h2>
        <p className="text-text-secondary">
          正在檢測您的設備是否支援 Apple Pay...
        </p>
        
        <div className="flex justify-center mt-6">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
        </div>
      </Card>
    )
  }

  if (currentStep === 'success') {
    return (
      <Card className="p-8 text-center">
        <div className="text-success-500 mb-6">
          <CheckCircle className="w-20 h-20 mx-auto animate-bounce-gentle" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">驗證成功！</h2>
        <p className="text-text-secondary mb-6">
          {authMethod === 'face_id' ? 'Face ID' : 'Touch ID'} 驗證通過，正在處理支付...
        </p>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-700">
            ✓ 安全驗證完成
          </div>
        </div>
      </Card>
    )
  }

  if (currentStep === 'failed') {
    return (
      <Card className="p-8 text-center">
        <div className="text-error-500 mb-6">
          <AlertCircle className="w-16 h-16 mx-auto" />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">驗證失敗</h2>
        <p className="text-text-secondary mb-6">
          {authMethod === 'face_id' ? 'Face ID' : 'Touch ID'} 驗證失敗，請重新嘗試
        </p>
        
        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full" variant="primary">
            重新驗證
          </Button>
          <Button onClick={onCancel} variant="ghost" className="w-full">
            取消支付
          </Button>
        </div>
      </Card>
    )
  }

  if (currentStep === 'authenticating') {
    return (
      <Card className="p-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 relative">
            {renderBiometricIcon()}
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            正在驗證 {authMethod === 'face_id' ? 'Face ID' : 'Touch ID'}
          </h2>
          <p className="text-text-secondary">
            {authMethod === 'face_id' 
              ? '請將臉部對準前鏡頭並保持自然表情'
              : '請將手指放在 Home 鍵上'
            }
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full" />
            <span className="text-blue-700 font-medium">驗證中...</span>
          </div>
        </div>
        
        <Button onClick={onCancel} variant="ghost" className="w-full">
          取消
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
          <Wallet className="w-10 h-10 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Apple Pay 支付</h2>
        <p className="text-text-secondary">
          使用 {authMethod === 'face_id' ? 'Face ID' : 'Touch ID'} 快速安全地完成支付
        </p>
      </div>

      {/* Payment Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">支付金額</div>
          <div className="text-3xl font-bold text-gray-800">
            {formatPrice(amount)}
          </div>
        </div>
      </div>

      {/* Biometric Preview */}
      <div className="mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-4">
            {authMethod === 'face_id' ? (
              <Eye className="w-12 h-12 text-blue-600" />
            ) : (
              <Fingerprint className="w-12 h-12 text-blue-600" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {authMethod === 'face_id' ? 'Face ID' : 'Touch ID'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {authMethod === 'face_id' 
              ? '將臉部對準前鏡頭進行識別'
              : '將手指輕觸 Home 鍵進行識別'
            }
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
            <Shield className="w-4 h-4" />
            <span>端到端加密保護</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Apple Pay 安全特性：</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-gray-800">安全元件</div>
                <div className="text-xs text-gray-600">卡片資訊加密存儲在安全晶片中</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-gray-800">即時授權</div>
                <div className="text-xs text-gray-600">每筆交易都需要生物識別驗證</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-gray-800">隱私保護</div>
                <div className="text-xs text-gray-600">Apple 不會存儲或分享交易資訊</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          onClick={handleStartAuth}
          disabled={isProcessing}
          className="flex-1 bg-gray-800 hover:bg-gray-900"
        >
          <Wallet className="w-4 h-4 mr-2" />
          使用 Apple Pay 支付
        </Button>
      </div>
    </Card>
  )
}

export default ApplePayAuth