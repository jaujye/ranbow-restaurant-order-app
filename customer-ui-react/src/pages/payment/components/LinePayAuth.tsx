import React, { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { formatPrice } from '@/store/cartStore'
import { 
  Smartphone, 
  QrCode, 
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface LinePayAuthProps {
  amount: number
  orderId: string | null
  onSuccess: () => void
  onCancel: () => void
  isProcessing?: boolean
}

type AuthStep = 'qr_code' | 'waiting' | 'success' | 'timeout'

const LinePayAuth: React.FC<LinePayAuthProps> = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
  isProcessing = false
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('qr_code')
  const [timeLeft, setTimeLeft] = useState(300) // 5分鐘倒計時
  const [isSimulating, setIsSimulating] = useState(false)

  // 模擬QR Code數據
  const qrCodeData = `linepay://pay?merchant=RANBOW_RESTAURANT&order=${orderId}&amount=${amount}&timestamp=${Date.now()}`

  // 倒計時效果
  useEffect(() => {
    if (currentStep === 'waiting' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCurrentStep('timeout')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentStep, timeLeft])

  // 模擬LINE Pay響應
  useEffect(() => {
    if (currentStep === 'waiting' && !isSimulating) {
      setIsSimulating(true)
      
      // 模擬用戶在手機上完成授權 (10-30秒隨機延遲)
      const authDelay = Math.random() * 20000 + 10000
      
      const timer = setTimeout(() => {
        // 85% 成功率
        const isSuccess = Math.random() > 0.15
        
        if (isSuccess) {
          setCurrentStep('success')
          setTimeout(() => {
            onSuccess()
          }, 1500)
        } else {
          setCurrentStep('timeout')
        }
      }, authDelay)

      return () => clearTimeout(timer)
    }
  }, [currentStep, isSimulating, onSuccess])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartAuth = () => {
    setCurrentStep('waiting')
    setTimeLeft(300)
  }

  const handleRefresh = () => {
    setCurrentStep('qr_code')
    setTimeLeft(300)
    setIsSimulating(false)
  }

  const renderQRCode = () => {
    // 簡化的QR Code視覺效果 (實際應用中會使用QR Code生成庫)
    return (
      <div className="relative">
        <div className="w-48 h-48 mx-auto bg-white border-4 border-green-500 rounded-xl p-4 shadow-lg">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-green-600 mb-2" />
              <div className="text-xs text-green-700 font-medium">LINE Pay</div>
              <div className="text-xs text-green-600">QR Code</div>
            </div>
          </div>
        </div>
        
        {/* QR Code 裝飾角落 */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
      </div>
    )
  }

  if (currentStep === 'success') {
    return (
      <Card className="p-8 text-center">
        <div className="text-success-500 mb-6">
          <CheckCircle className="w-20 h-20 mx-auto animate-bounce-gentle" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-green-600">LINE Pay 授權成功！</h2>
        <p className="text-text-secondary mb-6">
          正在處理您的支付請求...
        </p>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-700">
            ✓ 授權金額：{formatPrice(amount)}
          </div>
        </div>
      </Card>
    )
  }

  if (currentStep === 'timeout') {
    return (
      <Card className="p-8 text-center">
        <div className="text-warning-500 mb-6">
          <AlertCircle className="w-20 h-20 mx-auto" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">授權超時</h2>
        <p className="text-text-secondary mb-6">
          LINE Pay 授權已超時，請重新開始支付流程
        </p>
        
        <div className="space-y-3">
          <Button onClick={handleRefresh} className="w-full" variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新生成 QR Code
          </Button>
          <Button onClick={onCancel} variant="ghost" className="w-full">
            取消支付
          </Button>
        </div>
      </Card>
    )
  }

  if (currentStep === 'waiting') {
    return (
      <Card className="p-8 text-center">
        <div className="text-green-500 mb-6">
          <div className="relative">
            <Smartphone className="w-20 h-20 mx-auto animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-green-600">等待授權確認</h2>
        <p className="text-text-secondary mb-6">
          請在您的手機上打開 LINE Pay 並確認支付
        </p>
        
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-lg font-mono font-bold text-green-700">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-green-700">
            剩餘授權時間
          </div>
          
          {/* 進度條 */}
          <div className="mt-4 w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 300) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">支付步驟：</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. 打開手機上的 LINE 應用程式</li>
              <li>2. 在聊天列表中尋找 LINE Pay 通知</li>
              <li>3. 點擊通知並確認支付資訊</li>
              <li>4. 輸入您的 LINE Pay 密碼或使用指紋驗證</li>
            </ol>
          </div>
          
          <Button onClick={onCancel} variant="ghost" className="w-full">
            取消支付
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">LINE Pay 支付</h2>
        <p className="text-text-secondary">
          使用手機掃描 QR Code 即可完成支付
        </p>
      </div>

      {/* QR Code */}
      <div className="mb-8">
        {renderQRCode()}
      </div>

      {/* Payment Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
        <div className="text-center">
          <div className="text-sm text-green-700 mb-1">支付金額</div>
          <div className="text-3xl font-bold text-green-800">
            {formatPrice(amount)}
          </div>
          <div className="text-xs text-green-600 mt-2">
            訂單編號：#{orderId}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4 mb-8">
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            如何使用 QR Code 支付：
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                <span className="text-green-700">打開 LINE 應用程式</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                <span className="text-green-700">點擊右上角的掃描按鈕</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                <span className="text-green-700">掃描上方的 QR Code</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</div>
                <span className="text-green-700">確認支付資訊並完成授權</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => window.open('https://pay.line.me', '_blank')}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            沒有 LINE Pay？立即下載
          </button>
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
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          我已掃描，開始授權
        </Button>
      </div>
    </Card>
  )
}

export default LinePayAuth