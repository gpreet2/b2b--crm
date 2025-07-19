'use client'

import React, { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { 
  CalendarIcon, 
  PlusIcon, 
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon,
  FireIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function CalendarPage() {
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
        backgroundColor: '#dc2626',
        borderColor: '#b91c1c',
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
        backgroundColor: '#dc2626',
        borderColor: '#b91c1c',
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
        backgroundColor: '#dc2626',
        borderColor: '#b91c1c',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Sarah Johnson',
          capacity: 20,
          enrolledCount: 15,
          status: 'available',
          category: 'cardio'
        }
      },
      
      // Strength Training Classes - Dark Grey
      {
        id: '4',
        title: 'Strength & Power',
        start: new Date(currentYear, currentMonth, 15, 7, 0),
        end: new Date(currentYear, currentMonth, 15, 8, 0),
        backgroundColor: '#374151',
        borderColor: '#1f2937',
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
        backgroundColor: '#374151',
        borderColor: '#1f2937',
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
        backgroundColor: '#374151',
        borderColor: '#1f2937',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Mike Chen',
          capacity: 15,
          enrolledCount: 8,
          status: 'low-enrollment',
          category: 'strength'
        }
      },
      
      // Yoga Classes - Complementary Green
      {
        id: '7',
        title: 'Yoga Flow',
        start: new Date(currentYear, currentMonth, 16, 18, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 0),
        backgroundColor: '#059669',
        borderColor: '#047857',
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
        backgroundColor: '#059669',
        borderColor: '#047857',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Emma Davis',
          capacity: 25,
          enrolledCount: 24,
          status: 'high-demand',
          category: 'wellness'
        }
      },
      
      // Boxing Classes - Accent Orange
      {
        id: '9',
        title: 'Boxing Fundamentals',
        start: new Date(currentYear, currentMonth, 16, 19, 0),
        end: new Date(currentYear, currentMonth, 16, 19, 50),
        backgroundColor: '#d97706',
        borderColor: '#b45309',
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
        backgroundColor: '#d97706',
        borderColor: '#b45309',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Alex Rivera',
          capacity: 12,
          enrolledCount: 11,
          status: 'available',
          category: 'martial-arts'
        }
      },
      
      // Functional Fitness Classes - Blue Accent
      {
        id: '11',
        title: 'Functional Movement',
        start: new Date(currentYear, currentMonth, 16, 6, 30),
        end: new Date(currentYear, currentMonth, 16, 7, 15),
        backgroundColor: '#2563eb',
        borderColor: '#1d4ed8',
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
        backgroundColor: '#2563eb',
        borderColor: '#1d4ed8',
        textColor: '#ffffff',
        extendedProps: {
          coach: 'Jordan Kim',
          capacity: 18,
          enrolledCount: 17,
          status: 'available',
          category: 'functional'
        }
      },
      
      // Special Events - Purple Accent
      {
        id: '13',
        title: 'New Member Orientation',
        start: new Date(currentYear, currentMonth, 20, 10, 0),
        end: new Date(currentYear, currentMonth, 20, 11, 0),
        backgroundColor: '#7c3aed',
        borderColor: '#6d28d9',
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
        backgroundColor: '#0891b2',
        borderColor: '#0e7490',
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
    const { coach, capacity, enrolledCount, category } = arg.event.extendedProps as { coach: string; capacity: number; enrolledCount: number; category: string }
    console.log('Event clicked:', {
      title: arg.event.title,
      start: arg.event.start,
      end: arg.event.end,
      coach,
      capacity,
      enrolledCount,
      category
    })
  }

  const classTypes = [
    { name: 'HIIT Cardio', color: '#dc2626', count: 12, description: 'High-intensity cardio' },
    { name: 'Strength Training', color: '#374151', count: 8, description: 'Muscle building' },
    { name: 'Yoga Flow', color: '#059669', count: 6, description: 'Mindful movement' },
    { name: 'Boxing', color: '#d97706', count: 4, description: 'Combat fitness' },
    { name: 'Functional', color: '#2563eb', count: 5, description: 'Real-world strength' },
    { name: 'Special Events', color: '#7c3aed', count: 2, description: 'Member events' },
    { name: 'Workshops', color: '#0891b2', count: 3, description: 'Educational sessions' }
  ]

  const quickStats = [
    {
      title: 'Total Classes',
      value: '40',
      change: '+5',
      icon: CalendarIcon,
      color: 'bg-primary'
    },
    {
      title: 'This Week',
      value: '12',
      change: '+2',
      icon: ClockIcon,
      color: 'bg-info'
    },
    {
      title: 'Active Coaches',
      value: '6',
      change: '+1',
      icon: UsersIcon,
      color: 'bg-success'
    },
    {
      title: 'Avg Attendance',
      value: '87%',
      change: '+3%',
      icon: ChartBarIcon,
      color: 'bg-warning'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-h1 font-heading text-primary-text mb-2">Class Calendar</h1>
          <p className="text-body text-secondary-text">
            Manage your fitness classes, workshops, and special events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link href="/classes/events">
            <Button variant="primary" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-md transition-all duration-300">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-1">
                    <h3 className="text-body-sm font-semibold text-primary-text">{stat.value}</h3>
                    <span className="text-xs font-medium text-success">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-text truncate">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Calendar */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-surface">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>Schedule Overview</span>
            </CardTitle>
            <div className="flex items-center space-x-2 text-body-sm text-secondary-text">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              viewDidMount={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Types Legend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-primary" />
                <span>Class Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classTypes.map((type, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-accent rounded-lg hover:bg-secondary/30 transition-colors group cursor-pointer"
                  >
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body-sm font-medium text-primary-text truncate">
                          {type.name}
                        </span>
                        <span className="text-caption text-secondary-text">
                          {type.count}
                        </span>
                      </div>
                      <p className="text-caption text-secondary-text">
                        {type.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-secondary-text group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FireIcon className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/classes/events">
              <Button variant="primary" className="w-full justify-start">
                <PlusIcon className="h-4 w-4 mr-2" />
                Schedule New Class
              </Button>
            </Link>
            <Link href="/classes/programs">
              <Button variant="outline" className="w-full justify-start">
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                Manage Programs
              </Button>
            </Link>
            <Link href="/analytics/reports">
              <Button variant="ghost" className="w-full justify-start">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/classes/settings">
              <Button variant="ghost" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 