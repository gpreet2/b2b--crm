'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { 
  PlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  FireIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import WorkoutCalendar from '@/components/perform/WorkoutCalendar'
import AddWorkoutModal from '@/components/perform/AddWorkoutModal'
import WorkoutEventModal from '@/components/perform/WorkoutEventModal'
import { EnhancedWorkoutEvent } from '@/lib/types'


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

export default function WorkoutsPage() {
  const [selectedEvent, setSelectedEvent] = useState<WorkoutEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [view, setView] = useState<'week' | 'month' | 'list'>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Screen reader announcement function
  const announceToScreenReader = React.useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }, [])

  // Enhanced keyboard shortcuts for the entire page - will be moved after navigateDate function

  // Program-based workout events reflecting the programs from the programs tab
  const events = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      // Burn40 Workouts - Red
      {
        id: '1',
        title: 'Burn40',
        start: new Date(currentYear, currentMonth, 15, 6, 0),
        end: new Date(currentYear, currentMonth, 15, 6, 40),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'high',
          duration: 40,
          exercises: ['HIIT Circuit', 'Tabata Intervals', 'Cardio Blast'],
          notes: 'High-intensity interval training for maximum calorie burn',
          completed: true,
          program: 'Burn40'
        }
      },
      {
        id: '2',
        title: 'Burn40',
        start: new Date(currentYear, currentMonth, 17, 6, 0),
        end: new Date(currentYear, currentMonth, 17, 6, 40),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'high',
          duration: 40,
          exercises: ['Squats', 'Push-ups', 'Rows', 'Burpees'],
          notes: 'Full body strength and cardio',
          completed: false,
          program: 'Burn40'
        }
      },
      
      // CrossFit Workouts - Cyan
      {
        id: '3',
        title: 'CrossFit',
        start: new Date(currentYear, currentMonth, 16, 7, 0),
        end: new Date(currentYear, currentMonth, 16, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 60,
          exercises: ['Thrusters', 'Pull-ups', 'Box Jumps'],
          notes: 'Functional fitness with varied, high-intensity movements',
          completed: true,
          program: 'CrossFit'
        }
      },
      {
        id: '4',
        title: 'CrossFit',
        start: new Date(currentYear, currentMonth, 18, 7, 0),
        end: new Date(currentYear, currentMonth, 18, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 60,
          exercises: ['Deadlifts', 'Overhead Press', 'Rowing'],
          notes: 'Strength and conditioning focus',
          completed: false,
          program: 'CrossFit'
        }
      },
      
      // BurnDumbells Workouts - Green
      {
        id: '5',
        title: 'BurnDumbells',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burndumbells',
          intensity: 'medium',
          duration: 60,
          exercises: ['Dumbbell Press', 'Dumbbell Rows', 'Dumbbell Squats'],
          notes: 'Strength training with dumbbells',
          completed: false,
          program: 'BurnDumbells'
        }
      },
      
      // Additional program-based workouts
      {
        id: '6',
        title: 'Burn40',
        start: new Date(currentYear, currentMonth, 21, 6, 0),
        end: new Date(currentYear, currentMonth, 21, 6, 40),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'high',
          duration: 40,
          exercises: ['Tabata intervals', 'AMRAP circuit'],
          notes: 'Maximum intensity session',
          completed: false,
          program: 'Burn40'
        }
      },
      
      {
        id: '7',
        title: 'CrossFit',
        start: new Date(currentYear, currentMonth, 22, 7, 0),
        end: new Date(currentYear, currentMonth, 22, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 60,
          exercises: ['Olympic lifts', 'Gymnastics', 'Metabolic conditioning'],
          notes: 'Skill development and conditioning',
          completed: false,
          program: 'CrossFit'
        }
      },
      
      {
        id: '8',
        title: 'BurnDumbells',
        start: new Date(currentYear, currentMonth, 23, 18, 0),
        end: new Date(currentYear, currentMonth, 23, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burndumbells',
          intensity: 'medium',
          duration: 60,
          exercises: ['Upper body focus', 'Lower body focus'],
          notes: 'Full body dumbbell workout',
          completed: false,
          program: 'BurnDumbells'
        }
      }
    ]
  }, [])

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = selectedType === 'all' || event.extendedProps.type === selectedType
      return matchesType
    })
  }, [events, selectedType])

  // Program types for filter
  const workoutTypes = [
    { value: 'all', label: 'All Programs', icon: FireIcon, color: '#6b7280' },
    { value: 'burn40', label: 'Burn40', icon: BoltIcon, color: '#ef4444' },
    { value: 'crossfit', label: 'CrossFit', icon: FireIcon, color: '#06b6d4' },
    { value: 'burndumbells', label: 'BurnDumbells', icon: UserGroupIcon, color: '#10b981' },
  ]



  // Handle date click - open add workout modal
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsAddWorkoutModalOpen(true)
  }

  // Handle event click - open workout details modal
  const handleEventClick = (event: WorkoutEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  // Handle add workout
  const handleAddWorkout = (workoutData: Partial<EnhancedWorkoutEvent>) => {
    console.log('New workout data:', workoutData)
    console.log('Workout segments:', workoutData.segments)
    console.log('Total duration:', workoutData.totalDuration)
    console.log('Created from:', workoutData.createdFrom)
    console.log('Template IDs:', workoutData.templateIds)
    setIsAddWorkoutModalOpen(false)
    setSelectedDate(null)
  }

  // Navigate calendar
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }, [currentDate, view, setCurrentDate])

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Enhanced keyboard shortcuts for the entire page
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            // Ctrl/Cmd + N for new workout
            e.preventDefault()
            setIsAddWorkoutModalOpen(true)
            announceToScreenReader('Opening new workout modal')
            break
          case '1':
            // Ctrl/Cmd + 1 for week view
            e.preventDefault()
            setView('week')
            announceToScreenReader('Switched to week view')
            break
          case '2':
            // Ctrl/Cmd + 2 for month view
            e.preventDefault()
            setView('month')
            announceToScreenReader('Switched to month view')
            break
          case 'f':
            // Ctrl/Cmd + F for filter (focus on filter dropdown)
            e.preventDefault()
            const filterSelect = document.querySelector('select') as HTMLSelectElement
            if (filterSelect) {
              filterSelect.focus()
              announceToScreenReader('Filter dropdown focused')
            }
            break
        }
      }

      // Alt key shortcuts
      if (e.altKey) {
        switch (e.key) {
          case 'ArrowLeft':
            // Alt + Left Arrow for previous period
            e.preventDefault()
            navigateDate('prev')
            announceToScreenReader(`Navigated to previous ${view}`)
            break
          case 'ArrowRight':
            // Alt + Right Arrow for next period
            e.preventDefault()
            navigateDate('next')
            announceToScreenReader(`Navigated to next ${view}`)
            break
          case 't':
            // Alt + T for today
            e.preventDefault()
            goToToday()
            announceToScreenReader('Navigated to today')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [view, announceToScreenReader, navigateDate])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Keyboard shortcuts help - hidden but accessible */}
      <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
        <h2>Available keyboard shortcuts:</h2>
        <ul>
          <li>Ctrl/Cmd + N: Add new workout</li>
          <li>Ctrl/Cmd + 1: Switch to week view</li>
          <li>Ctrl/Cmd + 2: Switch to month view</li>
          <li>Ctrl/Cmd + F: Focus filter dropdown</li>
          <li>Alt + Left Arrow: Previous period</li>
          <li>Alt + Right Arrow: Next period</li>
          <li>Alt + T: Go to today</li>
          <li>Arrow keys: Navigate calendar dates</li>
          <li>Enter/Space: Select calendar date</li>
          <li>A: Add workout to focused date</li>
          <li>T: Go to today from calendar</li>
          <li>Page Up/Down: Navigate weeks/months</li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Mobile Optimization */}
        <div className="p-4 sm:p-6 bg-surface/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-light text-primary-text mb-1">Workouts</h1>
                <p className="text-sm sm:text-base text-secondary-text font-light">Track your daily workouts and performance</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Category Filter with Mobile Optimization */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <FunnelIcon className="h-4 w-4 text-secondary-text flex-shrink-0" />
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    announceToScreenReader(`Filter changed to ${e.target.options[e.target.selectedIndex].text}`)
                  }}
                  className="flex-1 sm:flex-none px-3 py-3 sm:py-2 bg-surface border border-border/50 rounded-lg text-primary-text text-base sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  aria-label="Filter workouts by type"
                  title="Filter workouts by type (Ctrl/Cmd + F to focus)"
                >
                  {workoutTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Workout Button with Touch-Friendly Design */}
              <button 
                onClick={() => setIsAddWorkoutModalOpen(true)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-light text-base sm:text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation"
                aria-label="Add new workout"
                title="Add new workout (Ctrl/Cmd + N)"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Workout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Section with Mobile Optimization */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
          <div className="bg-surface/95 backdrop-blur-sm border-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg flex-1 flex flex-col">
            {/* Calendar Header with Mobile Layout */}
            <div className="p-4 sm:p-6 border-b border-surface-light/30 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button 
                      onClick={() => navigateDate('prev')}
                      className="p-2 sm:p-3 hover:bg-surface-light/50 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      aria-label={`Go to previous ${view}`}
                      title={`Navigate to previous ${view} (Alt + Left Arrow)`}
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-secondary-text" />
                    </button>
                    <button 
                      onClick={() => navigateDate('next')}
                      className="p-2 sm:p-3 hover:bg-surface-light/50 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      aria-label={`Go to next ${view}`}
                      title={`Navigate to next ${view} (Alt + Right Arrow)`}
                    >
                      <ChevronRightIcon className="h-5 w-5 text-secondary-text" />
                    </button>
                    <button 
                      onClick={goToToday}
                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg min-h-[44px] touch-manipulation"
                      aria-label="Go to today"
                      title="Navigate to today (Alt + T)"
                    >
                      Today
                    </button>
                  </div>
                  
                  <div className="text-lg sm:text-xl font-light text-primary-text sm:hidden">
                    {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="hidden sm:block text-xl font-light text-primary-text">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>

                {/* View Toggle with Touch-Friendly Design */}
                <div className="flex items-center bg-surface-light/30 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setView('week')
                      announceToScreenReader('Switched to week view')
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-light transition-all duration-200 min-h-[40px] touch-manipulation ${
                      view === 'week' 
                        ? 'bg-primary text-white' 
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                    aria-label="Week view"
                    aria-pressed={view === 'week'}
                    title="Switch to week view (Ctrl/Cmd + 1)"
                  >
                    Week
                  </button>
                  <button
                    onClick={() => {
                      setView('month')
                      announceToScreenReader('Switched to month view')
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-light transition-all duration-200 min-h-[40px] touch-manipulation ${
                      view === 'month' 
                        ? 'bg-primary text-white' 
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                    aria-label="Month view"
                    aria-pressed={view === 'month'}
                    title="Switch to month view (Ctrl/Cmd + 2)"
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>
            
            {/* Calendar Content with Mobile Optimization */}
            <div className="flex-1 p-4 sm:p-6 overflow-hidden">
              <div className="h-full">
                <WorkoutCalendar
                  events={filteredEvents}
                  view={view}
                  currentDate={currentDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  onViewChange={setView}
                  onAddWorkout={(date) => {
                    if (date) {
                      setSelectedDate(date)
                    }
                    setIsAddWorkoutModalOpen(true)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Event Modal */}
      <WorkoutEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />

      {/* Add Workout Modal */}
      <AddWorkoutModal
        isOpen={isAddWorkoutModalOpen}
        onClose={() => {
          setIsAddWorkoutModalOpen(false)
          setSelectedDate(null)
        }}
        onSave={handleAddWorkout}
        selectedDate={selectedDate}
      />

      {/* Workout Library Sidebar - Removed in favor of new WorkoutLibrary component */}
    </div>
  )
} 