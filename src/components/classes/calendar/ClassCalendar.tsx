'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Class, Program, Coach } from '@/lib/types'
import { mockClasses, mockPrograms, mockCoaches } from '@/lib/mock-data'

export interface ClassCalendarProps {
  classes?: Class[]
  programs?: Program[]
  coaches?: Coach[]
  onEventClick?: (classEvent: Class) => void
  onDateClick?: (date: Date) => void

  filteredProgramIds?: string[]
  filteredCoachIds?: string[]
}

export default function ClassCalendar({
  classes = mockClasses,
  programs = mockPrograms,
  coaches = mockCoaches,
  onEventClick,
  onDateClick,
  filteredProgramIds,
  filteredCoachIds
}: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Create program and coach lookup maps
  const programMap = useMemo(() => {
    return programs.reduce((acc, program) => {
      acc[program.id] = program
      return acc
    }, {} as Record<string, Program>)
  }, [programs])

  const coachMap = useMemo(() => {
    return coaches.reduce((acc, coach) => {
      acc[coach.id] = coach
      return acc
    }, {} as Record<string, Coach>)
  }, [coaches])

  // Filter classes based on current filters
  const filteredClasses = useMemo(() => {
    return classes.filter(classItem => {
      if (filteredProgramIds && filteredProgramIds.length > 0) {
        if (!filteredProgramIds.includes(classItem.programId)) return false
      }
      if (filteredCoachIds && filteredCoachIds.length > 0) {
        if (!filteredCoachIds.includes(classItem.coachId)) return false
      }
      return true
    })
  }, [classes, filteredProgramIds, filteredCoachIds])

  // Get week dates for current week
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day // Adjust to start on Sunday
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek)
      weekDate.setDate(startOfWeek.getDate() + i)
      week.push(weekDate)
    }
    return week
  }

  const weekDates = getWeekDates(currentDate)

  // Get classes for current week
  const weekClasses = useMemo(() => {
    const startOfWeek = weekDates[0]
    const endOfWeek = weekDates[6]
    
    return filteredClasses.filter(classItem => {
      const classDate = new Date(classItem.date)
      return classDate >= startOfWeek && classDate <= endOfWeek
    })
  }, [filteredClasses, weekDates])

  // Group classes by date
  const classesByDate = useMemo(() => {
    const grouped: Record<string, Class[]> = {}
    
    weekClasses.forEach(classItem => {
      const dateKey = classItem.date.toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(classItem)
    })

    // Sort classes by start time within each day
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })

    return grouped
  }, [weekClasses])

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get capacity status
  const getCapacityStatus = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100
    if (percentage >= 100) return 'full'
    if (percentage >= 80) return 'high'
    if (percentage >= 50) return 'medium'
    return 'low'
  }

  // Handle class click
  const handleClassClick = (classEvent: Class) => {
    onEventClick?.(classEvent)
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    onDateClick?.(date)
  }

  return (
    <Card className="overflow-hidden card-animate">
      <CardHeader className="border-b border-border bg-surface-light">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="text-primary-text">Weekly Schedule</span>
          </CardTitle>
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="btn-animate">
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="btn-animate">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek} className="btn-animate">
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Week Range Display */}
        <div className="text-sm text-secondary-text">
          {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
          {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {/* Week Header */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-light/30">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNumber = date.getDate()
              
              return (
                <div 
                  key={index}
                  className={`p-4 text-center border-r border-border last:border-r-0 cursor-pointer hover:bg-surface-light/50 transition-all duration-200 hover-lift ${
                    isToday ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
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
              const dayClasses = classesByDate[dateKey] || []
              
              return (
                <div 
                  key={index}
                  className="border-r border-border last:border-r-0 p-2 space-y-1 min-h-[400px] bg-surface hover:bg-surface-light transition-colors duration-200"
                >
                  {dayClasses.map((classItem) => {
                    const program = programMap[classItem.programId]
                    const coach = coachMap[classItem.coachId]
                    const capacityStatus = getCapacityStatus(classItem.enrolled, classItem.capacity)
                    
                    return (
                      <div
                        key={classItem.id}
                        className="p-2 rounded-md text-xs cursor-pointer hover:opacity-80 transition-all duration-200 hover-lift"
                        style={{ 
                          backgroundColor: program?.color || '#6b7280',
                          color: 'white'
                        }}
                        onClick={() => handleClassClick(classItem)}
                      >
                        <div className="font-semibold truncate mb-1">
                          {classItem.name}
                        </div>
                        <div className="flex items-center justify-between text-xs opacity-90">
                          <span>{formatTime(classItem.startTime)}</span>
                          <span>{classItem.enrolled}/{classItem.capacity}</span>
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {coach?.name}
                        </div>
                        
                        {/* Capacity indicator */}
                        <div className="mt-1 h-1 bg-black/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              capacityStatus === 'full' ? 'bg-red-300' :
                              capacityStatus === 'high' ? 'bg-yellow-300' :
                              'bg-green-300'
                            }`}
                            style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}