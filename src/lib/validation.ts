import { WorkoutSegment } from './types'

export interface ValidationError {
  field: string
  message: string
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'duplicate' | 'custom'
}

export interface WorkoutValidationResult {
  isValid: boolean
  errors: ValidationError[]
  fieldErrors: Record<string, string>
}

export interface WorkoutFormData {
  title: string
  description?: string
  startTime: string
  segments: WorkoutSegment[]
}

/**
 * Validates workout form data comprehensively
 */
export function validateWorkoutForm(data: WorkoutFormData): WorkoutValidationResult {
  const errors: ValidationError[] = []
  const fieldErrors: Record<string, string> = {}

  // Title validation
  if (!data.title || !data.title.trim()) {
    const error: ValidationError = {
      field: 'title',
      message: 'Workout title is required',
      type: 'required'
    }
    errors.push(error)
    fieldErrors.title = error.message
  } else if (data.title.trim().length < 3) {
    const error: ValidationError = {
      field: 'title',
      message: 'Workout title must be at least 3 characters',
      type: 'minLength'
    }
    errors.push(error)
    fieldErrors.title = error.message
  } else if (data.title.trim().length > 100) {
    const error: ValidationError = {
      field: 'title',
      message: 'Workout title must be less than 100 characters',
      type: 'maxLength'
    }
    errors.push(error)
    fieldErrors.title = error.message
  }

  // Start time validation
  if (!data.startTime) {
    const error: ValidationError = {
      field: 'startTime',
      message: 'Start time is required',
      type: 'required'
    }
    errors.push(error)
    fieldErrors.startTime = error.message
  } else {
    // Validate time format (HH:MM)
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timePattern.test(data.startTime)) {
      const error: ValidationError = {
        field: 'startTime',
        message: 'Please enter a valid time format (HH:MM)',
        type: 'pattern'
      }
      errors.push(error)
      fieldErrors.startTime = error.message
    }
  }

  // Description validation (optional but with limits)
  if (data.description && data.description.length > 1000) {
    const error: ValidationError = {
      field: 'description',
      message: 'Description must be less than 1000 characters',
      type: 'maxLength'
    }
    errors.push(error)
    fieldErrors.description = error.message
  }

  // Segment validation
  const segmentTitles: string[] = []
  
  data.segments.forEach((segment, index) => {
    const segmentPrefix = `segment-${index}`

    // Segment title validation
    if (!segment.title || !segment.title.trim()) {
      const error: ValidationError = {
        field: `${segmentPrefix}-title`,
        message: `Segment ${index + 1} title is required`,
        type: 'required'
      }
      errors.push(error)
      fieldErrors[`${segmentPrefix}-title`] = error.message
    } else if (segment.title.trim().length < 2) {
      const error: ValidationError = {
        field: `${segmentPrefix}-title`,
        message: `Segment ${index + 1} title must be at least 2 characters`,
        type: 'minLength'
      }
      errors.push(error)
      fieldErrors[`${segmentPrefix}-title`] = error.message
    } else if (segment.title.trim().length > 50) {
      const error: ValidationError = {
        field: `${segmentPrefix}-title`,
        message: `Segment ${index + 1} title must be less than 50 characters`,
        type: 'maxLength'
      }
      errors.push(error)
      fieldErrors[`${segmentPrefix}-title`] = error.message
    } else {
      // Check for duplicates
      const trimmedTitle = segment.title.trim().toLowerCase()
      if (segmentTitles.includes(trimmedTitle)) {
        const error: ValidationError = {
          field: `${segmentPrefix}-title`,
          message: `Segment ${index + 1} title must be unique`,
          type: 'duplicate'
        }
        errors.push(error)
        fieldErrors[`${segmentPrefix}-title`] = error.message
      } else {
        segmentTitles.push(trimmedTitle)
      }
    }

    // Segment description validation
    if (segment.description && segment.description.length > 500) {
      const error: ValidationError = {
        field: `${segmentPrefix}-description`,
        message: `Segment ${index + 1} description must be less than 500 characters`,
        type: 'maxLength'
      }
      errors.push(error)
      fieldErrors[`${segmentPrefix}-description`] = error.message
    }

    // Segment duration validation
    if (segment.duration !== undefined && segment.duration !== null) {
      if (segment.duration < 1) {
        const error: ValidationError = {
          field: `${segmentPrefix}-duration`,
          message: `Segment ${index + 1} duration must be at least 1 minute`,
          type: 'range'
        }
        errors.push(error)
        fieldErrors[`${segmentPrefix}-duration`] = error.message
      } else if (segment.duration > 480) {
        const error: ValidationError = {
          field: `${segmentPrefix}-duration`,
          message: `Segment ${index + 1} duration must be less than 480 minutes (8 hours)`,
          type: 'range'
        }
        errors.push(error)
        fieldErrors[`${segmentPrefix}-duration`] = error.message
      }
    }
  })

  // Check for duplicate segment titles across all segments
  if (segmentTitles.length !== new Set(segmentTitles).size) {
    const error: ValidationError = {
      field: 'duplicateSegments',
      message: 'All segment titles must be unique',
      type: 'duplicate'
    }
    errors.push(error)
    fieldErrors.duplicateSegments = error.message
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

/**
 * Validates individual field in real-time
 */
export function validateField(field: string, value: unknown): ValidationError | null {
  switch (field) {
    case 'title':
      if (!value || typeof value !== 'string' || !value.trim()) {
        return {
          field: 'title',
          message: 'Workout title is required',
          type: 'required'
        }
      }
      if (typeof value === 'string' && value.trim().length < 3) {
        return {
          field: 'title',
          message: 'Workout title must be at least 3 characters',
          type: 'minLength'
        }
      }
      if (typeof value === 'string' && value.trim().length > 100) {
        return {
          field: 'title',
          message: 'Workout title must be less than 100 characters',
          type: 'maxLength'
        }
      }
      break

    case 'startTime':
      if (!value || typeof value !== 'string') {
        return {
          field: 'startTime',
          message: 'Start time is required',
          type: 'required'
        }
      }
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (typeof value === 'string' && !timePattern.test(value)) {
        return {
          field: 'startTime',
          message: 'Please enter a valid time format (HH:MM)',
          type: 'pattern'
        }
      }
      break

    case 'description':
      if (value && typeof value === 'string' && value.length > 1000) {
        return {
          field: 'description',
          message: 'Description must be less than 1000 characters',
          type: 'maxLength'
        }
      }
      break

    default:
      // Handle segment fields
      if (field.startsWith('segment-') && field.includes('-title')) {
        if (!value || typeof value !== 'string' || !value.trim()) {
          const segmentIndex = field.split('-')[1]
          return {
            field,
            message: `Segment ${parseInt(segmentIndex) + 1} title is required`,
            type: 'required'
          }
        }
        if (typeof value === 'string' && value.trim().length < 2) {
          const segmentIndex = field.split('-')[1]
          return {
            field,
            message: `Segment ${parseInt(segmentIndex) + 1} title must be at least 2 characters`,
            type: 'minLength'
          }
        }
        if (typeof value === 'string' && value.trim().length > 50) {
          const segmentIndex = field.split('-')[1]
          return {
            field,
            message: `Segment ${parseInt(segmentIndex) + 1} title must be less than 50 characters`,
            type: 'maxLength'
          }
        }
      }

      if (field.startsWith('segment-') && field.includes('-description')) {
        if (value && typeof value === 'string' && value.length > 500) {
          const segmentIndex = field.split('-')[1]
          return {
            field,
            message: `Segment ${parseInt(segmentIndex) + 1} description must be less than 500 characters`,
            type: 'maxLength'
          }
        }
      }

      if (field.startsWith('segment-') && field.includes('-duration')) {
        if (value !== undefined && value !== null && value !== '') {
          const duration = typeof value === 'string' ? parseInt(value) : typeof value === 'number' ? value : NaN
          if (isNaN(duration) || duration < 1) {
            const segmentIndex = field.split('-')[1]
            return {
              field,
              message: `Segment ${parseInt(segmentIndex) + 1} duration must be at least 1 minute`,
              type: 'range'
            }
          }
          if (duration > 480) {
            const segmentIndex = field.split('-')[1]
            return {
              field,
              message: `Segment ${parseInt(segmentIndex) + 1} duration must be less than 480 minutes`,
              type: 'range'
            }
          }
        }
      }
      break
  }

  return null
}

/**
 * Validates drag and drop operations
 */
export function validateDragDropData(data: unknown): ValidationError | null {
  if (!data) {
    return {
      field: 'dragData',
      message: 'Invalid workout data. Please try dragging again.',
      type: 'custom'
    }
  }

  if (typeof data !== 'object' || data === null) {
    return {
      field: 'dragData',
      message: 'Invalid workout format. Please try dragging again.',
      type: 'custom'
    }
  }

  const workoutData = data as Record<string, unknown>
  if (!workoutData.title || typeof workoutData.title !== 'string') {
    return {
      field: 'dragData',
      message: 'Workout template is missing required title information.',
      type: 'custom'
    }
  }

  return null
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map(error => error.message)
}

/**
 * Groups validation errors by type
 */
export function groupValidationErrors(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((groups, error) => {
    const type = error.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(error)
    return groups
  }, {} as Record<string, ValidationError[]>)
}

/**
 * Checks if form has any validation errors
 */
export function hasValidationErrors(fieldErrors: Record<string, string>): boolean {
  return Object.keys(fieldErrors).some(key => fieldErrors[key] && fieldErrors[key].trim() !== '')
}

/**
 * Clears specific validation error
 */
export function clearValidationError(
  fieldErrors: Record<string, string>, 
  field: string
): Record<string, string> {
  const newErrors = { ...fieldErrors }
  delete newErrors[field]
  return newErrors
}

/**
 * Clears all validation errors
 */
export function clearAllValidationErrors(): Record<string, string> {
  return {}
}