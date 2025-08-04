'use client';

import {
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  Bars3Icon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { WorkoutSegment, EnhancedWorkoutEvent } from '@/lib/types';
import {
  validateWorkoutForm,
  validateField,
  validateDragDropData,
  hasValidationErrors,
  clearAllValidationErrors,
  type WorkoutFormData,
  type ValidationError,
} from '@/lib/validation';

import WorkoutSidebar from './WorkoutSidebar';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workoutData: Partial<EnhancedWorkoutEvent>) => void;
  selectedDate?: Date | null;
}

export default function AddWorkoutModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
}: AddWorkoutModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [segments, setSegments] = useState<WorkoutSegment[]>([]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<'form' | 'segments' | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [lastValidationResult, setLastValidationResult] = useState<{
    isValid: boolean;
    errors: ValidationError[];
  } | null>(null);

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form reset function for reusability
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setStartTime('07:00');
    setSegments([]);
    setDragError(null);
    setSuccessMessage(null);
    setIsDragOver(false);
    setDragOverTarget(null);
    setValidationErrors(clearAllValidationErrors());
    setShowValidationSummary(false);
    setLastValidationResult(null);
    setIsLoading(false);
    setIsSaving(false);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setShowSidebar(true); // Show sidebar when modal opens

      // Focus management - focus first input after modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    } else {
      setShowSidebar(false); // Hide sidebar when modal closes
    }
  }, [isOpen, resetForm]);

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  useEffect(() => {
    if (dragError) {
      const timer = setTimeout(() => setDragError(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [dragError]);

  // Enhanced segment management functions with better state management
  const addSegment = useCallback(() => {
    const newSegment: WorkoutSegment = {
      id: `segment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title: '',
      description: '',
      order: segments.length,
      type: 'main',
      intensity: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSegments(prev => [...prev, newSegment]);

    // Clear any validation errors for the new segment
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`segment-${segments.length}-`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, [segments.length]);

  const updateSegment = useCallback(
    (id: string, updates: Partial<WorkoutSegment>) => {
      setSegments(prev =>
        prev.map(segment =>
          segment.id === id ? { ...segment, ...updates, updatedAt: new Date() } : segment
        )
      );

      // Real-time validation for updated segment
      const segmentIndex = segments.findIndex(s => s.id === id);
      if (segmentIndex !== -1) {
        Object.keys(updates).forEach(key => {
          const fieldName = `segment-${segmentIndex}-${key}`;
          const validationError = validateField(fieldName, updates[key as keyof WorkoutSegment]);

          setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (validationError) {
              newErrors[fieldName] = validationError.message;
            } else {
              delete newErrors[fieldName];
            }
            return newErrors;
          });
        });
      }
    },
    [segments]
  );

  const deleteSegment = useCallback((id: string) => {
    setSegments(prev => {
      const filtered = prev.filter(segment => segment.id !== id);
      // Reorder remaining segments
      return filtered.map((segment, index) => ({
        ...segment,
        order: index,
        updatedAt: new Date(),
      }));
    });

    // Clear validation errors for deleted segment
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.includes('segment-')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, []);

  const moveSegment = (fromIndex: number, toIndex: number) => {
    const newSegments = [...segments];
    const [movedSegment] = newSegments.splice(fromIndex, 1);
    newSegments.splice(toIndex, 0, movedSegment);

    // Update order values
    const reorderedSegments = newSegments.map((segment, index) => ({
      ...segment,
      order: index,
    }));

    setSegments(reorderedSegments);
  };

  const handleSegmentDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSegmentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSegmentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      moveSegment(dragIndex, dropIndex);
    }
  };

  // Enhanced form validation with comprehensive segment validation
  const validateForm = useCallback(() => {
    const formData: WorkoutFormData = {
      title,
      description,
      startTime,
      segments,
    };

    const validationResult = validateWorkoutForm(formData);
    setValidationErrors(validationResult.fieldErrors);
    setLastValidationResult(validationResult);
    setShowValidationSummary(
      !validationResult.isValid && Object.keys(validationResult.fieldErrors).length > 0
    );

    return validationResult.isValid;
  }, [title, description, startTime, segments]);

  const isFormValid = useCallback(() => {
    return (
      title.trim() &&
      startTime &&
      segments.every(segment => segment.title.trim()) &&
      !hasValidationErrors(validationErrors)
    );
  }, [title, startTime, segments, validationErrors]);

  // Enhanced save handlers with proper EnhancedWorkoutEvent data processing
  const handleSaveAndAddAnother = useCallback(async () => {
    if (!validateForm()) {
      setDragError('Please fix the validation errors before saving.');
      setShowValidationSummary(true);
      return;
    }

    setIsSaving(true);
    setIsLoading(true);

    try {
      const currentDate = selectedDate || new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const totalDuration = segments.reduce((total, segment) => total + (segment.duration || 0), 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + totalDuration);

      const workoutData: Partial<EnhancedWorkoutEvent> = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime,
        date: currentDate,
        start: startDateTime,
        end: endDateTime,
        segments: segments.map(segment => ({
          ...segment,
          title: segment.title.trim(),
          description: segment.description.trim(),
          updatedAt: new Date(),
        })),
        totalDuration,
        createdFrom: segments.some(s => s.templateId) ? 'drag-drop' : 'manual',
        templateIds: segments.filter(s => s.templateId).map(s => s.templateId!),
        backgroundColor: '#f34a22',
        borderColor: '#d63916',
        textColor: '#ffffff',
        extendedProps: {
          type: 'custom',
          intensity: segments.length > 0 ? 'medium' : 'low',
          duration: totalDuration,
          exercises: segments.flatMap(s => s.exercises || []),
          notes: description.trim() || undefined,
          completed: false,
          segmentCount: segments.length,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSave(workoutData);

      // Show success message
      setSuccessMessage(`✅ Workout "${title}" saved successfully!`);

      // Reset form for next workout but keep modal open
      resetForm();

      // Focus back to title input for rapid creation
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    } catch (error) {
      setDragError('Failed to save workout. Please try again.');
      console.error('Error saving workout:', error);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  }, [validateForm, title, description, startTime, selectedDate, segments, onSave, resetForm]);

  const handleSaveAndClose = useCallback(async () => {
    if (!validateForm()) {
      setDragError('Please fix the validation errors before saving.');
      setShowValidationSummary(true);
      return;
    }

    setIsSaving(true);
    setIsLoading(true);

    try {
      const currentDate = selectedDate || new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const totalDuration = segments.reduce((total, segment) => total + (segment.duration || 0), 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + totalDuration);

      const workoutData: Partial<EnhancedWorkoutEvent> = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime,
        date: currentDate,
        start: startDateTime,
        end: endDateTime,
        segments: segments.map(segment => ({
          ...segment,
          title: segment.title.trim(),
          description: segment.description.trim(),
          updatedAt: new Date(),
        })),
        totalDuration,
        createdFrom: segments.some(s => s.templateId) ? 'drag-drop' : 'manual',
        templateIds: segments.filter(s => s.templateId).map(s => s.templateId!),
        backgroundColor: '#f34a22',
        borderColor: '#d63916',
        textColor: '#ffffff',
        extendedProps: {
          type: 'custom',
          intensity: segments.length > 0 ? 'medium' : 'low',
          duration: totalDuration,
          exercises: segments.flatMap(s => s.exercises || []),
          notes: description.trim() || undefined,
          completed: false,
          segmentCount: segments.length,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSave(workoutData);
      onClose();
    } catch (error) {
      setDragError('Failed to save workout. Please try again.');
      console.error('Error saving workout:', error);
      setIsLoading(false);
      setIsSaving(false);
    }
  }, [validateForm, title, description, startTime, selectedDate, segments, onSave, onClose]);

  // Enhanced keyboard navigation and focus management with accessibility - will be moved after announceToScreenReader

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

  // Enhanced keyboard navigation and focus management with accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        announceToScreenReader('Modal closed');
        onClose();
        return;
      }

      // Handle Tab navigation with focus trapping
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab (backward)
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (forward)
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Enhanced keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (isFormValid()) {
              announceToScreenReader('Saving workout and closing modal');
              handleSaveAndClose();
            } else {
              announceToScreenReader('Please fix validation errors before saving');
            }
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl/Cmd + Shift + S for Save & Add Another
              if (isFormValid()) {
                announceToScreenReader('Saving workout and preparing for next');
                handleSaveAndAddAnother();
              } else {
                announceToScreenReader('Please fix validation errors before saving');
              }
            } else {
              // Ctrl/Cmd + S for Save & Close
              if (isFormValid()) {
                announceToScreenReader('Saving workout and closing modal');
                handleSaveAndClose();
              } else {
                announceToScreenReader('Please fix validation errors before saving');
              }
            }
            break;
          case 'n':
            // Ctrl/Cmd + N for new segment
            e.preventDefault();
            addSegment();
            announceToScreenReader('New workout segment added');
            break;
        }
      }

      // Alt key shortcuts for accessibility
      if (e.altKey) {
        switch (e.key) {
          case 'a':
            // Alt + A to add segment
            e.preventDefault();
            addSegment();
            announceToScreenReader('New workout segment added');
            break;
          case 'c':
            // Alt + C to close modal
            e.preventDefault();
            announceToScreenReader('Modal closed');
            onClose();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    onClose,
    isFormValid,
    handleSaveAndClose,
    handleSaveAndAddAnother,
    addSegment,
    announceToScreenReader,
  ]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Enhanced drag and drop handlers with accessibility
  const handleDragOver = (e: React.DragEvent, target: 'form' | 'segments' = 'form') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setDragOverTarget(target);
    setDragError(null);

    // Set visual feedback for drop effect
    e.dataTransfer.dropEffect = 'copy';

    // Announce drag over state to screen readers
    if (!isDragOver) {
      announceToScreenReader(
        `Drag over ${target === 'form' ? 'main form' : 'segments area'}. Release to drop workout template.`
      );
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only clear drag state if leaving the modal entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, target: 'form' | 'segments' = 'form') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragOverTarget(null);

    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) {
        const errorMsg = 'Invalid workout data. Please try dragging again.';
        setDragError(errorMsg);
        announceToScreenReader(errorMsg);
        return;
      }

      const workoutData = JSON.parse(jsonData);

      // Validate drag and drop data
      const dragValidationError = validateDragDropData(workoutData);
      if (dragValidationError) {
        setDragError(dragValidationError.message);
        announceToScreenReader(`Drag and drop error: ${dragValidationError.message}`);
        return;
      }

      // Enhanced auto-population logic with accessibility announcements
      if (target === 'form' && !title && segments.length === 0) {
        // Auto-fill main form if empty
        setTitle(workoutData.title);
        setDescription(workoutData.description || '');
        const successMsg = `Auto-filled workout: "${workoutData.title}"`;
        setSuccessMessage(`✅ ${successMsg}`);
        announceToScreenReader(successMsg);
      } else {
        // Add as new segment with enhanced properties
        const newSegment: WorkoutSegment = {
          id: `segment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          title: workoutData.title,
          description: workoutData.description || '',
          duration: workoutData.duration || undefined,
          exercises: workoutData.exercises || [],
          order: segments.length,
          templateId: workoutData.id,
          type: workoutData.type || 'main',
          intensity: workoutData.intensity || 'medium',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSegments(prev => [...prev, newSegment]);
        const successMsg = `Added segment: "${workoutData.title}"`;
        setSuccessMessage(`✅ ${successMsg}`);
        announceToScreenReader(successMsg);
      }
    } catch (error) {
      console.error('Error parsing dropped workout data:', error);
      const errorMsg = 'Failed to process workout template. Please try again.';
      setDragError(errorMsg);
      announceToScreenReader(errorMsg);
    }
  };

  // Prevent default drag behavior on the entire modal
  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // If dropped outside specific zones, treat as form drop
    if (!dragOverTarget) {
      handleDrop(e, 'form');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Workout Sidebar */}
      <WorkoutSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onAddWorkout={workout => {
          // Handle workout selection for drag and drop
          console.log('Selected workout:', workout);
        }}
      />

      {/* Enhanced Modal Layout with Mobile-First Dynamic Positioning */}
      <div className='fixed inset-0 z-[60] flex'>
        {/* Dynamic Backdrop - adjusts based on sidebar state and screen size */}
        <div
          className={`fixed top-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-[61] transition-all duration-300 ${
            showSidebar ? 'left-0 lg:left-80' : 'left-0'
          }`}
          onClick={onClose}
        />

        {/* Modal Container with Mobile-First Dynamic Positioning */}
        <div
          className={`relative flex-1 flex items-center justify-center p-2 sm:p-4 z-[62] transition-all duration-300 ${
            showSidebar ? 'ml-0 lg:ml-80' : 'ml-0'
          }`}
        >
          <div
            ref={modalRef}
            className={`relative bg-surface rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-3xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden transition-all duration-300 ${
              isDragOver
                ? 'border-2 border-primary ring-4 ring-primary/20 shadow-2xl scale-[1.01]'
                : 'border border-border'
            }`}
            onDragOver={handleModalDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleModalDrop}
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-title'
            aria-describedby='modal-description'
          >
            {/* Modal Content with Scroll Container */}
            <div className='flex flex-col h-full max-h-[95vh]'>
              {/* Enhanced Header with Mobile-First Design */}
              <div className='flex-shrink-0 p-4 sm:p-6 bg-gradient-to-r from-surface-light/50 to-surface-light/30 border-b border-border/30'>
                <div className='flex items-start sm:items-center justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    <h2
                      id='modal-title'
                      className='text-lg sm:text-xl lg:text-2xl font-light text-primary-text mb-1 truncate'
                    >
                      Add New Workout
                    </h2>
                    <p
                      id='modal-description'
                      className='text-xs sm:text-sm text-secondary-text font-light'
                    >
                      {selectedDate
                        ? `${selectedDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}`
                        : 'Create a new workout'}
                    </p>
                  </div>
                  <Button
                    onClick={onClose}
                    variant='outline'
                    size='sm'
                    className='border-border/50 text-primary-text hover:bg-surface/50 transition-all duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] p-2 sm:p-3'
                    aria-label='Close modal'
                  >
                    <XMarkIcon className='h-4 w-4 sm:h-5 sm:w-5' />
                  </Button>
                </div>
              </div>

              {/* Enhanced Success/Error Messages */}
              {(successMessage || dragError || showValidationSummary) ? <div className='flex-shrink-0 px-6 pt-4 space-y-3'>
                  {successMessage ? <ErrorMessage
                      variant='info'
                      dismissible
                      onDismiss={() => setSuccessMessage(null)}
                      className='bg-green-50 border-green-200 text-green-800'
                    >
                      <div className='flex items-center space-x-2'>
                        <CheckCircleIcon className='h-4 w-4 text-green-600' />
                        <span>{successMessage}</span>
                      </div>
                    </ErrorMessage> : null}

                  {dragError ? <ErrorMessage
                      variant='error'
                      title='Drag & Drop Error'
                      dismissible
                      onDismiss={() => setDragError(null)}
                    >
                      {dragError}
                    </ErrorMessage> : null}

                  {showValidationSummary &&
                    lastValidationResult &&
                    !lastValidationResult.isValid ? <ErrorMessage
                        variant='warning'
                        title='Form Validation Errors'
                        dismissible
                        onDismiss={() => setShowValidationSummary(false)}
                      >
                        <div className='space-y-1'>
                          <p className='text-sm mb-2'>
                            Please fix the following errors before saving:
                          </p>
                          <ul className='list-disc list-inside space-y-1 text-xs'>
                            {lastValidationResult.errors.map((error, index) => (
                              <li
                                key={index}
                                className={error.type === 'duplicate' ? 'font-medium' : ''}
                              >
                                {error.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </ErrorMessage> : null}
                </div> : null}

              {/* Scrollable Content Area with Mobile Optimization */}
              <div className='flex-1 overflow-y-auto'>
                <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
                  {/* Enhanced Basic Information Section */}
                  <div
                    className={`relative space-y-4 p-4 rounded-lg transition-all duration-300 ${
                      isDragOver && dragOverTarget === 'form'
                        ? 'bg-primary/10 border-2 border-dashed border-primary ring-2 ring-primary/20'
                        : 'bg-transparent'
                    }`}
                    onDragOver={e => handleDragOver(e, 'form')}
                    onDrop={e => handleDrop(e, 'form')}
                  >
                    <div>
                      <label
                        htmlFor='workout-title'
                        className='block text-sm font-medium text-primary-text mb-2'
                      >
                        Workout Title *
                      </label>
                      <Input
                        id='workout-title'
                        ref={titleInputRef}
                        value={title}
                        onChange={e => {
                          const newValue = e.target.value;
                          setTitle(newValue);

                          // Real-time validation
                          const validationError = validateField('title', newValue);
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            if (validationError) {
                              newErrors.title = validationError.message;
                            } else {
                              delete newErrors.title;
                            }
                            return newErrors;
                          });
                        }}
                        placeholder='e.g., CrossFit WOD, Morning Cardio'
                        className={`w-full bg-surface border-border/50 text-primary-text placeholder:text-muted focus:border-primary transition-colors min-h-[44px] text-base sm:text-sm ${
                          validationErrors.title ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        aria-describedby={validationErrors.title ? 'title-error' : undefined}
                        aria-invalid={!!validationErrors.title}
                      />
                      {validationErrors.title ? <p id='title-error' className='text-red-500 text-xs mt-1' role='alert'>
                          {validationErrors.title}
                        </p> : null}
                    </div>

                    <div>
                      <label
                        htmlFor='start-time'
                        className='block text-sm font-medium text-primary-text mb-2'
                      >
                        Start Time *
                      </label>
                      <Input
                        id='start-time'
                        type='time'
                        value={startTime}
                        onChange={e => {
                          const newValue = e.target.value;
                          setStartTime(newValue);

                          // Real-time validation
                          const validationError = validateField('startTime', newValue);
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            if (validationError) {
                              newErrors.startTime = validationError.message;
                            } else {
                              delete newErrors.startTime;
                            }
                            return newErrors;
                          });
                        }}
                        className={`w-full bg-surface border-border/50 text-primary-text transition-colors min-h-[44px] text-base sm:text-sm ${
                          validationErrors.startTime ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        aria-describedby={validationErrors.startTime ? 'time-error' : undefined}
                        aria-invalid={!!validationErrors.startTime}
                      />
                      {validationErrors.startTime ? <p id='time-error' className='text-red-500 text-xs mt-1' role='alert'>
                          {validationErrors.startTime}
                        </p> : null}
                    </div>

                    <div>
                      <label
                        htmlFor='description'
                        className='block text-sm font-medium text-primary-text mb-2'
                      >
                        Description
                      </label>
                      <textarea
                        id='description'
                        value={description}
                        onChange={e => {
                          const newValue = e.target.value;
                          setDescription(newValue);

                          // Real-time validation
                          const validationError = validateField('description', newValue);
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            if (validationError) {
                              newErrors.description = validationError.message;
                            } else {
                              delete newErrors.description;
                            }
                            return newErrors;
                          });
                        }}
                        placeholder='Brief description of the workout...'
                        className={`w-full px-3 py-3 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-primary-text placeholder:text-muted transition-colors text-base sm:text-sm ${
                          validationErrors.description ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        rows={3}
                        aria-describedby={
                          validationErrors.description ? 'description-error' : undefined
                        }
                        aria-invalid={!!validationErrors.description}
                      />
                      {validationErrors.description ? <p
                          id='description-error'
                          className='text-red-500 text-xs mt-1'
                          role='alert'
                        >
                          {validationErrors.description}
                        </p> : null}
                    </div>

                    {isDragOver && dragOverTarget === 'form' ? <div className='absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg border-2 border-dashed border-primary pointer-events-none'>
                        <div className='text-center'>
                          <div className='text-primary font-medium'>Drop workout here</div>
                          <div className='text-sm text-primary/70'>Auto-fill form fields</div>
                        </div>
                      </div> : null}
                  </div>

                  {/* Workout Segments */}
                  <div
                    className={`space-y-4 p-4 rounded-lg transition-all duration-300 ${
                      isDragOver && dragOverTarget === 'segments'
                        ? 'bg-blue-50 border-2 border-dashed border-blue-400 ring-2 ring-blue-400/20'
                        : 'bg-transparent'
                    }`}
                    onDragOver={e => handleDragOver(e, 'segments')}
                    onDrop={e => handleDrop(e, 'segments')}
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-sm font-medium text-primary-text'>Workout Segments</h3>
                      <Button
                        onClick={addSegment}
                        variant='outline'
                        size='sm'
                        className='border-border/50 text-primary-text hover:bg-surface/50'
                      >
                        <PlusIcon className='h-4 w-4 mr-1' />
                        Add Segment
                      </Button>
                    </div>

                    {segments.length > 0 && (
                      <div className='space-y-3'>
                        {segments.map((segment, index) => (
                          <div
                            key={segment.id}
                            draggable
                            onDragStart={e => handleSegmentDragStart(e, index)}
                            onDragOver={handleSegmentDragOver}
                            onDrop={e => handleSegmentDrop(e, index)}
                            className='bg-surface-light/20 border border-border/50 rounded-lg p-4 space-y-3 cursor-move hover:bg-surface-light/30 transition-colors'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2'>
                                <Bars3Icon className='h-4 w-4 text-secondary-text cursor-grab' />
                                <span className='text-xs text-secondary-text'>
                                  Segment {index + 1}
                                </span>
                              </div>
                              <Button
                                onClick={() => deleteSegment(segment.id)}
                                variant='outline'
                                size='sm'
                                className='border-red-500/50 text-red-500 hover:bg-red-500/10'
                              >
                                <TrashIcon className='h-4 w-4' />
                              </Button>
                            </div>

                            <div className='space-y-3'>
                              <div>
                                <label
                                  htmlFor={`segment-title-${segment.id}`}
                                  className='block text-xs font-medium text-primary-text mb-1'
                                >
                                  Segment Title *
                                </label>
                                <Input
                                  id={`segment-title-${segment.id}`}
                                  value={segment.title}
                                  onChange={e => {
                                    updateSegment(segment.id, { title: e.target.value });
                                    const errorKey = `segment-${index}-title`;
                                    if (validationErrors[errorKey]) {
                                      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
                                    }
                                  }}
                                  placeholder='e.g., Warm-up, Main Set, Cool Down'
                                  className={`w-full bg-surface border-border/50 text-primary-text placeholder:text-muted focus:border-primary transition-colors ${
                                    validationErrors[`segment-${index}-title`]
                                      ? 'border-red-500 focus:border-red-500'
                                      : ''
                                  }`}
                                  aria-describedby={
                                    validationErrors[`segment-${index}-title`]
                                      ? `segment-${index}-title-error`
                                      : undefined
                                  }
                                  aria-invalid={!!validationErrors[`segment-${index}-title`]}
                                />
                                {validationErrors[`segment-${index}-title`] ? <p
                                    id={`segment-${index}-title-error`}
                                    className='text-red-500 text-xs mt-1'
                                    role='alert'
                                  >
                                    {validationErrors[`segment-${index}-title`]}
                                  </p> : null}
                              </div>

                              <div>
                                <label className='block text-xs font-medium text-primary-text mb-1'>
                                  Segment Description
                                </label>
                                <textarea
                                  value={segment.description}
                                  onChange={e => {
                                    updateSegment(segment.id, { description: e.target.value });
                                    const errorKey = `segment-${index}-description`;
                                    if (validationErrors[errorKey]) {
                                      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
                                    }
                                  }}
                                  placeholder='Describe this segment of the workout...'
                                  className={`w-full px-3 py-2 bg-surface border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-primary-text placeholder:text-muted text-sm transition-colors ${
                                    validationErrors[`segment-${index}-description`]
                                      ? 'border-red-500 focus:border-red-500'
                                      : ''
                                  }`}
                                  rows={2}
                                  aria-describedby={
                                    validationErrors[`segment-${index}-description`]
                                      ? `segment-${index}-description-error`
                                      : undefined
                                  }
                                  aria-invalid={!!validationErrors[`segment-${index}-description`]}
                                />
                                {validationErrors[`segment-${index}-description`] ? <p
                                    id={`segment-${index}-description-error`}
                                    className='text-red-500 text-xs mt-1'
                                    role='alert'
                                  >
                                    {validationErrors[`segment-${index}-description`]}
                                  </p> : null}
                              </div>

                              <div>
                                <label className='block text-xs font-medium text-primary-text mb-1'>
                                  Duration (minutes)
                                </label>
                                <Input
                                  type='number'
                                  value={segment.duration || ''}
                                  onChange={e => {
                                    updateSegment(segment.id, {
                                      duration: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    });
                                    const errorKey = `segment-${index}-duration`;
                                    if (validationErrors[errorKey]) {
                                      setValidationErrors(prev => ({ ...prev, [errorKey]: '' }));
                                    }
                                  }}
                                  placeholder='Optional'
                                  className={`w-full bg-surface border-border/50 text-primary-text placeholder:text-muted focus:border-primary transition-colors ${
                                    validationErrors[`segment-${index}-duration`]
                                      ? 'border-red-500 focus:border-red-500'
                                      : ''
                                  }`}
                                  min='1'
                                  max='480'
                                  aria-describedby={
                                    validationErrors[`segment-${index}-duration`]
                                      ? `segment-${index}-duration-error`
                                      : undefined
                                  }
                                  aria-invalid={!!validationErrors[`segment-${index}-duration`]}
                                />
                                {validationErrors[`segment-${index}-duration`] ? <p
                                    id={`segment-${index}-duration-error`}
                                    className='text-red-500 text-xs mt-1'
                                    role='alert'
                                  >
                                    {validationErrors[`segment-${index}-duration`]}
                                  </p> : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {segments.length === 0 && (
                      <div
                        className={`text-center py-6 transition-all duration-300 ${
                          isDragOver && dragOverTarget === 'segments'
                            ? 'text-blue-600'
                            : 'text-secondary-text'
                        }`}
                      >
                        {isDragOver && dragOverTarget === 'segments' ? (
                          <>
                            <div className='text-2xl mb-2'>🎯</div>
                            <p className='text-sm font-medium'>
                              Drop workout here to create segment
                            </p>
                            <p className='text-xs mt-1'>Will be added as a new workout segment</p>
                          </>
                        ) : (
                          <>
                            <p className='text-sm'>No segments added yet</p>
                            <p className='text-xs text-muted mt-1'>
                              Add segments to break down your workout into organized components
                            </p>
                            <p className='text-xs text-muted mt-2'>
                              💡 Drag workouts from sidebar to create segments automatically
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Drop Zone Instructions */}
                  <div className='space-y-4'>
                    <h3 className='text-sm font-medium text-primary-text flex items-center space-x-2'>
                      <span>🎯</span>
                      <span>Drag & Drop Instructions</span>
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <div className='w-3 h-3 bg-primary rounded-full' />
                          <h4 className='text-sm font-medium text-primary-text'>Auto-fill Form</h4>
                        </div>
                        <p className='text-xs text-secondary-text'>
                          Drop workout on the form fields above to automatically fill title and
                          description
                        </p>
                      </div>

                      <div className='p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <div className='w-3 h-3 bg-blue-500 rounded-full' />
                          <h4 className='text-sm font-medium text-primary-text'>Create Segment</h4>
                        </div>
                        <p className='text-xs text-secondary-text'>
                          Drop workout on the segments area to create a new workout segment
                        </p>
                      </div>
                    </div>

                    {isDragOver ? <div className='p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg'>
                        <div className='flex items-center space-x-2'>
                          <div className='animate-bounce'>🎯</div>
                          <div>
                            <p className='text-sm font-medium text-green-800'>
                              {dragOverTarget === 'form'
                                ? 'Ready to auto-fill form!'
                                : 'Ready to create segment!'}
                            </p>
                            <p className='text-xs text-green-600'>
                              Release to{' '}
                              {dragOverTarget === 'form'
                                ? 'populate form fields'
                                : 'add as new segment'}
                            </p>
                          </div>
                        </div>
                      </div> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Footer with Better Button Layout */}
            <div className='flex-shrink-0 flex items-center justify-between p-6 bg-gradient-to-r from-accent/50 to-accent/30 border-t border-border'>
              <div className='text-xs text-secondary-text'>
                {isSaving ? (
                  <span className='text-primary font-medium flex items-center space-x-2'>
                    <Spinner size='sm' variant='primary' />
                    <span>Saving workout...</span>
                  </span>
                ) : isLoading ? (
                  <span className='text-primary font-medium flex items-center space-x-2'>
                    <Spinner size='sm' variant='primary' />
                    <span>Processing...</span>
                  </span>
                ) : isDragOver ? (
                  <span className='text-primary font-medium animate-pulse'>
                    🎯 Drop zone active - Release to add workout!
                  </span>
                ) : hasValidationErrors(validationErrors) ? (
                  <span className='text-warning font-medium'>
                    ⚠️ Please fix validation errors above
                  </span>
                ) : (
                  <span>💡 Tip: Drag workouts from sidebar to auto-fill or create segments</span>
                )}
              </div>

              <div className='flex items-center space-x-3'>
                <Button
                  variant='outline'
                  onClick={onClose}
                  disabled={isSaving || isLoading}
                  className='px-6 py-2 border-border text-primary-text hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label='Cancel and close modal'
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSaveAndAddAnother}
                  disabled={!isFormValid() || isSaving || isLoading}
                  variant='outline'
                  className='px-6 py-2 border-primary text-primary hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label='Save workout and add another'
                >
                  {isSaving ? (
                    <div className='flex items-center space-x-2'>
                      <Spinner size='sm' variant='primary' />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save & Add Another'
                  )}
                </Button>

                <Button
                  onClick={handleSaveAndClose}
                  disabled={!isFormValid() || isSaving || isLoading}
                  variant='primary'
                  className='px-6 py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label='Save workout and close modal'
                >
                  {isSaving ? (
                    <div className='flex items-center space-x-2'>
                      <Spinner size='sm' className='border-t-white' />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save & Close'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
