'use client'

import React, { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { 
  CalendarIcon, 
  PlusIcon, 
  FunnelIcon,
  AcademicCapIcon,
  FireIcon,
  ArrowRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ClassEventModal from '@/components/classes/ClassEventModal'
import AddClassModal from '@/components/classes/AddClassModal'

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCoach, setSelectedCoach] = useState<string>('all')

  // Enhanced events with better colors and variety
  const events = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      // HIIT Cardio Classes - Primary Red
      {
        id: '1',
        title: 'HIIT Cardio Blast',
        start: new Date(currentYear, currentMonth, 15, 6, 0),
        end: new Date(currentYear, currentMonth, 15, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 18,
          status: 'high-demand',
          category: 'cardio'
        }
      },
      {
        id: '2',
        title: 'HIIT Cardio Blast',
        start: new Date(currentYear, currentMonth, 17, 6, 0),
        end: new Date(currentYear, currentMonth, 17, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 19,
          status: 'high-demand',
          category: 'cardio'
        }
      },
      {
        id: '3',
        title: 'HIIT Cardio Blast',
        start: new Date(currentYear, currentMonth, 19, 6, 0),
        end: new Date(currentYear, currentMonth, 19, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 15,
          status: 'available',
          category: 'cardio'
        }
      },
      
      // Strength Training Classes - Cyan
      {
        id: '4',
        title: 'Strength & Power',
        start: new Date(currentYear, currentMonth, 15, 7, 0),
        end: new Date(currentYear, currentMonth, 15, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 12,
          status: 'available',
          category: 'strength'
        }
      },
      {
        id: '5',
        title: 'Strength & Power',
        start: new Date(currentYear, currentMonth, 17, 7, 0),
        end: new Date(currentYear, currentMonth, 17, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 14,
          status: 'available',
          category: 'strength'
        }
      },
      {
        id: '6',
        title: 'Strength & Power',
        start: new Date(currentYear, currentMonth, 19, 7, 0),
        end: new Date(currentYear, currentMonth, 19, 8, 0),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 8,
          status: 'low-enrollment',
          category: 'strength'
        }
      },
      
      // Yoga Classes - Purple
      {
        id: '7',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 25,
          enrolledCount: 22,
          status: 'available',
          category: 'wellness'
        }
      },
      {
        id: '8',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 18, 18, 0),
        end: new Date(currentYear, currentMonth, 18, 19, 0),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 25,
          enrolledCount: 24,
          status: 'high-demand',
          category: 'wellness'
        }
      },
      
      // Boxing Classes - Orange
      {
        id: '9',
        title: 'Boxing Fundamentals',
        start: new Date(currentYear, currentMonth, 16, 19, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 50),
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Alex Rivera',
          capacity: 12,
          enrolledCount: 10,
          status: 'available',
          category: 'martial-arts'
        }
      },
      {
        id: '10',
        title: 'Boxing Fundamentals',
        start: new Date(currentYear, currentMonth, 18, 19, 0),
        end: new Date(currentYear, currentMonth, 18, 19, 50),
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Alex Rivera',
          capacity: 12,
          enrolledCount: 11,
          status: 'available',
          category: 'martial-arts'
        }
      },
      
      // Functional Fitness Classes - Blue
      {
        id: '11',
        title: 'Functional Movement',
        start: new Date(currentYear, currentMonth, 16, 6, 30),
        end: new Date(currentYear, currentMonth, 16, 7, 15),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Jordan Kim',
          capacity: 18,
          enrolledCount: 16,
          status: 'available',
          category: 'functional'
        }
      },
      {
        id: '12',
        title: 'Functional Movement',
        start: new Date(currentYear, currentMonth, 18, 6, 30),
        end: new Date(currentYear, currentMonth, 18, 7, 15),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Jordan Kim',
          capacity: 18,
          enrolledCount: 17,
          status: 'available',
          category: 'functional'
        }
      },
      
      // Special Events - Pink
      {
        id: '13',
        title: 'New Member Orientation',
        start: new Date(currentYear, currentMonth, 20, 10, 0),
        end: new Date(currentYear, currentMonth, 20, 11, 0),
        backgroundColor: '#ec4899',
        borderColor: '#db2777',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 30,
          enrolledCount: 25,
          status: 'available',
          category: 'special'
        }
      },
      {
        id: '14',
        title: 'Nutrition Workshop',
        start: new Date(currentYear, currentMonth, 22, 14, 0),
        end: new Date(currentYear, currentMonth, 22, 15, 30),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Dr. Sarah Martinez',
          capacity: 40,
          enrolledCount: 35,
          status: 'available',
          category: 'workshop'
        }
      }
    ]
  }, [])

  // Get unique categories and coaches for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Set(events.map(event => event.extendedProps.category))
    return Array.from(uniqueCategories).map(category => ({
      value: category,
      label: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: events.find(e => e.extendedProps.category === category)?.backgroundColor || '#6b7280'
    }))
  }, [events])

  const coaches = useMemo(() => {
    const uniqueCoaches = new Set(events.map(event => event.extendedProps.coach))
    return Array.from(uniqueCoaches).map(coach => ({
      value: coach,
      label: coach
    }))
  }, [events])

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'all' || event.extendedProps.category === selectedCategory
      const matchesCoach = selectedCoach === 'all' || event.extendedProps.coach === selectedCoach
      return matchesCategory && matchesCoach
    })
  }, [events, selectedCategory, selectedCoach])

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { event } = eventInfo
    const { enrolledCount, capacity } = event.extendedProps as { enrolledCount: number; capacity: number }
    const fillPercentage = (enrolledCount / capacity) * 100
    
    return (
      <div className="px-2 py-1 relative overflow-hidden">
        <div className="font-semibold text-xs leading-tight text-white truncate mb-1">
          {event.title}
        </div>
        <div className="flex items-center justify-between text-xs text-white/90">
          <span>{event.start ? event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          <span className="text-xs">{enrolledCount}/{capacity}</span>
        </div>
        {/* Capacity indicator bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-white/30 transition-all duration-300"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Handle date click
  const handleDateClick = (arg: DateClickArg) => {
    console.log('Date clicked:', arg.date)
  }

  // Handle event click
  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEvent(arg.event)
    setIsModalOpen(true)
  }

  // Handle add class
  const handleAddClass = (classData: any) => {
    console.log('New class data:', classData)
    // Here you would typically save the class to your backend
    // For now, we'll just close the modal
    setIsAddClassModalOpen(false)
  }

  const classTypes = [
    { name: 'HIIT Cardio', color: '#ef4444', count: 12, description: 'High-intensity cardio' },
    { name: 'Strength Training', color: '#06b6d4', count: 8, description: 'Muscle building' },
    { name: 'Yoga Flow', color: '#8b5cf6', count: 6, description: 'Mindful movement' },
    { name: 'Boxing', color: '#f97316', count: 4, description: 'Combat fitness' },
    { name: 'Functional', color: '#3b82f6', count: 5, description: 'Real-world strength' },
    { name: 'Special Events', color: '#ec4899', count: 2, description: 'Member events' },
    { name: 'Workshops', color: '#10b981', count: 3, description: 'Educational sessions' }
  ]

  return (
    <div className="space-y-8 bg-surface min-h-screen page-transition">
      {/* Professional Header */}
      <div className="bg-surface-light border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg hover-lift">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary-text mb-2">
                  Class Calendar
                </h1>
                <p className="text-lg text-secondary-text max-w-2xl">
                  Comprehensive view of all fitness classes, workshops, and special events
                </p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-500 font-medium">Live Updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted">
                      {filteredEvents.length} events this month
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 flex items-center btn-animate">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filter Events
              </button>
              <button 
                onClick={() => setIsAddClassModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center btn-animate"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Class
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Enhanced Filters */}
        <div className="bg-surface-light border border-border rounded-xl overflow-hidden mb-8 card-animate">
          <div className="p-6 border-b border-border bg-surface/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text">Filter Classes</h3>
                <p className="text-sm text-muted">Customize your calendar view</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Filter */}
              <div>
                <label className="text-lg font-bold text-primary-text mb-4 block flex items-center space-x-2">
                  <span>Program Type</span>
                  <span className="text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded-full">
                    {selectedCategory === 'all' ? 'All' : categories.find(c => c.value === selectedCategory)?.label}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'bg-surface text-secondary-text hover:bg-surface-light border border-border'
                    }`}
                  >
                    All Programs
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                        selectedCategory === category.value
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'bg-surface text-secondary-text hover:bg-surface-light border border-border'
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coach Filter */}
              <div>
                <label className="text-lg font-bold text-primary-text mb-4 block flex items-center space-x-2">
                  <span>Coach</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full">
                    {selectedCoach === 'all' ? 'All' : coaches.find(c => c.value === selectedCoach)?.label}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCoach('all')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedCoach === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                        : 'bg-surface text-secondary-text hover:bg-surface-light border border-border'
                    }`}
                  >
                    All Coaches
                  </button>
                  {coaches.map((coach) => (
                    <button
                      key={coach.value}
                      onClick={() => setSelectedCoach(coach.value)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        selectedCoach === coach.value
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                          : 'bg-surface text-secondary-text hover:bg-surface-light border border-border'
                      }`}
                    >
                      {coach.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Calendar */}
        <div className="bg-surface-light border border-border rounded-xl overflow-hidden shadow-xl mb-8 card-animate">
          <div className="p-6 border-b border-border bg-surface/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text">Schedule Overview</h3>
                  <p className="text-sm text-muted">Interactive class calendar</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-500 font-medium">Live Updates</span>
                </div>
                <div className="text-sm text-muted">
                  {filteredEvents.length} events showing
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-0">
            <div className="h-[800px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                editable={false}
                selectable={true}
                selectMirror={true}
                weekends={true}
                events={filteredEvents}
                eventContent={renderEventContent}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="100%"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                expandRows={true}
                stickyHeaderDates={true}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                titleFormat={{ year: 'numeric', month: 'long' }}
                dayMaxEvents={false}
                viewDidMount={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class Categories Legend */}
          <div className="lg:col-span-2">
            <div className="bg-surface-light border border-border rounded-xl overflow-hidden card-animate">
              <div className="p-6 border-b border-border bg-surface/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <AcademicCapIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-text">Class Categories</h3>
                    <p className="text-sm text-muted">Program types and statistics</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classTypes.map((type, index) => (
                    <div 
                      key={index} 
                      className="group p-4 bg-surface/50 rounded-xl hover:bg-surface transition-all duration-300 cursor-pointer border border-border hover:border-border card-animate"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg flex-shrink-0"
                          style={{ backgroundColor: type.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary-text group-hover:text-primary-text transition-colors truncate">
                              {type.name}
                            </span>
                            <span className="text-xl font-bold text-amber-500">
                              {type.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-secondary-text mb-3">
                        {type.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-surface rounded-full h-2 mr-3">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              backgroundColor: type.color,
                              width: `${(type.count / 15) * 100}%`
                            }}
                          />
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-muted group-hover:text-amber-500 transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-surface-light border border-border rounded-xl overflow-hidden card-animate">
            <div className="p-6 border-b border-border bg-surface/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FireIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text">Quick Actions</h3>
                  <p className="text-sm text-muted">Manage your calendar</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <button 
                onClick={() => setIsAddClassModalOpen(true)}
                className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2 group btn-animate"
              >
                <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Schedule New Class</span>
              </button>
              
              <Link href="/classes/programs">
                <button className="w-full p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center space-x-2 group btn-animate">
                  <AcademicCapIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Manage Programs</span>
                </button>
              </Link>
              
              <Link href="/analytics/reports">
                <button className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 group btn-animate">
                  <ChartBarIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>View Reports</span>
                </button>
              </Link>
              
              <Link href="/classes/settings">
                <button className="w-full p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 flex items-center justify-center space-x-2 group btn-animate">
                  <CalendarIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Calendar Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Class Event Modal */}
      <ClassEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onSave={handleAddClass}
      />
    </div>
  )
} 