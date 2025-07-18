import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-h2 sm:text-h1 font-heading text-primary-text">Analytics</h1>
        <p className="text-sm sm:text-body text-secondary-text">View insights and performance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 sm:p-8 text-center text-muted">
            <ChartBarIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted" />
            <p className="text-sm sm:text-body">Analytics and reporting system</p>
            <p className="text-xs sm:text-body-sm">View business insights, performance metrics, and detailed reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 