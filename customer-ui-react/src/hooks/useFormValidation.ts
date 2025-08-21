import { useForm, FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'

interface UseFormValidationProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ZodSchema<T>
}

interface UseFormValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean
  submitError: string | null
  setSubmitError: (error: string | null) => void
}

export function useFormValidation<T extends FieldValues>({
  schema,
  ...formProps
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const form = useForm<T>({
    ...formProps,
    resolver: zodResolver(schema),
    mode: formProps.mode || 'onChange'
  })

  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const isSubmitting = form.formState.isSubmitting

  // Clear submit error when form values change
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (submitError) {
        setSubmitError(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, submitError])

  return {
    ...form,
    isSubmitting,
    submitError,
    setSubmitError
  }
}

// Utility hook for field-level validation
export function useFieldValidation<T extends FieldValues>(
  schema: ZodSchema<T>,
  fieldName: keyof T,
  value: any
) {
  const [error, setError] = React.useState<string | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)

  const validate = React.useCallback(async (val: any) => {
    setIsValidating(true)
    try {
      // Extract field schema and validate
      const fieldSchema = (schema as any).shape[fieldName]
      if (fieldSchema) {
        await fieldSchema.parseAsync(val)
        setError(null)
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || '驗證失敗'
      setError(message)
    } finally {
      setIsValidating(false)
    }
  }, [schema, fieldName])

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      validate(value)
    }
  }, [value, validate])

  return {
    error,
    isValidating,
    validate
  }
}

import React from 'react'