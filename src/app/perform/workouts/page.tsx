'use client'

import React, { useState, useMemo } from 'react'
import { 
  PlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import WorkoutCalendar from '@/components/perform/WorkoutCalendar'
import AddWorkoutModal from '@/components/perform/AddWorkoutModal'
import WorkoutEventModal from '@/components/perform/WorkoutEventModal'


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

  // Enhanced workout events with better variety
  const events = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      // CrossFit Workouts - Red
      {
        id: '1',
        title: 'CrossFit WOD',
        start: new Date(currentYear, currentMonth, 15, 6, 0),
        end: new Date(currentYear, currentMonth, 15, 7, 0),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 60,
          exercises: ['Thrusters', 'Pull-ups', 'Box Jumps'],
          notes: 'AMRAP 20 minutes',
          completed: true
        }
      },
      {
        id: '2',
        title: 'CrossFit Strength',
        start: new Date(currentYear, currentMonth, 17, 6, 0),
        end: new Date(currentYear, currentMonth, 17, 7, 0),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 60,
          exercises: ['Deadlifts', 'Overhead Press'],
          notes: '5x5 Deadlifts, 3x8 OHP',
          completed: false
        }
      },
      
      // Burn40 Workouts - Orange
      {
        id: '3',
        title: 'Burn40 Cardio',
        start: new Date(currentYear, currentMonth, 16, 7, 0),
        end: new Date(currentYear, currentMonth, 16, 7, 40),
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'medium',
          duration: 40,
          exercises: ['HIIT Circuit', 'Tabata Intervals'],
          notes: 'High-intensity cardio session',
          completed: true
        }
      },
      {
        id: '4',
        title: 'Burn40 Strength',
        start: new Date(currentYear, currentMonth, 18, 7, 0),
        end: new Date(currentYear, currentMonth, 18, 7, 40),
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'medium',
          duration: 40,
          exercises: ['Squats', 'Push-ups', 'Rows'],
          notes: 'Full body strength',
          completed: false
        }
      },
      
      // Yoga Sessions - Purple
      {
        id: '5',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        extendedProps: {
          type: 'yoga',
          intensity: 'low',
          duration: 60,
          exercises: ['Sun Salutations', 'Balance Poses', 'Meditation'],
          notes: 'Vinyasa flow for recovery',
          completed: false
        }
      },
      
      // Strength Training - Green
      {
        id: '6',
        title: 'Upper Body Strength',
        start: new Date(currentYear, currentMonth, 15, 17, 0),
        end: new Date(currentYear, currentMonth, 15, 18, 30),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          type: 'strength',
          intensity: 'high',
          duration: 90,
          exercises: ['Bench Press', 'Rows', 'Shoulder Press'],
          notes: 'Progressive overload focus',
          completed: true
        }
      },
      
      // Cardio Sessions - Blue
      {
        id: '7',
        title: 'Running Session',
        start: new Date(currentYear, currentMonth, 17, 17, 0),
        end: new Date(currentYear, currentMonth, 17, 18, 0),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          type: 'cardio',
          intensity: 'medium',
          duration: 60,
          exercises: ['5K Run', 'Intervals'],
          notes: 'Endurance building',
          completed: false
        }
      },
      
      // Recovery Sessions - Teal
      {
        id: '8',
        title: 'Recovery & Mobility',
        start: new Date(currentYear, currentMonth, 19, 18, 0),
        end: new Date(currentYear, currentMonth, 19, 19, 0),
        backgroundColor: '#14b8a6',
        borderColor: '#0d9488',
        textColor: '#ffffff',
        extendedProps: {
          type: 'recovery',
          intensity: 'low',
          duration: 60,
          exercises: ['Foam Rolling', 'Stretching', 'Mobility Work'],
          notes: 'Active recovery day',
          completed: false
        }
      },
      
      // Additional CrossFit Workouts
      {
        id: '9',
        title: 'CrossFit WOD - Murph',
        start: new Date(currentYear, currentMonth, 20, 6, 0),
        end: new Date(currentYear, currentMonth, 20, 7, 30),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'high',
          duration: 90,
          exercises: ['1 Mile Run', '100 Pull-ups', '200 Push-ups', '300 Air Squats', '1 Mile Run'],
          notes: 'Hero WOD - For time with vest',
          completed: false
        }
      },
      {
        id: '10',
        title: 'CrossFit Skills',
        start: new Date(currentYear, currentMonth, 21, 17, 0),
        end: new Date(currentYear, currentMonth, 21, 18, 0),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          type: 'crossfit',
          intensity: 'medium',
          duration: 60,
          exercises: ['Handstand Practice', 'Muscle-ups', 'Double-unders'],
          notes: 'Skill development session',
          completed: false
        }
      },
      
      // Additional Burn40 Workouts
      {
        id: '11',
        title: 'Burn40 Tabata',
        start: new Date(currentYear, currentMonth, 20, 7, 0),
        end: new Date(currentYear, currentMonth, 20, 7, 40),
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        textColor: '#ffffff',
        extendedProps: {
          type: 'burn40',
          intensity: 'high',
          duration: 40,
          exercises: ['20s Work / 10s Rest', '8 Rounds Each Exercise'],
          notes: 'Tabata intervals for maximum intensity',
          completed: false
        }
      },
      
      // Additional Strength Workouts
      {
        id: '12',
        title: 'Lower Body Power',
        start: new Date(currentYear, currentMonth, 21, 6, 0),
        end: new Date(currentYear, currentMonth, 21, 7, 30),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          type: 'strength',
          intensity: 'high',
          duration: 90,
          exercises: ['Squats', 'Deadlifts', 'Lunges', 'Calf Raises'],
          notes: 'Focus on lower body strength and power',
          completed: false
        }
      },
      
      // Additional Cardio Workouts
      {
        id: '13',
        title: 'HIIT Intervals',
        start: new Date(currentYear, currentMonth, 22, 17, 0),
        end: new Date(currentYear, currentMonth, 22, 18, 0),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          type: 'cardio',
          intensity: 'high',
          duration: 60,
          exercises: ['30s Sprint', '30s Rest', 'Repeat 20 times'],
          notes: 'High-intensity interval training',
          completed: false
        }
      },
      
      // Additional Yoga Sessions
      {
        id: '14',
        title: 'Power Yoga',
        start: new Date(currentYear, currentMonth, 23, 18, 0),
        end: new Date(currentYear, currentMonth, 23, 19, 0),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        extendedProps: {
          type: 'yoga',
          intensity: 'medium',
          duration: 60,
          exercises: ['Sun Salutations', 'Warrior Poses', 'Balance Work'],
          notes: 'Dynamic yoga flow for strength and flexibility',
          completed: false
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

  // Workout types for filter
  const workoutTypes = [
    { value: 'all', label: 'All Types', icon: FireIcon, color: '#6b7280' },
    { value: 'crossfit', label: 'CrossFit', icon: FireIcon, color: '#ef4444' },
    { value: 'burn40', label: 'Burn40', icon: BoltIcon, color: '#f97316' },
    { value: 'strength', label: 'Strength', icon: UserGroupIcon, color: '#10b981' },
    { value: 'cardio', label: 'Cardio', icon: HeartIcon, color: '#3b82f6' },
    { value: 'yoga', label: 'Yoga', icon: ClockIcon, color: '#8b5cf6' },
    { value: 'recovery', label: 'Recovery', icon: ClockIcon, color: '#14b8a6' },
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
  const handleAddWorkout = (workoutData: Record<string, unknown>) => {
    console.log('New workout data:', workoutData)
    console.log('Workout segments:', workoutData.segments)
    console.log('Total duration:', workoutData.totalDuration)
    setIsAddWorkoutModalOpen(false)
    setSelectedDate(null)
  }

  // Navigate calendar
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-surface/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">

              <div>
                <h1 className="text-2xl font-light text-primary-text mb-1">Workouts</h1>
                <p className="text-secondary-text font-light">Track your daily workouts and performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-secondary-text" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 bg-surface border border-border/50 rounded-lg text-primary-text text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {workoutTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Workout Button */}
              <button 
                onClick={() => setIsAddWorkoutModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Workout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-surface/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden shadow-lg h-full">
            {/* Calendar Header */}
            <div className="p-6 border-b border-surface-light/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => navigateDate('prev')}
                    className="p-3 hover:bg-surface-light/50 rounded-xl transition-all duration-200"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-secondary-text" />
                  </button>
                  <button 
                    onClick={() => navigateDate('next')}
                    className="p-3 hover:bg-surface-light/50 rounded-xl transition-all duration-200"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-secondary-text" />
                  </button>
                  <button 
                    onClick={goToToday}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg"
                  >
                    Today
                  </button>
                </div>
                
                <div className="text-xl font-light text-primary-text">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-surface-light/30 rounded-lg p-1">
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 rounded-md text-xs font-light transition-all duration-200 ${
                      view === 'week' 
                        ? 'bg-primary text-white' 
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 rounded-md text-xs font-light transition-all duration-200 ${
                      view === 'month' 
                        ? 'bg-primary text-white' 
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            <div className="flex-1 p-6">
              <WorkoutCalendar
                events={filteredEvents}
                view={view}
                currentDate={currentDate}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onViewChange={setView}
                onAddWorkout={() => setIsAddWorkoutModalOpen(true)}
              />
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