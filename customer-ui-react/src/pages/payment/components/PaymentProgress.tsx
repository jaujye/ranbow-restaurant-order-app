import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import { PaymentMethod } from '@/services/api'
import { formatPrice } from '@/store/cartStore'
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Server,
  Lock,
  ArrowRight
} from 'lucide-react'

interface PaymentProgressProps {
  method: PaymentMethod | null
  amount: number
  orderId: string | null
}

interface ProcessStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  completed: boolean
  processing: boolean
}

const PaymentProgress: React.FC<PaymentProgressProps> = ({
  method,
  amount,
  orderId
}) => {
  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // 根據支付方式配置不同的處理步驟
  useEffect(() => {
    let processSteps: ProcessStep[] = []

    switch (method) {
      case 'CREDIT_CARD':
        processSteps = [
          {
            id: 'validate',
            label: '驗證卡片資訊',
            description: '正在驗證信用卡號、有效期限和安全碼',
            icon: <CreditCard className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'encrypt',
            label: '加密傳輸',
            description: '使用 SSL 加密技術保護您的支付資訊',
            icon: <Lock className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'authorize',
            label: '銀行授權',
            description: '正在向發卡銀行請求支付授權',
            icon: <Shield className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'confirm',
            label: '確認交易',
            description: '完成支付並生成交易記錄',
            icon: <CheckCircle className="w-5 h-5" />,
            completed: false,
            processing: false
          }
        ]
        break

      case 'LINE_PAY':
        processSteps = [
          {
            id: 'redirect',
            label: '連接 LINE Pay',
            description: '正在建立與 LINE Pay 的安全連接',
            icon: <Smartphone className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'auth',
            label: '用戶授權',
            description: '等待您在 LINE 中確認支付授權',
            icon: <Shield className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'process',
            label: '處理支付',
            description: 'LINE Pay 正在處理您的支付請求',
            icon: <Zap className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'complete',
            label: '支付完成',
            description: '支付成功，正在更新訂單狀態',
            icon: <CheckCircle className="w-5 h-5" />,
            completed: false,
            processing: false
          }
        ]
        break

      case 'APPLE_PAY':
        processSteps = [
          {
            id: 'biometric',
            label: '生物識別驗證',
            description: '正在驗證 Touch ID 或 Face ID',
            icon: <Wallet className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'tokenize',
            label: '生成支付令牌',
            description: '創建安全的支付令牌替代卡片資訊',
            icon: <Lock className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'authorize',
            label: '處理授權',
            description: '通過 Apple Pay 網絡處理支付授權',
            icon: <Server className="w-5 h-5" />,
            completed: false,
            processing: false
          },
          {
            id: 'finalize',
            label: '完成交易',
            description: '支付成功並記錄交易資訊',
            icon: <CheckCircle className="w-5 h-5" />,
            completed: false,
            processing: false
          }
        ]
        break

      default:
        processSteps = [
          {
            id: 'init',
            label: '初始化支付',
            description: '正在準備支付流程',
            icon: <Clock className="w-5 h-5" />,
            completed: false,
            processing: false
          }
        ]
    }

    setSteps(processSteps)
  }, [method])

  // 模擬處理步驟進度
  useEffect(() => {
    if (steps.length === 0) return

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i)
        
        // 標記當前步驟為處理中
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          processing: index === i,
          completed: index < i
        })))

        // 每個步驟的處理時間 (0.8-2秒隨機)
        const stepDuration = Math.random() * 1200 + 800
        await new Promise(resolve => setTimeout(resolve, stepDuration))

        // 標記當前步驟為完成
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          processing: false,
          completed: index <= i
        })))
      }
    }

    processSteps()
  }, [steps.length])

  const getMethodInfo = () => {
    switch (method) {
      case 'CREDIT_CARD':
        return {
          name: '信用卡支付',
          icon: <CreditCard className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'LINE_PAY':
        return {
          name: 'LINE Pay',
          icon: <Smartphone className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'APPLE_PAY':
        return {
          name: 'Apple Pay',
          icon: <Wallet className="w-6 h-6" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
      default:
        return {
          name: '處理中',
          icon: <Clock className="w-6 h-6" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const methodInfo = getMethodInfo()

  return (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 ${methodInfo.bgColor} rounded-full mb-6`}>
          <div className={methodInfo.color}>
            {methodInfo.icon}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">處理支付中</h1>
        <p className="text-text-secondary mb-6">
          正在使用 {methodInfo.name} 處理您的支付請求
        </p>

        <div className={`${methodInfo.bgColor} rounded-xl p-6`}>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">支付金額</div>
            <div className="text-3xl font-bold text-gray-800">
              {formatPrice(amount)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              訂單編號：#{orderId}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary-500" />
          處理進度
        </h2>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.completed 
                  ? 'bg-success-500 text-white' 
                  : step.processing 
                  ? 'bg-primary-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.processing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium ${
                    step.completed 
                      ? 'text-success-700' 
                      : step.processing 
                      ? 'text-primary-600' 
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h3>
                  {step.processing && (
                    <div className="flex items-center gap-1 text-primary-500">
                      <div className="animate-pulse text-xs font-medium">處理中</div>
                    </div>
                  )}
                  {step.completed && (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  )}
                </div>
                <p className={`text-sm ${
                  step.completed 
                    ? 'text-success-600' 
                    : step.processing 
                    ? 'text-primary-500' 
                    : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>

              {/* Progress Connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-9 mt-10 w-0.5 h-8 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>處理進度</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900 text-sm mb-1">安全保護</div>
            <div className="text-blue-700 text-xs">
              您的支付資訊受到多層加密保護，整個處理過程符合 PCI DSS 安全標準。
              請勿關閉此頁面直到處理完成。
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PaymentProgress