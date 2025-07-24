import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ 
    className, 
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const baseClasses = 'animate-spin rounded-full border-2 border-accent'
    
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    }
    
    const variants = {
      default: 'border-t-secondary-text',
      primary: 'border-t-primary',
      secondary: 'border-t-secondary'
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          variants[variant],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'

export { Spinner } 