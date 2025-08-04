'use client';

import {
  Cog6ToothIcon,
  CalendarIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// iOS-style Toggle Component
const Toggle = ({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
  description?: string;
}) => {
  return (
    <div className='flex items-center justify-between p-4 bg-accent rounded-xl border border-border-light'>
      <div className='flex-1'>
        <div className='text-sm font-light text-primary-text'>{label}</div>
        {description ? <div className='text-xs text-secondary-text mt-1'>{description}</div> : null}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-accent'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Time Input Component
const TimeInput = ({
  value,
  onChange,
  label,
  description,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
}) => {
  return (
    <div className='space-y-2'>
      <label className='block text-sm font-light text-primary-text'>{label}</label>
      {description ? <div className='text-xs text-secondary-text'>{description}</div> : null}
      <Input
        type='time'
        value={value}
        onChange={e => onChange(e.target.value)}
        className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
      />
    </div>
  );
};

// Number Input Component
const NumberInput = ({
  value,
  onChange,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  return (
    <div className='space-y-2'>
      <label className='block text-sm font-light text-primary-text'>{label}</label>
      {description ? <div className='text-xs text-secondary-text'>{description}</div> : null}
      <Input
        type='number'
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className='bg-accent border-border rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
      />
    </div>
  );
};

export default function ClassesSettingsPage() {
  // Reservation Settings
  const [reservationsOpenTime, setReservationsOpenTime] = useState('06:00');
  const [reservationsCloseTime, setReservationsCloseTime] = useState('22:00');

  // Cancellation Settings
  const [cancellationTiming, setCancellationTiming] = useState('24:00'); // hours before class
  const [lateCancellationEnabled, setLateCancellationEnabled] = useState(true);
  const [lateCancellationFee, setLateCancellationFee] = useState(15);
  const [lateCancellationTaxRate, setLateCancellationTaxRate] = useState(8.5);
  const [autoChargeLateFee, setAutoChargeLateFee] = useState(true);

  // No Show Settings
  const [noShowEnabled, setNoShowEnabled] = useState(true);
  const [noShowFee, setNoShowFee] = useState(25);
  const [noShowTaxRate, setNoShowTaxRate] = useState(8.5);
  const [autoChargeNoShowFee, setAutoChargeNoShowFee] = useState(true);

  const calculateTotalWithTax = (baseAmount: number, taxRate: number) => {
    return baseAmount + baseAmount * (taxRate / 100);
  };

  return (
    <div className='p-6 space-y-6 bg-background min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-light text-primary-text mb-1'>CLASS SETTINGS</h1>
          <p className='text-secondary-text font-light'>
            Configure class policies and system preferences
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <Button
            variant='outline'
            className='px-4 py-2 bg-accent border-border rounded-xl font-light text-sm hover:bg-accent/80 transition-all duration-200'
          >
            <DocumentTextIcon className='h-4 w-4 mr-2' />
            Export Config
          </Button>
          <Button
            variant='primary'
            className='px-4 py-2 rounded-xl font-light text-sm transition-all duration-200 shadow-lg hover:shadow-xl'
          >
            <Cog6ToothIcon className='h-4 w-4 mr-2' />
            Save Changes
          </Button>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Reservation Settings */}
        <Card className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg'>
          <CardHeader className='px-8 py-6 border-b border-border bg-accent'>
            <CardTitle className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg'>
                <CalendarIcon className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-xl font-light text-primary-text'>Reservation Settings</div>
                <div className='text-sm text-secondary-text font-light'>
                  Configure booking windows and timing
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8 space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-2'>
              <TimeInput
                label='Reservations Open Time'
                description='When members can start booking classes'
                value={reservationsOpenTime}
                onChange={setReservationsOpenTime}
              />
              <TimeInput
                label='Reservations Close Time'
                description='When booking closes for the day'
                value={reservationsCloseTime}
                onChange={setReservationsCloseTime}
              />
            </div>

            <div className='p-6 bg-accent rounded-xl border border-border-light'>
              <div className='flex items-center space-x-3 mb-3'>
                <ClockIcon className='h-5 w-5 text-primary' />
                <span className='text-lg font-medium text-primary-text'>
                  Booking Window Summary
                </span>
              </div>
              <div className='text-sm text-secondary-text'>
                Members can book classes from{' '}
                <span className='font-medium text-primary-text'>{reservationsOpenTime}</span> to{' '}
                <span className='font-medium text-primary-text'>{reservationsCloseTime}</span> daily
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Settings */}
        <Card className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg'>
          <CardHeader className='px-8 py-6 border-b border-border bg-accent'>
            <CardTitle className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg'>
                <ExclamationTriangleIcon className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-xl font-light text-primary-text'>Cancellation Policy</div>
                <div className='text-sm text-secondary-text font-light'>
                  Set cancellation rules and fees
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8 space-y-8 mt-2'>
            <div className='space-y-6'>
              <NumberInput
                label='Cancellation Timing (Hours Before Class)'
                description='How many hours before class members can cancel without fees'
                value={parseFloat(cancellationTiming)}
                onChange={value => setCancellationTiming(value.toString())}
                min={1}
                max={72}
                step={0.5}
              />
            </div>

            <div className='space-y-6'>
              <div className='flex items-center justify-between p-6 bg-accent rounded-xl border border-border-light'>
                <div>
                  <div className='text-lg font-medium text-primary-text'>
                    Late Cancellation Fees
                  </div>
                  <div className='text-sm text-secondary-text'>
                    Charge fees for late cancellations
                  </div>
                </div>
                <Toggle
                  enabled={lateCancellationEnabled}
                  onToggle={setLateCancellationEnabled}
                  label=''
                />
              </div>

              {lateCancellationEnabled ? <div className='space-y-6 p-6 bg-accent rounded-xl border border-border-light'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <NumberInput
                      label='Late Cancellation Fee ($)'
                      description='Base fee amount'
                      value={lateCancellationFee}
                      onChange={setLateCancellationFee}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <NumberInput
                      label='Tax Rate (%)'
                      description='Tax rate applied to fees'
                      value={lateCancellationTaxRate}
                      onChange={setLateCancellationTaxRate}
                      min={0}
                      max={20}
                      step={0.1}
                    />
                  </div>

                  <div className='p-6 bg-surface rounded-xl border border-border-light'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between text-base'>
                        <span className='text-secondary-text'>Base Fee:</span>
                        <span className='text-primary-text font-medium'>
                          ${lateCancellationFee.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-base'>
                        <span className='text-secondary-text'>
                          Tax ({lateCancellationTaxRate}%):
                        </span>
                        <span className='text-primary-text font-medium'>
                          ${(lateCancellationFee * (lateCancellationTaxRate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-lg font-medium border-t border-border pt-3'>
                        <span className='text-primary-text'>Total with Tax:</span>
                        <span className='text-primary font-medium'>
                          $
                          {calculateTotalWithTax(
                            lateCancellationFee,
                            lateCancellationTaxRate
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Toggle
                    enabled={autoChargeLateFee}
                    onToggle={setAutoChargeLateFee}
                    label='Auto-charge Late Cancellation Fees'
                    description='Automatically charge fees when members cancel late'
                  />
                </div> : null}
            </div>
          </CardContent>
        </Card>

        {/* No Show Settings */}
        <Card className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg'>
          <CardHeader className='px-8 py-6 border-b border-border bg-accent'>
            <CardTitle className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg'>
                <UserGroupIcon className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-xl font-light text-primary-text'>No Show Policy</div>
                <div className='text-sm text-secondary-text font-light'>
                  Handle members who don&apos;t attend
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8 space-y-8 mt-2'>
            <div className='space-y-6'>
              <div className='flex items-center justify-between p-6 bg-accent rounded-xl border border-border-light'>
                <div>
                  <div className='text-lg font-medium text-primary-text'>No Show Fees</div>
                  <div className='text-sm text-secondary-text'>
                    Charge fees for members who don&apos;t show up
                  </div>
                </div>
                <Toggle enabled={noShowEnabled} onToggle={setNoShowEnabled} label='' />
              </div>

              {noShowEnabled ? <div className='space-y-6 p-6 bg-accent rounded-xl border border-border-light'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <NumberInput
                      label='No Show Fee ($)'
                      description='Base fee amount'
                      value={noShowFee}
                      onChange={setNoShowFee}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <NumberInput
                      label='Tax Rate (%)'
                      description='Tax rate applied to fees'
                      value={noShowTaxRate}
                      onChange={setNoShowTaxRate}
                      min={0}
                      max={20}
                      step={0.1}
                    />
                  </div>

                  <div className='p-6 bg-surface rounded-xl border border-border-light'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between text-base'>
                        <span className='text-secondary-text'>Base Fee:</span>
                        <span className='text-primary-text font-medium'>
                          ${noShowFee.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-base'>
                        <span className='text-secondary-text'>Tax ({noShowTaxRate}%):</span>
                        <span className='text-primary-text font-medium'>
                          ${(noShowFee * (noShowTaxRate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-lg font-medium border-t border-border pt-3'>
                        <span className='text-primary-text'>Total with Tax:</span>
                        <span className='text-primary font-medium'>
                          ${calculateTotalWithTax(noShowFee, noShowTaxRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Toggle
                    enabled={autoChargeNoShowFee}
                    onToggle={setAutoChargeNoShowFee}
                    label='Auto-charge No Show Fees'
                    description="Automatically charge fees when members don't show up"
                  />
                </div> : null}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg'>
          <CardHeader className='px-8 py-6 border-b border-border bg-accent'>
            <CardTitle className='flex items-center space-x-4'>
              <div className='p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg'>
                <ShieldCheckIcon className='h-6 w-6 text-white' />
              </div>
              <div>
                <div className='text-xl font-light text-primary-text'>System Status</div>
                <div className='text-sm text-secondary-text font-light'>
                  Current system health and status
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6'>
              <div className='flex items-center space-x-4 p-6 bg-emerald-500/10 rounded-xl border border-border-light'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-500 flex-shrink-0' />
                <div>
                  <div className='text-base font-medium text-primary-text'>Classes System</div>
                  <div className='text-sm text-emerald-500'>Operational</div>
                </div>
              </div>
              <div className='flex items-center space-x-4 p-6 bg-emerald-500/10 rounded-xl border border-border-light'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-500 flex-shrink-0' />
                <div>
                  <div className='text-base font-medium text-primary-text'>Booking Engine</div>
                  <div className='text-sm text-emerald-500'>Online</div>
                </div>
              </div>
              <div className='flex items-center space-x-4 p-6 bg-emerald-500/10 rounded-xl border border-border-light'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-500 flex-shrink-0' />
                <div>
                  <div className='text-base font-medium text-primary-text'>Payment Processing</div>
                  <div className='text-sm text-emerald-500'>Active</div>
                </div>
              </div>
              <div className='flex items-center space-x-4 p-6 bg-emerald-500/10 rounded-xl border border-border-light'>
                <CheckCircleIcon className='h-6 w-6 text-emerald-500 flex-shrink-0' />
                <div>
                  <div className='text-base font-medium text-primary-text'>Notifications</div>
                  <div className='text-sm text-emerald-500'>Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
