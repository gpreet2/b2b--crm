import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BanknotesIcon } from '@heroicons/react/24/outline'

export default function PayrollPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-primary-text">Payroll</h1>
        <p className="text-body text-secondary-text">Manage staff payroll and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BanknotesIcon className="h-6 w-6" />
            <span>Payroll Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted">
            <BanknotesIcon className="h-12 w-12 mx-auto mb-4 text-muted" />
            <p className="text-body">Payroll management system</p>
            <p className="text-body-sm">Process payroll, manage staff payments, and track compensation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 