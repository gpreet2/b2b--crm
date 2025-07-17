'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  UserIcon, 
  ClockIcon, 
  CalendarIcon, 
  UsersIcon,
  MapPinIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Class } from '@/lib/types'
import { format } from 'date-fns'

interface ClassEventModalProps {
  isOpen: boolean
  onClose: () => void
  classData: Class
}

export default function ClassEventModal({ isOpen, onClose, classData }: ClassEventModalProps) {
  const availableSpots = classData.capacity - classData.enrolledCount
  const enrollmentPercentage = (classData.enrolledCount / classData.capacity) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: classData.program.color }}
            />
            <span>{classData.program.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Date & Time</span>
                  </div>
                  <div className="ml-7">
                    <p className="text-lg font-semibold">
                      {format(classData.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-gray-600">
                      {classData.startTime} - {classData.endTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Coach</span>
                  </div>
                  <div className="ml-7">
                    <p className="text-lg font-semibold">{classData.coach.name}</p>
                    <p className="text-gray-600">{classData.coach.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Status */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Enrollment</span>
                  </div>
                  <Badge className={getStatusColor(classData.status)}>
                    {classData.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enrolled</span>
                    <span className="font-medium">{classData.enrolledCount} / {classData.capacity}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getEnrollmentColor(enrollmentPercentage)}`}
                      style={{ width: `${enrollmentPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Available spots: {availableSpots}</span>
                    <span>{Math.round(enrollmentPercentage)}% full</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">Program Details</span>
                </div>
                <div className="ml-7 space-y-2">
                  <p className="text-gray-700">{classData.program.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Duration: {classData.program.duration} minutes</span>
                    <span>Category: {classData.program.category}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Information */}
          {classData.isRecurring && classData.recurringPattern && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Recurring Schedule</span>
                  </div>
                  <div className="ml-7">
                    <p className="text-gray-700">
                      {classData.recurringPattern.frequency} on{' '}
                      {classData.recurringPattern.daysOfWeek?.map(day => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                        return days[day]
                      }).join(', ')}
                    </p>
                    {classData.recurringPattern.endDate && (
                      <p className="text-sm text-gray-600">
                        Until {format(classData.recurringPattern.endDate, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {classData.notes && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <div className="ml-7">
                    <p className="text-gray-700">{classData.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Edit Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 