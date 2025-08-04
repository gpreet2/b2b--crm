import { CreditCardIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function FinancialPage() {
  return (
    <div>
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-h2 sm:text-h1 font-heading text-primary-text'>Financial</h1>
        <p className='text-sm sm:text-body text-secondary-text'>
          Manage invoices, transactions, and payroll
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <CreditCardIcon className='h-5 w-5 sm:h-6 sm:w-6' />
            <span>Financial Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-4 sm:p-8 text-center text-muted'>
            <CreditCardIcon className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted' />
            <p className='text-sm sm:text-body'>Financial management system</p>
            <p className='text-xs sm:text-body-sm'>
              Track revenue, manage invoices, and handle financial operations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
