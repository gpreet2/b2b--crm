'use client';

import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { mockClasses, mockPrograms } from '@/lib/mock-data';
import { Class, Program, Coach } from '@/lib/types';

import AddClassModal from '../classes/AddClassModal';

import ClassEventModal from './ClassEventModal';


import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventContentArg, DateSelectArg } from '@fullcalendar/core';

// Dynamic import for FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

interface ClassCalendarProps {
  classes?: Class[];
  programs?: Program[];
  coaches?: Coach[];
}

export default function ClassCalendar({
  classes = mockClasses,
  programs = mockPrograms,
  coaches = [],
}: ClassCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Class | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'dayGridWeek' | 'timeGridWeek'>('dayGridWeek');

  // Create lookup maps
  const programMap = useMemo(() => {
    return programs.reduce(
      (acc, program) => {
        acc[program.id] = program;
        return acc;
      },
      {} as Record<string, Program>
    );
  }, [programs]);

  const coachMap = useMemo(() => {
    return coaches.reduce(
      (acc, coach) => {
        acc[coach.id] = coach;
        return acc;
      },
      {} as Record<string, Coach>
    );
  }, [coaches]);

  // Filter classes based on selected filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const programMatch =
        selectedProgramFilter === 'all' || cls.programId === selectedProgramFilter;
      const coachMatch = selectedCoachFilter === 'all' || cls.coachId === selectedCoachFilter;
      return programMatch && coachMatch;
    });
  }, [classes, selectedProgramFilter, selectedCoachFilter]);

  // Convert classes to FullCalendar events
  const calendarEvents = useMemo(() => {
    return filteredClasses.map(cls => {
      const startDate = new Date(cls.date);
      const [startHour, startMinute] = cls.startTime.split(':').map(Number);
      const [endHour, endMinute] = cls.endTime.split(':').map(Number);

      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      const program = programMap[cls.programId];
      const coach = coachMap[cls.coachId];

      return {
        id: cls.id,
        title: program?.name || 'Unknown Program',
        start: startDate,
        end: endDate,
        backgroundColor: program?.color || '#6b7280',
        borderColor: program?.color || '#6b7280',
        textColor: '#ffffff',
        extendedProps: {
          class: cls,
          availableSpots: cls.capacity - cls.enrolled,
          totalSpots: cls.capacity,
          enrolledCount: cls.enrolled,
          coach,
          program,
        },
      };
    });
  }, [filteredClasses, programMap, coachMap]);

  const handleEventClick = (info: EventClickArg) => {
    const extendedProps = info.event.extendedProps as { class: Class };
    setSelectedEvent(extendedProps.class);
    setIsEventModalOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // Handle date selection for adding new classes
    console.log('Date selected:', selectInfo.startStr);
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    // Handle saving the new class
    console.log('Saving class:', classData);
    // In a real app, this would make an API call to save the class
    // For now, we'll just log it and close the modal
  };

  const handleViewChange = (viewType: string) => {
    if (viewType === 'dayGridWeek' || viewType === 'timeGridWeek') {
      setCurrentView(viewType as 'dayGridWeek' | 'timeGridWeek');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header with Add Class Button */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Class Calendar</h2>
          <p className='text-gray-600'>Manage and view all scheduled classes</p>
        </div>
        <Button
          onClick={() => setIsAddClassModalOpen(true)}
          className='flex items-center space-x-2'
        >
          <PlusIcon className='h-5 w-5' />
          <span>Add Class</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <FunnelIcon className='h-5 w-5' />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Program Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Program Type</label>
              <select
                value={selectedProgramFilter}
                onChange={e => setSelectedProgramFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='all'>All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coach Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Coach</label>
              <select
                value={selectedCoachFilter}
                onChange={e => setSelectedCoachFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='all'>All Coaches</option>
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
        <CardContent className='p-0'>
          <div className='p-4'>
            <Tabs value={currentView} onValueChange={handleViewChange}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='dayGridWeek'>Weekly Grid</TabsTrigger>
                <TabsTrigger value='timeGridWeek'>Weekly Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className='h-[600px] p-4'>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridWeek,timeGridWeek',
              }}
              height='100%'
              events={calendarEvents}
              eventClick={handleEventClick}
              select={handleDateSelect}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              eventDisplay='block'
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
              slotMinTime='06:00:00'
              slotMaxTime='22:00:00'
              allDaySlot={false}
              slotDuration='00:30:00'
              eventContent={(arg: EventContentArg) => {
                const extendedProps = arg.event.extendedProps as {
                  coach?: { name: string };
                  enrolledCount: number;
                  totalSpots: number;
                };
                return (
                  <div className='p-1'>
                    <div className='font-medium text-sm'>{arg.event.title}</div>
                    <div className='text-xs opacity-90'>
                      {extendedProps.coach?.name || 'No Coach'}
                    </div>
                    <div className='text-xs opacity-75'>
                      {extendedProps.enrolledCount}/{extendedProps.totalSpots}
                    </div>
                  </div>
                );
              }}
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
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
            {programs.map(program => (
              <div key={program.id} className='flex items-center space-x-2'>
                <div className='w-4 h-4 rounded' style={{ backgroundColor: program.color }} />
                <span className='text-sm font-medium'>{program.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent ? <ClassEventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
          }}
          classData={selectedEvent}
        /> : null}

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        programs={programs}
        coaches={coaches}
        onSave={handleSaveClass}
      />
    </div>
  );
}
