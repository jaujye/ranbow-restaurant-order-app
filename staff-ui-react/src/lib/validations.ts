/**
 * 🔐 Staff Authentication Validation Schemas
 * Zod validation schemas for staff authentication forms
 */

import { z } from 'zod'

// 📝 Common Validation Rules
export const employeeNumberSchema = z.string()
  .min(3, '員工編號最少3個字符')
  .max(20, '員工編號最多20個字符')
  .regex(/^[A-Z0-9]+$/, '員工編號只能包含大寫字母和數字')

export const emailSchema = z.string()
  .email('請輸入有效的電子郵件地址')
  .optional()
  .or(z.literal(''))

export const passwordSchema = z.string()
  .min(8, '密碼最少8個字符')
  .max(50, '密碼最多50個字符')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密碼必須包含大小寫字母和數字')

export const pinSchema = z.string()
  .min(4, 'PIN最少4位數字')
  .max(6, 'PIN最多6位數字')
  .regex(/^\d+$/, 'PIN只能包含數字')

// 🔐 Staff Login Validation
export const staffLoginSchema = z.object({
  loginId: z.string()
    .min(1, '請輸入員工編號或電子郵件')
    .refine((val) => {
      // Check if it's email or employee number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      const isEmployeeNumber = /^[A-Z0-9]{3,20}$/.test(val)
      return isEmail || isEmployeeNumber
    }, '請輸入有效的員工編號或電子郵件地址'),
  
  password: passwordSchema,
  
  rememberMe: z.boolean().optional().default(false),
  
  deviceInfo: z.object({
    deviceId: z.string().min(1, '設備ID不能為空'),
    deviceType: z.enum(['TABLET', 'PHONE', 'POS', 'DESKTOP']),
    appVersion: z.string().min(1, '應用版本不能為空'),
    platform: z.string().optional()
  })
})

// 🔄 Quick Switch Validation
export const quickSwitchSchema = z.object({
  currentStaffId: z.string()
    .min(1, '當前員工ID不能為空')
    .uuid('無效的員工ID格式'),
  
  targetStaffId: z.string()
    .min(1, '目標員工ID不能為空')
    .uuid('無效的員工ID格式'),
  
  pin: pinSchema
}).refine((data) => data.currentStaffId !== data.targetStaffId, {
  message: '不能切換到同一員工賬戶',
  path: ['targetStaffId']
})

// 📱 PIN Login Validation
export const pinLoginSchema = z.object({
  employeeNumber: employeeNumberSchema,
  pin: pinSchema,
  deviceInfo: z.object({
    deviceId: z.string().min(1, '設備ID不能為空'),
    deviceType: z.enum(['TABLET', 'PHONE', 'POS', 'DESKTOP']),
    appVersion: z.string().min(1, '應用版本不能為空'),
    platform: z.string().optional()
  })
})

// 🔄 Token Refresh Validation
export const tokenRefreshSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token不能為空'),
  deviceId: z.string().optional()
})

// 👤 Staff Profile Update Validation
export const staffProfileUpdateSchema = z.object({
  name: z.string()
    .min(2, '姓名最少2個字符')
    .max(50, '姓名最多50個字符')
    .optional(),
  
  email: emailSchema,
  
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, '請輸入有效的電話號碼')
    .optional()
    .or(z.literal('')),
  
  avatar: z.string()
    .url('請輸入有效的頭像URL')
    .optional()
    .or(z.literal('')),
  
  quickSwitchEnabled: z.boolean().optional(),
  
  notifications: z.object({
    sound: z.boolean(),
    vibration: z.boolean(),
    desktop: z.boolean()
  }).optional()
})

// 🔒 Change Password Validation
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, '請輸入當前密碼'),
  
  newPassword: passwordSchema,
  
  confirmPassword: z.string()
    .min(1, '請確認新密碼')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '新密碼和確認密碼不一致',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: '新密碼不能與當前密碼相同',
  path: ['newPassword']
})

// 📝 Set PIN Validation
export const setPinSchema = z.object({
  pin: pinSchema,
  confirmPin: pinSchema
}).refine((data) => data.pin === data.confirmPin, {
  message: 'PIN和確認PIN不一致',
  path: ['confirmPin']
})

// 🔧 Device Registration Validation
export const deviceRegistrationSchema = z.object({
  deviceName: z.string()
    .min(1, '設備名稱不能為空')
    .max(50, '設備名稱最多50個字符'),
  
  deviceType: z.enum(['TABLET', 'PHONE', 'POS', 'DESKTOP']),
  
  location: z.string()
    .min(1, '設備位置不能為空')
    .max(100, '設備位置最多100個字符')
    .optional(),
  
  autoLogin: z.boolean().default(false),
  
  sessionTimeout: z.number()
    .min(15, '會話超時最少15分鐘')
    .max(480, '會話超時最多8小時')
    .default(30)
})

// 📊 Performance Report Request Validation
export const performanceReportSchema = z.object({
  staffId: z.string()
    .uuid('無效的員工ID格式')
    .optional(),
  
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  
  startDate: z.date(),
  
  endDate: z.date()
}).refine((data) => data.endDate >= data.startDate, {
  message: '結束日期不能早於開始日期',
  path: ['endDate']
})

// 🔔 Notification Settings Validation
export const notificationSettingsSchema = z.object({
  newOrderSound: z.boolean(),
  urgentOrderSound: z.boolean(),
  completedOrderSound: z.boolean(),
  systemNotificationSound: z.boolean(),
  vibrationEnabled: z.boolean(),
  desktopNotifications: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的時間格式 (HH:MM)'),
    endTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的時間格式 (HH:MM)')
  }).optional()
})

// 📝 Work Shift Management Validation
export const workShiftSchema = z.object({
  shiftDate: z.date(),
  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的開始時間'),
  endTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效的結束時間'),
  breakMinutes: z.number()
    .min(0, '休息時間不能為負數')
    .max(240, '休息時間最多4小時')
    .default(0)
})

// 🎯 Type Exports for Form Data
export type StaffLoginFormData = z.infer<typeof staffLoginSchema>
export type QuickSwitchFormData = z.infer<typeof quickSwitchSchema>
export type PinLoginFormData = z.infer<typeof pinLoginSchema>
export type TokenRefreshFormData = z.infer<typeof tokenRefreshSchema>
export type StaffProfileUpdateFormData = z.infer<typeof staffProfileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type SetPinFormData = z.infer<typeof setPinSchema>
export type DeviceRegistrationFormData = z.infer<typeof deviceRegistrationSchema>
export type PerformanceReportFormData = z.infer<typeof performanceReportSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>
export type WorkShiftFormData = z.infer<typeof workShiftSchema>

// 🔍 Validation Helper Functions
export const validateEmployeeNumber = (value: string): boolean => {
  return employeeNumberSchema.safeParse(value).success
}

export const validateEmail = (value: string): boolean => {
  return emailSchema.safeParse(value).success
}

export const validatePassword = (value: string): boolean => {
  return passwordSchema.safeParse(value).success
}

export const validatePin = (value: string): boolean => {
  return pinSchema.safeParse(value).success
}

// 📋 Form Validation Messages
export const ValidationMessages = {
  REQUIRED: '此欄位為必填',
  INVALID_FORMAT: '格式無效',
  INVALID_EMAIL: '請輸入有效的電子郵件地址',
  INVALID_EMPLOYEE_NUMBER: '員工編號格式無效',
  WEAK_PASSWORD: '密碼強度不足，需包含大小寫字母和數字',
  INVALID_PIN: 'PIN格式無效，只能包含4-6位數字',
  PASSWORDS_NOT_MATCH: '密碼和確認密碼不一致',
  PINS_NOT_MATCH: 'PIN和確認PIN不一致',
  DEVICE_ID_REQUIRED: '設備ID為必填項',
  SAME_STAFF_SWITCH: '不能切換到同一員工賬戶',
  INVALID_TIME_FORMAT: '時間格式無效，請使用 HH:MM 格式',
  END_DATE_BEFORE_START: '結束日期不能早於開始日期'
} as const

// 🎨 UI Field Configuration
export const FormFieldConfig = {
  employeeNumber: {
    placeholder: '請輸入員工編號 (例: EMP001)',
    maxLength: 20,
    autoComplete: 'username',
    inputMode: 'text' as const
  },
  email: {
    placeholder: '請輸入電子郵件地址',
    maxLength: 255,
    autoComplete: 'email',
    inputMode: 'email' as const
  },
  password: {
    placeholder: '請輸入密碼',
    maxLength: 50,
    autoComplete: 'current-password',
    inputMode: 'text' as const
  },
  pin: {
    placeholder: '請輸入4-6位PIN',
    maxLength: 6,
    autoComplete: 'off',
    inputMode: 'numeric' as const
  },
  phone: {
    placeholder: '請輸入電話號碼',
    maxLength: 20,
    autoComplete: 'tel',
    inputMode: 'tel' as const
  }
} as const