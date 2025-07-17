"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { SubNavigation } from '@/components/layout/SubNavigation'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getNavigationItemByPath, getSubNavigationItem } from '@/lib/navigation'

export default function ClassesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const navigationItem = getNavigationItemByPath(pathname)
  const subItem = getSubNavigationItem(pathname)

  const breadcrumbItems = [
    { label: 'Classes', href: '/classes' },
    ...(subItem ? [{ label: subItem.title, href: subItem.href }] : [])
  ]

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="px-6 pt-6">
        <Breadcrumb items={breadcrumbItems} showHomeIcon />
      </div>

      {/* Sub Navigation */}
      {navigationItem?.subItems && (
        <div className="px-6 pt-4">
          <SubNavigation items={navigationItem.subItems} />
        </div>
      )}

      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
} 