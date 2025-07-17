import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CreditCardIcon } from '@heroicons/react/24/outline'

export default function FinancialPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Financial</h1>
        <p className="text-body text-secondary-text">Manage invoices, transactions, and payroll</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCardIcon className="h-6 w-6" />
            <span>Financial Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Financial management system</p>
            <p className="text-body-sm">Track revenue, manage invoices, and handle financial operations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 