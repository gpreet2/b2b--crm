import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PlayIcon } from '@heroicons/react/24/outline'

export default function PerformPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Perform</h1>
        <p className="text-body text-secondary-text">Track workouts and manage exercise library</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayIcon className="h-6 w-6" />
            <span>Workout Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <PlayIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Workout tracking and performance</p>
            <p className="text-body-sm">Track daily workouts, view exercise library, and monitor progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 