import {
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

import { cn } from '@/lib/utils';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
  icon?: boolean;
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  (
    {
      className,
      variant = 'error',
      title,
      children,
      onDismiss,
      dismissible = false,
      icon = true,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg border p-4 text-sm transition-all duration-200';

    const variants = {
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const iconVariants = {
      error: XCircleIcon,
      warning: ExclamationTriangleIcon,
      info: InformationCircleIcon,
    };

    const IconComponent = iconVariants[variant];

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        role='alert'
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        {...props}
      >
        <div className='flex'>
          {icon ? <div className='flex-shrink-0'>
              <IconComponent className='h-5 w-5' aria-hidden='true' />
            </div> : null}
          <div className={cn('flex-1', icon && 'ml-3')}>
            {title ? <h3 className='text-sm font-medium mb-1'>{title}</h3> : null}
            <div className='text-sm'>{children}</div>
          </div>
          {dismissible && onDismiss ? <div className='ml-auto pl-3'>
              <div className='-mx-1.5 -my-1.5'>
                <button
                  type='button'
                  onClick={onDismiss}
                  className={cn(
                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600',
                    variant === 'warning' &&
                      'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                    variant === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                  )}
                  aria-label='Dismiss'
                >
                  <XCircleIcon className='h-4 w-4' />
                </button>
              </div>
            </div> : null}
        </div>
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';

export { ErrorMessage };
