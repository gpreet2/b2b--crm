'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface AddWorkoutTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: WorkoutTemplate) => void
}

interface WorkoutTemplate {
  id: string
  title: string
  type: string
  intensity: string
  duration: number
  exercises: string[]
  description: string
  isFavorite: boolean
}

export default function AddWorkoutTemplateModal({
  isOpen,
  onClose,
  onSave,
}: AddWorkoutTemplateModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('crossfit')
  const [intensity, setIntensity] = useState('medium')
  const [duration, setDuration] = useState(30)
  const [exercises, setExercises] = useState<string[]>([''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const modalRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const workoutTypes = [
    { value: 'crossfit', label: 'CrossFit', icon: FireIcon, color: '#ef4444' },
    { value: 'burn40', label: 'Burn40', icon: BoltIcon, color: '#f97316' },
    { value: 'strength', label: 'Strength', icon: UserGroupIcon, color: '#10b981' },
    { value: 'cardio', label: 'Cardio', icon: HeartIcon, color: '#3b82f6' },
    { value: 'yoga', label: 'Yoga', icon: ClockIcon, color: '#8b5cf6' },
    { value: 'recovery', label: 'Recovery', icon: ClockIcon, color: '#14b8a6' },
  ]

  const intensityLevels = [
    { value: 'low', label: 'Low Intensity' },
    { value: 'medium', label: 'Medium Intensity' },
    { value: 'high', label: 'High Intensity' },
  ]

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setType('crossfit')
      setIntensity('medium')
      setDuration(30)
      setExercises([''])
      setErrors({})
      
      // Focus first input after modal opens
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (duration < 1 || duration > 300) {
      newErrors.duration = 'Duration must be between 1 and 300 minutes'
    }

    const validExercises = exercises.filter(ex => ex.trim())
    if (validExercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, description, duration, exercises, setErrors])

  const handleSave = useCallback(() => {
    if (!validateForm()) return

    const validExercises = exercises.filter(ex => ex.trim())
    
    const template: WorkoutTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title: title.trim(),
      description: description.trim(),
      type,
      intensity,
      duration,
      exercises: validExercises,
      isFavorite: false
    }

    onSave(template)
    onClose()
  }, [validateForm, exercises, title, description, type, intensity, duration, onSave, onClose])

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      // Tab navigation with focus trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
        
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      // Ctrl/Cmd + Enter to save
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleSave, onClose])

  // Prevent background scrolling
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const addExercise = () => {
    setExercises([...exercises, ''])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const updateExercise = (index: number, value: string) => {
    const newExercises = [...exercises]
    newExercises[index] = value
    setExercises(newExercises)
  }

  const getTypeIcon = (typeValue: string) => {
    const workoutType = workoutTypes.find(t => t.value === typeValue)
    if (!workoutType) return <ClockIcon className="h-4 w-4" />
    const IconComponent = workoutType.icon
    return <IconComponent className="h-4 w-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
        aria-describedby="template-modal-description"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 bg-gradient-to-r from-surface-light/50 to-surface-light/30 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 
                id="template-modal-title"
                className="text-xl font-semibold text-primary-text"
              >
                Create Workout Template
              </h2>
              <p 
                id="template-modal-description"
                className="text-sm text-secondary-text mt-1"
              >
                Create a reusable workout template for your library
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-border/50 text-primary-text hover:bg-surface/50"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="template-title" className="block text-sm font-medium text-primary-text mb-2">
                Template Title *
              </label>
              <Input
                id="template-title"
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CrossFit WOD - Helen"
                className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="template-description" className="block text-sm font-medium text-primary-text mb-2">
                Description *
              </label>
              <textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the workout..."
                className={`w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-primary-text placeholder:text-muted ${
                  errors.description ? 'border-red-500' : ''
                }`}
                rows={3}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && (
                <p id="description-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="template-type" className="block text-sm font-medium text-primary-text mb-2">
                  Type *
                </label>
                <div className="relative">
                  <select
                    id="template-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-primary-text appearance-none pr-10"
                  >
                    {workoutTypes.map((workoutType) => (
                      <option key={workoutType.value} value={workoutType.value}>
                        {workoutType.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {getTypeIcon(type)}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="template-intensity" className="block text-sm font-medium text-primary-text mb-2">
                  Intensity *
                </label>
                <select
                  id="template-intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-primary-text"
                >
                  {intensityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="template-duration" className="block text-sm font-medium text-primary-text mb-2">
                  Duration (minutes) *
                </label>
                <Input
                  id="template-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  min="1"
                  max="300"
                  className={`w-full ${errors.duration ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.duration}
                  aria-describedby={errors.duration ? "duration-error" : undefined}
                />
                {errors.duration && (
                  <p id="duration-error" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-primary-text">
                Exercises *
              </label>
              <Button
                onClick={addExercise}
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-primary/10"
                aria-label="Add exercise"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <Input
                      value={exercise}
                      onChange={(e) => updateExercise(index, e.target.value)}
                      placeholder={`Exercise ${index + 1}`}
                      className="w-full"
                      aria-label={`Exercise ${index + 1}`}
                    />
                  </div>
                  {exercises.length > 1 && (
                    <Button
                      onClick={() => removeExercise(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500 hover:bg-red-50 flex-shrink-0"
                      aria-label={`Remove exercise ${index + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.exercises && (
              <p className="text-red-500 text-xs mt-2" role="alert">
                {errors.exercises}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 bg-surface-light/30 border-t border-border/30">
          <div className="flex items-center justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-border text-secondary-text hover:bg-surface/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-white hover:bg-primary-dark"
              aria-label="Save template (Ctrl/Cmd + Enter)"
            >
              Save Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}