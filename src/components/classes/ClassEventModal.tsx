'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

import {
  UserIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  PencilIcon,
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
        return 'text-danger'
      case 'low-enrollment':
        return 'text-warning'
      default:
        return 'text-success'
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
      <DialogContent className="max-w-md">
        <DialogHeader className="px-8 pt-8 pb-6">
          <DialogTitle className="flex items-center space-x-4 text-primary-text font-light">
            <div 
              className="w-6 h-6 rounded-xl shadow-lg"
              style={{ backgroundColor }}
            />
            <span className="text-xl">{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-8 pb-8 space-y-6">
          {/* Time and Date */}
          <div className="p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-light text-primary-text">
                    {formatDate(start)}
                  </p>
                  <p className="text-xs text-secondary-text font-light mt-1">
                    {formatTime(start)} - {formatTime(end)}
                  </p>
                </div>
              </div>
              
              {location && (
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-secondary-text font-light">{location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Coach */}
          <div className="p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-light text-primary-text">Coach</p>
                <p className="text-xs text-secondary-text font-light mt-1">{coach}</p>
              </div>
            </div>
          </div>

          {/* Capacity and Enrollment */}
          <div className="p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <UsersIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-light text-primary-text">Enrollment</p>
                    <p className="text-xs text-secondary-text font-light mt-1">
                      {enrolledCount} of {capacity} spots filled
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-light px-3 py-1 rounded-full bg-surface-light/50 ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-surface-light/50 rounded-xl h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-xl transition-all duration-300 shadow-sm"
                  style={{ 
                    width: `${fillPercentage}%`,
                    backgroundColor 
                  }}
                />
              </div>
              
              <p className="text-xs text-secondary-text font-light">
                {availableSpots} spots available
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <AcademicCapIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-light text-primary-text">Category</p>
                <p className="text-xs text-secondary-text font-light mt-1 capitalize">
                  {category.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
              <p className="text-sm text-secondary-text font-light leading-relaxed">{description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 font-light px-6 py-3 rounded-xl border-surface-light/50 hover:bg-surface-light/50 transition-all duration-200" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 font-light px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}