'use client'

import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { mockClasses } from '@/lib/mock-data'
import { Class } from '@/lib/types'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Hardcoded events with better colors and variety
  const events = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    return [
      // HIIT Cardio Classes
      {
        id: '1',
        title: 'HIIT Cardio',
        start: new Date(currentYear, currentMonth, 15, 6, 0),
        end: new Date(currentYear, currentMonth, 15, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 15,
          status: 'scheduled',
          category: 'cardio'
        }
      },
      {
        id: '2',
        title: 'HIIT Cardio',
        start: new Date(currentYear, currentMonth, 17, 6, 0),
        end: new Date(currentYear, currentMonth, 17, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 18,
          status: 'scheduled',
          category: 'cardio'
        }
      },
      {
        id: '3',
        title: 'HIIT Cardio',
        start: new Date(currentYear, currentMonth, 19, 6, 0),
        end: new Date(currentYear, currentMonth, 19, 6, 45),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 12,
          status: 'scheduled',
          category: 'cardio'
        }
      },
      
      // Strength Training Classes
      {
        id: '4',
        title: 'Strength Training',
        start: new Date(currentYear, currentMonth, 15, 7, 0),
        end: new Date(currentYear, currentMonth, 15, 8, 0),
        backgroundColor: '#1f2937',
        borderColor: '#111827',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 12,
          status: 'scheduled',
          category: 'strength'
        }
      },
      {
        id: '5',
        title: 'Strength Training',
        start: new Date(currentYear, currentMonth, 17, 7, 0),
        end: new Date(currentYear, currentMonth, 17, 8, 0),
        backgroundColor: '#1f2937',
        borderColor: '#111827',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 14,
          status: 'scheduled',
          category: 'strength'
        }
      },
      {
        id: '6',
        title: 'Strength Training',
        start: new Date(currentYear, currentMonth, 19, 7, 0),
        end: new Date(currentYear, currentMonth, 19, 8, 0),
        backgroundColor: '#1f2937',
        borderColor: '#111827',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 10,
          status: 'scheduled',
          category: 'strength'
        }
      },
      
      // Yoga Classes
      {
        id: '7',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 25,
          enrolledCount: 20,
          status: 'scheduled',
          category: 'yoga'
        }
      },
      {
        id: '8',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 18, 18, 0),
        end: new Date(currentYear, currentMonth, 18, 19, 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 25,
          enrolledCount: 22,
          status: 'scheduled',
          category: 'yoga'
        }
      },
      
      // Boxing Classes
      {
        id: '9',
        title: 'Boxing Basics',
        start: new Date(currentYear, currentMonth, 16, 19, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 50),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 12,
          enrolledCount: 8,
          status: 'scheduled',
          category: 'martial-arts'
        }
      },
      {
        id: '10',
        title: 'Boxing Basics',
        start: new Date(currentYear, currentMonth, 18, 19, 0),
        end: new Date(currentYear, currentMonth, 18, 19, 50),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 12,
          enrolledCount: 10,
          status: 'scheduled',
          category: 'martial-arts'
        }
      },
      
      // Functional Fitness Classes
      {
        id: '11',
        title: 'Functional Fitness',
        start: new Date(currentYear, currentMonth, 16, 6, 30),
        end: new Date(currentYear, currentMonth, 16, 7, 15),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 18,
          enrolledCount: 14,
          status: 'scheduled',
          category: 'fitness'
        }
      },
      {
        id: '12',
        title: 'Functional Fitness',
        start: new Date(currentYear, currentMonth, 18, 6, 30),
        end: new Date(currentYear, currentMonth, 18, 7, 15),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 18,
          enrolledCount: 16,
          status: 'scheduled',
          category: 'fitness'
        }
      },
      
      // Special Events
      {
        id: '13',
        title: 'New Member Orientation',
        start: new Date(currentYear, currentMonth, 20, 10, 0),
        end: new Date(currentYear, currentMonth, 20, 11, 0),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 30,
          enrolledCount: 25,
          status: 'scheduled',
          category: 'special'
        }
      },
      {
        id: '14',
        title: 'Nutrition Workshop',
        start: new Date(currentYear, currentMonth, 22, 14, 0),
        end: new Date(currentYear, currentMonth, 22, 15, 30),
        backgroundColor: '#06b6d4',
        borderColor: '#0891b2',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 40,
          enrolledCount: 35,
          status: 'scheduled',
          category: 'workshop'
        }
      }
    ]
  }, [])

  // Custom event content renderer for small strips
  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo
    const { coach, capacity, enrolledCount, category } = event.extendedProps
    
    return (
      <div className="px-2 py-1">
        <div className="font-semibold text-xs leading-tight text-white truncate">
          {event.title}
        </div>
        <div className="text-xs text-white/80 truncate">
          {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    )
  }

  // Handle date click
  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date)
    console.log('Date clicked:', arg.date)
  }

  // Handle event click
  const handleEventClick = (arg: any) => {
    const { coach, capacity, enrolledCount, category } = arg.event.extendedProps
    console.log('Event clicked:', {
      title: arg.event.title,
      start: arg.event.start,
      end: arg.event.end,
      coach,
      capacity,
      enrolledCount,
      category
    })
    // Here you could open a modal with class details
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Class Schedule</h1>
          <p className="text-lg text-gray-300">View and manage all fitness classes, workshops, and special events</p>
        </div> */}

        {/* Calendar Section */}
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-900/50 rounded-lg border border-red-800">
                <CalendarIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Monthly Schedule</h2>
                <p className="text-sm text-gray-400">Interactive calendar with class details</p>
              </div>
            </div>
          </div>
          
          <div className="p-0">
            <div className="h-[900px]">
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
                events={events}
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
              />
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="mt-8 bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gray-700 rounded-lg border border-gray-600">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Class Types</h3>
              <p className="text-sm text-gray-400">Color-coded schedule legend</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {[
              { name: 'HIIT Cardio', color: '#ef4444', description: 'High-intensity cardio' },
              { name: 'Strength Training', color: '#1f2937', description: 'Muscle building' },
              { name: 'Yoga Flow', color: '#10b981', description: 'Mindful movement' },
              { name: 'Boxing Basics', color: '#f59e0b', description: 'Combat fitness' },
              { name: 'Functional Fitness', color: '#3b82f6', description: 'Real-world strength' },
              { name: 'Special Events', color: '#8b5cf6', description: 'Member events' },
              { name: 'Workshops', color: '#06b6d4', description: 'Educational sessions' }
            ].map((item) => (
              <div key={item.name} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-red-900/50 rounded-lg border border-red-800">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-white">14</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-900/50 rounded-lg border border-green-800">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900/50 rounded-lg border border-blue-800">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Coaches</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-800">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-white">7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 