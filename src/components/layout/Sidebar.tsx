"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  ChevronDownIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { NavigationItem, navigationConfig } from '@/lib/navigation'

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ 
    className, 
    onClose,
    ...props 
  }, ref) => {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setExpandedItems(newExpanded)
    }

    const handleNavigation = () => {
      // Close mobile menu when navigating
      if (onClose) {
        onClose()
      }
    }

    const isItemActive = (item: NavigationItem): boolean => {
      if (item.href === pathname) return true
      if (item.subItems) {
        return item.subItems.some(subItem => subItem.href === pathname)
      }
      return false
    }

    const isSubItemActive = (href: string): boolean => {
      return pathname === href
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-surface border-r border-surface h-full w-64 lg:w-64',
          className
        )}
        {...props}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-4 border-b border-surface flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-primary-text font-semibold text-lg">GymPro</span>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-accent text-secondary-text hover:text-primary-text transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationConfig.map((item) => {
            const isActive = isItemActive(item)
            const isExpanded = expandedItems.has(item.id)
            const Icon = item.icon

            return (
              <div key={item.id}>
                {item.expandable ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-secondary-text hover:bg-accent hover:text-primary-text'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDownIcon 
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded ? 'rotate-180' : ''
                        )} 
                      />
                    </button>
                    
                    {/* Sub Items */}
                    {isExpanded && item.subItems && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleNavigation}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isSubItemActive(subItem.href)
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-secondary-text hover:bg-accent hover:text-primary-text'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <SubIcon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </div>
                                {subItem.badge && (
                                  <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleNavigation}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-secondary-text hover:bg-accent hover:text-primary-text'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-surface flex-shrink-0">
          <button
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-secondary-text hover:bg-accent hover:text-primary-text'
            )}
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'

export { Sidebar } 