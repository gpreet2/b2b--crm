"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getSubNavigationItem } from '@/lib/navigation'

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const subItem = getSubNavigationItem(pathname)

  const breadcrumbItems = [
    { label: 'People', href: '/people' },
    ...(subItem ? [{ label: subItem.title, href: subItem.href }] : [])
  ]

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} showHomeIcon />
      </div>

      {/* Page Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
} 