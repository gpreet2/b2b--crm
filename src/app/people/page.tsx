import { UsersIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function PeoplePage() {
  return (
    <div>
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-h2 sm:text-h1 font-heading text-primary-text'>People</h1>
        <p className='text-sm sm:text-body text-secondary-text'>
          Manage leads, clients, and customer segments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <UsersIcon className='h-5 w-5 sm:h-6 sm:w-6' />
            <span>People Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-4 sm:p-8 text-center text-muted'>
            <UsersIcon className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted' />
            <p className='text-sm sm:text-body'>People management system</p>
            <p className='text-xs sm:text-body-sm'>
              Manage leads, clients, segments, and customer relationships
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
