'use client';

import {
  UserIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import React from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Class } from '@/lib/types';


interface ClassEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class;
}

export default function ClassEventModal({ isOpen, onClose, classData }: ClassEventModalProps) {
  if (!isOpen) return null;

  const availableSpots = classData.capacity - classData.enrolled;
  const enrollmentPercentage = (classData.enrolled / classData.capacity) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <Card className='border-0 shadow-none'>
          <CardHeader className='border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center space-x-2'>
                <div className='w-4 h-4 rounded' style={{ backgroundColor: '#6b7280' }} />
                <span>Class Details</span>
              </CardTitle>
              <Button variant='ghost' size='sm' onClick={onClose} className='p-2'>
                <XMarkIcon className='h-5 w-5' />
              </Button>
            </div>
          </CardHeader>

          <div className='p-6'>
            <div className='space-y-6'>
              {/* Class Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2'>
                        <CalendarIcon className='h-5 w-5 text-gray-500' />
                        <span className='text-sm font-medium'>Date & Time</span>
                      </div>
                      <div className='ml-7'>
                        <p className='text-lg font-semibold'>
                          {format(classData.date, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className='text-gray-600'>
                          {classData.startTime} - {classData.endTime}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2'>
                        <UserIcon className='h-5 w-5 text-gray-500' />
                        <span className='text-sm font-medium'>Coach</span>
                      </div>
                      <div className='ml-7'>
                        <p className='text-lg font-semibold'>{classData.name}</p>
                        <p className='text-gray-600'>{classData.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enrollment Status */}
              <Card>
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <UsersIcon className='h-5 w-5 text-gray-500' />
                        <span className='text-sm font-medium'>Enrollment</span>
                      </div>
                      <Badge className={getStatusColor(classData.status)}>
                        {classData.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Enrolled</span>
                        <span className='font-medium'>
                          {classData.enrolled} / {classData.capacity}
                        </span>
                      </div>

                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full ${getEnrollmentColor(enrollmentPercentage)}`}
                          style={{ width: `${enrollmentPercentage}%` }}
                        />
                      </div>

                      <div className='flex justify-between text-sm text-gray-600'>
                        <span>Available spots: {availableSpots}</span>
                        <span>{Math.round(enrollmentPercentage)}% full</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Information */}
              {classData.isRecurring && classData.recurrencePattern ? <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2'>
                        <ClockIcon className='h-5 w-5 text-gray-500' />
                        <span className='text-sm font-medium'>Recurring Schedule</span>
                      </div>
                      <div className='ml-7'>
                        <p className='text-gray-700'>
                          {classData.recurrencePattern.frequency} on{' '}
                          {classData.recurrencePattern.daysOfWeek
                            ?.map(day => {
                              const days = [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                              ];
                              return days[day];
                            })
                            .join(', ')}
                        </p>
                        {classData.recurrencePattern.endDate ? <p className='text-sm text-gray-600'>
                            Until {format(classData.recurrencePattern.endDate, 'MMM d, yyyy')}
                          </p> : null}
                      </div>
                    </div>
                  </CardContent>
                </Card> : null}

              {/* Notes */}
              {classData.notes ? <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2'>
                        <InformationCircleIcon className='h-5 w-5 text-gray-500' />
                        <span className='text-sm font-medium'>Notes</span>
                      </div>
                      <div className='ml-7'>
                        <p className='text-gray-700'>{classData.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> : null}

              {/* Action Buttons */}
              <div className='flex justify-end space-x-3 pt-4'>
                <Button variant='ghost' onClick={onClose}>
                  Close
                </Button>
                <Button>Edit Class</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
