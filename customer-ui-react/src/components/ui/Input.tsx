import React, { forwardRef, useState } from 'react'
import { cn, variants } from '@/utils/cn'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: keyof typeof variants.inputSize
  error?: boolean
  errorMessage?: string
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  fullWidth?: boolean
  showPasswordToggle?: boolean
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
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
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
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-disabled">{leftIcon}</span>
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
                  className="text-text-disabled hover:text-text-primary focus:outline-none focus:text-text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              )}
              {!showPasswordToggle && rightIcon && (
                <span className="text-text-disabled">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error Message */}
        {(helperText || errorMessage) && (
          <p 
            className={cn(
              'mt-2 text-sm',
              error ? 'text-error-500' : 'text-text-disabled'
            )}
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