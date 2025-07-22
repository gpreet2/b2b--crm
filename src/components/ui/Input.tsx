import React, { useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerClassName,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-light text-primary-text mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-primary">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'block w-full rounded-xl border-0 px-4 py-3 text-sm placeholder-secondary-text shadow-sm bg-surface-light/50 text-primary-text font-light transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-light',
              'disabled:bg-accent disabled:text-muted disabled:cursor-not-allowed',
              error && 'ring-2 ring-danger/20',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-primary">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-danger font-light">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-secondary-text font-light">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 