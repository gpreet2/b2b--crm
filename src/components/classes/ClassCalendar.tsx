'use client';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { mockClasses, mockPrograms, mockCoaches } from '@/lib/mock-data';
import { Class, Program, Coach } from '@/lib/types';

interface ClassCalendarProps {
  classes?: Class[];
  programs?: Program[];
  coaches?: Coach[];
  onEventClick?: (classEvent: Class) => void;
  onDateClick?: (date: Date) => void;
  view?: 'week' | 'month';
  onViewChange?: (view: 'week' | 'month') => void;
}

export default function ClassCalendar({
  classes = mockClasses,
  programs = mockPrograms,
  coaches = mockCoaches,
  onEventClick,
  onDateClick,
  view = 'week',
  onViewChange,
}: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create program and coach lookup maps
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

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(start);
      weekDate.setDate(start.getDate() + i);
      dates.push(weekDate);
    }
    return dates;
  };

  // Get month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Adjust to start from Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // Adjust to end on Saturday
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const displayDates = view === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  // Filter classes for current view
  const visibleClasses = useMemo(() => {
    const startDate = displayDates[0];
    const endDate = displayDates[displayDates.length - 1];

    return classes.filter(classItem => {
      const classDate = new Date(classItem.date);
      return classDate >= startDate && classDate <= endDate;
    });
  }, [classes, displayDates]);

  // Group classes by date
  const classesByDate = useMemo(() => {
    return visibleClasses.reduce(
      (acc, classItem) => {
        const dateKey = classItem.date.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(classItem);
        return acc;
      },
      {} as Record<string, Class[]>
    );
  }, [visibleClasses]);

  // Time slots for week view
  const timeSlots = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    if (view === 'week') {
      const weekDates = getWeekDates(currentDate);
      const start = weekDates[0];
      const end = weekDates[6];
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const renderClassEvent = (classItem: Class) => {
    const program = programMap[classItem.programId];
    const coach = coachMap[classItem.coachId];
    const fillPercentage = (classItem.enrolled / classItem.capacity) * 100;

    return (
      <div
        key={classItem.id}
        className='mb-1 p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity'
        style={{
          backgroundColor: program?.color || '#6b7280',
          color: 'white',
        }}
        onClick={() => onEventClick?.(classItem)}
      >
        <div className='font-medium truncate'>{classItem.name}</div>
        <div className='flex items-center justify-between mt-1'>
          <span className='text-xs opacity-90'>
            {classItem.startTime} - {classItem.endTime}
          </span>
          <span className='text-xs opacity-90'>
            {classItem.enrolled}/{classItem.capacity}
          </span>
        </div>
        {coach ? <div className='text-xs opacity-75 truncate'>{coach.name}</div> : null}
        <div className='mt-1 h-1 bg-black/20 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white/30 transition-all duration-300'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <div className='grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden'>
        {/* Time column header */}
        <div className='bg-gray-50 p-2 text-xs font-medium text-gray-600'>Time</div>

        {/* Day headers */}
        {weekDates.map((date, index) => (
          <div
            key={index}
            className='bg-gray-50 p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors'
            onClick={() => onDateClick?.(date)}
          >
            <div className='text-xs font-medium text-gray-600'>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className='text-sm font-semibold text-gray-900'>{date.getDate()}</div>
          </div>
        ))}

        {/* Time slots and events */}
        {timeSlots.map((time, timeIndex) => (
          <React.Fragment key={time}>
            {/* Time label */}
            <div className='bg-white p-2 text-xs text-gray-500 border-r border-gray-100'>
              {time}
            </div>

            {/* Day columns */}
            {weekDates.map((date, dayIndex) => {
              const dateKey = date.toDateString();
              const dayClasses = classesByDate[dateKey] || [];
              const timeClasses = dayClasses.filter(classItem => {
                const classHour = parseInt(classItem.startTime.split(':')[0]);
                const slotHour = parseInt(time.split(':')[0]);
                return classHour === slotHour;
              });

              return (
                <div
                  key={`${timeIndex}-${dayIndex}`}
                  className='bg-white p-1 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors'
                  onClick={() => onDateClick?.(date)}
                >
                  {timeClasses.map(renderClassEvent)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weeks = [];

    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <div className='space-y-px'>
        {/* Day headers */}
        <div className='grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden'>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className='bg-gray-50 p-2 text-center text-xs font-medium text-gray-600'>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className='grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden'>
          {monthDates.map((date, index) => {
            const dateKey = date.toDateString();
            const dayClasses = classesByDate[dateKey] || [];
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateClick?.(date)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                </div>
                <div className='space-y-1'>
                  {dayClasses.slice(0, 3).map(renderClassEvent)}
                  {dayClasses.length > 3 && (
                    <div className='text-xs text-gray-500 text-center'>
                      +{dayClasses.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
          <CardTitle className='flex items-center space-x-2'>
            <CalendarIcon className='h-5 w-5 text-primary' />
            <span>Class Schedule</span>
          </CardTitle>

          <div className='flex items-center space-x-2'>
            {/* View Toggle */}
            <div className='flex items-center bg-gray-100 rounded-lg p-1'>
              <Button
                variant={view === 'week' ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => onViewChange?.('week')}
                className='px-3 py-1 text-xs'
              >
                Week
              </Button>
              <Button
                variant={view === 'month' ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => onViewChange?.('month')}
                className='px-3 py-1 text-xs'
              >
                Month
              </Button>
            </div>

            {/* Navigation */}
            <div className='flex items-center space-x-1'>
              <Button variant='outline' size='sm' onClick={() => navigateDate('prev')}>
                <ChevronLeftIcon className='h-4 w-4' />
              </Button>

              <Button variant='outline' size='sm' onClick={goToToday} className='px-3'>
                Today
              </Button>

              <Button variant='outline' size='sm' onClick={() => navigateDate('next')}>
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-2 text-sm text-gray-600'>
          <ClockIcon className='h-4 w-4' />
          <span>{formatDateHeader()}</span>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='p-4'>{view === 'week' ? renderWeekView() : renderMonthView()}</div>
      </CardContent>
    </Card>
  );
}
