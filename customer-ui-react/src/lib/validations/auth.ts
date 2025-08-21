import { z } from 'zod'

// 基本驗證規則
export const emailSchema = z
  .string()
  .min(1, '請輸入Email')
  .email('請輸入有效的Email格式')

export const passwordSchema = z
  .string()
  .min(6, '密碼至少需要6個字符')
  .max(50, '密碼不能超過50個字符')

export const phoneSchema = z
  .string()
  .min(1, '請輸入手機號碼')
  .regex(/^09\d{8}$/, '請輸入有效的台灣手機號碼格式 (09xxxxxxxx)')

export const nameSchema = z
  .string()
  .min(1, '請輸入姓名')
  .min(2, '姓名至少需要2個字符')
  .max(20, '姓名不能超過20個字符')

// 登入表單驗證
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '請輸入密碼'),
  rememberMe: z.boolean().optional()
})

export type LoginFormData = z.infer<typeof loginSchema>

// 註冊表單驗證
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: '請同意服務條款和隱私政策'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼確認不一致",
  path: ["confirmPassword"],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// 忘記密碼表單驗證
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// 重置密碼表單驗證
export const resetPasswordSchema = z.object({
  token: z.string().min(1, '驗證碼不能為空'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "密碼確認不一致",
  path: ["confirmPassword"],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// 修改密碼表單驗證
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '請輸入目前密碼'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "密碼確認不一致",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "新密碼不能與目前密碼相同",
  path: ["newPassword"],
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// 個人資料編輯表單驗證
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema
})

export type ProfileFormData = z.infer<typeof profileSchema>