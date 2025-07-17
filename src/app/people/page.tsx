import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { UsersIcon } from '@heroicons/react/24/outline'

export default function PeoplePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">People</h1>
        <p className="text-body text-secondary-text">Manage leads, clients, and customer segments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UsersIcon className="h-6 w-6" />
            <span>People Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">People management system</p>
            <p className="text-body-sm">Manage leads, clients, segments, and customer relationships</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 