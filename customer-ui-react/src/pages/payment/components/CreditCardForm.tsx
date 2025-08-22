import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { formatPrice } from '@/store/cartStore'
import { 
  CreditCard, 
  Calendar, 
  Lock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'

interface CreditCardFormProps {
  amount: number
  onSubmit: () => void
  onCancel: () => void
  isProcessing?: boolean
}

interface CardData {
  number: string
  holder: string
  expiry: string
  cvv: string
}

interface CardValidation {
  number: boolean
  holder: boolean
  expiry: boolean
  cvv: boolean
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  amount,
  onSubmit,
  onCancel,
  isProcessing = false
}) => {
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  })

  const [validation, setValidation] = useState<CardValidation>({
    number: false,
    holder: false,
    expiry: false,
    cvv: false
  })

  const [showCvv, setShowCvv] = useState(false)
  const [cardType, setCardType] = useState<string>('')

  // 信用卡號格式化
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // 到期日格式化
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  // 檢測信用卡類型
  const detectCardType = (number: string) => {
    const num = number.replace(/\s/g, '')
    
    if (/^4/.test(num)) return 'visa'
    if (/^5[1-5]/.test(num)) return 'mastercard'
    if (/^3[47]/.test(num)) return 'amex'
    if (/^35(2[89]|[3-8][0-9])/.test(num)) return 'jcb'
    
    return ''
  }

  // 驗證信用卡號 (簡化的Luhn算法)
  const validateCardNumber = (number: string) => {
    const num = number.replace(/\s/g, '')
    if (num.length < 13 || num.length > 19) return false
    
    let sum = 0
    let alternate = false
    
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num.charAt(i), 10)
      
      if (alternate) {
        n *= 2
        if (n > 9) {
          n = (n % 10) + 1
        }
      }
      
      sum += n
      alternate = !alternate
    }
    
    return (sum % 10) === 0
  }

  // 驗證到期日
  const validateExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
    
    const [month, year] = expiry.split('/').map(Number)
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1
    
    if (month < 1 || month > 12) return false
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false
    
    return true
  }

  // 處理輸入變化
  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value

    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value)
        setCardType(detectCardType(formattedValue))
        break
      case 'expiry':
        formattedValue = formatExpiry(value)
        break
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 4)
        break
      case 'holder':
        formattedValue = value.toUpperCase()
        break
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  // 驗證表單
  useEffect(() => {
    setValidation({
      number: validateCardNumber(cardData.number),
      holder: cardData.holder.length >= 2,
      expiry: validateExpiry(cardData.expiry),
      cvv: cardData.cvv.length >= 3
    })
  }, [cardData])

  const isFormValid = Object.values(validation).every(Boolean)

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return <div className="text-blue-600 font-bold text-sm">VISA</div>
      case 'mastercard':
        return <div className="text-red-600 font-bold text-sm">MC</div>
      case 'amex':
        return <div className="text-green-600 font-bold text-sm">AMEX</div>
      case 'jcb':
        return <div className="text-purple-600 font-bold text-sm">JCB</div>
      default:
        return <CreditCard className="w-5 h-5 text-text-secondary" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Virtual Credit Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-500/20 to-primary-500/20 rounded-full translate-y-12 -translate-x-12" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="text-2xl font-bold">
              {getCardIcon()}
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">信用卡</div>
              <div className="font-semibold">模擬卡</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-2xl font-mono tracking-wider">
              {cardData.number || '•••• •••• •••• ••••'}
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">持卡人姓名</div>
              <div className="font-semibold">
                {cardData.holder || 'YOUR NAME'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75 mb-1">有效期限</div>
              <div className="font-semibold">
                {cardData.expiry || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-500" />
          信用卡資訊
        </h2>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              卡號 *
            </label>
            <div className="relative">
              <Input
                value={cardData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`pr-12 ${validation.number ? 'border-success-500' : cardData.number ? 'border-error-500' : ''}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.number && cardData.number ? (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                ) : cardData.number ? (
                  <AlertTriangle className="w-5 h-5 text-error-500" />
                ) : (
                  getCardIcon()
                )}
              </div>
            </div>
          </div>

          {/* Card Holder */}
          <div>
            <label className="block text-sm font-medium mb-2">
              持卡人姓名 *
            </label>
            <Input
              value={cardData.holder}
              onChange={(e) => handleInputChange('holder', e.target.value)}
              placeholder="如卡片上所示的姓名"
              className={`${validation.holder ? 'border-success-500' : cardData.holder ? 'border-error-500' : ''}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                有效期限 *
              </label>
              <div className="relative">
                <Input
                  value={cardData.expiry}
                  onChange={(e) => handleInputChange('expiry', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`pr-10 ${validation.expiry ? 'border-success-500' : cardData.expiry ? 'border-error-500' : ''}`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            {/* CVV */}
            <div>
              <label className="block text-sm font-medium mb-2">
                安全碼 (CVV) *
              </label>
              <div className="relative">
                <Input
                  type={showCvv ? 'text' : 'password'}
                  value={cardData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className={`pr-16 ${validation.cvv ? 'border-success-500' : cardData.cvv ? 'border-error-500' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Lock className="w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">安全保護</div>
              <div className="text-blue-700">
                您的信用卡資訊受到 SSL 加密保護，我們不會儲存您的卡片資訊。
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isProcessing}
            loading={isProcessing}
            loadingText="處理中..."
            className="flex-1"
            rainbow
          >
            確認支付 {formatPrice(amount)}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CreditCardForm