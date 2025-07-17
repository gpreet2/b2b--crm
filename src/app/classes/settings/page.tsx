import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function ClassesSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Classes Settings</h1>
        <p className="text-body text-secondary-text">Configure class settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-6 w-6" />
            <span>Class Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <Cog6ToothIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Classes settings and configuration</p>
            <p className="text-body-sm">Manage class types, instructors, schedules, and preferences</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 