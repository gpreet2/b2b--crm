'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { 
  XMarkIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface WorkoutEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    type: string
    intensity: string
    duration: number
    exercises: string[]
    notes?: string
    completed: boolean
  }
}

interface WorkoutEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: WorkoutEvent | null
}

export default function WorkoutEventModal({
  isOpen,
  onClose,
  event
}: WorkoutEventModalProps) {
  if (!event) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crossfit':
        return <FireIcon className="h-5 w-5" />
      case 'burn40':
        return <BoltIcon className="h-5 w-5" />
      case 'strength':
        return <UserGroupIcon className="h-5 w-5" />
      case 'cardio':
        return <HeartIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crossfit':
        return 'CrossFit'
      case 'burn40':
        return 'Burn40'
      case 'strength':
        return 'Strength Training'
      case 'cardio':
        return 'Cardio'
      case 'yoga':
        return 'Yoga'
      case 'recovery':
        return 'Recovery'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'text-success bg-success/10'
      case 'medium':
        return 'text-warning bg-warning/10'
      case 'high':
        return 'text-danger bg-danger/10'
      default:
        return 'text-secondary-text bg-surface-light/50'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-6 bg-gradient-to-r from-surface-light/50 to-surface-light/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="p-3 rounded-xl shadow-lg"
                  style={{ 
                    backgroundColor: event.backgroundColor + '20',
                    border: `1px solid ${event.backgroundColor + '30'}`
                  }}
                >
                  {getTypeIcon(event.extendedProps.type)}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-semibold text-primary-text mb-1">{event.title}</DialogTitle>
                  <p className="text-sm text-secondary-text">{getTypeLabel(event.extendedProps.type)}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  event.extendedProps.completed 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {event.extendedProps.completed ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <XCircleIcon className="h-6 w-6" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-secondary-text">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(event.start)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Workout Details Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-surface-light/30 to-surface-light/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary-text">Duration</span>
              </div>
              <p className="text-lg font-semibold text-primary-text">{event.extendedProps.duration} minutes</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-surface-light/30 to-surface-light/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 bg-warning/20 rounded-lg">
                  <FireIcon className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-primary-text">Intensity</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(event.extendedProps.intensity)}`}>
                {event.extendedProps.intensity.charAt(0).toUpperCase() + event.extendedProps.intensity.slice(1)}
              </span>
            </div>
          </div>

          {/* Exercises */}
          {event.extendedProps.exercises.length > 0 && (
            <div className="bg-gradient-to-br from-surface-light/20 to-surface-light/10 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-primary-text mb-3 flex items-center space-x-2">
                <div className="p-1.5 bg-info/20 rounded-lg">
                  <UserGroupIcon className="h-4 w-4 text-info" />
                </div>
                <span>Exercises</span>
              </h3>
              <div className="space-y-2">
                {event.extendedProps.exercises.map((exercise, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-surface/50 rounded-lg backdrop-blur-sm"
                  >
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
                      {index + 1}
                    </div>
                    <span className="text-primary-text">{exercise}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.extendedProps.notes && (
            <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-primary-text mb-3 flex items-center space-x-2">
                <div className="p-1.5 bg-info/20 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-info" />
                </div>
                <span>Notes</span>
              </h3>
              <p className="text-primary-text leading-relaxed">{event.extendedProps.notes}</p>
            </div>
          )}

          {/* Status */}
          <div className="bg-gradient-to-br from-surface-light/30 to-surface-light/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary-text mb-1">Status</h3>
                <p className="text-sm text-secondary-text">
                  {event.extendedProps.completed ? 'Completed' : 'Scheduled'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {event.extendedProps.completed ? (
                  <div className="flex items-center space-x-2 text-success">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-warning">
                    <XCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/20">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 border-surface-light/50 text-primary-text hover:bg-surface/50"
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="px-4 flex items-center space-x-2 border-surface-light/50 text-primary-text hover:bg-surface/50"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            className="px-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white flex items-center space-x-2"
          >
            {event.extendedProps.completed ? (
              <>
                <XCircleIcon className="h-4 w-4" />
                <span>Mark Incomplete</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Mark Complete</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 