import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LightBulbIcon } from '@heroicons/react/24/outline'

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Insights</h1>
        <p className="text-body text-secondary-text">Business insights and key metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LightBulbIcon className="h-6 w-6" />
            <span>Business Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <LightBulbIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Business insights system</p>
            <p className="text-body-sm">View key performance indicators, trends, and actionable insights</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 