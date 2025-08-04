import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function InvoicesPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-h1 font-heading text-primary-text'>Invoices</h1>
        <p className='text-body text-secondary-text'>Manage invoices and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <DocumentTextIcon className='h-6 w-6' />
            <span>Invoice Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-8 text-center text-muted'>
            <DocumentTextIcon className='h-12 w-12 mx-auto mb-4 text-muted' />
            <p className='text-body'>Invoice management system</p>
            <p className='text-body-sm'>
              Create, send, and track invoices for services and memberships
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
