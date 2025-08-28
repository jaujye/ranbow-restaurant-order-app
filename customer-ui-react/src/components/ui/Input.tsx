import React, { forwardRef, useState } from 'react'
import { cn, variants } from '@/utils/cn'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: keyof typeof variants.inputSize
  error?: boolean
  errorMessage?: string
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  fullWidth?: boolean
  showPasswordToggle?: boolean
  // Enhanced accessibility props
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
  'aria-label'?: string
  srOnlyLabel?: string // for screen reader only labels
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = 'md',
      error = false,
      errorMessage,
      label,
      leftIcon,
      rightIcon,
      helperText,
      fullWidth = false,
      showPasswordToggle = false,
      type = 'text',
      id,
      srOnlyLabel,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    
    // Build aria-describedby attribute
    const describedByIds = []
    if (helperText) describedByIds.push(helperId)
    if (errorMessage && error) describedByIds.push(errorId)
    if (ariaDescribedby) describedByIds.push(ariaDescribedby)
    const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined
    
    const baseClasses = 'input'
    const sizeClasses = variants.inputSize[size]
    const errorClasses = error ? 'input-error' : ''
    const focusClasses = isFocused ? 'ring-2 ring-primary-500 border-transparent' : ''
    const widthClasses = fullWidth ? 'w-full' : ''
    
    // 調整padding來容納圖標
    const paddingClasses = cn(
      leftIcon && 'pl-10',
      (rightIcon || showPasswordToggle) && 'pr-10'
    )

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Screen reader only label */}
        {srOnlyLabel && (
          <label 
            htmlFor={inputId}
            className="sr-only"
          >
            {srOnlyLabel}
            {props.required && ' (必填)'}
          </label>
        )}
        
        {/* Visible Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1" aria-label="必填">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-disabled" aria-hidden="true">{leftIcon}</span>
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              baseClasses,
              sizeClasses,
              errorClasses,
              focusClasses,
              widthClasses,
              paddingClasses,
              className
            )}
            aria-describedby={describedBy}
            aria-invalid={ariaInvalid ?? error}
            aria-required={ariaRequired ?? props.required}
            aria-label={ariaLabel || (srOnlyLabel && !label ? srOnlyLabel : undefined)}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && (
                <button
                  type="button"
                  className="text-text-disabled hover:text-text-primary focus:outline-none focus:text-text-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                  aria-pressed={showPassword}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              )}
              {!showPasswordToggle && rightIcon && (
                <span className="text-text-disabled" aria-hidden="true">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error Message */}
        {(helperText || errorMessage) && (
          <p 
            id={error && errorMessage ? errorId : (helperText ? helperId : undefined)}
            className={cn(
              'mt-2 text-sm',
              error ? 'text-error-500' : 'text-text-disabled'
            )}
            role={error ? 'alert' : undefined}
            aria-live={error ? 'polite' : undefined}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// 特殊輸入類型組件
export const PasswordInput = (props: Omit<InputProps, 'type' | 'showPasswordToggle'>) => (
  <Input type="password" showPasswordToggle {...props} />
)

export const EmailInput = (props: Omit<InputProps, 'type'>) => (
  <Input type="email" {...props} />
)

export const PhoneInput = (props: Omit<InputProps, 'type'>) => (
  <Input type="tel" {...props} />
)

export const SearchInput = (props: Omit<InputProps, 'type'>) => (
  <Input type="search" {...props} />
)