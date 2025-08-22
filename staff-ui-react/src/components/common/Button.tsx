/**
 * 🔘 Button Component
 * Reusable button component with rainbow theme variants
 */

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonProps } from '@/types'

// 🎨 Button Variants
const buttonVariants = {
  primary: [
    'bg-primary text-white',
    'hover:bg-primary-600',
    'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:bg-primary-300',
    'shadow-rainbow'
  ],
  secondary: [
    'bg-secondary text-white',
    'hover:bg-secondary-600',
    'focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2',
    'disabled:bg-secondary-300'
  ],
  outline: [
    'border-2 border-primary text-primary bg-transparent',
    'hover:bg-primary hover:text-white',
    'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:border-primary-300 disabled:text-primary-300'
  ],
  ghost: [
    'text-primary bg-transparent',
    'hover:bg-primary-50',
    'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'disabled:text-primary-300'
  ],
  danger: [
    'bg-urgent text-white',
    'hover:bg-urgent-600',
    'focus:ring-2 focus:ring-urgent-500 focus:ring-offset-2',
    'disabled:bg-urgent-300'
  ]
} as const

// 📏 Button Sizes
const buttonSizes = {
  sm: ['px-3 py-1.5', 'text-caption', 'min-h-touch-sm'],
  md: ['px-4 py-2', 'text-body', 'min-h-touch-md'],
  lg: ['px-6 py-3', 'text-body-large', 'min-h-touch-lg']
} as const

// 🔘 Button Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className,
    children,
    ...props
  }, ref) => {
    // 🎨 Combine classes
    const buttonClasses = twMerge(
      clsx(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium',
        'rounded-staff',
        'border-0',
        'cursor-pointer',
        'transition-all duration-200',
        'focus:outline-none',
        'active:scale-95',
        
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-60',
        
        // Loading state
        loading && 'cursor-wait',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        className
      )
    )

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={buttonClasses}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button