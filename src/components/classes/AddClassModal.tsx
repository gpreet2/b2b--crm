'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  UsersIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Program, Coach, Class, RecurrencePattern } from '@/lib/types'

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  programs: Program[]
  coaches: Coach[]
  onSave: (classData: Partial<Class>) => void
  editingClass?: Class | null
}

interface FormData {
  name: string
  programId: string
  coachId: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  location: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  notes: string
}

export default function AddClassModal({
  isOpen,
  onClose,
  programs,
  coaches,
  onSave,
  editingClass
}: AddClassModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: editingClass?.name || '',
    programId: editingClass?.programId || '',
    coachId: editingClass?.coachId || '',
    date: editingClass?.date ? editingClass.date.toISOString().split('T')[0] : '',
    startTime: editingClass?.startTime || '',
    endTime: editingClass?.endTime || '',
    capacity: editingClass?.capacity || 20,
    location: editingClass?.location || '',
    isRecurring: editingClass?.isRecurring || false,
    recurrencePattern: editingClass?.recurrencePattern,
    notes: editingClass?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const selectedProgram = programs.find(p => p.id === formData.programId)
  const selectedCoach = coaches.find(c => c.id === formData.coachId)

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRecurrenceChange = (field: keyof RecurrencePattern, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurrencePattern: {
        ...prev.recurrencePattern,
        [field]: value
      } as RecurrencePattern
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Class name is required'
    if (!formData.programId) newErrors.programId = 'Program is required'
    if (!formData.coachId) newErrors.coachId = 'Coach is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    // Validate recurrence pattern if recurring
    if (formData.isRecurring) {
      if (!formData.recurrencePattern?.frequency) {
        newErrors.recurrenceFrequency = 'Recurrence frequency is required'
      }
      if (formData.recurrencePattern?.frequency === 'weekly' && 
          (!formData.recurrencePattern?.daysOfWeek || formData.recurrencePattern.daysOfWeek.length === 0)) {
        newErrors.recurrenceDays = 'Select at least one day for weekly recurrence'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const classData: Partial<Class> = {
      name: formData.name,
      programId: formData.programId,
      coachId: formData.coachId,
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      capacity: formData.capacity,
      enrolled: editingClass?.enrolled || 0,
      location: formData.location,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      status: editingClass?.status || 'scheduled',
      notes: formData.notes || undefined
    }

    onSave(classData)
    onClose()
  }

  const handleDayToggle = (dayIndex: number) => {
    const currentDays = formData.recurrencePattern?.daysOfWeek || []
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex].sort()
    
    handleRecurrenceChange('daysOfWeek', newDays)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </CardTitle>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter class name"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Program Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program *
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) => handleInputChange('programId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.programId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {selectedProgram && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedProgram.color }}
                    />
                    <span className="text-sm text-gray-600">{selectedProgram.description}</span>
                  </div>
                )}
                {errors.programId && <p className="text-red-600 text-sm mt-1">{errors.programId}</p>}
              </div>

              {/* Coach Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach *
                </label>
                <select
                  value={formData.coachId}
                  onChange={(e) => handleInputChange('coachId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.coachId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a coach</option>
                  {coaches.filter(coach => coach.isActive).map(coach => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
                {selectedCoach && selectedCoach.specialties && (
                  <p className="text-sm text-gray-600 mt-1">
                    Specialties: {selectedCoach.specialties.join(', ')}
                  </p>
                )}
                {errors.coachId && <p className="text-red-600 text-sm mt-1">{errors.coachId}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={errors.date ? 'border-red-300' : ''}
                  />
                  {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={errors.startTime ? 'border-red-300' : ''}
                  />
                  {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={errors.endTime ? 'border-red-300' : ''}
                  />
                  {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
                </div>
              </div>

              {/* Capacity and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                    placeholder="20"
                    className={errors.capacity ? 'border-red-300' : ''}
                  />
                  {errors.capacity && <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Studio A"
                    className={errors.location ? 'border-red-300' : ''}
                  />
                  {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Recurring Class Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Recurring Class</span>
                </label>
              </div>

              {/* Recurrence Pattern */}
              {formData.isRecurring && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h4 className="text-sm font-medium text-blue-900">Recurrence Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency *
                    </label>
                    <select
                      value={formData.recurrencePattern?.frequency || ''}
                      onChange={(e) => handleRecurrenceChange('frequency', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.recurrenceFrequency ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {errors.recurrenceFrequency && <p className="text-red-600 text-sm mt-1">{errors.recurrenceFrequency}</p>}
                  </div>

                  {formData.recurrencePattern?.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days of Week *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dayNames.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(index)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              formData.recurrencePattern?.daysOfWeek?.includes(index)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      {errors.recurrenceDays && <p className="text-red-600 text-sm mt-1">{errors.recurrenceDays}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={formData.recurrencePattern?.endDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleRecurrenceChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this class..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}