import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function EventsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Events</h1>
        <p className="text-body text-secondary-text">Manage special events and workshops</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6" />
            <span>Class Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Events management system</p>
            <p className="text-body-sm">Create and manage special events, workshops, and one-time classes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 