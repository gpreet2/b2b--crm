'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { PlusIcon, FunnelIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { Class, Program, User } from '@/lib/types'
import { mockClasses, mockPrograms, mockUsers } from '@/lib/mock-data'
import ClassEventModal from './ClassEventModal'
import AddClassModal from './AddClassModal'

// Dynamic import for FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid'), { ssr: false })
const timeGridPlugin = dynamic(() => import('@fullcalendar/timegrid'), { ssr: false })
const interactionPlugin = dynamic(() => import('@fullcalendar/interaction'), { ssr: false })

interface ClassCalendarProps {
  classes?: Class[]
  programs?: Program[]
  coaches?: User[]
}

export default function ClassCalendar({ 
  classes = mockClasses, 
  programs = mockPrograms, 
  coaches = mockUsers.filter(u => u.role === 'coach') 
}: ClassCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Class | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all')
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>('all')
  const [currentView, setCurrentView] = useState<'dayGridWeek' | 'timeGridWeek'>('dayGridWeek')

  // Filter classes based on selected filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const programMatch = selectedProgramFilter === 'all' || cls.programId === selectedProgramFilter
      const coachMatch = selectedCoachFilter === 'all' || cls.coachId === selectedCoachFilter
      return programMatch && coachMatch
    })
  }, [classes, selectedProgramFilter, selectedCoachFilter])

  // Convert classes to FullCalendar events
  const calendarEvents = useMemo(() => {
    return filteredClasses.map(cls => {
      const startDate = new Date(cls.date)
      const [startHour, startMinute] = cls.startTime.split(':').map(Number)
      const [endHour, endMinute] = cls.endTime.split(':').map(Number)
      
      startDate.setHours(startHour, startMinute, 0, 0)
      const endDate = new Date(startDate)
      endDate.setHours(endHour, endMinute, 0, 0)

      return {
        id: cls.id,
        title: cls.program.name,
        start: startDate,
        end: endDate,
        backgroundColor: cls.program.color,
        borderColor: cls.program.color,
        textColor: '#ffffff',
        extendedProps: {
          class: cls,
          availableSpots: cls.capacity - cls.enrolledCount,
          totalSpots: cls.capacity,
          enrolledCount: cls.enrolledCount,
          coach: cls.coach,
          program: cls.program
        }
      }
    })
  }, [filteredClasses])

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps.class)
    setIsEventModalOpen(true)
  }

  const handleDateSelect = (selectInfo: any) => {
    // Handle date selection for adding new classes
    console.log('Date selected:', selectInfo.startStr)
  }

  const handleViewChange = (viewType: string) => {
    if (viewType === 'dayGridWeek' || viewType === 'timeGridWeek') {
      setCurrentView(viewType as 'dayGridWeek' | 'timeGridWeek')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Class Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Calendar</h2>
          <p className="text-gray-600">Manage and view all scheduled classes</p>
        </div>
        <Button 
          onClick={() => setIsAddClassModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Class</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Type
              </label>
              <select
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coach Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coach
              </label>
              <select
                value={selectedCoachFilter}
                onChange={(e) => setSelectedCoachFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Coaches</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <Tabs value={currentView} onValueChange={handleViewChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dayGridWeek">Weekly Grid</TabsTrigger>
                <TabsTrigger value="timeGridWeek">Weekly Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-[600px] p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridWeek,timeGridWeek'
              }}
              height="100%"
              events={calendarEvents}
              eventClick={handleEventClick}
              select={handleDateSelect}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              eventDisplay="block"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              eventContent={(arg) => (
                <div className="p-1">
                  <div className="font-medium text-sm">{arg.event.title}</div>
                  <div className="text-xs opacity-90">
                    {arg.event.extendedProps.coach.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {arg.event.extendedProps.enrolledCount}/{arg.event.extendedProps.totalSpots}
                  </div>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Program Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Program Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {programs.map(program => (
              <div key={program.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: program.color }}
                />
                <span className="text-sm font-medium">{program.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <ClassEventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false)
            setSelectedEvent(null)
          }}
          classData={selectedEvent}
        />
      )}

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        programs={programs}
        coaches={coaches}
      />
    </div>
  )
} 