import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { UserIcon } from '@heroicons/react/24/outline'

export default function ClientsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Clients</h1>
        <p className="text-body text-secondary-text">Manage active clients and memberships</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-6 w-6" />
            <span>Client Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Client management system</p>
            <p className="text-body-sm">Manage active clients, memberships, and client relationships</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 