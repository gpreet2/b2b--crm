import React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, max = 100, size = 'md', variant = 'default', showLabel = false, ...props },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const baseClasses = 'w-full bg-accent rounded-full overflow-hidden border border-border-light';

    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    const variants = {
      default: 'bg-primary',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    };

    return (
      <div className='w-full' {...props}>
        <div ref={ref} className={cn(baseClasses, sizes[size], className)}>
          <div
            className={cn('h-full transition-all duration-300 ease-out', variants[variant])}
            style={{ width: `${percentage}%` }}
            role='progressbar'
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showLabel ? <div className='mt-1 text-sm text-secondary-text text-center'>
            {Math.round(percentage)}%
          </div> : null}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
