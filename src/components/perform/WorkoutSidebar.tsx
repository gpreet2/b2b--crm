'use client'

import React, { useState } from 'react'
import { 
  XMarkIcon,
  PlusIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

interface WorkoutSidebarProps {
  isOpen: boolean
  onClose: () => void
  onAddWorkout?: (workout: PreBuiltWorkout) => void
}

interface PreBuiltWorkout {
  id: string
  title: string
  type: string
  intensity: string
  duration: number
  exercises: string[]
  description: string
  isFavorite: boolean
}

export default function WorkoutSidebar({
  isOpen,
  onClose,
  onAddWorkout
}: WorkoutSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedIntensity, setSelectedIntensity] = useState('all')
  const [draggedWorkout, setDraggedWorkout] = useState<PreBuiltWorkout | null>(null)

  // Pre-built workout templates
  const preBuiltWorkouts: PreBuiltWorkout[] = [
    {
      id: '1',
      title: 'CrossFit WOD - Cindy',
      type: 'crossfit',
      intensity: 'high',
      duration: 20,
      exercises: ['5 Pull-ups', '10 Push-ups', '15 Air Squats'],
      description: 'AMRAP in 20 minutes. Classic CrossFit benchmark workout.',
      isFavorite: true
    },
    {
      id: '2',
      title: 'CrossFit WOD - Fran',
      type: 'crossfit',
      intensity: 'high',
      duration: 15,
      exercises: ['21-15-9 Thrusters', '21-15-9 Pull-ups'],
      description: 'For time. One of the most famous CrossFit workouts.',
      isFavorite: true
    },
    {
      id: '3',
      title: 'Burn40 HIIT Circuit',
      type: 'burn40',
      intensity: 'high',
      duration: 40,
      exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Push-ups'],
      description: 'High-intensity interval training circuit.',
      isFavorite: false
    },
    {
      id: '4',
      title: 'Burn40 Strength',
      type: 'burn40',
      intensity: 'medium',
      duration: 40,
      exercises: ['Squats', 'Deadlifts', 'Rows', 'Overhead Press'],
      description: 'Full body strength training session.',
      isFavorite: false
    },
    {
      id: '5',
      title: 'Upper Body Strength',
      type: 'strength',
      intensity: 'high',
      duration: 60,
      exercises: ['Bench Press', 'Rows', 'Shoulder Press', 'Bicep Curls'],
      description: 'Focus on upper body muscle groups.',
      isFavorite: false
    },
    {
      id: '6',
      title: 'Lower Body Power',
      type: 'strength',
      intensity: 'high',
      duration: 60,
      exercises: ['Squats', 'Deadlifts', 'Lunges', 'Calf Raises'],
      description: 'Lower body strength and power development.',
      isFavorite: false
    },
    {
      id: '7',
      title: '5K Running',
      type: 'cardio',
      intensity: 'medium',
      duration: 30,
      exercises: ['5K Run', 'Cool Down Walk'],
      description: 'Endurance running session.',
      isFavorite: false
    },
    {
      id: '8',
      title: 'HIIT Cardio',
      type: 'cardio',
      intensity: 'high',
      duration: 45,
      exercises: ['Sprint Intervals', 'Rest Periods', 'Cool Down'],
      description: 'High-intensity cardio intervals.',
      isFavorite: false
    },
    {
      id: '9',
      title: 'Vinyasa Flow',
      type: 'yoga',
      intensity: 'low',
      duration: 60,
      exercises: ['Sun Salutations', 'Balance Poses', 'Meditation'],
      description: 'Flowing yoga sequence for flexibility and mindfulness.',
      isFavorite: false
    },
    {
      id: '10',
      title: 'Recovery & Mobility',
      type: 'recovery',
      intensity: 'low',
      duration: 45,
      exercises: ['Foam Rolling', 'Stretching', 'Mobility Work'],
      description: 'Active recovery and mobility session.',
      isFavorite: false
    }
  ]

  const workoutTypes = [
    { value: 'all', label: 'All Types', icon: FireIcon, color: '#6b7280' },
    { value: 'crossfit', label: 'CrossFit', icon: FireIcon, color: '#ef4444' },
    { value: 'burn40', label: 'Burn40', icon: BoltIcon, color: '#f97316' },
    { value: 'strength', label: 'Strength', icon: UserGroupIcon, color: '#10b981' },
    { value: 'cardio', label: 'Cardio', icon: HeartIcon, color: '#3b82f6' },
    { value: 'yoga', label: 'Yoga', icon: ClockIcon, color: '#8b5cf6' },
    { value: 'recovery', label: 'Recovery', icon: ClockIcon, color: '#14b8a6' },
  ]

  const intensityLevels = [
    { value: 'all', label: 'All Intensities' },
    { value: 'low', label: 'Low Intensity' },
    { value: 'medium', label: 'Medium Intensity' },
    { value: 'high', label: 'High Intensity' },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
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

  const getTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(t => t.value === type)
    return workoutType ? workoutType.color : '#6b7280'
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'text-success bg-success/10'
      case 'medium':
        return 'text-warning bg-warning/10'
      case 'high':
        return 'text-danger bg-danger/10'
      default:
        return 'text-secondary-text bg-surface-light/50'
    }
  }

  // Filter workouts based on search and filters
  const filteredWorkouts = preBuiltWorkouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || workout.type === selectedType
    const matchesIntensity = selectedIntensity === 'all' || workout.intensity === selectedIntensity
    
    return matchesSearch && matchesType && matchesIntensity
  })

  const handleAddWorkout = (workout: PreBuiltWorkout) => {
    onAddWorkout?.(workout)
    onClose()
  }

  const toggleFavorite = (workoutId: string) => {
    // Here you would typically update the favorite status
    console.log('Toggling favorite for workout:', workoutId)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, workout: PreBuiltWorkout) => {
    setDraggedWorkout(workout)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', workout.id)
  }

  const handleDragEnd = () => {
    setDraggedWorkout(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="relative bg-surface w-full max-w-md h-full shadow-2xl overflow-y-auto border-r border-border/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-surface-light/50 to-surface-light/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-text">Workout Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface/50 rounded-lg transition-colors text-secondary-text hover:text-primary-text"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-primary-text placeholder:text-muted"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gradient-to-r from-surface-light/20 to-surface-light/10">
          <h3 className="text-sm font-medium text-primary-text mb-3">Filter by Type</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {workoutTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedType === type.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light/50 text-primary-text hover:bg-surface-light/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <h3 className="text-sm font-medium text-primary-text mb-3">Filter by Intensity</h3>
          <div className="flex flex-wrap gap-2">
            {intensityLevels.map((intensity) => (
              <button
                key={intensity.value}
                onClick={() => setSelectedIntensity(intensity.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedIntensity === intensity.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light/50 text-primary-text hover:bg-surface-light/80'
                }`}
              >
                {intensity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workout List */}
        <div className="p-6 space-y-4 bg-surface">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary-text">
              Pre-built Workouts ({filteredWorkouts.length})
            </h3>
            <button className="text-primary hover:text-primary-dark text-sm font-medium">
              Create New
            </button>
          </div>
          
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                draggable
                onDragStart={(e) => handleDragStart(e, workout)}
                onDragEnd={handleDragEnd}
                className={`p-4 bg-gradient-to-br from-surface-light/30 to-surface-light/10 rounded-xl hover:from-surface-light/50 hover:to-surface-light/30 transition-all duration-200 cursor-grab active:cursor-grabbing backdrop-blur-sm ${
                  draggedWorkout?.id === workout.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: getTypeColor(workout.type) + '20' }}
                    >
                      {getTypeIcon(workout.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-primary-text">{workout.title}</h4>
                      <p className="text-sm text-secondary-text">{workout.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(workout.id)}
                    className={`p-1 rounded transition-colors ${
                      workout.isFavorite 
                        ? 'text-warning hover:text-warning/80' 
                        : 'text-secondary-text hover:text-warning'
                    }`}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(workout.intensity)}`}>
                      {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-secondary-text">
                      <ClockIcon className="h-4 w-4" />
                      <span>{workout.duration}m</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-muted mb-2">Exercises:</p>
                  <div className="flex flex-wrap gap-1">
                    {workout.exercises.slice(0, 3).map((exercise, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-surface/50 text-primary-text text-xs rounded-full border border-border/50"
                      >
                        {exercise}
                      </span>
                    ))}
                    {workout.exercises.length > 3 && (
                      <span className="px-2 py-1 bg-surface/50 text-primary-text text-xs rounded-full border border-border/50">
                        +{workout.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAddWorkout(workout)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-200 text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add to Calendar</span>
                  </button>
                  <div className="text-xs text-secondary-text">
                    Drag to calendar
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredWorkouts.length === 0 && (
            <div className="text-center py-8">
              <FireIcon className="h-12 w-12 text-secondary-text mx-auto mb-4" />
              <p className="text-secondary-text">No workouts found matching your criteria.</p>
              <p className="text-sm text-muted">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 