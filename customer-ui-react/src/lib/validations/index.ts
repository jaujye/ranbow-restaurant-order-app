// Authentication validations
export * from './auth'

// Order validations  
export * from './order'

// Menu validations
export * from './menu'

// Payment validations
export * from './payment'

// Common validation utilities
export const createFormValidator = <T>(schema: any) => {
  return {
    validate: (data: unknown): { success: true; data: T } | { success: false; errors: any } => {
      try {
        const result = schema.parse(data)
        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, errors: error.flatten() }
      }
    },
    
    validateField: (field: string, value: unknown) => {
      try {
        const fieldSchema = schema.shape[field]
        if (fieldSchema) {
          fieldSchema.parse(value)
          return { success: true, error: null }
        }
        return { success: true, error: null }
      } catch (error: any) {
        return { success: false, error: error.errors[0]?.message || '驗證失敗' }
      }
    }
  }
}