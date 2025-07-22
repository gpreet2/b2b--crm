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

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
              <PlusIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-light text-primary-text">
                {formData.isRecurring ? 'Create Recurring Class' : 'Create New Class'}
              </DialogTitle>
              <DialogDescription className="text-sm text-secondary-text font-light mt-1">
                Schedule a new fitness class session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
          {/* Class Type Toggle */}
          <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="oneTime"
                name="classType"
                checked={!formData.isRecurring}
                onChange={() => handleInputChange('isRecurring', false)}
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="oneTime" className="text-primary-text font-light text-lg">
                One Time Class
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="recurring"
                name="classType"
                checked={formData.isRecurring}
                onChange={() => handleInputChange('isRecurring', true)}
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="recurring" className="text-primary-text font-light text-lg">
                Recurring Class
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Class Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Morning HIIT Blast"
                className={`bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 ${errors.name ? 'ring-2 ring-danger/20' : ''}`}
              />
              {errors.name && <p className="text-danger text-xs mt-2 font-light">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Studio A"
                className="bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200"
              />
            </div>
          </div>

          {/* Program and Coach Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Program *
              </label>
              <select
                value={formData.programId}
                onChange={(e) => handleInputChange('programId', e.target.value)}
                className={`w-full px-4 py-3 bg-surface-light/50 border-0 rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 font-light ${
                  errors.programId ? 'ring-2 ring-danger/20' : ''
                }`}
              >
                <option value="">Select a program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {errors.programId && <p className="text-danger text-xs mt-2 font-light">{errors.programId}</p>}
              {selectedProgram && (
                <div className="mt-3 flex items-center space-x-3 p-3 bg-surface-light/30 rounded-xl">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedProgram.color }}
                  />
                  <span className="text-sm text-secondary-text font-light">{selectedProgram.description}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Coach *
              </label>
              <select
                value={formData.coachId}
                onChange={(e) => handleInputChange('coachId', e.target.value)}
                className={`w-full px-4 py-3 bg-surface-light/50 border-0 rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 font-light ${
                  errors.coachId ? 'ring-2 ring-danger/20' : ''
                }`}
              >
                <option value="">Select a coach</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
              {errors.coachId && <p className="text-danger text-xs mt-2 font-light">{errors.coachId}</p>}
              {selectedCoach && (
                <div className="mt-3 flex items-center space-x-3 p-3 bg-surface-light/30 rounded-xl">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary-text font-light">{selectedCoach.role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`pl-12 bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 ${errors.date ? 'ring-2 ring-danger/20' : ''}`}
                />
              </div>
              {errors.date && <p className="text-danger text-xs mt-2 font-light">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                Start Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`pl-12 bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 ${errors.startTime ? 'ring-2 ring-danger/20' : ''}`}
                />
              </div>
              {errors.startTime && <p className="text-danger text-xs mt-2 font-light">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-light text-primary-text mb-3">
                End Time *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`pl-12 bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 ${errors.endTime ? 'ring-2 ring-danger/20' : ''}`}
                />
              </div>
              {errors.endTime && <p className="text-danger text-xs mt-2 font-light">{errors.endTime}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-light text-primary-text mb-3">
              Capacity
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleInputChange('capacity', Math.max(1, formData.capacity - 1))}
                className="p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all duration-200 text-primary hover:text-primary-dark"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="text-center w-24 bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => handleInputChange('capacity', Math.min(100, formData.capacity + 1))}
                className="p-3 rounded-xl bg-surface-light/50 hover:bg-surface-light transition-all duration-200 text-primary hover:text-primary-dark"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Recurring Options */}
          {formData.isRecurring && (
            <div className="space-y-6 p-6 bg-gradient-to-r from-surface-light/30 to-surface-light/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <ArrowPathIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-light text-primary-text">Recurring Schedule</h3>
              </div>

              <div>
                <label className="block text-sm font-light text-primary-text mb-3">
                  Recurring Days *
                </label>
                <div className="grid grid-cols-7 gap-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleRecurringDayToggle(day)}
                      className={`p-3 rounded-xl text-sm font-light transition-all duration-200 ${
                        formData.recurringDays.includes(day)
                          ? 'bg-primary text-white shadow-lg transform scale-105'
                          : 'bg-surface-light/50 text-secondary-text hover:bg-surface-light hover:text-primary-text'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.recurringDays && <p className="text-danger text-xs mt-2 font-light">{errors.recurringDays}</p>}
              </div>

              <div>
                <label className="block text-sm font-light text-primary-text mb-3">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                  className={`bg-surface-light/50 border-0 rounded-xl px-4 py-3 text-primary-text focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200 ${errors.recurringEndDate ? 'ring-2 ring-danger/20' : ''}`}
                />
                {errors.recurringEndDate && <p className="text-danger text-xs mt-2 font-light">{errors.recurringEndDate}</p>}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-light text-primary-text mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional class description..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-light/50 border-0 rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-light resize-none font-light transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="font-light px-6 py-3 rounded-xl border-surface-light/50 hover:bg-surface-light/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-light px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}