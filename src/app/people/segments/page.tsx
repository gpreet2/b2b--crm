import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { UserGroupIcon } from '@heroicons/react/24/outline'

export default function SegmentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Segments</h1>
        <p className="text-body text-secondary-text">Manage client segments and groups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserGroupIcon className="h-6 w-6" />
            <span>Client Segments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Client segmentation system</p>
            <p className="text-body-sm">Create and manage client segments for targeted marketing and communication</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 