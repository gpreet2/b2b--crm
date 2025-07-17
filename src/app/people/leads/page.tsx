import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export default function LeadsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Leads</h1>
        <p className="text-body text-secondary-text">Manage potential customers and leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlusIcon className="h-6 w-6" />
            <span>Lead Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <UserPlusIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Lead management system</p>
            <p className="text-body-sm">Track potential customers, follow up on leads, and convert prospects</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 