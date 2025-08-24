import React, { forwardRef } from 'react'
import { cn, variants } from '@/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants.buttonVariant
  size?: keyof typeof variants.buttonSize
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  rainbow?: boolean
  // Enhanced accessibility props
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  tooltip?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rainbow = false,
      children,
      disabled,
      tooltip,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-expanded': ariaExpanded,
      'aria-pressed': ariaPressed,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn focus-visible'
    const variantClasses = rainbow ? variants.buttonVariant.rainbow : variants.buttonVariant[variant]
    const sizeClasses = variants.buttonSize[size]
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses,
          sizeClasses,
          widthClasses,
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescribedby || (tooltip ? `${props.id || 'btn'}-tooltip` : undefined)}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-busy={loading}
        title={tooltip}
        {...props}
      >
        {loading && (
          <div className="loading-spinner" aria-hidden="true" />
        )}
        
        {!loading && leftIcon && (
          <span className="flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className={cn('flex items-center justify-center', loading && 'ml-2')}>
          {loading ? (loadingText || '載入中...') : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 快速按鈕變體
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
)

export const AccentButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="accent" {...props} />
)

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
)

export const RainbowButton = (props: Omit<ButtonProps, 'rainbow'>) => (
  <Button rainbow {...props} />
)