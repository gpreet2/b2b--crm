import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Reports</h1>
        <p className="text-body text-secondary-text">Generate and view detailed reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DocumentChartBarIcon className="h-6 w-6" />
            <span>Performance Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <DocumentChartBarIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Reporting system</p>
            <p className="text-body-sm">Generate detailed reports on performance, revenue, and business metrics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 