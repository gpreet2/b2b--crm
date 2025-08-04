import {
  ArrowUpIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { mockDashboardStats } from '@/lib/mock-data';
import { cn } from '@/lib/utils';


export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: typeof mockDashboardStats;
}

const Dashboard = React.forwardRef<HTMLDivElement, DashboardProps>(
  ({ className, ...props }, ref) => {
    const [isStripeConnected, setIsStripeConnected] = useState(false);

    // Gym staff profile data
    const staffProfile = {
      name: 'Sarah Johnson',
      email: 'sarah@fitnesspro.com',
      role: 'Head Trainer',
      experience: '5 years',
      speciality: 'HIIT &amp; Strength',
    };

    const handleStripeConnect = () => {
      // Simulate redirect to Stripe onboarding
      setIsStripeConnected(true);
    };

    // Payment/Revenue metrics data (only shown when Stripe is connected)
    const paymentMetrics = [
      {
        title: 'Daily Revenue',
        value: '$1,240',
        percentage: 85,
        color: 'bg-success',
        icon: CurrencyDollarIcon,
        change: '+12%',
      },
      {
        title: 'Active Members',
        value: '1,247',
        percentage: 92,
        color: 'bg-primary',
        icon: UsersIcon,
        change: '+15',
      },
      {
        title: 'Monthly Recurring Revenue',
        value: '$28,420',
        percentage: 78,
        color: 'bg-info',
        icon: ChartBarIcon,
        change: '+8.2%',
      },
      {
        title: 'Class Utilization',
        value: '94%',
        percentage: 94,
        color: 'bg-warning',
        icon: TrophyIcon,
        change: '+2.1%',
      },
    ];

    // Notes and upcoming tours
    const notes = [
      {
        title: 'Pool maintenance scheduled',
        time: 'Tomorrow, 8:00 AM',
        type: 'maintenance',
      },
      {
        title: 'New trainer interviews',
        time: 'Friday, 2:00 PM',
        type: 'hr',
      },
    ];

    const upcomingTours = [
      {
        name: 'Johnson Family',
        time: 'Today, 3:30 PM',
        type: 'Family Package',
        status: 'confirmed',
      },
      {
        name: 'Mike Rodriguez',
        time: 'Tomorrow, 10:00 AM',
        type: 'Premium Membership',
        status: 'pending',
      },
    ];

    // Today's classes
    const todaysClasses = [
      {
        name: 'HIIT Cardio Blast',
        time: '6:00 AM',
        trainer: 'Sarah Johnson',
        enrolled: 18,
        capacity: 20,
        status: 'high-demand',
      },
      {
        name: 'Strength &amp; Power',
        time: '7:00 AM',
        trainer: 'Mike Chen',
        enrolled: 12,
        capacity: 15,
        status: 'available',
      },
      {
        name: 'Yoga Flow',
        time: '6:00 PM',
        trainer: 'Emma Davis',
        enrolled: 8,
        capacity: 25,
        status: 'low-enrollment',
      },
    ];

    return (
      <div
        ref={ref}
        className={cn('p-6 space-y-6 bg-background min-h-screen', className)}
        {...props}
      >
        {/* Minimal Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-primary-text'>Dashboard</h1>
            <p className='text-secondary-text'>Welcome back, {staffProfile.name}</p>
          </div>
          <div className='flex items-center space-x-3'>
            <div className='text-right'>
              <p className='text-sm text-secondary-text'>Today</p>
              <p className='text-primary-text font-medium'>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!isStripeConnected ? (
          // Empty state - Stripe not connected
          <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-8'>
            <div className='text-center space-y-4'>
              <div className='w-24 h-24 mx-auto bg-accent rounded-full flex items-center justify-center border-2 border-dashed border-border'>
                <CreditCardIcon className='h-12 w-12 text-secondary-text' />
              </div>
              <h2 className='text-2xl font-semibold text-primary-text'>
                Connect Payment Processing
              </h2>
              <p className='text-secondary-text max-w-md'>
                Connect your Stripe account to start tracking revenue, managing subscriptions, and
                viewing detailed payment analytics.
              </p>
            </div>
            <button
              onClick={handleStripeConnect}
              className='flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors'
            >
              <CreditCardIcon className='h-5 w-5' />
              <span>Connect to Stripe</span>
            </button>
          </div>
        ) : (
          // Connected state - Show dashboard content
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            {/* Left Column */}
            <div className='lg:col-span-8 space-y-6'>
              {/* Payment Metrics Cards */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {paymentMetrics.map((metric, index) => (
                  <Card key={index} className='bg-surface border-border shadow-sm'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <div
                          className={`p-2 rounded-lg ${metric.color} flex items-center justify-center`}
                        >
                          <metric.icon className='h-5 w-5 text-white' />
                        </div>
                        <div className='flex items-center space-x-1'>
                          <ArrowUpIcon className='h-4 w-4 text-success' />
                          <span className='text-xs text-success font-medium'>{metric.change}</span>
                        </div>
                      </div>
                      <div className='mb-3'>
                        <h3 className='text-lg font-semibold text-primary-text mb-1'>
                          {metric.value}
                        </h3>
                        <p className='text-sm text-secondary-text'>{metric.title}</p>
                      </div>
                      <div className='w-full bg-accent rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${metric.color}`}
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>
                      <p className='text-xs text-muted mt-2'>{metric.percentage}%</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stripe Dashboard Link */}
              <Card className='bg-surface border-border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 rounded-lg bg-primary/10 flex items-center justify-center'>
                        <EyeIcon className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <h3 className='text-primary-text font-medium'>Stripe Dashboard</h3>
                        <p className='text-sm text-secondary-text'>
                          View detailed payment analytics and reports
                        </p>
                      </div>
                    </div>
                    <Link
                      href='#'
                      className='flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors'
                    >
                      <span className='text-sm font-medium'>View Dashboard</span>
                      <ArrowRightIcon className='h-4 w-4' />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Class Management */}
              <Card className='bg-surface border-border shadow-sm'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-primary-text'>
                    Class Management - Today&apos;s Classes
                  </CardTitle>
                  <Link
                    href='/classes/calendar'
                    className='text-secondary-text hover:text-primary transition-colors'
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {todaysClasses.map((classItem, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-4 bg-accent rounded-lg border border-border-light'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='text-center'>
                            <p className='text-primary-text font-medium'>{classItem.time}</p>
                            <p className='text-xs text-secondary-text'>{classItem.name}</p>
                          </div>
                          <div className='w-px h-12 bg-border' />
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2 mb-1'>
                              <span className='text-sm text-secondary-text'>Capacity:</span>
                              <span className='text-primary-text font-medium'>
                                {classItem.enrolled}/{classItem.capacity}
                              </span>
                            </div>
                            <p className='text-sm text-secondary-text'>
                              Trainer: {classItem.trainer}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <Link
                            href='#'
                            className='text-primary hover:text-primary/80 text-sm font-medium'
                          >
                            View Roster
                          </Link>
                          <ArrowRightIcon className='h-4 w-4 text-secondary-text' />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className='lg:col-span-4 space-y-6'>
              {/* Notes */}
              <Card className='bg-surface border-border shadow-sm'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-primary-text'>Notes</CardTitle>
                  <Link
                    href='/notes'
                    className='text-secondary-text hover:text-primary transition-colors'
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {notes.map((note, index) => (
                    <div
                      key={index}
                      className='flex items-start space-x-3 p-3 bg-accent rounded-lg border border-border-light'
                    >
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-primary-text mb-1'>{note.title}</h4>
                        <p className='text-xs text-secondary-text'>{note.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Tours */}
              <Card className='bg-surface border-border shadow-sm'>
                <CardHeader className='flex flex-row items-center justify-between pb-4'>
                  <CardTitle className='text-primary-text'>Upcoming Tours</CardTitle>
                  <Link
                    href='/tours'
                    className='text-secondary-text hover:text-primary transition-colors'
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {upcomingTours.map((tour, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-accent rounded-lg border border-border-light'
                    >
                      <div>
                        <h4 className='text-primary-text font-medium mb-1'>{tour.name}</h4>
                        <p className='text-sm text-secondary-text mb-1'>{tour.time}</p>
                        <p className='text-xs text-muted'>{tour.type}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          tour.status === 'confirmed'
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-warning/20 text-warning border border-warning/30'
                        }`}
                      >
                        {tour.status}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Dashboard.displayName = 'Dashboard';

export { Dashboard };
