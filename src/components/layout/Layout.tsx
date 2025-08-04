'use client';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Header, HeaderProps } from './Header';
import { Sidebar } from './Sidebar';

export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  headerProps?: Partial<HeaderProps>;
  children: React.ReactNode;
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, headerProps, children, ...props }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn('flex h-screen bg-background text-primary-text', className)}
        {...props}
      >
        {/* Mobile Overlay */}
        {isMobileMenuOpen ? <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200'
            onClick={closeMobileMenu}
          /> : null}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed lg:relative z-50 transition-all duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <Sidebar onClose={closeMobileMenu} />
        </div>

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col overflow-hidden w-full lg:w-auto'>
          {/* Header */}
          <Header {...headerProps} onMenuToggle={toggleMobileMenu} />

          {/* Content */}
          <main className='flex-1 overflow-auto p-2 lg:p-4 page-transition'>{children}</main>
        </div>
      </div>
    );
  }
);

Layout.displayName = 'Layout';

export { Layout };
