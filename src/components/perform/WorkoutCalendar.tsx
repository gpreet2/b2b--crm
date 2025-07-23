'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  PlusIcon,
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

interface WorkoutCalendarProps {
  events: WorkoutEvent[]
  view: 'week' | 'month' | 'list'
  currentDate?: Date
  onEventClick?: (event: WorkoutEvent) => void
  onDateClick?: (date: Date) => void
  onViewChange?: (view: 'week' | 'month' | 'list') => void
  onAddWorkout?: () => void
}

export default function WorkoutCalendar({
  events,
  view,
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  onViewChange,
  onAddWorkout
}: WorkoutCalendarProps) {

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    start.setDate(diff)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(start)
      weekDate.setDate(start.getDate() + i)
      dates.push(weekDate)
    }
    return dates
  }

  // Get month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)
    
    // Adjust to start from Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())
    // Adjust to end on Saturday
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    const dates = []
    const current = new Date(startDate)
    while (current <= endDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const displayDates = view === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate)

  // Filter events for current view
  const visibleEvents = useMemo(() => {
    if (view === 'list') {
      return events.sort((a, b) => a.start.getTime() - b.start.getTime())
    }
    
    const startDate = displayDates[0]
    const endDate = displayDates[displayDates.length - 1]
    
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= startDate && eventDate <= endDate
    })
  }, [events, displayDates, view])

  // Group events by date
  const eventsByDate = useMemo(() => {
    return visibleEvents.reduce((acc, event) => {
      const dateKey = event.start.toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {} as Record<string, WorkoutEvent[]>)
  }, [visibleEvents])

  // Time slots for week view
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ]

  const formatDateHeader = () => {
    if (view === 'week') {
      const weekDates = getWeekDates(currentDate)
      const start = weekDates[0]
      const end = weekDates[6]
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crossfit':
        return <FireIcon className="h-3 w-3" />
      case 'burn40':
        return <BoltIcon className="h-3 w-3" />
      case 'strength':
        return <UserGroupIcon className="h-3 w-3" />
      case 'cardio':
        return <HeartIcon className="h-3 w-3" />
      default:
        return <ClockIcon className="h-3 w-3" />
    }
  }

  const renderWorkoutEvent = (event: WorkoutEvent) => {
    const duration = event.extendedProps.duration
    const isCompleted = event.extendedProps.completed
    
    return (
      <div
        key={event.id}
        className="p-2 rounded-md text-xs cursor-pointer hover:opacity-80 transition-all duration-200 hover-lift"
        style={{ 
          backgroundColor: event.backgroundColor,
          color: event.textColor
        }}
        onClick={() => onEventClick?.(event)}
      >
        <div className="font-semibold truncate mb-1">{event.title}</div>
        <div className="flex items-center justify-between text-xs opacity-90">
          <span>{event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>{duration}m</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {getTypeIcon(event.extendedProps.type)}
          <span className="text-xs opacity-75 capitalize">{event.extendedProps.intensity}</span>
        </div>
        {/* Progress indicator for completed workouts */}
        {isCompleted && (
          <div className="mt-1 h-1 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-green-300" style={{ width: '100%' }} />
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate)
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, date: Date) => {
      e.preventDefault()
      try {
        const workoutData = JSON.parse(e.dataTransfer.getData('application/json'))
        console.log('Dropped workout on date:', date, workoutData)
        // Here you would typically create a new workout event
        onDateClick?.(date)
      } catch (error) {
        console.error('Error parsing dropped workout data:', error)
      }
    }
    
    return (
      <div className="overflow-x-auto">
        {/* Week Header */}
        <div className="grid grid-cols-7 border-b border-border/50 bg-surface-light/30">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNumber = date.getDate()
            
            return (
              <div 
                key={index}
                className={`p-4 text-center border-r border-border/50 last:border-r-0 cursor-pointer hover:bg-surface-light/50 transition-all duration-200 hover-lift ${
                  isToday ? 'bg-primary/10 text-primary font-semibold' : ''
                }`}
                onClick={() => onDateClick?.(date)}
              >
                <div className="text-sm font-medium text-secondary-text">{dayName}</div>
                <div className={`text-lg ${isToday ? 'text-primary' : 'text-primary-text'}`}>
                  {dayNumber}
                </div>
              </div>
            )
          })}
        </div>

        {/* Week Body */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {weekDates.map((date, index) => {
            const dateKey = date.toDateString()
            const dayEvents = eventsByDate[dateKey] || []
            
            return (
              <div 
                key={index}
                className="border-r border-border/50 last:border-r-0 p-4 space-y-2 min-h-[400px] bg-surface hover:bg-surface-light/30 transition-colors duration-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                {dayEvents.map(renderWorkoutEvent)}
                {/* Drop zone indicator */}
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 p-2 border-2 border-dashed border-primary/30 rounded-lg text-center text-xs text-primary/70">
                  Drop workout here
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate)
    const weeks = []
    
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7))
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, date: Date) => {
      e.preventDefault()
      try {
        const workoutData = JSON.parse(e.dataTransfer.getData('application/json'))
        console.log('Dropped workout on date:', date, workoutData)
        // Here you would typically create a new workout event
        onDateClick?.(date)
      } catch (error) {
        console.error('Error parsing dropped workout data:', error)
      }
    }
    
    return (
      <div className="space-y-px">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-surface-light rounded-t-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-surface-light p-2 text-center text-xs font-medium text-secondary-text">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-surface-light rounded-b-lg overflow-hidden">
          {monthDates.map((date, index) => {
            const dateKey = date.toDateString()
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div 
                key={index}
                className={`bg-surface p-4 min-h-[120px] cursor-pointer hover:bg-surface-light transition-colors relative ${
                  !isCurrentMonth ? 'text-muted bg-surface-light/50' : ''
                } ${isToday ? 'bg-primary/10' : ''}`}
                onClick={() => onDateClick?.(date)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-primary-text'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(renderWorkoutEvent)}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-secondary-text text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    return (
      <div className="bg-surface/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-surface-light/30 border-b border-surface-light/30">
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">WORKOUT</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">TYPE</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">STATUS</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">DURATION</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">TIME</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">ACTIONS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-surface-light/30">
          {visibleEvents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClockIcon className="h-12 w-12 text-secondary-text mx-auto mb-4" />
              <h3 className="text-lg font-light text-primary-text mb-2">No workouts found</h3>
              <p className="text-sm text-secondary-text">
                No workouts scheduled for this period
              </p>
            </div>
          ) : (
            visibleEvents.map((event) => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'crossfit': return '#ef4444'
                  case 'burn40': return '#f97316'
                  case 'strength': return '#10b981'
                  case 'cardio': return '#3b82f6'
                  case 'yoga': return '#8b5cf6'
                  case 'recovery': return '#14b8a6'
                  default: return '#6b7280'
                }
              }

              const getTypeLabel = (type: string) => {
                switch (type) {
                  case 'crossfit': return 'CrossFit'
                  case 'burn40': return 'Burn40'
                  case 'strength': return 'Strength'
                  case 'cardio': return 'Cardio'
                  case 'yoga': return 'Yoga'
                  case 'recovery': return 'Recovery'
                  default: return type.charAt(0).toUpperCase() + type.slice(1)
                }
              }

              const getStatusColor = (completed: boolean) => {
                return completed 
                  ? 'bg-success/20 text-success border-success/30' 
                  : 'bg-warning/20 text-warning border-warning/30'
              }

              const getStatusText = (completed: boolean) => {
                return completed ? 'Completed' : 'Scheduled'
              }

              return (
                <div 
                  key={event.id}
                  className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-surface-light/20 transition-all duration-200 cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >
                  {/* WORKOUT */}
                  <div className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: getTypeColor(event.extendedProps.type) }}
                      />
                      <div>
                        <div className="text-sm font-light text-primary-text">{event.title}</div>
                        <div className="text-xs text-secondary-text">
                          {event.extendedProps.exercises.length > 0 
                            ? `${event.extendedProps.exercises.length} exercises`
                            : 'No exercises listed'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TYPE */}
                  <div className="flex items-center">
                    <span className="text-sm text-secondary-text capitalize">
                      {getTypeLabel(event.extendedProps.type)}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.extendedProps.completed)}`}>
                      {getStatusText(event.extendedProps.completed)}
                    </span>
                  </div>

                  {/* DURATION */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-primary-text">{event.extendedProps.duration}m</span>
                  </div>

                  {/* TIME */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-light text-primary-text">
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-secondary-text">
                        {event.start.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center space-x-2">
                    {event.extendedProps.completed ? (
                      <div className="w-2 h-2 rounded-full bg-success" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-warning" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'list' && renderListView()}
    </div>
  )
} 