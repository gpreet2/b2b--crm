import { PlayIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function PerformPage() {
  return (
    <div>
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-h2 sm:text-h1 font-heading text-primary-text'>Perform</h1>
        <p className='text-sm sm:text-body text-secondary-text'>
          Track workouts and manage exercise library
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <PlayIcon className='h-5 w-5 sm:h-6 sm:w-6' />
            <span>Workout Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-4 sm:p-8 text-center text-muted'>
            <PlayIcon className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted' />
            <p className='text-sm sm:text-body'>Workout tracking and performance</p>
            <p className='text-xs sm:text-body-sm'>
              Track daily workouts, view exercise library, and monitor progress
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
