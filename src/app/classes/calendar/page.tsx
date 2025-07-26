'use client'

import React, { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { 
  PlusIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import ClassEventModal from '@/components/classes/ClassEventModal'
import AddClassModal from '@/components/classes/AddClassModal'

interface ClassEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    coach: string
    capacity: number
    enrolledCount: number
    status: string
    category: string
    location?: string
    description?: string
  }
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [selectedCategory] = useState<string>('all')
  const [selectedCoach] = useState<string>('all')
  const [, setSelectedDate] = useState<Date | null>(null)

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
        backgroundColor: '#f34a22',
        borderColor: '#d93f1e',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 18,
          status: 'high-demand',
          category: 'cardio',
          location: 'Studio A'
        }
      },
      {
        id: '2',
        title: 'HIIT Cardio Blast',
        start: new Date(currentYear, currentMonth, 17, 6, 0),
        end: new Date(currentYear, currentMonth, 17, 6, 45),
        backgroundColor: '#f34a22',
        borderColor: '#d93f1e',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 19,
          status: 'high-demand',
          category: 'cardio',
          location: 'Studio A'
        }
      },
      {
        id: '3',
        title: 'HIIT Cardio Blast',
        start: new Date(currentYear, currentMonth, 19, 6, 0),
        end: new Date(currentYear, currentMonth, 19, 6, 45),
        backgroundColor: '#f34a22',
        borderColor: '#d93f1e',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 15,
          status: 'available',
          category: 'cardio',
          location: 'Studio A'
        }
      },
      
      // Strength Training Classes - Green
      {
        id: '4',
        title: 'Strength &amp; Power',
        start: new Date(currentYear, currentMonth, 15, 7, 0),
        end: new Date(currentYear, currentMonth, 15, 8, 0),
        backgroundColor: '#c3fb67',
        borderColor: '#a8e85a',
        textColor: '#000000',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 12,
          status: 'available',
          category: 'strength',
          location: 'Weight Room'
        }
      },
      {
        id: '5',
        title: 'Strength &amp; Power',
        start: new Date(currentYear, currentMonth, 17, 7, 0),
        end: new Date(currentYear, currentMonth, 17, 8, 0),
        backgroundColor: '#c3fb67',
        borderColor: '#a8e85a',
        textColor: '#000000',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 14,
          status: 'available',
          category: 'strength',
          location: 'Weight Room'
        }
      },
      {
        id: '6',
        title: 'Strength &amp; Power',
        start: new Date(currentYear, currentMonth, 19, 7, 0),
        end: new Date(currentYear, currentMonth, 19, 8, 0),
        backgroundColor: '#c3fb67',
        borderColor: '#a8e85a',
        textColor: '#000000',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 8,
          status: 'low-enrollment',
          category: 'strength',
          location: 'Weight Room'
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
          category: 'wellness',
          location: 'Yoga Studio'
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
          category: 'wellness',
          location: 'Yoga Studio'
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
          category: 'martial-arts',
          location: 'Boxing Ring'
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
          category: 'martial-arts',
          location: 'Boxing Ring'
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
          category: 'functional',
          location: 'Functional Area'
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
          category: 'functional',
          location: 'Functional Area'
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
          category: 'special',
          location: 'Main Hall',
          description: 'Welcome new members to our fitness community with an orientation session covering facilities, programs, and membership benefits.'
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
          category: 'workshop',
          location: 'Conference Room',
          description: 'Learn about proper nutrition for fitness goals, meal planning, and sustainable eating habits from our certified nutritionist.'
        }
      }
    ]
  }, [])

  // Get unique categories and coaches for filters (commented out as they're not currently used)
  // const categories = useMemo(() => {
  //   const uniqueCategories = new Set(events.map(event => event.extendedProps.category))
  //   return Array.from(uniqueCategories).map(category => ({
  //     value: category,
  //     label: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
  //     color: events.find(e => e.extendedProps.category === category)?.backgroundColor || '#6b7280'
  //   }))
  // }, [events])

  // const coaches = useMemo(() => {
  //   const uniqueCoaches = new Set(events.map(event => event.extendedProps.coach))
  //   return Array.from(uniqueCoaches).map(coach => ({
  //     value: coach,
  //     label: coach
  //   }))
  // }, [events])

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
        <div className="font-light text-xs leading-tight text-white truncate mb-1">
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

  // Handle date click - open add class modal with pre-filled date
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.date)
    setIsAddClassModalOpen(true)
  }

  // Handle event click - open event details modal
  const handleEventClick = (arg: EventClickArg) => {
    const eventData: ClassEvent = {
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start || new Date(),
      end: arg.event.end || new Date(),
      backgroundColor: arg.event.backgroundColor || '#3b82f6',
      borderColor: arg.event.borderColor || '#2563eb',
      textColor: arg.event.textColor || '#ffffff',
      extendedProps: {
        coach: arg.event.extendedProps.coach || '',
        capacity: arg.event.extendedProps.capacity || 20,
        enrolledCount: arg.event.extendedProps.enrolledCount || 0,
        status: arg.event.extendedProps.status || 'available',
        category: arg.event.extendedProps.category || 'general',
        location: arg.event.extendedProps.location,
        description: arg.event.extendedProps.description
      }
    }
    setSelectedEvent(eventData)
    setIsModalOpen(true)
  }

  // Handle add class
  const handleAddClass = (classData: Record<string, unknown>) => {
    console.log('New class data:', classData)
    // Here you would typically save the class to your backend
    // For now, we'll just close the modal
    setIsAddClassModalOpen(false)
    setSelectedDate(null)
  }

  const classTypes = [
    { name: 'HIIT Cardio', color: '#f34a22', count: 12, description: 'High-intensity cardio' },
    { name: 'Strength Training', color: '#c3fb67', count: 8, description: 'Muscle building' },
    { name: 'Yoga Flow', color: '#8b5cf6', count: 6, description: 'Mindful movement' },
    { name: 'Boxing', color: '#f97316', count: 4, description: 'Combat fitness' },
    { name: 'Functional', color: '#3b82f6', count: 5, description: 'Real-world strength' },
    { name: 'Special Events', color: '#ec4899', count: 2, description: 'Member events' },
    { name: 'Workshops', color: '#10b981', count: 3, description: 'Educational sessions' }
  ]

  // Monthly statistics
  const monthlyStats = {
    totalClasses: 36,
    todayClasses: 5,
    lowEnrollment: 8,
    highDemand: 12,
    specialEvents: 3
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-primary-text mb-1">Calendar</h1>
          <p className="text-secondary-text font-light">Manage your fitness classes</p>
        </div>
        
        <button 
          onClick={() => setIsAddClassModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Main Layout - Three Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Two Panels */}
        <div className="lg:col-span-3 space-y-6">
          {/* Panel 1: Monthly Statistics */}
          <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-light text-primary-text mb-4">Monthly Statistics</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-xl border border-border-light">
                <div className="text-2xl font-light text-primary-text mb-1">{monthlyStats.totalClasses}</div>
                <div className="text-xs text-secondary-text font-light">Total Classes</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent rounded-xl border border-border-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-success rounded-full shadow-sm"></div>
                    <span className="text-sm font-light text-primary-text">Today&apos;s Classes</span>
                  </div>
                  <span className="text-sm font-light text-primary-text">{monthlyStats.todayClasses}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent rounded-xl border border-border-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-warning rounded-full shadow-sm"></div>
                    <span className="text-sm font-light text-primary-text">Low Enrollment</span>
                  </div>
                  <span className="text-sm font-light text-primary-text">{monthlyStats.lowEnrollment}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent rounded-xl border border-border-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                    <span className="text-sm font-light text-primary-text">High Demand</span>
                  </div>
                  <span className="text-sm font-light text-primary-text">{monthlyStats.highDemand}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent rounded-xl border border-border-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-info rounded-full shadow-sm"></div>
                    <span className="text-sm font-light text-primary-text">Special Events</span>
                  </div>
                  <span className="text-sm font-light text-primary-text">{monthlyStats.specialEvents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Class Categories */}
          <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-light text-primary-text mb-4">Class Categories</h3>
            <div className="space-y-3">
              {classTypes.map((type, index) => (
                <div key={index} className={`flex items-center justify-between p-3 bg-accent rounded-xl hover:bg-accent/80 transition-all duration-200 border border-border-light ${
                  index < classTypes.length - 1 ? 'border-b border-border' : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <span className="text-sm font-light text-primary-text">{type.name}</span>
                  </div>
                  <span className="text-sm font-light text-primary-text">{type.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Main Calendar */}
        <div className="lg:col-span-9">
          <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="p-6 border-b border-border bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="p-3 hover:bg-accent/80 rounded-xl transition-all duration-200">
                    <ChevronLeftIcon className="h-5 w-5 text-secondary-text" />
                  </button>
                  <button className="p-3 hover:bg-accent/80 rounded-xl transition-all duration-200">
                    <ChevronRightIcon className="h-5 w-5 text-secondary-text" />
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-light text-sm hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg">
                    Today
                  </button>
                </div>
                
                <div className="text-xl font-light text-primary-text">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            
            {/* Calendar Content */}
            <div className="p-0">
              <div className="h-[700px]">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
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
        onClose={() => {
          setIsAddClassModalOpen(false)
          setSelectedDate(null)
        }}
        onSave={handleAddClass}
      />
    </div>
  )
} 