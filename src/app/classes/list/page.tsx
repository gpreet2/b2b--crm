'use client'

import React, { useState, useMemo } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
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
  program: string
  isRecurring: boolean
  recurrencePattern?: string
  lastUpdated?: Date
}

export default function CalendarClassListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Mock data for classes based on programs
  const classes: ClassItem[] = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      {
        id: '1',
        title: 'Burn40',
        date: new Date(currentYear, currentMonth, 15, 6, 0),
        startTime: '06:00',
        endTime: '06:40',
        coach: 'Sarah Johnson',
        capacity: 20,
        enrolledCount: 18,
        status: 'active',
        category: 'Cardio',
        program: 'Burn40',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri',
        lastUpdated: new Date(2024, 2, 15)
      },
      {
        id: '2',
        title: 'CrossFit',
        date: new Date(currentYear, currentMonth, 15, 7, 0),
        startTime: '07:00',
        endTime: '08:00',
        coach: 'Mike Chen',
        capacity: 15,
        enrolledCount: 12,
        status: 'active',
        category: 'Strength',
        program: 'CrossFit',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri',
        lastUpdated: new Date(2024, 2, 12)
      },
      {
        id: '3',
        title: 'Functional Movement',
        date: new Date(currentYear, currentMonth, 15, 6, 30),
        startTime: '06:30',
        endTime: '07:15',
        coach: 'Jordan Kim',
        capacity: 18,
        enrolledCount: 16,
        status: 'active',
        category: 'Functional',
        program: 'Functional Movement',
        isRecurring: true,
        recurrencePattern: 'Mon, Wed, Fri',
        lastUpdated: new Date(2024, 2, 10)
      },
      {
        id: '4',
        title: 'BurnDumbells',
        date: new Date(currentYear, currentMonth, 16, 18, 0),
        startTime: '18:00',
        endTime: '19:00',
        coach: 'Emma Davis',
        capacity: 20,
        enrolledCount: 18,
        status: 'active',
        category: 'Strength',
        program: 'BurnDumbells',
        isRecurring: true,
        recurrencePattern: 'Tue, Thu',
        lastUpdated: new Date(2024, 2, 8)
      },
      {
        id: '5',
        title: 'BurnDumbells',
        date: new Date(currentYear, currentMonth, 17, 18, 0),
        startTime: '18:00',
        endTime: '19:00',
        coach: 'Emma Davis',
        capacity: 20,
        enrolledCount: 19,
        status: 'active',
        category: 'Strength',
        program: 'BurnDumbells',
        isRecurring: true,
        recurrencePattern: 'Wed, Sat',
        lastUpdated: new Date(2024, 2, 5)
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
        classItem.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by active tab
    if (activeTab === 'active') {
      filtered = filtered.filter(classItem => classItem.status === 'active')
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(classItem => classItem.status === 'inactive')
    }

    return filtered
  }, [classes, searchQuery, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      default:
        return 'Unknown'
    }
  }

  const getProgramColor = (program: string) => {
    switch (program) {
      case 'Burn40':
        return '#ef4444'
      case 'CrossFit':
        return '#06b6d4'
      case 'BurnDumbells':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Removed unused formatDate function

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-primary-text mb-1">CLASSES</h1>
          <p className="text-secondary-text font-light">Manage your scheduled classes</p>
        </div>
        
        <button 
          onClick={() => {/* Add class modal */}}
          className="px-6 py-3 bg-primary text-white rounded-xl font-light text-sm hover:bg-primary-dark transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Schedule Class</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-text" />
          <input
            type="text"
            placeholder="Search classes, programs, or coaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-accent border border-border rounded-xl text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent/80 rounded-full transition-colors"
            >
              <XCircleIcon className="h-4 w-4 text-secondary-text" />
            </button>
          )}
        </div>
        
        <div className="flex bg-accent rounded-xl p-1 border border-border-light">
          {[
            { value: 'all', label: 'ALL CLASSES', count: classes.length },
            { value: 'active', label: 'ACTIVE', count: classes.filter(c => c.status === 'active').length },
            { value: 'inactive', label: 'INACTIVE', count: classes.filter(c => c.status === 'inactive').length }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg font-light text-sm transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-secondary-text hover:text-primary-text hover:bg-accent/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-accent border-b border-border">
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">PROGRAM</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">CATEGORY</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">STATUS</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">COACH</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">ENROLLMENT</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">TIME</div>
          <div className="text-sm font-light text-secondary-text uppercase tracking-wider">ACTIONS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
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
            filteredClasses.map((classItem, index) => (
              <div 
                key={classItem.id}
                className={`grid grid-cols-7 gap-4 px-6 py-4 hover:bg-accent transition-colors ${
                  index < filteredClasses.length - 1 ? 'border-b border-border-light' : ''
                }`}
              >
                {/* PROGRAM */}
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: getProgramColor(classItem.program) }}
                  />
                  <div>
                    <div className="font-medium text-primary-text">{classItem.program}</div>
                    <div className="text-sm text-secondary-text">{formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}</div>
                  </div>
                </div>

                {/* CATEGORY */}
                <div className="flex items-center">
                  <span className="text-sm text-secondary-text">{classItem.category}</span>
                </div>

                {/* STATUS */}
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classItem.status)}`}>
                    {getStatusText(classItem.status)}
                  </span>
                </div>

                {/* COACH */}
                <div className="flex items-center">
                  <span className="text-sm text-secondary-text">{classItem.coach}</span>
                </div>

                {/* ENROLLMENT */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-primary-text">{classItem.enrolledCount}/{classItem.capacity}</span>
                    <div className="w-16 bg-accent rounded-full h-2 border border-border-light">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                        style={{
                          width: `${(classItem.enrolledCount / classItem.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* TIME */}
                <div className="flex items-center">
                  <span className="text-sm text-secondary-text">
                    {classItem.lastUpdated ? getTimeAgo(classItem.lastUpdated) : '—'}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent/80 transition-colors text-secondary-text hover:text-primary-text">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-secondary-text hover:text-red-500">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}