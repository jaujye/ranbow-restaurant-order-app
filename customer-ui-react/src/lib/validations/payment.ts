import { z } from 'zod'

// 信用卡號驗證 (Luhn算法)
const validateCreditCardNumber = (number: string): boolean => {
  const num = number.replace(/\s/g, '')
  if (num.length < 13 || num.length > 19 || !/^\d+$/.test(num)) return false
  
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

// 信用卡到期日驗證
const validateExpiryDate = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
  
  const [month, year] = expiry.split('/').map(Number)
  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  
  if (month < 1 || month > 12) return false
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false
  
  return true
}

// 信用卡類型檢測
export const detectCardType = (number: string): string => {
  const num = number.replace(/\s/g, '')
  
  if (/^4/.test(num)) return 'visa'
  if (/^5[1-5]/.test(num)) return 'mastercard'
  if (/^3[47]/.test(num)) return 'amex'
  if (/^35(2[89]|[3-8][0-9])/.test(num)) return 'jcb'
  if (/^6(?:011|5[0-9]{2})/.test(num)) return 'discover'
  
  return 'unknown'
}

// 信用卡驗證 Schema
export const creditCardSchema = z.object({
  number: z
    .string()
    .min(1, '請輸入信用卡號')
    .transform(val => val.replace(/\s/g, ''))
    .refine(validateCreditCardNumber, {
      message: '請輸入有效的信用卡號'
    }),
  
  holder: z
    .string()
    .min(2, '持卡人姓名至少需要2個字元')
    .max(50, '持卡人姓名不能超過50個字元')
    .regex(/^[a-zA-Z\s]+$/, '持卡人姓名只能包含英文字母和空格'),
  
  expiry: z
    .string()
    .min(1, '請輸入到期日')
    .regex(/^\d{2}\/\d{2}$/, '請輸入正確的到期日格式 (MM/YY)')
    .refine(validateExpiryDate, {
      message: '請輸入有效的到期日'
    }),
  
  cvv: z
    .string()
    .min(3, 'CVV 至少需要3位數字')
    .max(4, 'CVV 最多4位數字')
    .regex(/^\d+$/, 'CVV 只能包含數字')
})

// LINE Pay 驗證 Schema
export const linePaySchema = z.object({
  phoneNumber: z
    .string()
    .optional()
    .refine(
      val => !val || /^09\d{8}$/.test(val), 
      { message: '請輸入有效的手機號碼格式 (09xxxxxxxx)' }
    ),
  
  agreementAccepted: z
    .boolean()
    .refine(val => val === true, {
      message: '請同意 LINE Pay 服務條款'
    })
})

// Apple Pay 驗證 Schema
export const applePaySchema = z.object({
  deviceSupported: z
    .boolean()
    .refine(val => val === true, {
      message: '您的設備不支援 Apple Pay'
    }),
  
  biometricEnabled: z
    .boolean()
    .refine(val => val === true, {
      message: '請啟用 Touch ID 或 Face ID'
    }),
  
  agreementAccepted: z
    .boolean()
    .refine(val => val === true, {
      message: '請同意 Apple Pay 服務條款'
    })
})

// 支付金額驗證 Schema
export const paymentAmountSchema = z.object({
  amount: z
    .number()
    .min(1, '支付金額必須大於 0')
    .max(100000, '單筆支付金額不能超過 $100,000')
    .refine(val => Number.isInteger(val * 100), {
      message: '金額只能精確到分'
    }),
  
  currency: z
    .string()
    .min(3)
    .max(3)
    .regex(/^[A-Z]{3}$/, '貨幣代碼必須是3位大寫字母')
    .default('TWD'),
  
  orderId: z
    .string()
    .min(1, '訂單編號不能為空')
    .max(50, '訂單編號不能超過50個字元')
})

// 通用支付驗證 Schema
export const paymentSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'LINE_PAY', 'APPLE_PAY', 'CASH'], {
    errorMap: () => ({ message: '請選擇支付方式' })
  }),
  
  amount: z.number().min(1, '支付金額必須大於 0'),
  
  orderId: z.string().min(1, '訂單編號不能為空'),
  
  customerId: z.string().optional(),
  
  metadata: z.record(z.any()).optional()
})

// 支付驗證錯誤類型
export interface PaymentValidationError {
  field: string
  code: string
  message: string
  value?: any
}

// 驗證結果類型
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: PaymentValidationError[]
}

// 驗證函數工廠
export const createPaymentValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): ValidationResult<T> => {
    try {
      const result = schema.parse(data)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: PaymentValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          code: err.code,
          message: err.message,
          value: err.path.reduce((obj, key) => obj?.[key], data)
        }))
        
        return {
          success: false,
          errors
        }
      }
      
      return {
        success: false,
        errors: [{
          field: 'unknown',
          code: 'VALIDATION_ERROR',
          message: '驗證過程中發生未知錯誤'
        }]
      }
    }
  }
}

// 預定義驗證器
export const validateCreditCard = createPaymentValidator(creditCardSchema)
export const validateLinePay = createPaymentValidator(linePaySchema)
export const validateApplePay = createPaymentValidator(applePaySchema)
export const validatePaymentAmount = createPaymentValidator(paymentAmountSchema)
export const validatePayment = createPaymentValidator(paymentSchema)

// 實用驗證函數
export const validateCardNumber = (number: string): boolean => {
  return validateCreditCardNumber(number.replace(/\s/g, ''))
}

export const validateCardExpiry = (expiry: string): boolean => {
  return validateExpiryDate(expiry)
}

export const validateCVV = (cvv: string, cardType?: string): boolean => {
  if (!/^\d+$/.test(cvv)) return false
  
  if (cardType === 'amex') {
    return cvv.length === 4
  }
  
  return cvv.length >= 3 && cvv.length <= 4
}

// 格式化函數
export const formatCardNumber = (value: string): string => {
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

export const formatExpiry = (value: string): string => {
  const v = value.replace(/\D/g, '')
  if (v.length >= 2) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}`
  }
  return v
}

export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 4)
}

// 安全性檢查
export const isSecurePaymentEnvironment = (): boolean => {
  if (typeof window === 'undefined') return true // SSR 環境
  
  const isHTTPS = window.location.protocol === 'https:'
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1'
  
  return isHTTPS || isLocalhost
}

export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `tx_${timestamp}_${random}`
}

// 支付方式特定驗證
export const paymentMethodValidators = {
  CREDIT_CARD: validateCreditCard,
  LINE_PAY: validateLinePay,
  APPLE_PAY: validateApplePay,
  CASH: () => ({ success: true, data: {} })
} as const

// 導出所有驗證相關類型和函數
export type CreditCardData = z.infer<typeof creditCardSchema>
export type LinePayData = z.infer<typeof linePaySchema>
export type ApplePayData = z.infer<typeof applePaySchema>
export type PaymentAmountData = z.infer<typeof paymentAmountSchema>
export type PaymentData = z.infer<typeof paymentSchema>