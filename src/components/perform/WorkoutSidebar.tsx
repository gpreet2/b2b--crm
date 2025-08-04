'use client';

import {
  XMarkIcon,
  FireIcon,
  BoltIcon,
  UserGroupIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useCallback } from 'react';

import AddWorkoutTemplateModal from './AddWorkoutTemplateModal';

interface WorkoutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout?: (workout: PreBuiltWorkout) => void;
}

interface PreBuiltWorkout {
  id: string;
  title: string;
  type: string;
  intensity: string;
  duration: number;
  exercises: string[];
  description: string;
  isFavorite: boolean;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  type: string;
  intensity: string;
  duration: number;
  exercises: string[];
  description: string;
  isFavorite: boolean;
}

export default function WorkoutSidebar({ isOpen, onClose }: WorkoutSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedIntensity, setSelectedIntensity] = useState('all');
  const [draggedWorkout, setDraggedWorkout] = useState<PreBuiltWorkout | null>(null);
  const [focusedWorkoutIndex, setFocusedWorkoutIndex] = useState<number>(-1);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<WorkoutTemplate[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Program templates that can be dragged to workout titles
  const programTemplates: PreBuiltWorkout[] = [
    {
      id: 'program-1',
      title: 'Burn40',
      type: 'burn40',
      intensity: 'high',
      duration: 40,
      exercises: ['HIIT Circuit', 'Tabata Intervals', 'Cardio Blast'],
      description: 'High-intensity interval training for maximum calorie burn',
      isFavorite: true,
    },
    {
      id: 'program-2',
      title: 'CrossFit',
      type: 'crossfit',
      intensity: 'high',
      duration: 60,
      exercises: ['Functional movements', 'Varied workouts', 'High intensity'],
      description: 'Functional fitness with varied, high-intensity movements',
      isFavorite: true,
    },
    {
      id: 'program-3',
      title: 'BurnDumbells',
      type: 'burndumbells',
      intensity: 'medium',
      duration: 60,
      exercises: ['Dumbbell Press', 'Dumbbell Rows', 'Dumbbell Squats'],
      description: 'Strength training with dumbbells for muscle building',
      isFavorite: true,
    },
  ];

  // Pre-built workout templates for the three programs
  const preBuiltWorkouts: PreBuiltWorkout[] = [
    // Burn40 Workouts
    {
      id: '1',
      title: 'Burn40 HIIT Circuit',
      type: 'burn40',
      intensity: 'high',
      duration: 40,
      exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Push-ups'],
      description: 'High-intensity interval training circuit.',
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Burn40 Tabata',
      type: 'burn40',
      intensity: 'high',
      duration: 40,
      exercises: ['20s Work / 10s Rest', '8 Rounds Each Exercise'],
      description: 'Tabata intervals for maximum intensity.',
      isFavorite: false,
    },
    {
      id: '3',
      title: 'Burn40 Strength',
      type: 'burn40',
      intensity: 'medium',
      duration: 40,
      exercises: ['Squats', 'Push-ups', 'Rows', 'Overhead Press'],
      description: 'Full body strength training session.',
      isFavorite: false,
    },

    // CrossFit Workouts
    {
      id: '4',
      title: 'CrossFit WOD - Cindy',
      type: 'crossfit',
      intensity: 'high',
      duration: 20,
      exercises: ['5 Pull-ups', '10 Push-ups', '15 Air Squats'],
      description: 'AMRAP in 20 minutes. Classic CrossFit benchmark workout.',
      isFavorite: true,
    },
    {
      id: '5',
      title: 'CrossFit WOD - Fran',
      type: 'crossfit',
      intensity: 'high',
      duration: 15,
      exercises: ['21-15-9 Thrusters', '21-15-9 Pull-ups'],
      description: 'For time. One of the most famous CrossFit workouts.',
      isFavorite: true,
    },
    {
      id: '6',
      title: 'CrossFit Strength',
      type: 'crossfit',
      intensity: 'high',
      duration: 60,
      exercises: ['Deadlifts', 'Overhead Press', 'Back Squats'],
      description: 'Strength focused CrossFit session.',
      isFavorite: false,
    },

    // BurnDumbells Workouts
    {
      id: '7',
      title: 'BurnDumbells Upper Body',
      type: 'burndumbells',
      intensity: 'medium',
      duration: 60,
      exercises: ['Dumbbell Press', 'Dumbbell Rows', 'Shoulder Press', 'Bicep Curls'],
      description: 'Upper body focused dumbbell workout.',
      isFavorite: false,
    },
    {
      id: '8',
      title: 'BurnDumbells Lower Body',
      type: 'burndumbells',
      intensity: 'medium',
      duration: 60,
      exercises: ['Dumbbell Squats', 'Lunges', 'Romanian Deadlifts', 'Calf Raises'],
      description: 'Lower body focused dumbbell workout.',
      isFavorite: false,
    },
    {
      id: '9',
      title: 'BurnDumbells Full Body',
      type: 'burndumbells',
      intensity: 'high',
      duration: 60,
      exercises: ['Thrusters', 'Renegade Rows', 'Dumbbell Swings', 'Turkish Get-ups'],
      description: 'Full body dumbbell workout for strength and conditioning.',
      isFavorite: false,
    },
  ];

  const workoutTypes = [
    { value: 'all', label: 'All Types', icon: FireIcon, color: '#6b7280' },
    { value: 'programs', label: 'Programs', icon: BookmarkIcon, color: '#8b5cf6' },
    { value: 'burn40', label: 'Burn40', icon: BoltIcon, color: '#ef4444' },
    { value: 'crossfit', label: 'CrossFit', icon: FireIcon, color: '#06b6d4' },
    { value: 'burndumbells', label: 'BurnDumbells', icon: UserGroupIcon, color: '#10b981' },
  ];

  const intensityLevels = [
    { value: 'all', label: 'All Intensities' },
    { value: 'low', label: 'Low Intensity' },
    { value: 'medium', label: 'Medium Intensity' },
    { value: 'high', label: 'High Intensity' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'burn40':
        return <BoltIcon className='h-4 w-4' />;
      case 'crossfit':
        return <FireIcon className='h-4 w-4' />;
      case 'burndumbells':
        return <UserGroupIcon className='h-4 w-4' />;
      default:
        return <ClockIcon className='h-4 w-4' />;
    }
  };

  const getTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(t => t.value === type);
    return workoutType ? workoutType.color : '#6b7280';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'text-success bg-success/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'high':
        return 'text-danger bg-danger/10';
      default:
        return 'text-secondary-text bg-surface-light/50';
    }
  };

  // Combine program templates, pre-built workouts, and custom templates
  const allWorkouts = [...programTemplates, ...preBuiltWorkouts, ...customTemplates];

  // Filter workouts based on search and filters
  const filteredWorkouts = allWorkouts.filter(workout => {
    const matchesSearch =
      workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesType = false;
    if (selectedType === 'all') {
      matchesType = true;
    } else if (selectedType === 'programs') {
      matchesType = workout.id.startsWith('program-');
    } else {
      matchesType = workout.type === selectedType;
    }

    const matchesIntensity = selectedIntensity === 'all' || workout.intensity === selectedIntensity;

    return matchesSearch && matchesType && matchesIntensity;
  });

  const toggleCardExpansion = (workoutId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
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
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  const toggleFavorite = useCallback(
    (workoutId: string) => {
      // Here you would typically update the favorite status
      const workout = filteredWorkouts.find(w => w.id === workoutId);
      if (workout) {
        announceToScreenReader(
          `${workout.isFavorite ? 'Removed from' : 'Added to'} favorites: ${workout.title}`
        );
      }
      console.log('Toggling favorite for workout:', workoutId);
    },
    [filteredWorkouts, announceToScreenReader]
  );

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      const template = customTemplates.find(t => t.id === templateId);
      if (template && window.confirm(`Are you sure you want to delete "${template.title}"?`)) {
        setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
        announceToScreenReader(`Workout template "${template.title}" deleted`);
      }
    },
    [customTemplates, setCustomTemplates, announceToScreenReader]
  );

  // Enhanced keyboard navigation for sidebar
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          announceToScreenReader('Workout library closed');
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedWorkoutIndex(prev => {
            const newIndex = Math.min(prev + 1, filteredWorkouts.length - 1);
            if (newIndex !== prev && filteredWorkouts[newIndex]) {
              announceToScreenReader(`Focused on ${filteredWorkouts[newIndex].title}`);
            }
            return newIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedWorkoutIndex(prev => {
            const newIndex = Math.max(prev - 1, 0);
            if (newIndex !== prev && filteredWorkouts[newIndex]) {
              announceToScreenReader(`Focused on ${filteredWorkouts[newIndex].title}`);
            }
            return newIndex;
          });
          break;
        case 'Enter':
        case ' ':
          if (focusedWorkoutIndex >= 0 && filteredWorkouts[focusedWorkoutIndex]) {
            e.preventDefault();
            const workout = filteredWorkouts[focusedWorkoutIndex];
            // Simulate drag and drop for keyboard users
            const dragData = {
              id: workout.id,
              title: workout.title,
              description: workout.description,
              type: workout.type,
              intensity: workout.intensity,
              duration: workout.duration,
              exercises: workout.exercises,
              isFavorite: workout.isFavorite,
            };
            announceToScreenReader(`Selected ${workout.title} for adding to workout`);
            // Here you would typically trigger the same action as drag and drop
            console.log('Keyboard selection:', dragData);
          }
          break;
        case 'f':
        case 'F':
          if (focusedWorkoutIndex >= 0 && filteredWorkouts[focusedWorkoutIndex]) {
            e.preventDefault();
            toggleFavorite(filteredWorkouts[focusedWorkoutIndex].id);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (focusedWorkoutIndex >= 0 && filteredWorkouts[focusedWorkoutIndex]) {
            const workout = filteredWorkouts[focusedWorkoutIndex];
            if (customTemplates.some(t => t.id === workout.id)) {
              e.preventDefault();
              handleDeleteTemplate(workout.id);
            }
          }
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          announceToScreenReader('Search field focused');
          break;
        case 'n':
        case 'N':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsAddTemplateModalOpen(true);
            announceToScreenReader('Opening new workout template modal');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    onClose,
    focusedWorkoutIndex,
    filteredWorkouts,
    announceToScreenReader,
    customTemplates,
    handleDeleteTemplate,
    toggleFavorite,
  ]);

  // Focus management when sidebar opens
  React.useEffect(() => {
    if (isOpen) {
      setFocusedWorkoutIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setFocusedWorkoutIndex(-1);
    }
  }, [isOpen]);

  // Enhanced drag and drop handlers with accessibility
  const handleDragStart = (e: React.DragEvent, workout: PreBuiltWorkout) => {
    setDraggedWorkout(workout);
    e.dataTransfer.effectAllowed = 'copy';

    // Set comprehensive drag data
    e.dataTransfer.setData('text/plain', workout.id);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        id: workout.id,
        title: workout.title,
        description: workout.description,
        type: workout.type,
        intensity: workout.intensity,
        duration: workout.duration,
        exercises: workout.exercises,
        isFavorite: workout.isFavorite,
      })
    );

    // Create enhanced drag image with better visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(3deg) scale(0.95)';
    dragImage.style.opacity = '0.9';
    dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    dragImage.style.borderRadius = '12px';
    e.dataTransfer.setDragImage(dragImage, 50, 50);

    // Announce drag start to screen readers
    announceToScreenReader(`Started dragging ${workout.title} workout template`);
  };

  const handleDragEnd = () => {
    if (draggedWorkout) {
      announceToScreenReader(`Finished dragging ${draggedWorkout.title}`);
    }
    setDraggedWorkout(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none'; // Prevent dropping on sidebar
  };

  // Handle saving new workout template
  const handleSaveTemplate = (template: WorkoutTemplate) => {
    setCustomTemplates(prev => [...prev, template]);
    announceToScreenReader(`New workout template "${template.title}" created successfully`);
  };

  // Handle deleting custom template

  if (!isOpen) return null;

  return (
    <div
      ref={sidebarRef}
      className='fixed top-0 left-0 w-full sm:w-80 h-full z-[65] bg-surface shadow-2xl overflow-y-auto border-r border-border'
      role='complementary'
      aria-label='Workout Library'
      aria-describedby='sidebar-instructions'
    >
      {/* Screen reader instructions */}
      <div id='sidebar-instructions' className='sr-only'>
        Use arrow keys to navigate workouts. Press Enter or Space to select a workout. Press F to
        toggle favorites. Press Delete or Backspace to delete custom templates. Press / to search.
        Press Ctrl/Cmd + N to add new template. Press Escape to close.
      </div>
      {/* Header with Mobile Optimization */}
      <div className='sticky top-0 bg-gradient-to-r from-accent to-accent/80 p-4 sm:p-6 border-b border-border'>
        <div className='flex items-center justify-between mb-3 sm:mb-4'>
          <h2 className='text-lg sm:text-xl font-semibold text-primary-text'>Workout Library</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-accent rounded-lg transition-colors text-secondary-text hover:text-primary-text min-h-[44px] min-w-[44px] flex items-center justify-center'
            aria-label='Close workout library'
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>

        {/* Search with Mobile Optimization */}
        <div className='relative mb-3 sm:mb-4'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text' />
          <input
            ref={searchInputRef}
            type='text'
            placeholder='Search workouts...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-primary-text placeholder:text-muted text-base sm:text-sm min-h-[44px]'
            aria-label='Search workout templates'
            aria-describedby='search-help'
          />
          <div id='search-help' className='sr-only'>
            Type to filter workout templates by name or description
          </div>
        </div>
      </div>

      {/* Filters with Mobile Optimization */}
      <div className='p-4 sm:p-6 bg-gradient-to-r from-accent/50 to-accent/30 border-b border-border'>
        <h3 className='text-sm font-medium text-primary-text mb-3'>Filter by Type</h3>
        <div className='flex flex-wrap gap-2 mb-4'>
          {workoutTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedType === type.value
                  ? 'bg-primary text-white'
                  : 'bg-accent text-primary-text hover:bg-accent/80 border border-border-light'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <h3 className='text-sm font-medium text-primary-text mb-3'>Filter by Intensity</h3>
        <div className='flex flex-wrap gap-2'>
          {intensityLevels.map(intensity => (
            <button
              key={intensity.value}
              onClick={() => setSelectedIntensity(intensity.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedIntensity === intensity.value
                  ? 'bg-primary text-white'
                  : 'bg-accent text-primary-text hover:bg-accent/80 border border-border-light'
              }`}
            >
              {intensity.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workout List */}
      <div className='p-6 space-y-4 bg-surface'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-primary-text'>
            Workout Templates ({filteredWorkouts.length})
          </h3>
          <button
            onClick={() => setIsAddTemplateModalOpen(true)}
            className='flex items-center space-x-1 text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-primary/10'
            aria-label='Add new workout template (Ctrl/Cmd + N)'
            title='Add new workout template (Ctrl/Cmd + N)'
          >
            <PlusIcon className='h-4 w-4' />
            <span>Add New</span>
          </button>
        </div>

        {/* Show breakdown of template types */}
        {(customTemplates.length > 0 || preBuiltWorkouts.length > 0) && (
          <div className='text-sm text-secondary-text mb-4'>
            {customTemplates.length > 0 && (
              <span className='mr-4'>
                {customTemplates.filter(t => filteredWorkouts.includes(t)).length} Custom
              </span>
            )}
            <span>
              {preBuiltWorkouts.filter(t => filteredWorkouts.includes(t)).length} Pre-built
            </span>
          </div>
        )}

        <div className='space-y-3' role='list' aria-label='Workout templates'>
          {filteredWorkouts.map((workout, index) => {
            const isExpanded = expandedCards.has(workout.id);
            const isProgram = workout.id.startsWith('program-');

            return (
              <div
                key={workout.id}
                className={`group bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-border-light select-none touch-manipulation ${
                  draggedWorkout?.id === workout.id
                    ? 'opacity-50 scale-95 shadow-2xl cursor-grabbing rotate-2 ring-2 ring-primary/50'
                    : 'hover:from-accent/50 hover:to-accent/30 hover:shadow-lg hover:scale-[1.02]'
                } ${focusedWorkoutIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                style={{
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
                role='listitem'
                tabIndex={focusedWorkoutIndex === index ? 0 : -1}
                aria-label={`${workout.title} workout template. ${workout.intensity} intensity, ${workout.duration} minutes. ${workout.exercises.length} exercises. ${workout.isFavorite ? 'Favorited' : 'Not favorited'}. Drag to add to workout or press Enter to select.`}
                aria-describedby={`workout-${workout.id}-details`}
                onFocus={() => setFocusedWorkoutIndex(index)}
              >
                {/* Collapsed Header - Always Visible */}
                <div
                  className='p-3 cursor-pointer'
                  onClick={() => toggleCardExpansion(workout.id)}
                  draggable={!isExpanded}
                  onDragStart={!isExpanded ? e => handleDragStart(e, workout) : undefined}
                  onDragEnd={!isExpanded ? handleDragEnd : undefined}
                  onDragOver={!isExpanded ? handleDragOver : undefined}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 flex-1'>
                      <div
                        className='p-2 rounded-lg flex-shrink-0'
                        style={{ backgroundColor: `${getTypeColor(workout.type)  }20` }}
                      >
                        {getTypeIcon(workout.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2'>
                          <h4 className='font-medium text-primary-text truncate'>
                            {workout.title}
                          </h4>
                          {isProgram ? <span className='px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium flex-shrink-0'>
                              Program
                            </span> : null}
                          {customTemplates.some(t => t.id === workout.id) && (
                            <span className='px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium flex-shrink-0'>
                              Custom
                            </span>
                          )}
                        </div>
                        <div className='flex items-center space-x-2 mt-1'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(workout.intensity)} border border-border-light`}
                          >
                            {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
                          </span>
                          <div className='flex items-center space-x-1 text-xs text-secondary-text'>
                            <ClockIcon className='h-3 w-3' />
                            <span>{workout.duration}m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-1 flex-shrink-0'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(workout.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          workout.isFavorite
                            ? 'text-warning hover:text-warning/80'
                            : 'text-secondary-text hover:text-warning'
                        }`}
                        aria-label={`${workout.isFavorite ? 'Remove from' : 'Add to'} favorites`}
                        aria-pressed={workout.isFavorite}
                      >
                        <BookmarkIcon className='h-4 w-4' />
                      </button>

                      {/* Expand/Collapse Button */}
                      <button
                        className='p-1 rounded transition-colors text-secondary-text hover:text-primary-text'
                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                      >
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Drag hint for collapsed state */}
                  {!isExpanded && (
                    <div className='text-center mt-2'>
                      <div
                        className={`text-xs transition-all duration-300 ${
                          draggedWorkout?.id === workout.id
                            ? 'text-primary font-medium animate-pulse'
                            : 'text-secondary-text group-hover:text-primary-text'
                        }`}
                      >
                        {draggedWorkout?.id === workout.id
                          ? '✨ Dragging to modal...'
                          : '🎯 Drag to add workout'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded ? <div className='px-3 pb-3 border-t border-border-light/50'>
                    <div className='pt-3 space-y-3'>
                      <p className='text-sm text-secondary-text'>{workout.description}</p>

                      <div>
                        <p className='text-xs text-muted mb-2'>Exercises:</p>
                        <div className='flex flex-wrap gap-1'>
                          {workout.exercises.map((exercise, exerciseIndex) => (
                            <span
                              key={exerciseIndex}
                              className='px-2 py-1 bg-surface text-primary-text text-xs rounded-full border border-border'
                            >
                              {exercise}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Drag area for expanded state */}
                      <div
                        className='p-3 border-2 border-dashed border-border rounded-lg bg-accent/20 cursor-grab hover:cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors'
                        draggable
                        onDragStart={e => handleDragStart(e, workout)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                      >
                        <div className='text-center'>
                          <div
                            className={`text-xs transition-all duration-300 ${
                              draggedWorkout?.id === workout.id
                                ? 'text-primary font-medium animate-pulse'
                                : 'text-secondary-text hover:text-primary-text'
                            }`}
                          >
                            {draggedWorkout?.id === workout.id
                              ? '✨ Dragging to modal...'
                              : '🎯 Drag to add workout'}
                          </div>
                          <div className='text-xs text-muted mt-1'>
                            Drop in modal to auto-fill or create segment
                          </div>
                        </div>
                      </div>

                      {customTemplates.some(t => t.id === workout.id) && (
                        <div className='flex justify-end'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteTemplate(workout.id);
                            }}
                            className='p-2 rounded-lg transition-colors text-secondary-text hover:text-red-500 hover:bg-red-500/10'
                            aria-label={`Delete custom template ${workout.title}`}
                            title='Delete custom template'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div> : null}

                {/* Hidden details for screen readers */}
                <div id={`workout-${workout.id}-details`} className='sr-only'>
                  Workout description: {workout.description}. Exercises:{' '}
                  {workout.exercises.join(', ')}. Type: {workout.type}. Duration: {workout.duration}{' '}
                  minutes.
                  {workout.isFavorite ? ' This workout is in your favorites.' : null}
                </div>
              </div>
            );
          })}
        </div>

        {filteredWorkouts.length === 0 && (
          <div className='text-center py-8'>
            <FireIcon className='h-12 w-12 text-secondary-text mx-auto mb-4' />
            <p className='text-secondary-text'>No workouts found matching your criteria.</p>
            <p className='text-sm text-muted'>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Add Workout Template Modal */}
      <AddWorkoutTemplateModal
        isOpen={isAddTemplateModalOpen}
        onClose={() => setIsAddTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
