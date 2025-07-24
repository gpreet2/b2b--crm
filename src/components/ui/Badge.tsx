import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full'
    
    const variants = {
      default: 'bg-accent text-secondary-text border border-border-light',
      primary: 'bg-primary text-white border border-primary-dark',
      secondary: 'bg-secondary text-white border border-secondary-dark',
      success: 'bg-success text-black border border-success-dark',
      warning: 'bg-warning text-black border border-warning-dark',
      danger: 'bg-danger text-white border border-danger-dark',
      info: 'bg-info text-white border border-info-dark'
    }
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm'
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge } 