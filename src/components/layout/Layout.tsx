import React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Header, HeaderProps } from './Header'

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
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-screen bg-background text-primary-text',
          className
        )}
        {...props}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header {...headerProps} />

          {/* Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }
)

Layout.displayName = 'Layout'

export { Layout } 