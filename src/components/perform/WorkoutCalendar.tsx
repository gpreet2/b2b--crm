'use client';

import {
  ClockIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';

import { useResponsive } from '@/lib/hooks';

interface WorkoutEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    type: string;
    intensity: string;
    duration: number;
    exercises: string[];
    notes?: string;
    completed: boolean;
  };
}

interface WorkoutCalendarProps {
  events: WorkoutEvent[];
  view: 'week' | 'month' | 'list';
  currentDate?: Date;
  onEventClick?: (event: WorkoutEvent) => void;
  onDateClick?: (date: Date) => void;
  onViewChange?: (view: 'week' | 'month' | 'list') => void;
  onAddWorkout?: (date?: Date) => void;
}

export default function WorkoutCalendar({
  events,
  view,
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  onAddWorkout,
}: WorkoutCalendarProps) {
  const { isMobile, isTablet } = useResponsive();

  // Keyboard navigation state
  const [focusedDate, setFocusedDate] = React.useState<Date | null>(null);
  const [keyboardNavigationMode, setKeyboardNavigationMode] = React.useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);

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
    let current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // Add one day
    }
    return dates;
  };

  const displayDates = view === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  // Filter events for current view
  const visibleEvents = useMemo(() => {
    if (view === 'list') {
      return events.sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    const startDate = displayDates[0];
    const endDate = displayDates[displayDates.length - 1];

    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [events, displayDates, view]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    return visibleEvents.reduce(
      (acc, event) => {
        const dateKey = event.start.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
      },
      {} as Record<string, WorkoutEvent[]>
    );
  }, [visibleEvents]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crossfit':
        return <FireIcon className='h-3 w-3' />;
      case 'burn40':
        return <BoltIcon className='h-3 w-3' />;
      case 'strength':
        return <UserGroupIcon className='h-3 w-3' />;
      case 'cardio':
        return <HeartIcon className='h-3 w-3' />;
      default:
        return <ClockIcon className='h-3 w-3' />;
    }
  };

  // Screen reader announcement function
  const announceToScreenReader = React.useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Enhanced keyboard navigation handlers with accessibility announcements
  const handleCalendarKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!focusedDate) return;

      let newFocusedDate = new Date(focusedDate);
      let handled = false;
      let announcement = '';

      switch (e.key) {
        case 'ArrowLeft':
          newFocusedDate.setDate(newFocusedDate.getDate() - 1);
          announcement = `Moved to ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'ArrowRight':
          newFocusedDate.setDate(newFocusedDate.getDate() + 1);
          announcement = `Moved to ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'ArrowUp':
          newFocusedDate.setDate(newFocusedDate.getDate() - 7);
          announcement = `Moved to ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'ArrowDown':
          newFocusedDate.setDate(newFocusedDate.getDate() + 7);
          announcement = `Moved to ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'Home':
          // Go to first day of week
          const dayOfWeek = newFocusedDate.getDay();
          newFocusedDate.setDate(newFocusedDate.getDate() - dayOfWeek);
          announcement = `Moved to beginning of week: ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'End':
          // Go to last day of week
          const currentDayOfWeek = newFocusedDate.getDay();
          newFocusedDate.setDate(newFocusedDate.getDate() + (6 - currentDayOfWeek));
          announcement = `Moved to end of week: ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onDateClick?.(focusedDate);
          announcement = `Selected ${focusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with Ctrl+A
          e.preventDefault();
          onAddWorkout?.(focusedDate);
          announcement = `Adding workout for ${focusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
        case 'PageUp':
          // Navigate to previous week/month
          if (view === 'week') {
            newFocusedDate.setDate(newFocusedDate.getDate() - 7);
          } else {
            newFocusedDate.setMonth(newFocusedDate.getMonth() - 1);
          }
          announcement = `Navigated to ${newFocusedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
          handled = true;
          break;
        case 'PageDown':
          // Navigate to next week/month
          if (view === 'week') {
            newFocusedDate.setDate(newFocusedDate.getDate() + 7);
          } else {
            newFocusedDate.setMonth(newFocusedDate.getMonth() + 1);
          }
          announcement = `Navigated to ${newFocusedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
          handled = true;
          break;
        case 't':
        case 'T':
          // Go to today
          newFocusedDate = new Date();
          announcement = `Moved to today: ${newFocusedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        setFocusedDate(newFocusedDate);
        setKeyboardNavigationMode(true);

        // Announce to screen readers
        if (announcement) {
          announceToScreenReader(announcement);
        }
      }
    },
    [focusedDate, onDateClick, onAddWorkout, view, announceToScreenReader]
  );

  // Initialize focused date when calendar loads
  React.useEffect(() => {
    if (!focusedDate) {
      setFocusedDate(new Date(currentDate));
    }
  }, [currentDate, focusedDate]);

  const renderWorkoutEvent = (event: WorkoutEvent) => {
    const duration = event.extendedProps.duration;
    const isCompleted = event.extendedProps.completed;
    const intensity = event.extendedProps.intensity;

    // Enhanced color mapping for better visual hierarchy
    const getEventStyles = (type: string, completed: boolean) => {
      const baseStyles = {
        crossfit: { bg: '#f34a22', text: '#ffffff', border: '#d93f1e' },
        burn40: { bg: '#ff5a3a', text: '#ffffff', border: '#f34a22' },
        strength: { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed' },
        cardio: { bg: '#ec4899', text: '#ffffff', border: '#db2777' },
        yoga: { bg: '#10b981', text: '#ffffff', border: '#059669' },
        recovery: { bg: '#14b8a6', text: '#ffffff', border: '#0d9488' },
        default: { bg: '#6b7280', text: '#ffffff', border: '#4b5563' },
      };

      const style = baseStyles[type as keyof typeof baseStyles] || baseStyles.default;

      return {
        backgroundColor: completed ? `${style.bg}80` : style.bg, // 50% opacity if completed
        color: style.text,
        borderColor: style.border,
      };
    };

    const eventStyles = getEventStyles(event.extendedProps.type, isCompleted);

    return (
      <div
        key={event.id}
        className='group relative p-2 sm:p-3 rounded-lg text-xs cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border transform hover:-translate-y-1 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        style={{
          backgroundColor: eventStyles.backgroundColor,
          color: eventStyles.color,
          borderColor: eventStyles.borderColor,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          minHeight: '44px', // Touch-friendly minimum height
        }}
        onClick={() => onEventClick?.(event)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEventClick?.(event);
          }
        }}
        tabIndex={0}
        role='button'
        aria-label={`${event.title} workout on ${event.start.toLocaleDateString()}, ${duration} minutes, ${intensity} intensity. ${isCompleted ? 'Completed' : 'Scheduled'}`}
        aria-describedby={`workout-${event.id}-details`}
      >
        {/* Enhanced event content with mobile optimization */}
        <div className='space-y-1 sm:space-y-2'>
          {/* Title with responsive typography */}
          <div className='font-semibold truncate text-xs sm:text-sm leading-tight'>
            {event.title}
          </div>

          {/* Time and duration with responsive layout */}
          <div className='flex items-center justify-between text-xs opacity-90'>
            <div className='flex items-center space-x-1'>
              <ClockIcon className='h-3 w-3 flex-shrink-0' />
              <span className='font-medium text-xs'>
                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className='px-1 sm:px-2 py-1 bg-black/20 rounded-full text-xs font-medium flex-shrink-0'>
              {duration}m
            </div>
          </div>

          {/* Type and intensity with responsive styling */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-1 min-w-0 flex-1'>
              <span className='hidden sm:inline flex-shrink-0'>
                {getTypeIcon(event.extendedProps.type)}
              </span>
              <span className='text-xs opacity-90 capitalize font-medium truncate'>
                {intensity}
              </span>
            </div>

            {/* Completion status indicator */}
            {isCompleted ? <div className='flex items-center space-x-1 flex-shrink-0'>
                <div className='w-2 h-2 bg-green-400 rounded-full' aria-hidden='true' />
                <span className='text-xs font-medium opacity-90 hidden sm:inline'>Done</span>
                <span className='text-xs font-medium opacity-90 sm:hidden'>✓</span>
              </div> : null}
          </div>
        </div>

        {/* Hidden details for screen readers */}
        <div id={`workout-${event.id}-details`} className='sr-only'>
          Workout type: {event.extendedProps.type}. Exercises:{' '}
          {event.extendedProps.exercises.join(', ') || 'No exercises listed'}.
          {event.extendedProps.notes ? `Notes: ${event.extendedProps.notes}` : null}
        </div>

        {/* Enhanced progress indicator for completed workouts */}
        {isCompleted ? <div className='absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden'>
            <div
              className='h-full bg-green-400 transition-all duration-500'
              style={{ width: '100%' }}
            />
          </div> : null}

        {/* Hover effect overlay */}
        <div className='absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none' />
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      try {
        const workoutData = JSON.parse(e.dataTransfer.getData('application/json'));
        console.log('Dropped workout on date:', date, workoutData);
        // Here you would typically create a new workout event
        onDateClick?.(date);
      } catch (error) {
        console.error('Error parsing dropped workout data:', error);
      }
    };

    // Touch event handlers for mobile drag and drop
    const handleTouchStart = (e: React.TouchEvent) => {
      // Store touch start position for potential drag operation
      const touch = e.touches[0];
      const target = e.currentTarget as HTMLElement;
      target.setAttribute('data-touch-start-x', touch.clientX.toString());
      target.setAttribute('data-touch-start-y', touch.clientY.toString());
      target.setAttribute('data-touch-start-time', Date.now().toString());
    };

    const handleTouchEnd = (e: React.TouchEvent, date: Date) => {
      const target = e.currentTarget as HTMLElement;
      const startTime = parseInt(target.getAttribute('data-touch-start-time') || '0');
      const touchDuration = Date.now() - startTime;

      // If touch was brief (< 300ms), treat as tap
      if (touchDuration < 300) {
        onDateClick?.(date);
      }

      // Clean up touch data
      target.removeAttribute('data-touch-start-x');
      target.removeAttribute('data-touch-start-y');
      target.removeAttribute('data-touch-start-time');
    };

    return (
      <div
        className='h-full flex flex-col bg-surface rounded-2xl shadow-lg border border-border'
        ref={calendarRef}
        onKeyDown={handleCalendarKeyDown}
        tabIndex={keyboardNavigationMode ? 0 : -1}
        role='grid'
        aria-label={`Weekly calendar view for ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        aria-describedby='calendar-instructions'
      >
        {/* Screen reader instructions */}
        <div id='calendar-instructions' className='sr-only'>
          Use arrow keys to navigate between dates. Press Enter or Space to select a date. Press
          &apos;A&apos; to add a workout to the focused date. Use Home and End to jump to the
          beginning or end of the week.
        </div>

        {/* Enhanced Week Header with Mobile Optimization */}
        <div
          className='grid grid-cols-7 bg-gradient-to-r from-surface-light to-accent border-b border-border flex-shrink-0'
          role='row'
        >
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div
                key={index}
                className={`group relative p-3 sm:p-4 md:p-6 text-center border-r border-border last:border-r-0 cursor-pointer transition-all duration-300 hover:bg-primary/5 touch-manipulation ${
                  isToday ? 'bg-primary/10 border-primary/20' : ''
                }`}
                onClick={() => onDateClick?.(date)}
                onTouchStart={e => handleTouchStart(e)}
                onTouchEnd={e => handleTouchEnd(e, date)}
                role='columnheader'
                aria-label={`${dayName}, ${monthName} ${dayNumber}${isToday ? ', today' : ''}`}
              >
                {/* Enhanced day header design with responsive sizing */}
                <div className='space-y-1 sm:space-y-2'>
                  <div
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isToday ? 'text-primary' : 'text-secondary-text'
                    }`}
                  >
                    <span className='sm:hidden'>{dayName.slice(0, 1)}</span>
                    <span className='hidden sm:inline'>{dayName}</span>
                  </div>
                  <div
                    className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-200 ${
                      isToday ? 'text-primary' : 'text-primary-text group-hover:text-primary'
                    }`}
                  >
                    {dayNumber}
                  </div>
                  {/* Month indicator for first day of month */}
                  {date.getDate() === 1 && (
                    <div className='text-xs text-secondary-text font-medium hidden sm:block'>
                      {monthName}
                    </div>
                  )}
                </div>

                {/* Today indicator */}
                {isToday ? <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1 bg-primary rounded-full' /> : null}
              </div>
            );
          })}
        </div>

        {/* Enhanced Week Body with Mobile Optimization */}
        <div className='grid grid-cols-7 flex-1 min-h-0' role='rowgroup'>
          {weekDates.map((date, index) => {
            const dateKey = date.toDateString();
            const dayEvents = eventsByDate[dateKey] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            // Responsive event limits based on device type
            const maxEvents = isMobile ? 4 : isTablet ? 6 : 8;
            const visibleEvents = dayEvents.slice(0, maxEvents);
            const hiddenCount = Math.max(0, dayEvents.length - maxEvents);
            const isFocused = focusedDate && date.toDateString() === focusedDate.toDateString();

            return (
              <div
                key={index}
                className={`group relative border-r border-border last:border-r-0 bg-surface hover:bg-surface-light transition-all duration-300 cursor-pointer touch-manipulation min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                  isToday ? 'bg-primary/5' : ''
                } ${isFocused && keyboardNavigationMode ? 'ring-2 ring-primary ring-inset bg-primary/10' : ''}`}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, date)}
                onClick={() => {
                  setFocusedDate(date);
                  setKeyboardNavigationMode(false);
                  onDateClick?.(date);
                }}
                onTouchStart={e => handleTouchStart(e)}
                onTouchEnd={e => handleTouchEnd(e, date)}
                onFocus={() => {
                  setFocusedDate(date);
                  setKeyboardNavigationMode(true);
                }}
                tabIndex={isFocused ? 0 : -1}
                role='gridcell'
                aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ', today' : ''}. ${dayEvents.length} workout${dayEvents.length !== 1 ? 's' : ''} scheduled.`}
                aria-selected={!!isFocused}
                aria-describedby={dayEvents.length > 0 ? `day-${index}-events` : undefined}
              >
                {/* Day content container with responsive spacing */}
                <div className='flex flex-col h-full p-2 sm:p-3 space-y-1 sm:space-y-2'>
                  {/* Enhanced Workout Events with responsive stacking */}
                  <div
                    className='flex-1 space-y-1 pt-1 sm:pt-2 overflow-y-auto'
                    role='list'
                    aria-label={`Workouts for ${date.toLocaleDateString()}`}
                  >
                    {visibleEvents.map(event => (
                      <div key={event.id} role='listitem'>
                        {renderWorkoutEvent(event)}
                      </div>
                    ))}

                    {/* Show more indicator for overflow events */}
                    {hiddenCount > 0 && (
                      <div
                        className='px-2 py-1 text-xs text-secondary-text bg-accent/50 rounded-md text-center font-medium hover:bg-accent transition-colors duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary'
                        role='button'
                        tabIndex={0}
                        aria-label={`View ${hiddenCount} more workout${hiddenCount !== 1 ? 's' : ''} for ${date.toLocaleDateString()}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onDateClick?.(date);
                          }
                        }}
                      >
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>

                  {/* Hidden event details for screen readers */}
                  {dayEvents.length > 0 && (
                    <div id={`day-${index}-events`} className='sr-only'>
                      {dayEvents.map((event, eventIndex) => (
                        <span key={event.id}>
                          {eventIndex > 0 && ', '}
                          {event.title} at{' '}
                          {event.start.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enhanced empty state for days with no workouts */}
                  {dayEvents.length === 0 && (
                    <div className='flex-1 flex items-center justify-center'>
                      <div className='opacity-0 group-hover:opacity-40 group-focus:opacity-40 transition-all duration-300 text-center transform translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0'>
                        <div
                          className='w-8 sm:w-10 h-8 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-full bg-accent/30 flex items-center justify-center'
                          aria-hidden='true'
                        >
                          <PlusIcon className='h-4 sm:h-5 w-4 sm:w-5 text-secondary-text' />
                        </div>
                        <p className='text-xs text-secondary-text font-medium hidden sm:block'>
                          Add workout
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Touch-friendly Add Workout button for days that already have workouts */}
                  {dayEvents.length > 0 && (
                    <div className='flex-shrink-0 pt-1 sm:pt-2'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onAddWorkout?.(date);
                        }}
                        className='w-full px-2 sm:px-3 py-2 sm:py-2 bg-accent hover:bg-accent/80 focus:bg-accent/80 border border-border rounded-lg text-secondary-text hover:text-primary-text focus:text-primary-text text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 touch-manipulation min-h-[44px] sm:min-h-auto focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                        aria-label={`Add workout for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                      >
                        <PlusIcon className='h-3 w-3 flex-shrink-0' aria-hidden='true' />
                        <span className='hidden sm:inline'>Add workout</span>
                        <span className='sm:hidden'>Add</span>
                      </button>
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

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weeks = [];

    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      try {
        const workoutData = JSON.parse(e.dataTransfer.getData('application/json'));
        console.log('Dropped workout on date:', date, workoutData);
        // Here you would typically create a new workout event
        onDateClick?.(date);
      } catch (error) {
        console.error('Error parsing dropped workout data:', error);
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const target = e.currentTarget as HTMLElement;
      target.setAttribute('data-touch-start-x', touch.clientX.toString());
      target.setAttribute('data-touch-start-y', touch.clientY.toString());
      target.setAttribute('data-touch-start-time', Date.now().toString());
    };

    const handleTouchEnd = (e: React.TouchEvent, date: Date) => {
      const target = e.currentTarget as HTMLElement;
      const startTime = parseInt(target.getAttribute('data-touch-start-time') || '0');
      const touchDuration = Date.now() - startTime;

      if (touchDuration < 300) {
        onDateClick?.(date);
      }

      target.removeAttribute('data-touch-start-x');
      target.removeAttribute('data-touch-start-y');
      target.removeAttribute('data-touch-start-time');
    };

    return (
      <div
        className='bg-surface rounded-2xl shadow-lg border border-border overflow-hidden'
        ref={calendarRef}
        onKeyDown={handleCalendarKeyDown}
        tabIndex={keyboardNavigationMode ? 0 : -1}
        role='grid'
        aria-label={`Monthly calendar view for ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        aria-describedby='calendar-instructions-month'
      >
        {/* Screen reader instructions */}
        <div id='calendar-instructions-month' className='sr-only'>
          Use arrow keys to navigate between dates. Press Enter or Space to select a date. Press
          &apos;A&apos; to add a workout to the focused date. Use Home and End to jump to the
          beginning or end of the week.
        </div>

        {/* Enhanced day headers with mobile optimization */}
        <div
          className='grid grid-cols-7 bg-gradient-to-r from-surface-light to-accent border-b border-border'
          role='row'
        >
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
            day => (
              <div
                key={day}
                className='p-2 sm:p-3 md:p-4 text-center border-r border-border last:border-r-0'
                role='columnheader'
                aria-label={day}
              >
                <div className='text-xs font-semibold uppercase tracking-wider text-secondary-text'>
                  <span className='sm:hidden'>{day.slice(0, 1)}</span>
                  <span className='hidden sm:inline md:hidden'>{day.slice(0, 3)}</span>
                  <span className='hidden md:inline'>{day.slice(0, 3)}</span>
                </div>
                <div className='hidden md:block text-xs text-secondary-text/70 mt-1'>
                  {day.slice(3)}
                </div>
              </div>
            )
          )}
        </div>

        {/* Enhanced calendar grid with mobile optimization */}
        <div className='grid grid-cols-7' role='rowgroup'>
          {monthDates.map((date, index) => {
            const dateKey = date.toDateString();
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            // Responsive event limits for month view
            const maxEvents = isMobile ? 2 : 3;
            const visibleEvents = dayEvents.slice(0, maxEvents);
            const hiddenCount = Math.max(0, dayEvents.length - maxEvents);
            const isFocused = focusedDate && date.toDateString() === focusedDate.toDateString();

            return (
              <div
                key={index}
                className={`group relative border-r border-b border-border last:border-r-0 p-2 sm:p-3 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] cursor-pointer transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                  !isCurrentMonth
                    ? 'bg-accent/30 text-muted hover:bg-accent/50'
                    : 'bg-surface hover:bg-surface-light'
                } ${isToday ? 'bg-primary/10 hover:bg-primary/15' : ''} ${isFocused && keyboardNavigationMode ? 'ring-2 ring-primary ring-inset bg-primary/10' : ''}`}
                onClick={() => {
                  setFocusedDate(date);
                  setKeyboardNavigationMode(false);
                  onDateClick?.(date);
                }}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, date)}
                onTouchStart={e => handleTouchStart(e)}
                onTouchEnd={e => handleTouchEnd(e, date)}
                onFocus={() => {
                  setFocusedDate(date);
                  setKeyboardNavigationMode(true);
                }}
                tabIndex={isFocused ? 0 : -1}
                role='gridcell'
                aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ', today' : ''}${!isCurrentMonth ? ', outside current month' : ''}. ${dayEvents.length} workout${dayEvents.length !== 1 ? 's' : ''} scheduled.`}
                aria-selected={!!isFocused}
                aria-describedby={dayEvents.length > 0 ? `month-day-${index}-events` : undefined}
              >
                {/* Enhanced date number with responsive sizing */}
                <div className='flex items-center justify-between mb-1 sm:mb-2'>
                  <div
                    className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
                      isToday
                        ? 'text-primary'
                        : isCurrentMonth
                          ? 'text-primary-text group-hover:text-primary'
                          : 'text-secondary-text'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>

                {/* Today indicator */}
                {isToday ? <div className='absolute top-1 left-1 w-2 h-2 bg-primary rounded-full' /> : null}

                {/* Enhanced events container with mobile optimization */}
                <div
                  className='space-y-1 flex-1'
                  role='list'
                  aria-label={`Workouts for ${date.toLocaleDateString()}`}
                >
                  {visibleEvents.map(event => (
                    <div
                      key={event.id}
                      className='px-1 sm:px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:scale-105 focus:scale-105 transition-transform duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
                      style={{
                        backgroundColor: event.backgroundColor,
                        color: event.textColor,
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onEventClick?.(event);
                        }
                      }}
                      tabIndex={0}
                      role='listitem button'
                      aria-label={`${event.title} workout at ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${event.extendedProps.duration} minutes`}
                    >
                      <div className='flex items-center space-x-1'>
                        <span className='hidden sm:inline' aria-hidden='true'>
                          {getTypeIcon(event.extendedProps.type)}
                        </span>
                        <span className='truncate text-xs sm:text-xs'>{event.title}</span>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced more indicator */}
                  {hiddenCount > 0 && (
                    <div
                      className='px-1 sm:px-2 py-1 text-xs text-secondary-text bg-accent/50 rounded text-center font-medium hover:bg-accent focus:bg-accent transition-colors duration-200 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'
                      role='button'
                      tabIndex={0}
                      aria-label={`View ${hiddenCount} more workout${hiddenCount !== 1 ? 's' : ''} for ${date.toLocaleDateString()}`}
                      onClick={e => {
                        e.stopPropagation();
                        onDateClick?.(date);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onDateClick?.(date);
                        }
                      }}
                    >
                      +{hiddenCount}
                    </div>
                  )}
                </div>

                {/* Hidden event details for screen readers */}
                {dayEvents.length > 0 && (
                  <div id={`month-day-${index}-events`} className='sr-only'>
                    {dayEvents.map((event, eventIndex) => (
                      <span key={event.id}>
                        {eventIndex > 0 && ', '}
                        {event.title} at{' '}
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ))}
                  </div>
                )}

                {/* Enhanced empty state for days with no workouts */}
                {dayEvents.length === 0 && isCurrentMonth ? <div className='flex items-center justify-center h-8 sm:h-12 md:h-16 opacity-0 group-hover:opacity-30 group-focus:opacity-30 transition-all duration-300'>
                    <div className='text-center transform translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0'>
                      <div
                        className='w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-1 rounded-full bg-accent/30 flex items-center justify-center'
                        aria-hidden='true'
                      >
                        <PlusIcon className='h-3 sm:h-4 w-3 sm:w-4 text-secondary-text' />
                      </div>
                      <p className='text-xs text-secondary-text font-medium hidden sm:block'>Add</p>
                    </div>
                  </div> : null}

                {/* Touch-friendly Add Workout button for days that already have workouts */}
                {dayEvents.length > 0 && isCurrentMonth ? <div className='mt-1 sm:mt-2'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onAddWorkout?.(date);
                      }}
                      className='w-full px-1 sm:px-2 py-1 bg-accent hover:bg-accent/80 focus:bg-accent/80 border border-border rounded text-secondary-text hover:text-primary-text focus:text-primary-text text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 touch-manipulation min-h-[32px] sm:min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                      aria-label={`Add workout for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
                    >
                      <PlusIcon className='h-3 w-3 flex-shrink-0' aria-hidden='true' />
                      <span className='hidden sm:inline'>Add</span>
                    </button>
                  </div> : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div
        className='bg-surface/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg'
        role='table'
        aria-label='Workout list view'
        aria-describedby='list-view-description'
      >
        {/* Screen reader description */}
        <div id='list-view-description' className='sr-only'>
          Table showing workout details including name, type, status, duration, time, and available
          actions. Use Tab to navigate between elements.
        </div>

        {/* Table Header */}
        <div
          className='grid grid-cols-6 gap-4 px-6 py-4 bg-accent border-b border-border'
          role='row'
        >
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            WORKOUT
          </div>
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            TYPE
          </div>
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            STATUS
          </div>
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            DURATION
          </div>
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            TIME
          </div>
          <div
            className='text-sm font-light text-secondary-text uppercase tracking-wider'
            role='columnheader'
          >
            ACTIONS
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-border' role='rowgroup'>
          {visibleEvents.length === 0 ? (
            <div className='px-6 py-12 text-center' role='row'>
              <div role='cell' className='col-span-6'>
                <ClockIcon
                  className='h-12 w-12 text-secondary-text mx-auto mb-4'
                  aria-hidden='true'
                />
                <h3 className='text-lg font-light text-primary-text mb-2'>No workouts found</h3>
                <p className='text-sm text-secondary-text'>No workouts scheduled for this period</p>
              </div>
            </div>
          ) : (
            visibleEvents.map(event => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'crossfit':
                    return '#ef4444';
                  case 'burn40':
                    return '#f97316';
                  case 'strength':
                    return '#10b981';
                  case 'cardio':
                    return '#3b82f6';
                  case 'yoga':
                    return '#8b5cf6';
                  case 'recovery':
                    return '#14b8a6';
                  default:
                    return '#6b7280';
                }
              };

              const getTypeLabel = (type: string) => {
                switch (type) {
                  case 'crossfit':
                    return 'CrossFit';
                  case 'burn40':
                    return 'Burn40';
                  case 'strength':
                    return 'Strength';
                  case 'cardio':
                    return 'Cardio';
                  case 'yoga':
                    return 'Yoga';
                  case 'recovery':
                    return 'Recovery';
                  default:
                    return type.charAt(0).toUpperCase() + type.slice(1);
                }
              };

              const getStatusColor = (completed: boolean) => {
                return completed
                  ? 'bg-success/20 text-success border-success/30'
                  : 'bg-warning/20 text-warning border-warning/30';
              };

              const getStatusText = (completed: boolean) => {
                return completed ? 'Completed' : 'Scheduled';
              };

              return (
                <div
                  key={event.id}
                  className='grid grid-cols-6 gap-4 px-6 py-4 hover:bg-accent focus:bg-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset'
                  onClick={() => onEventClick?.(event)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEventClick?.(event);
                    }
                  }}
                  tabIndex={0}
                  role='row button'
                  aria-label={`${event.title} workout on ${event.start.toLocaleDateString()}, ${event.extendedProps.duration} minutes, ${getStatusText(event.extendedProps.completed)}`}
                >
                  {/* WORKOUT */}
                  <div className='flex items-center'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-3 h-3 rounded-full shadow-sm'
                        style={{ backgroundColor: getTypeColor(event.extendedProps.type) }}
                      />
                      <div>
                        <div className='text-sm font-light text-primary-text'>{event.title}</div>
                        <div className='text-xs text-secondary-text'>
                          {event.extendedProps.exercises.length > 0
                            ? `${event.extendedProps.exercises.length} exercises`
                            : 'No exercises listed'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TYPE */}
                  <div className='flex items-center'>
                    <span className='text-sm text-secondary-text capitalize'>
                      {getTypeLabel(event.extendedProps.type)}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div className='flex items-center'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.extendedProps.completed)}`}
                    >
                      {getStatusText(event.extendedProps.completed)}
                    </span>
                  </div>

                  {/* DURATION */}
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-primary-text'>
                      {event.extendedProps.duration}m
                    </span>
                  </div>

                  {/* TIME */}
                  <div className='flex items-center'>
                    <div>
                      <div className='text-sm font-light text-primary-text'>
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className='text-xs text-secondary-text'>
                        {event.start.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className='flex items-center space-x-2'>
                    {event.extendedProps.completed ? (
                      <div className='w-2 h-2 rounded-full bg-success' />
                    ) : (
                      <div className='w-2 h-2 rounded-full bg-warning' />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='h-full flex flex-col'>
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'list' && renderListView()}
    </div>
  );
}
