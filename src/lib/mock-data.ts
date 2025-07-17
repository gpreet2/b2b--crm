import { User, Client, Program, Class, Reservation, Exercise, Workout, DashboardStats } from './types'

// Mock Users/Coaches
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/sarah.jpg',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/mike.jpg',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/emma.jpg',
    createdAt: new Date('2023-03-10'),
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@fitnesspro.com',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Programs
export const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'HIIT Cardio',
    description: 'High-intensity interval training for maximum calorie burn',
    color: '#dc2626', // Red
    category: 'cardio',
    duration: 45,
    maxCapacity: 20,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Strength Training',
    description: 'Build muscle and increase strength with compound movements',
    color: '#1f2937', // Dark gray
    category: 'strength',
    duration: 60,
    maxCapacity: 15,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '3',
    name: 'Yoga Flow',
    description: 'Mindful movement and flexibility training',
    color: '#059669', // Green
    category: 'yoga',
    duration: 60,
    maxCapacity: 25,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '4',
    name: 'Boxing Basics',
    description: 'Learn boxing fundamentals and get a great workout',
    color: '#d97706', // Orange
    category: 'martial-arts',
    duration: 50,
    maxCapacity: 12,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '5',
    name: 'Functional Fitness',
    description: 'Real-world movement patterns for everyday strength',
    color: '#2563eb', // Blue
    category: 'fitness',
    duration: 45,
    maxCapacity: 18,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: new Date('1990-05-15'),
    emergencyContact: {
      name: 'Jane Smith',
      phone: '(555) 123-4568',
      relationship: 'Spouse',
    },
    membershipType: 'active',
    membershipStartDate: new Date('2023-01-15'),
    notes: 'Prefers morning classes',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: new Date('1985-08-22'),
    emergencyContact: {
      name: 'Carlos Garcia',
      phone: '(555) 234-5679',
      relationship: 'Husband',
    },
    membershipType: 'active',
    membershipStartDate: new Date('2023-02-10'),
    notes: 'Loves yoga and strength training',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: new Date('1988-12-03'),
    emergencyContact: {
      name: 'Lisa Wilson',
      phone: '(555) 345-6790',
      relationship: 'Sister',
    },
    membershipType: 'active',
    membershipStartDate: new Date('2023-03-05'),
    notes: 'Boxing enthusiast',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    firstName: 'Jennifer',
    lastName: 'Brown',
    email: 'jennifer.brown@email.com',
    phone: '(555) 456-7890',
    dateOfBirth: new Date('1992-04-18'),
    emergencyContact: {
      name: 'Robert Brown',
      phone: '(555) 456-7891',
      relationship: 'Father',
    },
    membershipType: 'suspended',
    membershipStartDate: new Date('2023-01-20'),
    membershipEndDate: new Date('2024-02-20'),
    notes: 'Suspended due to payment issues',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Taylor',
    email: 'michael.taylor@email.com',
    phone: '(555) 567-8901',
    dateOfBirth: new Date('1987-09-30'),
    emergencyContact: {
      name: 'Amanda Taylor',
      phone: '(555) 567-8902',
      relationship: 'Wife',
    },
    membershipType: 'active',
    membershipStartDate: new Date('2023-04-12'),
    notes: 'New member, interested in functional fitness',
    createdAt: new Date('2023-04-12'),
    updatedAt: new Date('2024-01-15'),
  },
]

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: '1',
    programId: '1',
    program: mockPrograms[0],
    coachId: '1',
    coach: mockUsers[0],
    date: new Date('2024-01-15'),
    startTime: '06:00',
    endTime: '06:45',
    capacity: 20,
    enrolledCount: 15,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [1], // Monday
    },
    status: 'scheduled',
    createdAt: new Date('2023-12-01'),
  },
  {
    id: '2',
    programId: '2',
    program: mockPrograms[1],
    coachId: '2',
    coach: mockUsers[1],
    date: new Date('2024-01-15'),
    startTime: '07:00',
    endTime: '08:00',
    capacity: 15,
    enrolledCount: 12,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
    status: 'scheduled',
    createdAt: new Date('2023-12-01'),
  },
  {
    id: '3',
    programId: '3',
    program: mockPrograms[2],
    coachId: '3',
    coach: mockUsers[2],
    date: new Date('2024-01-15'),
    startTime: '18:00',
    endTime: '19:00',
    capacity: 25,
    enrolledCount: 20,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4], // Tue, Thu
    },
    status: 'scheduled',
    createdAt: new Date('2023-12-01'),
  },
  {
    id: '4',
    programId: '4',
    program: mockPrograms[3],
    coachId: '1',
    coach: mockUsers[0],
    date: new Date('2024-01-16'),
    startTime: '19:00',
    endTime: '19:50',
    capacity: 12,
    enrolledCount: 8,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4], // Tue, Thu
    },
    status: 'scheduled',
    createdAt: new Date('2023-12-01'),
  },
  {
    id: '5',
    programId: '5',
    program: mockPrograms[4],
    coachId: '2',
    coach: mockUsers[1],
    date: new Date('2024-01-16'),
    startTime: '06:30',
    endTime: '07:15',
    capacity: 18,
    enrolledCount: 14,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
    createdAt: new Date('2023-12-01'),
  },
]

// Mock Reservations
export const mockReservations: Reservation[] = [
  {
    id: '1',
    classId: '1',
    class: mockClasses[0],
    clientId: '1',
    client: mockClients[0],
    status: 'confirmed',
    reservedAt: new Date('2024-01-14T10:00:00'),
  },
  {
    id: '2',
    classId: '1',
    class: mockClasses[0],
    clientId: '2',
    client: mockClients[1],
    status: 'confirmed',
    reservedAt: new Date('2024-01-14T11:30:00'),
  },
  {
    id: '3',
    classId: '2',
    class: mockClasses[1],
    clientId: '3',
    client: mockClients[2],
    status: 'confirmed',
    reservedAt: new Date('2024-01-14T09:15:00'),
  },
  {
    id: '4',
    classId: '3',
    class: mockClasses[2],
    clientId: '1',
    client: mockClients[0],
    status: 'confirmed',
    reservedAt: new Date('2024-01-14T16:45:00'),
  },
  {
    id: '5',
    classId: '4',
    class: mockClasses[3],
    clientId: '5',
    client: mockClients[4],
    status: 'confirmed',
    reservedAt: new Date('2024-01-15T14:20:00'),
  },
]

// Mock Exercises
export const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your core tight throughout the movement'
    ],
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Squats',
    description: 'Fundamental lower body exercise',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Return to standing position'
    ],
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '3',
    name: 'Burpees',
    description: 'Full-body conditioning exercise',
    category: 'cardio',
    muscleGroups: ['full-body'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing, then drop into a squat position',
      'Place hands on ground and kick feet back into plank',
      'Perform a push-up, then jump feet back to squat',
      'Jump up from squat position'
    ],
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '4',
    name: 'Plank',
    description: 'Core stability exercise',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    difficulty: 'beginner',
    instructions: [
      'Start in forearm plank position',
      'Keep body in straight line from head to heels',
      'Engage core muscles',
      'Hold position for specified time'
    ],
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '5',
    name: 'Mountain Climbers',
    description: 'Dynamic cardio exercise',
    category: 'cardio',
    muscleGroups: ['core', 'shoulders', 'legs'],
    difficulty: 'intermediate',
    instructions: [
      'Start in plank position',
      'Drive one knee toward chest',
      'Quickly switch legs in running motion',
      'Keep core engaged throughout'
    ],
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Workouts
export const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Full Body HIIT',
    description: 'High-intensity full body workout',
    exercises: [
      {
        id: '1',
        exerciseId: '1',
        exercise: mockExercises[0],
        sets: 3,
        reps: 10,
        restTime: 60,
        order: 1,
      },
      {
        id: '2',
        exerciseId: '2',
        exercise: mockExercises[1],
        sets: 3,
        reps: 15,
        restTime: 60,
        order: 2,
      },
      {
        id: '3',
        exerciseId: '3',
        exercise: mockExercises[2],
        sets: 3,
        reps: 8,
        restTime: 90,
        order: 3,
      },
    ],
    estimatedDuration: 30,
    difficulty: 'intermediate',
    category: 'hiit',
    isTemplate: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Core Focus',
    description: 'Core strengthening workout',
    exercises: [
      {
        id: '4',
        exerciseId: '4',
        exercise: mockExercises[3],
        sets: 3,
        duration: 60,
        restTime: 30,
        order: 1,
      },
      {
        id: '5',
        exerciseId: '5',
        exercise: mockExercises[4],
        sets: 3,
        duration: 45,
        restTime: 30,
        order: 2,
      },
    ],
    estimatedDuration: 20,
    difficulty: 'beginner',
    category: 'core',
    isTemplate: true,
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalMembers: 156,
  activeClassesToday: 8,
  revenueThisMonth: 15420.50,
  pendingReservations: 23,
  averageClassAttendance: 78.5,
  newMembersThisMonth: 12,
} 