import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  showFirstLast?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      showPageNumbers = true,
      showFirstLast = true,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center space-x-1', className)}
        {...props}
      >
        {showFirstLast ? <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn(
              'inline-flex items-center rounded-md border border-border bg-surface font-medium text-secondary-text hover:bg-accent hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed',
              sizes[size]
            )}
          >
            <ChevronLeftIcon className='h-4 w-4' />
            <ChevronLeftIcon className='h-4 w-4 -ml-1' />
          </button> : null}

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'inline-flex items-center rounded-md border border-border bg-surface font-medium text-secondary-text hover:bg-accent hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed',
            sizes[size]
          )}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </button>

        {showPageNumbers ? visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className={cn('inline-flex items-center text-secondary-text', sizes[size])}>
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    'inline-flex items-center rounded-md border font-medium',
                    currentPage === page
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-secondary-text hover:bg-accent hover:text-primary-text',
                    sizes[size]
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          )) : null}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'inline-flex items-center rounded-md border border-border bg-surface font-medium text-secondary-text hover:bg-accent hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed',
            sizes[size]
          )}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </button>

        {showFirstLast ? <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              'inline-flex items-center rounded-md border border-border bg-surface font-medium text-secondary-text hover:bg-accent hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed',
              sizes[size]
            )}
          >
            <ChevronRightIcon className='h-4 w-4' />
            <ChevronRightIcon className='h-4 w-4 -ml-1' />
          </button> : null}
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination };
