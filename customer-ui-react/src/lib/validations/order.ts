import { z } from 'zod'

// 桌號驗證
export const tableNumberSchema = z
  .string()
  .min(1, '請輸入桌號')
  .regex(/^[A-Z]?\d+$/, '請輸入有效的桌號格式 (例如: A1, B5, 12)')
  .max(10, '桌號不能超過10個字符')

// 特殊需求驗證
export const specialRequestsSchema = z
  .string()
  .max(200, '特殊需求不能超過200個字符')
  .optional()

// 付款方式驗證
export const paymentMethodSchema = z.enum(['CASH', 'CREDIT_CARD', 'LINE_PAY', 'APPLE_PAY'] as const, {
  errorMap: () => ({ message: '請選擇付款方式' })
})

// 數量驗證
export const quantitySchema = z
  .number()
  .min(1, '數量至少為1')
  .max(99, '數量不能超過99')
  .int('數量必須為整數')

// 購物車商品驗證
export const cartItemSchema = z.object({
  menuItemId: z.number().int().positive('無效的商品ID'),
  quantity: quantitySchema,
  specialRequests: specialRequestsSchema
})

export type CartItemFormData = z.infer<typeof cartItemSchema>

// 結帳表單驗證
export const checkoutSchema = z.object({
  tableNumber: tableNumberSchema,
  paymentMethod: paymentMethodSchema,
  specialRequests: specialRequestsSchema,
  items: z.array(cartItemSchema).min(1, '購物車不能為空')
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// 訂單搜尋驗證
export const orderSearchSchema = z.object({
  query: z.string().min(1, '請輸入搜尋關鍵字').optional(),
  status: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'ALL'] as const).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export type OrderSearchFormData = z.infer<typeof orderSearchSchema>

// 訂單評價驗證
export const orderReviewSchema = z.object({
  orderId: z.number().int().positive('無效的訂單ID'),
  rating: z.number().min(1, '評分至少為1').max(5, '評分最高為5').int('評分必須為整數'),
  comment: z.string().max(500, '評論不能超過500個字符').optional(),
  items: z.array(z.object({
    menuItemId: z.number().int().positive(),
    rating: z.number().min(1).max(5).int(),
    comment: z.string().max(200).optional()
  })).optional()
})

export type OrderReviewFormData = z.infer<typeof orderReviewSchema>

// 取消訂單驗證
export const cancelOrderSchema = z.object({
  orderId: z.number().int().positive('無效的訂單ID'),
  reason: z.string().min(1, '請說明取消原因').max(200, '取消原因不能超過200個字符')
})

export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>

// 客服反饋驗證
export const feedbackSchema = z.object({
  orderId: z.number().int().positive().optional(),
  category: z.enum(['service', 'food', 'delivery', 'payment', 'app', 'other'] as const, {
    errorMap: () => ({ message: '請選擇反饋類別' })
  }),
  subject: z.string().min(1, '請輸入主題').max(100, '主題不能超過100個字符'),
  message: z.string().min(10, '訊息至少需要10個字符').max(1000, '訊息不能超過1000個字符'),
  contact: z.object({
    name: z.string().min(1, '請輸入聯絡人姓名'),
    email: z.string().email('請輸入有效的Email'),
    phone: z.string().regex(/^09\d{8}$/, '請輸入有效的手機號碼').optional()
  })
})

export type FeedbackFormData = z.infer<typeof feedbackSchema>