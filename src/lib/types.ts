// User and Authentication Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'coach' | 'staff'
  avatar?: string
  createdAt: Date
}

// Client/Member Types
export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: Date
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  membershipType: 'active' | 'suspended' | 'inactive' | 'employee'
  membershipStartDate: Date
  membershipEndDate?: Date
  notes?: string
  photo?: string
  createdAt: Date
  updatedAt: Date
}

// Class and Program Types
export interface Program {
  id: string
  name: string
  description?: string
  color: string
  category: 'fitness' | 'strength' | 'cardio' | 'yoga' | 'martial-arts'
  isActive: boolean
  createdAt: Date
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly'
  daysOfWeek?: number[]
  endDate?: Date
}

export interface Class {
  id: string
  name: string
  programId: string
  coachId: string
  date: Date
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
  location: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
}

// Coach Entity (extending User with coach-specific properties)
export interface Coach extends User {
  specialties: string[]
  isActive: boolean
}

// Reservation Settings
export interface ReservationSettings {
  reservationOpenHours: number
  reservationCloseHours: number
  cancellationDeadlineHours: number
  lateCancellationFee: number
  noShowFee: number
  noShowPenaltyEnabled: boolean
  autoWaitlistEnabled: boolean
}

// Reservation Types
export interface Reservation {
  id: string
  classId: string
  class: Class
  clientId: string
  client: Client
  status: 'confirmed' | 'cancelled' | 'no-show'
  reservedAt: Date
  cancelledAt?: Date
  cancellationReason?: string
}

// Workout Types
export interface Exercise {
  id: string
  name: string
  description: string
  category: string
  muscleGroups: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  videoUrl?: string
  imageUrl?: string
  instructions: string[]
  createdAt: Date
}

export interface Workout {
  id: string
  name: string
  description: string
  exercises: WorkoutExercise[]
  estimatedDuration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  isTemplate: boolean
  createdAt: Date
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps?: number
  duration?: number // in seconds
  weight?: number
  restTime: number // in seconds
  notes?: string
  order: number
}

export interface WorkoutSegment {
  id: string
  title: string
  description: string
  duration?: number // in minutes
  exercises?: string[]
  order: number
  templateId?: string // Reference to original template if created from drag
  type?: string // Type of segment (warmup, main, cooldown, etc.)
  intensity?: 'low' | 'medium' | 'high'
  notes?: string
  completed?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Enhanced workout event interface that extends the base WorkoutEvent
export interface EnhancedWorkoutEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  date: Date
  startTime: string
  backgroundColor: string
  borderColor: string
  textColor: string
  segments: WorkoutSegment[]
  totalDuration: number
  createdFrom?: 'manual' | 'template' | 'drag-drop'
  templateIds?: string[] // Track which templates were used
  extendedProps: {
    type: string
    intensity: string
    duration: number
    exercises: string[]
    notes?: string
    completed: boolean
    segmentCount?: number
  }
  createdAt: Date
  updatedAt: Date
}

// Form validation types for workout segments
export interface WorkoutSegmentValidation {
  title: boolean
  description?: boolean
  duration?: boolean
  exercises?: boolean
}

export interface WorkoutFormValidation {
  title: boolean
  startTime: boolean
  description?: boolean
  segments: Record<string, WorkoutSegmentValidation>
}

// Financial Types
export interface Invoice {
  id: string
  clientId: string
  client: Client
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  paidAt?: Date
  items: InvoiceItem[]
  notes?: string
  createdAt: Date
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Transaction {
  id: string
  invoiceId?: string
  clientId: string
  client: Client
  amount: number
  type: 'payment' | 'refund' | 'fee'
  method: 'credit-card' | 'cash' | 'bank-transfer' | 'check'
  status: 'completed' | 'pending' | 'failed'
  processedAt: Date
  notes?: string
}

// Analytics Types
export interface DashboardStats {
  totalMembers: number
  activeClassesToday: number
  revenueThisMonth: number
  pendingReservations: number
  averageClassAttendance: number
  newMembersThisMonth: number
}

export interface RevenueData {
  date: string
  revenue: number
  transactions: number
}

export interface AttendanceData {
  date: string
  attendance: number
  capacity: number
}

// UI State Types
export interface TabState {
  activeTab: string
  activeSubTab?: string
}

export interface FilterState {
  search: string
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  category?: string[]
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
} 