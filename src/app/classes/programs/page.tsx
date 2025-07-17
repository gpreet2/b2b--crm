import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PlayIcon } from '@heroicons/react/24/outline'

export default function ProgramsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Programs</h1>
        <p className="text-body text-secondary-text">Manage fitness programs and training plans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayIcon className="h-6 w-6" />
            <span>Fitness Programs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <PlayIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Programs management system</p>
            <p className="text-body-sm">Create and manage fitness programs, training plans, and workout series</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 