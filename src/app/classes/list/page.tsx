'use client'

import React, { useState, useMemo } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ListBulletIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'

interface ClassItem {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  coach: string
  capacity: number
  enrolledCount: number
  status: string
  category: string
  location?: string
  isRecurring: boolean
  recurrencePattern?: string
}

export default function CalendarClassListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Mock data for classes
  const classes: ClassItem[] = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      {
        id: '1',
        title: 'HIIT Cardio Blast',
        date: new Date(currentYear, currentMonth, 15, 6, 0),
        startTime: '06:00',
        endTime: '06:45',
        coach: 'Sarah Johnson',
        capacity: 20,
        enrolledCount: 18,
        status: 'open',
        category: 'cardio',
        location: 'Main Studio',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri'
      },
      {
        id: '2',
        title: 'Strength & Power',
        date: new Date(currentYear, currentMonth, 15, 7, 0),
        startTime: '07:00',
        endTime: '08:00',
        coach: 'Mike Chen',
        capacity: 15,
        enrolledCount: 12,
        status: 'open',
        category: 'strength',
        location: 'Weight Room',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri'
      },
      {
        id: '7',
        title: 'Functional Movement',
        date: new Date(currentYear, currentMonth, 15, 6, 30),
        startTime: '06:30',
        endTime: '07:15',
        coach: 'Jordan Kim',
        capacity: 18,
        enrolledCount: 16,
        status: 'open',
        category: 'functional',
        location: 'Functional Area',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri'
      },
      {
        id: '3',
        title: 'Yoga Flow',
        date: new Date(currentYear, currentMonth, 16, 18, 0),
        startTime: '18:00',
        endTime: '19:15',
        coach: 'Emma Davis',
        capacity: 25,
        enrolledCount: 22,
        status: 'closed',
        category: 'wellness',
        location: 'Yoga Studio',
        isRecurring: true,
        recurrencePattern: 'Tue, Thu'
      },
      {
        id: '4',
        title: 'Boxing Fundamentals',
        date: new Date(currentYear, currentMonth, 16, 19, 0),
        startTime: '19:00',
        endTime: '19:50',
        coach: 'Alex Rodriguez',
        capacity: 12,
        enrolledCount: 10,
        status: 'open',
        category: 'martial-arts',
        location: 'Boxing Ring',
        isRecurring: true,
        recurrencePattern: 'Tue, Thu'
      },
      {
        id: '5',
        title: 'Pilates Core',
        date: new Date(currentYear, currentMonth, 17, 7, 0),
        startTime: '07:00',
        endTime: '08:00',
        coach: 'Lisa Wang',
        capacity: 15,
        enrolledCount: 8,
        status: 'open',
        category: 'wellness',
        location: 'Pilates Studio',
        isRecurring: false
      },
      {
        id: '6',
        title: 'Advanced CrossFit',
        date: new Date(currentYear, currentMonth, 17, 17, 0),
        startTime: '17:00',
        endTime: '18:00',
        coach: 'Mike Chen',
        capacity: 12,
        enrolledCount: 12,
        status: 'closed',
        category: 'strength',
        location: 'CrossFit Area',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri'
      }
    ]
  }, [])

  // Filter classes based on search and active tab
  const filteredClasses = useMemo(() => {
    let filtered = classes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(classItem =>
        classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by active tab
    if (activeTab === 'recurring') {
      filtered = filtered.filter(classItem => classItem.isRecurring)
    } else if (activeTab === 'one-time') {
      filtered = filtered.filter(classItem => !classItem.isRecurring)
    }

    return filtered
  }, [classes, searchQuery, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
      case 'high-demand':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'low-enrollment':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open'
      case 'closed':
        return 'Closed'
      case 'high-demand':
        return 'High Demand'
      case 'low-enrollment':
        return 'Low Enrollment'
      default:
        return 'Unknown'
    }
  }

  const getRiskLevel = (enrolledCount: number, capacity: number) => {
    const percentage = (enrolledCount / capacity) * 100
    if (percentage >= 90) return 'high'
    if (percentage >= 70) return 'medium'
    return 'low'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cardio':
        return '#ef4444'
      case 'strength':
        return '#06b6d4'
      case 'wellness':
        return '#8b5cf6'
      case 'martial-arts':
        return '#f97316'
      case 'functional':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-primary-text mb-1">CLASS ROSTER</h1>
          <p className="text-secondary-text font-light">Manage your fitness classes</p>
        </div>
        
        <button 
          onClick={() => {/* Add class modal */}}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-text" />
          <input
            type="text"
            placeholder="Search classes, coaches, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-light/50 border-0 rounded-xl text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-light transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-light/50 rounded-full transition-colors"
            >
              <XCircleIcon className="h-4 w-4 text-secondary-text" />
            </button>
          )}
        </div>
        
        <div className="flex bg-surface-light/30 rounded-xl p-1">
          {[
            { value: 'all', label: 'ALL CLASSES', count: classes.length },
            { value: 'recurring', label: 'RECURRING', count: classes.filter(c => c.isRecurring).length },
            { value: 'one-time', label: 'ONE TIME', count: classes.filter(c => !c.isRecurring).length }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg font-light text-sm transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-light/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-surface/95 backdrop-blur-sm border-0 rounded-2xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-surface-light/30 border-b border-surface-light/30">
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">CLASS ID</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">CLASS NAME</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">STATUS</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">LOCATION</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">ENROLLMENT</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">RISK</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">TIME</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">ACTIONS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-surface-light/30">
          {filteredClasses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ListBulletIcon className="h-12 w-12 text-secondary-text mx-auto mb-4" />
              <h3 className="text-lg font-light text-primary-text mb-2">No classes found</h3>
              <p className="text-sm text-secondary-text">
                {searchQuery 
                  ? `No classes match "${searchQuery}"`
                  : `No ${activeTab === 'all' ? '' : activeTab} classes available`
                }
              </p>
            </div>
          ) : (
            filteredClasses.map((classItem) => {
              const risk = getRiskLevel(classItem.enrolledCount, classItem.capacity)
              const statusColor = getStatusColor(classItem.status)
              
              return (
                <div 
                  key={classItem.id}
                  className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-surface-light/20 transition-all duration-200"
                >
                  {/* CLASS ID */}
                  <div className="flex items-center">
                    <span className="text-sm font-light text-primary-text">C-{classItem.id.padStart(3, '0')}</span>
                  </div>

                  {/* CLASS NAME */}
                  <div className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: getCategoryColor(classItem.category) }}
                      />
                      <div>
                        <div className="text-sm font-light text-primary-text">{classItem.title}</div>
                        <div className="text-xs text-secondary-text">{classItem.coach}</div>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      {getStatusText(classItem.status)}
                    </span>
                  </div>

                  {/* LOCATION */}
                  <div className="flex items-center">
                    <span className="text-sm text-secondary-text">{classItem.location || '—'}</span>
                  </div>

                  {/* ENROLLMENT */}
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary-text">{classItem.enrolledCount}</span>
                      <span className="text-xs text-secondary-text">/ {classItem.capacity}</span>
                    </div>
                  </div>

                  {/* RISK */}
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      risk === 'high' ? 'bg-red-500' : 
                      risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-xs text-secondary-text ml-2 capitalize">{risk}</span>
                  </div>

                  {/* TIME */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-light text-primary-text">{formatTime(classItem.startTime)}</div>
                      <div className="text-xs text-secondary-text">{formatDate(classItem.date)}</div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-surface-light/50 transition-colors text-secondary-text hover:text-primary-text">
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}