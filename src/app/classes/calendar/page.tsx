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

  // Program-based events reflecting the programs from the programs tab
  const events = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      // Burn40 Classes - Red
      {
        id: '1',
        title: 'Burn40',
        start: new Date(currentYear, currentMonth, 15, 6, 0),
        end: new Date(currentYear, currentMonth, 15, 6, 40),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 18,
          status: 'high-demand',
          category: 'cardio',
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
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 19,
          status: 'high-demand',
          category: 'cardio',
          program: 'Burn40'
        }
      },
      {
        id: '3',
        title: 'Burn40',
        start: new Date(currentYear, currentMonth, 19, 6, 0),
        end: new Date(currentYear, currentMonth, 19, 6, 40),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 15,
          status: 'available',
          category: 'cardio',
          program: 'Burn40'
        }
      },
      
      // CrossFit Classes - Cyan
      {
        id: '4',
        title: 'CrossFit',
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
          category: 'strength',
          program: 'CrossFit'
        }
      },
      {
        id: '5',
        title: 'CrossFit',
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
          category: 'strength',
          program: 'CrossFit'
        }
      },
      {
        id: '6',
        title: 'CrossFit',
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
          category: 'strength',
          program: 'CrossFit'
        }
      },
      
      // BurnDumbells Classes - Green
      {
        id: '7',
        title: 'BurnDumbells',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 20,
          enrolledCount: 18,
          status: 'available',
          category: 'strength',
          program: 'BurnDumbells'
        }
      },
      {
        id: '8',
        title: 'BurnDumbells',
        start: new Date(currentYear, currentMonth, 18, 18, 0),
        end: new Date(currentYear, currentMonth, 18, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 20,
          enrolledCount: 19,
          status: 'high-demand',
          category: 'strength',
          program: 'BurnDumbells'
        }
      },
      {
        id: '9',
        title: 'BurnDumbells',
        start: new Date(currentYear, currentMonth, 20, 18, 0),
        end: new Date(currentYear, currentMonth, 20, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 20,
          enrolledCount: 16,
          status: 'available',
          category: 'strength',
          program: 'BurnDumbells'
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

      {/* Main Calendar - Full Width */}
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
          <div className="h-[800px]">
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