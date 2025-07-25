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
    const { user, loading } = useAuth()

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false)
    }

    // Check for development mode bypass
    const isDevBypass = process.env.NEXT_PUBLIC_DEV_MODE_BYPASS_AUTH === 'true'

    // Routes that should not show the dashboard layout
    const noLayoutRoutes = ['/signin', '/invite/accept', '/dev-bypass', '/test-connection', '/test-integration', '/test-summary']
    const isNoLayoutRoute = noLayoutRoutes.includes(pathname) || pathname.startsWith('/invite/')

    // Show pages without dashboard layout
    if (isNoLayoutRoute) {
      return (
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      )
    }

    // No auth check needed - using mock auth for now
    // Authentication will be handled by the new auth provider

    // Show dashboard layout for authenticated users or dev bypass
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