'use client'

import React, { useState, useMemo } from 'react'
import { 
  PlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ListBulletIcon,
  ViewColumnsIcon,
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
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all')
  const [view, setView] = useState<'week' | 'month' | 'list'>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
      const matchesIntensity = selectedIntensity === 'all' || event.extendedProps.intensity === selectedIntensity
      return matchesType && matchesIntensity
    })
  }, [events, selectedType, selectedIntensity])

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

  // Intensity levels for filter
  const intensityLevels = [
    { value: 'all', label: 'All Intensities' },
    { value: 'low', label: 'Low Intensity' },
    { value: 'medium', label: 'Medium Intensity' },
    { value: 'high', label: 'High Intensity' },
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

  // Weekly statistics
  const weeklyStats = {
    totalWorkouts: 8,
    completedWorkouts: 3,
    totalTime: 390,
    averageIntensity: 'medium'
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-primary-text mb-1">Workouts</h1>
          <p className="text-secondary-text font-light">Track your daily workouts and performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Workout Library button removed - now accessible through Add Workout modal */}
        </div>
      </div>

      {/* Main Layout - Calendar Only */}
      <div className="bg-surface/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden shadow-lg">
        {/* Calendar Content */}
        <div className="p-6">
          <WorkoutCalendar
            events={filteredEvents}
            view={view}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onViewChange={setView}
            onAddWorkout={() => setIsAddWorkoutModalOpen(true)}
          />
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
        onOpenWorkoutLibrary={() => {
          // This is now handled within the AddWorkoutModal component
        }}
      />

      {/* Workout Library Sidebar - Removed in favor of new WorkoutLibrary component */}
    </div>
  )
} 