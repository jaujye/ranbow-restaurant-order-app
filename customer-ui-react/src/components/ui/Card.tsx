import React, { forwardRef } from 'react'
import { cn, variants } from '@/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants.cardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rainbow?: boolean
  glass?: boolean
  clickable?: boolean
  loading?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      rainbow = false,
      glass = false,
      clickable = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = rainbow ? variants.cardVariant.rainbow : variants.cardVariant[variant]
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }[padding]
    
    const interactiveClasses = clickable ? 'cursor-pointer select-none' : ''
    const glassClasses = glass ? 'glass-morphism' : ''
    const loadingClasses = loading ? 'animate-pulse' : ''

    if (rainbow) {
      return (
        <div
          ref={ref}
          className={cn(
            baseClasses,
            interactiveClasses,
            loadingClasses,
            className
          )}
          {...props}
        >
          <div className={cn('card-rainbow-content', paddingClasses, glassClasses)}>
            {loading ? <CardSkeleton /> : children}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          paddingClasses,
          interactiveClasses,
          glassClasses,
          loadingClasses,
          className
        )}
        {...props}
      >
        {loading ? <CardSkeleton /> : children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card 子組件
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-4 pb-2', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 pt-0', className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-4 pt-2', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// 載入骨架屏
export const CardSkeleton = () => (
  <div className="space-y-3">
    <div className="loading-skeleton h-4 w-3/4" />
    <div className="loading-skeleton h-4 w-1/2" />
    <div className="loading-skeleton h-20 w-full" />
    <div className="flex space-x-2">
      <div className="loading-skeleton h-8 w-20" />
      <div className="loading-skeleton h-8 w-16" />
    </div>
  </div>
)

// 預設變體
export const RainbowCard = (props: Omit<CardProps, 'rainbow'>) => (
  <Card rainbow {...props} />
)

export const GlassCard = (props: Omit<CardProps, 'glass'>) => (
  <Card glass {...props} />
)

export const ClickableCard = (props: Omit<CardProps, 'clickable'>) => (
  <Card clickable {...props} />
)