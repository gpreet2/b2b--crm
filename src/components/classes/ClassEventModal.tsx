'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Class, Program, Coach } from '@/lib/types'

interface ClassEventModalProps {
  isOpen: boolean
  onClose: () => void
  classEvent: Class | null
  program?: Program
  coach?: Coach
  onEdit?: (classEvent: Class) => void
  onCancel?: (classEvent: Class) => void
  onDelete?: (classEvent: Class) => void
}

export default function ClassEventModal({
  isOpen,
  onClose,
  classEvent,
  program,
  coach,
  onEdit,
  onCancel,
  onDelete
}: ClassEventModalProps) {
  if (!isOpen || !classEvent) return null

  const fillPercentage = (classEvent.enrolled / classEvent.capacity) * 100
  const isFullyBooked = classEvent.enrolled >= classEvent.capacity
  const isLowEnrollment = fillPercentage < 30
  const isHighDemand = fillPercentage >= 80

  const getStatusColor = () => {
    switch (classEvent.status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      case 'completed':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const getCapacityStatus = () => {
    if (isFullyBooked) return { text: 'Fully Booked', color: 'text-red-600' }
    if (isHighDemand) return { text: 'High Demand', color: 'text-orange-600' }
    if (isLowEnrollment) return { text: 'Low Enrollment', color: 'text-yellow-600' }
    return { text: 'Available', color: 'text-green-600' }
  }

  const capacityStatus = getCapacityStatus()

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {classEvent.name}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
                  >
                    {classEvent.status.charAt(0).toUpperCase() + classEvent.status.slice(1)}
                  </span>
                  <span className={`text-sm font-medium ${capacityStatus.color}`}>
                    {capacityStatus.text}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Program Info */}
              {program && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: program.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{program.name}</h3>
                    <p className="text-sm text-gray-600">{program.description}</p>
                  </div>
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">{formatDate(classEvent.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(classEvent.startTime)} - {formatTime(classEvent.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coach and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coach && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Coach</p>
                      <p className="text-sm text-gray-600">{coach.name}</p>
                      {coach.specialties && coach.specialties.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {coach.specialties.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{classEvent.location}</p>
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Capacity</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {classEvent.enrolled} / {classEvent.capacity} enrolled
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isFullyBooked ? 'bg-red-500' :
                      isHighDemand ? 'bg-orange-500' :
                      isLowEnrollment ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{classEvent.capacity}</span>
                </div>
              </div>

              {/* Recurring Info */}
              {classEvent.isRecurring && classEvent.recurrencePattern && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Recurring Class</h4>
                  <p className="text-sm text-blue-700">
                    Repeats {classEvent.recurrencePattern.frequency}
                    {classEvent.recurrencePattern.daysOfWeek && (
                      <span> on {
                        classEvent.recurrencePattern.daysOfWeek.map(day => 
                          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                        ).join(', ')
                      }</span>
                    )}
                  </p>
                </div>
              )}

              {/* Notes */}
              {classEvent.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{classEvent.notes}</p>
                </div>
              )}

              {/* Warning for cancelled classes */}
              {classEvent.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <h4 className="text-sm font-medium text-red-900">Class Cancelled</h4>
                  </div>
                  {classEvent.notes && (
                    <p className="text-sm text-red-700 mt-2">{classEvent.notes}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              {classEvent.status !== 'cancelled' && classEvent.status !== 'completed' && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(classEvent)}
                      className="flex items-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit Class</span>
                    </Button>
                  )}
                  
                  {onCancel && classEvent.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancel(classEvent)}
                      className="flex items-center space-x-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>Cancel Class</span>
                    </Button>
                  )}
                </>
              )}
              
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(classEvent)}
                  className="flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Class</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}