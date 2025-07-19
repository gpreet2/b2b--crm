import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { 
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/Breadcrumb'

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  breadcrumbs?: BreadcrumbItem[]
  onMenuToggle?: () => void

  user?: {
    name: string
    email: string
    avatar?: string
  }
  notifications?: number
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ 
    className, 
    breadcrumbs,
    onMenuToggle,
    user,
    notifications = 0,
    ...props 
  }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'bg-surface border-b border-surface px-3 sm:px-4 py-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md hover:bg-accent text-secondary-text hover:text-primary-text transition-colors"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden sm:block">
                <Breadcrumb items={breadcrumbs} />
              </div>
            )}
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <Input
              placeholder="Search..."
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              className="bg-accent border-surface"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-md hover:bg-accent text-secondary-text hover:text-primary-text transition-colors">
              <BellIcon className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-primary-text">{user.name}</p>
                    <p className="text-xs text-secondary-text">{user.email}</p>
                  </div>
                  <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-secondary-text" />
                    )}
                  </button>
                </div>
              ) : (
                <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <Input
            placeholder="Search..."
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            className="bg-accent border-surface"
          />
        </div>

        {/* Mobile Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mt-3 sm:hidden">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
      </header>
    )
  }
)

Header.displayName = 'Header'

export { Header } 