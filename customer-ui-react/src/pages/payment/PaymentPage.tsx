import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { useDialogContext } from '@/components/ui/DialogProvider'
import { useCheckoutStore } from '@/store'
import { PaymentMethod } from '@/services/api'
import { formatPrice } from '@/store/cartStore'
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet
} from 'lucide-react'
import CreditCardForm from './components/CreditCardForm'
import LinePayAuth from './components/LinePayAuth'
import ApplePayAuth from './components/ApplePayAuth'
import PaymentProgress from './components/PaymentProgress'

type PaymentStep = 'selection' | 'processing' | 'success' | 'error'

interface PaymentPageProps {
  orderId?: string
  amount?: number
  onSuccess?: () => void
  onCancel?: () => void
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  orderId, 
  amount, 
  onSuccess, 
  onCancel 
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { error: showError, success: showSuccess } = useDialogContext()
  const { cartTotal } = useCheckoutStore()

  // 支付狀態管理
  const [currentStep, setCurrentStep] = useState<PaymentStep>('selection')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    transactionId?: string
    message?: string
  } | null>(null)

  // 從URL參數獲取訂單信息
  const finalOrderId = orderId || searchParams.get('orderId')
  const finalAmount = amount || parseFloat(searchParams.get('amount') || '0') || cartTotal
  const urlPaymentMethod = searchParams.get('paymentMethod') as PaymentMethod

  useEffect(() => {
    if (!finalOrderId) {
      showError('缺少訂單信息')
      navigate('/orders')
      return
    }
    
    // 直接設置從URL參數獲取的付款方式
    if (urlPaymentMethod) {
      setSelectedMethod(urlPaymentMethod)
    }
  }, [finalOrderId, urlPaymentMethod, navigate, showError])

  // 支付方式配置
  const paymentMethods = [
    {
      value: 'CREDIT_CARD' as PaymentMethod,
      label: '信用卡支付',
      icon: <CreditCard className="w-6 h-6" />,
      description: '支援 Visa、MasterCard、JCB',
      badges: ['安全', '快速'],
      enabled: true,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      value: 'LINE_PAY' as PaymentMethod,
      label: 'LINE Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'LINE 官方行動支付',
      badges: ['便利', '免手續費'],
      enabled: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      value: 'APPLE_PAY' as PaymentMethod,
      label: 'Apple Pay',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Touch ID 或 Face ID 驗證',
      badges: ['生物識別', '極速'],
      enabled: true,
      gradient: 'from-gray-700 to-gray-900'
    }
  ]

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const handleProcessPayment = async () => {
    if (!selectedMethod || !finalOrderId) return

    setIsProcessing(true)
    setCurrentStep('processing')

    try {
      // 模擬支付處理時間
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 模擬支付結果 (90% 成功率)
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setPaymentResult({
          success: true,
          transactionId,
          message: '支付成功完成'
        })
        setCurrentStep('success')
        showSuccess('支付成功！')
        
        // 調用成功回調
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setPaymentResult({
          success: false,
          message: '支付失敗，請重試'
        })
        setCurrentStep('error')
        showError('支付處理失敗')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setPaymentResult({
        success: false,
        message: '網絡錯誤，請檢查連接後重試'
      })
      setCurrentStep('error')
      showError('支付處理出現錯誤')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetryPayment = () => {
    setCurrentStep('selection')
    setPaymentResult(null)
    setSelectedMethod(null)
  }

  const handleCancel = () => {
    onCancel?.()
    navigate(-1)
  }

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'CREDIT_CARD':
        return (
          <CreditCardForm
            amount={finalAmount}
            onSubmit={handleProcessPayment}
            onCancel={() => setSelectedMethod(null)}
            isProcessing={isProcessing}
          />
        )
      case 'LINE_PAY':
        return (
          <LinePayAuth
            amount={finalAmount}
            orderId={finalOrderId}
            onSuccess={handleProcessPayment}
            onCancel={() => setSelectedMethod(null)}
            isProcessing={isProcessing}
          />
        )
      case 'APPLE_PAY':
        return (
          <ApplePayAuth
            amount={finalAmount}
            onSuccess={handleProcessPayment}
            onCancel={() => setSelectedMethod(null)}
            isProcessing={isProcessing}
          />
        )
      default:
        return null
    }
  }

  if (currentStep === 'processing') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <PaymentProgress
          method={selectedMethod}
          amount={finalAmount}
          orderId={finalOrderId}
        />
      </div>
    )
  }

  if (currentStep === 'success') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="text-success-500 mb-6">
            <CheckCircle className="w-20 h-20 mx-auto animate-bounce-gentle" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-rainbow">支付成功！</h1>
          
          <div className="bg-rainbow-soft rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <span className="text-text-secondary">訂單編號</span>
                <p className="font-bold text-lg">#{finalOrderId}</p>
              </div>
              <div className="text-right">
                <span className="text-text-secondary">支付金額</span>
                <p className="font-bold text-lg text-primary-500">
                  {formatPrice(finalAmount)}
                </p>
              </div>
              <div className="text-left">
                <span className="text-text-secondary">交易編號</span>
                <p className="font-medium text-xs font-mono">
                  {paymentResult?.transactionId}
                </p>
              </div>
              <div className="text-right">
                <span className="text-text-secondary">支付方式</span>
                <p className="font-medium">
                  {paymentMethods.find(m => m.value === selectedMethod)?.label}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/orders')}
              className="w-full"
              rainbow
            >
              查看訂單詳情
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/menu')}
              className="w-full"
            >
              繼續購物
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (currentStep === 'error') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="text-error-500 mb-6">
            <AlertCircle className="w-20 h-20 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">支付失敗</h1>
          <p className="text-text-secondary mb-6">
            {paymentResult?.message || '支付處理過程中發生錯誤'}
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleRetryPayment}
              className="w-full"
              variant="primary"
            >
              重新支付
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="w-full"
            >
              取消支付
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-rainbow">安全支付</h1>
          <p className="text-text-secondary text-sm flex items-center gap-1">
            <Shield className="w-4 h-4" />
            採用業界最高安全標準保護您的支付信息
          </p>
        </div>
      </div>

      {/* Payment Form - directly show based on selected method */}
      {selectedMethod ? (
        <div className="space-y-6">
          {/* Payment Method Header */}
          <Card className="p-4 bg-gradient-to-r from-rainbow-red/5 to-rainbow-purple/5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${paymentMethods.find(m => m.value === selectedMethod)?.gradient || 'from-primary-500 to-primary-600'} text-white`}>
                {paymentMethods.find(m => m.value === selectedMethod)?.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {paymentMethods.find(m => m.value === selectedMethod)?.label}
                </h2>
                <p className="text-text-secondary">
                  {paymentMethods.find(m => m.value === selectedMethod)?.description}
                </p>
              </div>
            </div>
          </Card>
          
          {renderPaymentMethod()}
        </div>
      ) : (
        // 如果沒有選擇的付款方式，顯示錯誤並返回
        <Card className="p-8 text-center">
          <div className="text-error-500 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-4">付款方式錯誤</h2>
          <p className="text-text-secondary mb-6">無法識別指定的付款方式</p>
          <Button onClick={handleCancel} className="w-full">
            返回結帳頁面
          </Button>
        </Card>
      )}

      {/* Order Summary */}
      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-r from-rainbow-red/5 to-rainbow-purple/5">
          <h3 className="text-lg font-semibold mb-4">付款摘要</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">訂單編號</span>
              <span className="font-medium">#{finalOrderId}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span>支付金額</span>
              <span className="text-primary-500">
                {formatPrice(finalAmount)}
              </span>
            </div>
            <div className="pt-3 border-t border-border-light">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4" />
                <span>預計處理時間：2-5 分鐘</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PaymentPage