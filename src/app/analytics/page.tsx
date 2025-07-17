import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Analytics</h1>
        <p className="text-body text-secondary-text">View insights and performance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6" />
            <span>Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Analytics and reporting system</p>
            <p className="text-body-sm">View business insights, performance metrics, and detailed reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 