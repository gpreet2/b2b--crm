import React from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  dismissible?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default',
    title,
    children,
    onClose,
    dismissible = false,
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-lg border p-4'
    
    const variants = {
      default: 'bg-accent border-surface text-secondary-text',
      primary: 'bg-primary/10 border-primary/20 text-primary',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      danger: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex">
          <div className="flex-1">
            {title && (
              <h4 className="text-sm font-medium mb-1">
                {title}
              </h4>
            )}
            <div className="text-sm">
              {children}
            </div>
          </div>
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 text-muted hover:text-secondary-text focus:outline-none focus:text-secondary-text"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export { Alert } 