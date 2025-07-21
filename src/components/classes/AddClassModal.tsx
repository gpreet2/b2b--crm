'use client'

import React, { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { Class, Program, Coach } from '@/lib/types'
import { mockPrograms, mockCoaches } from '@/lib/mock-data'

export interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (classData: Partial<Class>) => void
  programs?: Program[]
  coaches?: Coach[]
}

export default function AddClassModal({
  isOpen,
  onClose,
  onSave,
  programs = mockPrograms,
  coaches = mockCoaches
}: AddClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    programId: '',
    coachId: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 20,
    location: '',
    description: '',
    isRecurring: false,
    recurringDays: [] as string[],
    recurringEndDate: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRecurringDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    }
    if (!formData.programId) {
      newErrors.programId = 'Program is required'
    }
    if (!formData.coachId) {
      newErrors.coachId = 'Coach is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    if (formData.isRecurring && formData.recurringDays.length === 0) {
      newErrors.recurringDays = 'Select at least one recurring day'
    }
    if (formData.isRecurring && !formData.recurringEndDate) {
      newErrors.recurringEndDate = 'Recurring end date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const classData: Partial<Class> = {
        name: formData.name,
        programId: formData.programId,
        coachId: formData.coachId,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: formData.capacity,
        location: formData.location,
        // description is not a property of Class, so we remove it
        enrolled: 0,
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && { recurringDays: formData.recurringDays }),
        ...(formData.isRecurring && { recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined })
      }

      onSave(classData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      programId: '',
      coachId: '',
      date: '',
      startTime: '',
      endTime: '',
      capacity: 20,
      location: '',
      description: '',
      isRecurring: false,
      recurringDays: [],
      recurringEndDate: ''
    })
    setErrors({})
    onClose()
  }

  const selectedProgram = programs.find(p => p.id === formData.programId)
  const selectedCoach = coaches.find(c => c.id === formData.coachId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-light border border-border">
        {/* Header */}
        <DialogHeader className="border-b border-border bg-surface/50 p-6 -m-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-primary-text">
                {formData.isRecurring ? 'Create Recurring Class' : 'Create New Class'}
              </DialogTitle>
              <DialogDescription className="text-sm text-secondary-text">
                Schedule a new fitness class session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Type Toggle */}
          <div className="flex items-center space-x-4 p-4 bg-surface/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="oneTime"
                name="classType"
                checked={!formData.isRecurring}
                onChange={() => handleInputChange('isRecurring', false)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="oneTime" className="text-primary-text font-medium">
                One Time Class
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="recurring"
                name="classType"
                checked={formData.isRecurring}
                onChange={() => handleInputChange('isRecurring', true)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="recurring" className="text-primary-text font-medium">
                Recurring Class
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Class Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Morning HIIT Blast"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Studio A"
              />
            </div>
          </div>

          {/* Program and Coach Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Program *
              </label>
              <select
                value={formData.programId}
                onChange={(e) => handleInputChange('programId', e.target.value)}
                className={`w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.programId ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {errors.programId && <p className="text-red-500 text-xs mt-1">{errors.programId}</p>}
              {selectedProgram && (
                <div className="mt-2 flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedProgram.color }}
                  />
                  <span className="text-xs text-secondary-text">{selectedProgram.description}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Coach *
              </label>
              <select
                value={formData.coachId}
                onChange={(e) => handleInputChange('coachId', e.target.value)}
                className={`w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.coachId ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a coach</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
              {errors.coachId && <p className="text-red-500 text-xs mt-1">{errors.coachId}</p>}
              {selectedCoach && (
                <div className="mt-2 flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-muted" />
                  <span className="text-xs text-secondary-text">{selectedCoach.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`pl-10 ${errors.date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Start Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`pl-10 ${errors.startTime ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                End Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`pl-10 ${errors.endTime ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Capacity
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange('capacity', Math.max(1, formData.capacity - 1))}
                className="p-2 rounded-lg bg-surface hover:bg-surface-light transition-colors text-muted hover:text-primary-text"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="text-center w-20"
              />
              <button
                type="button"
                onClick={() => handleInputChange('capacity', Math.min(100, formData.capacity + 1))}
                className="p-2 rounded-lg bg-surface hover:bg-surface-light transition-colors text-muted hover:text-primary-text"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recurring Options */}
          {formData.isRecurring && (
            <div className="space-y-4 p-4 bg-surface/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-primary-text">Recurring Schedule</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Recurring Days *
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleRecurringDayToggle(day)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.recurringDays.includes(day)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-surface text-secondary-text hover:bg-surface-light hover:text-primary-text'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.recurringDays && <p className="text-red-500 text-xs mt-1">{errors.recurringDays}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                  className={errors.recurringEndDate ? 'border-red-500' : ''}
                />
                {errors.recurringEndDate && <p className="text-red-500 text-xs mt-1">{errors.recurringEndDate}</p>}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional class description..."
              rows={3}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="btn-animate"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white btn-animate"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}