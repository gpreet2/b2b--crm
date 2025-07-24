"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  ChevronDownIcon,
  Cog6ToothIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
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
          'flex flex-col bg-surface border-r border-border h-full w-56 lg:w-56',
          className
        )}
        {...props}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-light text-sm">G</span>
            </div>
            <span className="text-primary-text font-light text-lg tracking-wide">Fitness</span>
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
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                        'w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200',
                        isActive
                          ? 'bg-accent text-primary-text border border-border-light'
                          : 'text-secondary-text hover:bg-accent hover:text-primary-text'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-light text-sm">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full font-light">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDownIcon 
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded ? 'rotate-180' : ''
                        )} 
                      />
                    </button>
                    
                    {/* Sub Items */}
                    {isExpanded && item.subItems && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleNavigation}
                              className={cn(
                                'block px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                                isSubItemActive(subItem.href)
                                  ? 'bg-accent text-primary-text font-normal border border-border-light'
                                  : 'text-secondary-text hover:bg-accent hover:text-primary-text font-light'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <SubIcon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </div>
                                {subItem.badge && (
                                  <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full font-light">
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
                      'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-accent text-primary-text border border-border-light'
                        : 'text-secondary-text hover:bg-accent hover:text-primary-text'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 font-light text-sm">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full font-light">
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
        <div className="px-4 py-6 border-t border-border flex-shrink-0 space-y-2">
          <button
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text'
            )}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span className="font-light text-sm">Support</span>
          </button>
          
          <button
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text'
            )}
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span className="font-light text-sm">Settings</span>
          </button>
          
          <button
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 text-secondary-text hover:bg-accent hover:text-primary-text'
            )}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-light text-sm">Log out</span>
          </button>
        </div>
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'

export { Sidebar } 