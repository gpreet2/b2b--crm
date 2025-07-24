import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { 
  BellIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
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
          'bg-background border-b border-border px-3 sm:px-4 h-18 flex items-center',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-accent text-secondary-text hover:text-primary-text transition-all duration-200"
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

          {/* Center Section - Back2Back Logo */}
          <div className="hidden md:flex flex-1 justify-center">
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-lg tracking-wider text-shadow-lg">
              Back2Back
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-accent text-secondary-text hover:text-primary-text transition-all duration-200">
              <BellIcon className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-light text-primary-text">{user.name}</p>
                    <p className="text-xs text-secondary-text font-light">{user.email}</p>
                  </div>
                  <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-accent transition-all duration-200">
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