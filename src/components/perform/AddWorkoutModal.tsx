'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  PlusIcon, 
  TrashIcon, 
  ClockIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import WorkoutLibrary from './WorkoutLibrary'

interface WorkoutSegment {
  id: string
  title: string
  description: string
  duration: number
  category: string
  exercises: Array<{
    name: string
    sets: number
    reps?: number
    duration?: number
  }>
  color: string
}

interface AddWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (workoutData: Record<string, unknown>) => void
  selectedDate?: Date | null
  onOpenWorkoutLibrary?: () => void
}

export default function AddWorkoutModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  onOpenWorkoutLibrary
}: AddWorkoutModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('07:00')
  const [workoutSegments, setWorkoutSegments] = useState<WorkoutSegment[]>([])
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setStartTime('07:00')
      setWorkoutSegments([])
    }
  }, [isOpen])

  const handleSave = () => {
    const workoutData = {
      title,
      description,
      startTime,
      date: selectedDate || new Date(),
      segments: workoutSegments,
      totalDuration: workoutSegments.reduce((total, segment) => total + segment.duration, 0)
    }
    onSave(workoutData)
  }

  const handleOpenWorkoutLibrary = () => {
    setShowWorkoutLibrary(true)
  }

  const handleSelectWorkout = (workout: any) => {
    const newSegment: WorkoutSegment = {
      id: Date.now().toString(),
      title: workout.name,
      description: workout.description,
      duration: workout.estimatedDuration,
      category: workout.category,
      exercises: workout.exercises,
      color: workout.color
    }
    setWorkoutSegments([...workoutSegments, newSegment])
    setShowWorkoutLibrary(false)
  }

  const handleRemoveSegment = (segmentId: string) => {
    setWorkoutSegments(workoutSegments.filter(segment => segment.id !== segmentId))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crossfit':
        return <FireIcon className="h-4 w-4" />
      case 'burn40':
        return <BoltIcon className="h-4 w-4" />
      case 'strength':
        return <UserGroupIcon className="h-4 w-4" />
      case 'cardio':
        return <HeartIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto p-0 bg-surface border-0">
        {/* Header */}
        <DialogHeader className="p-6 bg-gradient-to-r from-surface-light/50 to-surface-light/30">
          <DialogTitle className="text-xl font-semibold text-primary-text">Add New Workout</DialogTitle>
          <DialogDescription className="text-sm text-secondary-text">
            {selectedDate 
              ? `Scheduled for ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
              : 'Create a new workout session'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Workout Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CrossFit WOD, Morning Cardio"
                className="w-full bg-surface border-border/50 text-primary-text placeholder:text-muted focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Start Time *
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-surface border-border/50 text-primary-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the workout..."
                className="w-full px-3 py-2 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-primary-text placeholder:text-muted"
                rows={3}
              />
            </div>
          </div>

          {/* Workout Segments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-primary-text">Workout Segments</h3>
              <div className="flex items-center space-x-2 text-sm text-secondary-text">
                <ClockIcon className="h-4 w-4" />
                <span>Total: {workoutSegments.reduce((total, segment) => total + segment.duration, 0)}m</span>
              </div>
            </div>

            {workoutSegments.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-border/50 rounded-lg">
                <p className="text-sm text-secondary-text mb-3">No workout segments added yet</p>
                <Button
                  onClick={handleOpenWorkoutLibrary}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add from Library
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutSegments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="p-4 bg-surface-light/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: segment.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-primary-text truncate">
                              {segment.title}
                            </h4>
                            <Badge className="text-xs bg-primary/20 text-primary">
                              {segment.duration}m
                            </Badge>
                          </div>
                          <p className="text-xs text-secondary-text mb-2">
                            {segment.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(segment.category)}
                            <span className="text-xs text-secondary-text capitalize">
                              {segment.category}
                            </span>
                            <span className="text-xs text-secondary-text">
                              • {segment.exercises.length} exercises
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveSegment(segment.id)}
                        variant="outline"
                        size="sm"
                        className="ml-3 border-border/50 text-secondary-text hover:text-red-500 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  onClick={handleOpenWorkoutLibrary}
                  variant="outline"
                  className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Another Segment
                </Button>
              </div>
            )}
          </div>

          {/* Workout Library Option */}
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
            <h3 className="text-sm font-medium text-primary-text mb-2">Workout Library</h3>
            <p className="text-xs text-secondary-text mb-3">
              Browse pre-built workout templates and add them to your session
            </p>
            <Button
              onClick={handleOpenWorkoutLibrary}
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
            >
              Browse Workout Library
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/20">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 border-border/50 text-primary-text hover:bg-surface/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white"
          >
            Save Workout
          </Button>
        </div>
      </DialogContent>

      {/* Workout Library Modal */}
      {showWorkoutLibrary && (
        <WorkoutLibrary
          onSelectWorkout={handleSelectWorkout}
          onClose={() => setShowWorkoutLibrary(false)}
        />
      )}
    </Dialog>
  )
} 