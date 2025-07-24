"use client"
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header, HeaderProps } from './Header'
import { useAuth } from '@/lib/auth-context'

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  headerProps?: Partial<HeaderProps>
  children: React.ReactNode
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ 
    className, 
    headerProps,
    children,
    ...props 
  }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { loading } = useAuth()

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false)
    }

    // Routes that should not show the dashboard layout
    const authRoutes = ['/signin', '/dev-bypass', '/test-auth', '/test-login', '/test-integration', '/test-summary']
    const isAuthRoute = authRoutes.includes(pathname)

    // Show auth pages without dashboard layout
    if (isAuthRoute) {
      return (
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      )
    }

    // Don't check loading state for non-auth routes to prevent hydration mismatch
    // The auth context will handle its own loading state

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-screen bg-background text-primary-text',
          className
        )}
        {...props}
      >
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          'fixed lg:relative z-50 transition-all duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <Sidebar onClose={closeMobileMenu} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
          {/* Header */}
          <Header 
            {...headerProps} 
            onMenuToggle={toggleMobileMenu}
          />

          {/* Content */}
          <main className="flex-1 overflow-auto p-2 lg:p-4 page-transition">
            {children}
          </main>
        </div>
      </div>
    )
  }
)

Layout.displayName = 'Layout'

export { Layout } 