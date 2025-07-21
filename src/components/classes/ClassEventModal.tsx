'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  UserIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'

interface ClassEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    coach: string
    capacity: number
    enrolledCount: number
    status: string
    category: string
    location?: string
    description?: string
  }
}

interface ClassEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: ClassEvent | null
}

export default function ClassEventModal({ isOpen, onClose, event }: ClassEventModalProps) {
  if (!event) return null

  const { title, start, end, backgroundColor, extendedProps } = event
  const { coach, capacity, enrolledCount, status, category, location, description } = extendedProps
  
  const fillPercentage = (enrolledCount / capacity) * 100
  const availableSpots = capacity - enrolledCount

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high-demand':
        return 'text-red-500'
      case 'low-enrollment':
        return 'text-amber-500'
      default:
        return 'text-emerald-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'high-demand':
        return 'High Demand'
      case 'low-enrollment':
        return 'Low Enrollment'
      default:
        return 'Available'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor }}
            />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Time and Date */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatDate(start)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(start)} - {formatTime(end)}
                    </p>
                  </div>
                </div>
                
                {location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-blue-500" />
                    <p className="text-sm text-gray-300">{location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coach */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-white">Coach</p>
                  <p className="text-xs text-gray-300">{coach}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity and Enrollment */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-white">Enrollment</p>
                      <p className="text-xs text-gray-300">
                        {enrolledCount} of {capacity} spots filled
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${fillPercentage}%`,
                      backgroundColor 
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-400">
                  {availableSpots} spots available
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-white">Category</p>
                  <p className="text-xs text-gray-300 capitalize">
                    {category.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {description && (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">{description}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              Edit Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}