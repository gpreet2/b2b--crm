import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function TransactionsPage() {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-h1 font-heading text-primary-text'>Transactions</h1>
        <p className='text-body text-secondary-text'>View transaction history and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <ArrowPathIcon className='h-6 w-6' />
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='p-8 text-center text-muted'>
            <ArrowPathIcon className='h-12 w-12 mx-auto mb-4 text-muted' />
            <p className='text-body'>Transaction management system</p>
            <p className='text-body-sm'>
              View payment history, track revenue, and manage financial records
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
