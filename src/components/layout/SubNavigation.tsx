"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationSubItem } from '@/lib/navigation'

export interface SubNavigationProps {
  items: NavigationSubItem[]
  className?: string
}

export const SubNavigation: React.FC<SubNavigationProps> = ({ 
  items, 
  className 
}) => {
  const pathname = usePathname()

  return (
    <nav className={cn('flex space-x-1 bg-surface border-b border-surface', className)}>
      {items.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-3 text-sm font-medium rounded-t-lg transition-colors relative',
              isActive
                ? 'text-primary bg-background border-b-2 border-primary'
                : 'text-secondary-text hover:text-primary-text hover:bg-accent'
            )}
          >
            <div className="flex items-center space-x-2">
              <span>{item.title}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </nav>
  )
} 