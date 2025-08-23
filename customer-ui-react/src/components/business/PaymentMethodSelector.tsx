import React from 'react'
import { Card } from '@/components/ui'
import { PaymentMethod } from '@/services/api'
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PaymentMethodOption {
  value: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  fees?: number
  estimatedTime?: string
  features?: string[]
  security?: 'high' | 'medium' | 'low'
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  variant?: 'default' | 'detailed' | 'compact'
  showFees?: boolean
  showSecurity?: boolean
  className?: string
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  variant = 'default',
  showFees = false,
  showSecurity = false,
  className = ''
}) => {
  const paymentMethods: PaymentMethodOption[] = [
    {
      value: 'CASH',
      label: '現金付款',
      description: '到店現金付款',
      icon: <DollarSign className="w-6 h-6" />,
      enabled: true,
      fees: 0,
      estimatedTime: '即時',
      features: ['免手續費', '現場結帳'],
      security: 'medium'
    },
    {
      value: 'CREDIT_CARD',
      label: '信用卡',
      description: '支援 Visa、MasterCard、JCB',
      icon: <CreditCard className="w-6 h-6" />,
      enabled: true,
      fees: 0,
      estimatedTime: '1-3 分鐘',
      features: ['安全加密', '即時扣款', '支援分期'],
      security: 'high'
    },
    {
      value: 'LINE_PAY',
      label: 'LINE Pay',
      description: '使用 LINE 應用程式快速付款',
      icon: <Smartphone className="w-6 h-6" />,
      enabled: true,
      fees: 0,
      estimatedTime: '30 秒',
      features: ['掃碼付款', 'LINE Points 回饋', '免輸入卡號'],
      security: 'high'
    },
    {
      value: 'APPLE_PAY',
      label: 'Apple Pay',
      description: 'Touch ID 或 Face ID 驗證',
      icon: <Wallet className="w-6 h-6" />,
      enabled: false, // 暫時停用
      fees: 0,
      estimatedTime: '即時',
      features: ['生物辨識', '裝置內付款', '隱私保護'],
      security: 'high'
    }
  ]

  const getSecurityColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
    }
  }

  const getSecurityText = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return '高度安全'
      case 'medium': return '中等安全'
      case 'low': return '基本安全'
    }
  }

  // Compact variant for mobile or limited space
  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {paymentMethods.map((method) => (
          <button
            key={method.value}
            onClick={() => method.enabled && onSelect(method.value)}
            disabled={!method.enabled}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
              selectedMethod === method.value
                ? 'border-primary-500 bg-primary-50'
                : method.enabled
                ? 'border-border-default hover:border-primary-300'
                : 'border-border-light bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`${method.enabled ? 'text-primary-500' : 'text-gray-400'}`}>
              {method.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                {method.label}
                {!method.enabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    暫停服務
                  </span>
                )}
              </h3>
              <p className="text-text-secondary text-xs">
                {method.description}
              </p>
            </div>
            {selectedMethod === method.value && (
              <div className="text-primary-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Detailed variant with full information
  if (variant === 'detailed') {
    return (
      <div className={`grid gap-4 ${className}`}>
        {paymentMethods.map((method) => (
          <Card 
            key={method.value}
            className={`p-6 cursor-pointer transition-all ${
              selectedMethod === method.value
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : method.enabled
                ? 'hover:border-primary-300 hover:shadow-md'
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
            onClick={() => method.enabled && onSelect(method.value)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedMethod === method.value ? 'bg-primary-500 text-white' : 
                  method.enabled ? 'bg-primary-100 text-primary-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {method.icon}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {method.label}
                    {!method.enabled && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        暫停服務
                      </span>
                    )}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {method.description}
                  </p>
                </div>
              </div>
              
              {selectedMethod === method.value && (
                <div className="text-primary-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
              
              {!method.enabled && (
                <div className="text-gray-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="text-text-secondary block">處理時間</span>
                <span className="font-medium">{method.estimatedTime}</span>
              </div>
              
              {showFees && (
                <div>
                  <span className="text-text-secondary block">手續費</span>
                  <span className="font-medium">
                    {method.fees === 0 ? '免費' : `NT$ ${method.fees}`}
                  </span>
                </div>
              )}
              
              {showSecurity && (
                <div>
                  <span className="text-text-secondary block">安全等級</span>
                  <span className={`font-medium ${getSecurityColor(method.security!)}`}>
                    {getSecurityText(method.security!)}
                  </span>
                </div>
              )}
            </div>
            
            {method.features && (
              <div className="flex flex-wrap gap-2">
                {method.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-background-light text-text-secondary text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`grid gap-4 ${className}`}>
      {paymentMethods.map((method) => (
        <button
          key={method.value}
          onClick={() => method.enabled && onSelect(method.value)}
          disabled={!method.enabled}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedMethod === method.value
              ? 'border-primary-500 bg-primary-50'
              : method.enabled
              ? 'border-border-default hover:border-primary-300'
              : 'border-border-light bg-gray-50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`${method.enabled ? 'text-primary-500' : 'text-gray-400'}`}>
              {method.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                {method.label}
                {!method.enabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    暫停服務
                  </span>
                )}
              </h3>
              <p className="text-text-secondary text-sm">
                {method.description}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                <span>約 {method.estimatedTime}</span>
                {showFees && (
                  <span>
                    {method.fees === 0 ? '免手續費' : `手續費 NT$ ${method.fees}`}
                  </span>
                )}
              </div>
            </div>
            {selectedMethod === method.value && (
              <div className="text-primary-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

export default PaymentMethodSelector