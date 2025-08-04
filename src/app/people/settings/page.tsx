import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function PeopleSettingsPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-h1 font-heading text-primary-text'>People Settings</h1>
        <p className='text-body text-secondary-text'>Configure people management settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Cog6ToothIcon className='h-6 w-6' />
            <span>People Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-8 text-center text-muted'>
            <Cog6ToothIcon className='h-12 w-12 mx-auto mb-4 text-muted' />
            <p className='text-body'>People management settings</p>
            <p className='text-body-sm'>
              Configure client fields, lead sources, and people management preferences
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
