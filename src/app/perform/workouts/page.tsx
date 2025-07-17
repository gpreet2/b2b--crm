import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function WorkoutsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Workouts</h1>
        <p className="text-body text-secondary-text">Track daily workouts and performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6" />
            <span>Daily Workouts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Workout tracking system</p>
            <p className="text-body-sm">Log workouts, track sets, reps, and performance metrics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 