"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationSubItem } from '@/lib/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export interface SubNavigationProps {
  items: NavigationSubItem[]
  className?: string
}

export const SubNavigation: React.FC<SubNavigationProps> = ({ 
  items, 
  className 
}) => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const activeItem = items.find(item => item.href === pathname)

  return (
    <div className={cn('bg-surface border-b border-surface', className)}>
      {/* Mobile Dropdown */}
      <div className="block sm:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-primary-text bg-surface hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-2">
            {activeItem?.icon && <activeItem.icon className="h-4 w-4" />}
            <span>{activeItem?.title || 'Select Section'}</span>
            {activeItem?.badge && (
              <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                {activeItem.badge}
              </span>
            )}
          </div>
          <ChevronDownIcon 
            className={cn(
              'h-4 w-4 transition-transform',
              isMobileMenuOpen ? 'rotate-180' : ''
            )} 
          />
        </button>
        
        {isMobileMenuOpen && (
          <div className="border-t border-surface bg-accent">
            {items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-b border-surface last:border-b-0',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-secondary-text hover:text-primary-text hover:bg-surface'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Horizontal Navigation */}
      <nav className="hidden sm:flex space-x-1 px-4">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors relative',
                isActive
                  ? 'text-primary bg-background border-b-2 border-primary'
                  : 'text-secondary-text hover:text-primary-text hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 