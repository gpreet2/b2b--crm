import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BookOpenIcon } from '@heroicons/react/24/outline'

export default function LibraryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Exercise Library</h1>
        <p className="text-body text-secondary-text">Browse and manage exercise database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpenIcon className="h-6 w-6" />
            <span>Exercise Database</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Exercise library system</p>
            <p className="text-body-sm">Browse exercises, create custom movements, and build workout templates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 