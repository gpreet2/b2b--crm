'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  UsersIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  MapPinIcon,
  XCircleIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

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
        status: 'high-demand',
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
        status: 'available',
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
        status: 'available',
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
        endTime: '19:00',
        coach: 'Emma Davis',
        capacity: 25,
        enrolledCount: 22,
        status: 'available',
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
        coach: 'Alex Rivera',
        capacity: 12,
        enrolledCount: 10,
        status: 'available',
        category: 'martial-arts',
        location: 'Boxing Ring',
        isRecurring: true,
        recurrencePattern: 'Tue, Thu'
      },
      {
        id: '5',
        title: 'New Member Orientation',
        date: new Date(currentYear, currentMonth, 20, 10, 0),
        startTime: '10:00',
        endTime: '11:00',
        coach: 'Emma Davis',
        capacity: 30,
        enrolledCount: 25,
        status: 'available',
        category: 'special',
        location: 'Conference Room',
        isRecurring: false
      },
      {
        id: '6',
        title: 'Nutrition Workshop',
        date: new Date(currentYear, currentMonth, 22, 14, 0),
        startTime: '14:00',
        endTime: '15:30',
        coach: 'Dr. Sarah Martinez',
        capacity: 40,
        enrolledCount: 35,
        status: 'available',
        category: 'workshop',
        location: 'Conference Room',
        isRecurring: false
      }
    ]
  }, [])

  // Filter classes based on search and active tab
  const filteredClasses = useMemo(() => {
    let filtered = classes

    // Filter by tab
    if (activeTab === 'recurring') {
      filtered = filtered.filter(cls => cls.isRecurring)
    } else if (activeTab === 'one-time') {
      filtered = filtered.filter(cls => !cls.isRecurring)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cls => 
        cls.title.toLowerCase().includes(query) ||
        cls.coach.toLowerCase().includes(query) ||
        cls.category.toLowerCase().includes(query) ||
        (cls.location && cls.location.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [classes, searchQuery, activeTab])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high-demand':
        return <FireIcon className="h-4 w-4 text-red-500" />
      case 'available':
        return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
      case 'low-enrollment':
        return <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high-demand':
        return 'text-red-500'
      case 'low-enrollment':
        return 'text-amber-500'
      default:
        return 'text-emerald-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'high-demand':
        return 'High Demand'
      case 'low-enrollment':
        return 'Low Enrollment'
      default:
        return 'Available'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'cardio': '#dc2626',
      'strength': '#374151',
      'wellness': '#059669',
      'martial-arts': '#d97706',
      'functional': '#2563eb',
      'special': '#7c3aed',
      'workshop': '#0891b2'
    }
    return colors[category] || '#6b7280'
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
      return date.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="space-y-8 bg-surface min-h-screen page-transition">
      {/* Professional Header */}
      <div className="bg-surface-light border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg hover-lift">
                <ListBulletIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary-text mb-2">
                  Class List
                </h1>
                <p className="text-lg text-secondary-text max-w-2xl">
                  Organized timeline view of all fitness classes and events
                </p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-500 font-medium">Live Schedule</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted">
                      {filteredClasses.length} classes found
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 flex items-center btn-animate">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Filter Classes
              </button>
              <Link href="/classes/calendar">
                <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center btn-animate">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Class
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced Search and Filters */}
        <div className="bg-surface-light border border-border rounded-xl overflow-hidden mb-8 card-animate">
          <div className="p-6 border-b border-border bg-surface/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <MagnifyingGlassIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text">Search & Filter</h3>
                <p className="text-sm text-muted">Find specific classes and events</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Enhanced Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search classes, coaches, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-primary-text placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-light rounded-full transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 text-muted" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Enhanced Tabs */}
              <div className="flex bg-surface rounded-xl p-1 border border-border">
                {[
                  { value: 'all', label: 'All Classes', count: classes.length },
                  { value: 'recurring', label: 'Recurring', count: classes.filter(c => c.isRecurring).length },
                  { value: 'one-time', label: 'One Time', count: classes.filter(c => !c.isRecurring).length }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.value
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                        : 'text-secondary-text hover:text-primary-text hover:bg-surface-light'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-light text-secondary-text'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Direct Class List */}
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card className="bg-surface-light border-border">
              <CardContent className="p-8 text-center">
                <ListBulletIcon className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-text mb-2">No classes found</h3>
                <p className="text-sm text-secondary-text mb-4">
                  {searchQuery 
                    ? `No classes match "${searchQuery}"`
                    : `No ${activeTab === 'all' ? '' : activeTab} classes available`
                  }
                </p>
                <Link href="/classes/calendar">
                  <Button variant="primary" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Class
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map((classItem) => {
              const fillPercentage = (classItem.enrolledCount / classItem.capacity) * 100

              return (
                <Card key={classItem.id} className="bg-surface-light border-border hover:border-border transition-all duration-300 card-animate">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Time and Date Column */}
                      <div className="flex flex-col items-center flex-shrink-0 w-20">
                        <div className="text-center mb-3">
                          <div className="text-lg font-bold text-primary-text">
                            {formatTime(classItem.startTime)}
                          </div>
                          <div className="text-sm text-secondary-text">
                            {formatTime(classItem.endTime)}
                          </div>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: getCategoryColor(classItem.category) }}
                        />
                        <div className="text-xs text-secondary-text mt-2 text-center">
                          {formatDate(classItem.date)}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary-text mb-2">
                              {classItem.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-secondary-text">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4 text-emerald-500" />
                                <span className="font-medium">{classItem.coach}</span>
                              </div>
                              {classItem.location && (
                                <div className="flex items-center space-x-2">
                                  <MapPinIcon className="h-4 w-4 text-blue-500" />
                                  <span>{classItem.location}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <AcademicCapIcon className="h-4 w-4 text-amber-500" />
                                <span className="capitalize">{classItem.category.replace('-', ' ')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-purple-500" />
                                <span>{formatFullDate(classItem.date)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                              classItem.status === 'high-demand' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                              classItem.status === 'low-enrollment' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            }`}>
                              {getStatusIcon(classItem.status)}
                              <span>{getStatusText(classItem.status)}</span>
                            </div>
                            {classItem.isRecurring && (
                              <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/30">
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Enrollment and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                              <UsersIcon className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium text-primary-text">
                                {classItem.enrolledCount}/{classItem.capacity} enrolled
                              </span>
                              <div className="w-24 bg-surface rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${fillPercentage}%`,
                                    backgroundColor: getCategoryColor(classItem.category)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-secondary-text">
                                {Math.round(fillPercentage)}%
                              </span>
                            </div>
                            
                            {classItem.isRecurring && classItem.recurrencePattern && (
                              <span className="text-xs text-secondary-text bg-surface px-2 py-1 rounded-full">
                                Repeats: {classItem.recurrencePattern}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-secondary-text hover:text-emerald-500">
                              <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Summary */}
        {filteredClasses.length > 0 && (
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-secondary-text">
                <span>Showing {filteredClasses.length} of {classes.length} classes</span>
                <span>{filteredClasses.filter(c => c.isRecurring).length} recurring, {filteredClasses.filter(c => !c.isRecurring).length} one-time</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}