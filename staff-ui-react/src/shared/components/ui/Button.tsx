import React from 'react';
import { clsx } from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 shadow-primary',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:bg-accent-700 active:bg-accent-800 disabled:bg-accent-300 shadow-accent',
  success: 'bg-success-600 text-white hover:bg-success-700 focus:bg-success-700 active:bg-success-800 disabled:bg-success-300 shadow-success',
  warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:bg-warning-700 active:bg-warning-800 disabled:bg-warning-300 shadow-warning',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:bg-danger-700 active:bg-danger-800 disabled:bg-danger-300 shadow-danger',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800',
  link: 'text-primary-600 hover:text-primary-700 focus:text-primary-700 active:text-primary-800 underline-offset-4 hover:underline dark:text-primary-400',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed touch-manipulation';
  
  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled || loading,
      'shadow-sm hover:shadow-md focus:shadow-md': variant !== 'ghost' && variant !== 'link',
    },
    className
  );

  const iconElement = loading ? (
    <LoadingSpinner 
      size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} 
      color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'} 
    />
  ) : icon;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={clsx('flex-shrink-0', children && 'mr-2')}>
          {iconElement}
        </span>
      )}
      
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
      
      {iconElement && iconPosition === 'right' && (
        <span className={clsx('flex-shrink-0', children && 'ml-2')}>
          {iconElement}
        </span>
      )}
    </button>
  );
}

// Button group component for related actions
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({ 
  children, 
  className, 
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  return (
    <div
      className={clsx(
        'inline-flex',
        {
          'flex-row': orientation === 'horizontal',
          'flex-col': orientation === 'vertical',
        },
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}

// Icon button component
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  tooltip?: string;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button
      className={clsx('p-2 aspect-square', className)}
      {...props}
    >
      {icon}
    </Button>
  );
}

// Floating action button
export interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6',
};

export function FAB({ 
  position = 'bottom-right', 
  className, 
  children,
  ...props 
}: FABProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      className={clsx(
        'rounded-full shadow-lg hover:shadow-xl z-50',
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}