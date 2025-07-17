import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHomeIcon?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    className, 
    items,
    separator = <ChevronRightIcon className="h-4 w-4 text-muted" />,
    showHomeIcon = false,
    ...props 
  }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-2', className)}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center text-sm font-medium transition-colors',
                    index === items.length - 1
                      ? 'text-primary-text cursor-default'
                      : 'text-secondary-text hover:text-primary-text'
                  )}
                  {...(index === items.length - 1 && { 'aria-current': 'page' })}
                >
                  {showHomeIcon && index === 0 && !item.icon && (
                    <HomeIcon className="h-4 w-4 mr-1" />
                  )}
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'flex items-center text-sm font-medium',
                    index === items.length - 1
                      ? 'text-primary-text'
                      : 'text-secondary-text'
                  )}
                  {...(index === items.length - 1 && { 'aria-current': 'page' })}
                >
                  {showHomeIcon && index === 0 && !item.icon && (
                    <HomeIcon className="h-4 w-4 mr-1" />
                  )}
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

export { Breadcrumb } 