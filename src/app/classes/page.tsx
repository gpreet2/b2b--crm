import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CalendarIcon } from '@heroicons/react/24/outline'

export default function ClassesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Classes</h1>
        <p className="text-body text-secondary-text">Manage your fitness classes and schedules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6" />
            <span>Class Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Calendar view will be implemented here</p>
            <p className="text-body-sm">This will show all scheduled classes in a calendar format</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 