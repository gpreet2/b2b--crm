import { User, Client, Program, Class, Reservation, Exercise, Workout, DashboardStats, Coach, ReservationSettings, Tour, Location } from './types'

// Mock Locations
export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Downtown Fitness Center',
    address: '123 Main Street',
    city: 'Downtown',
    state: 'CA',
    zipCode: '90210',
    phone: '(555) 123-4567',
    isActive: true,
  },
  {
    id: '2',
    name: 'Westside Gym',
    address: '456 Oak Avenue',
    city: 'Westside',
    state: 'CA',
    zipCode: '90211',
    phone: '(555) 234-5678',
    isActive: true,
  },
  {
    id: '3',
    name: 'Eastside Athletic Club',
    address: '789 Pine Boulevard',
    city: 'Eastside',
    state: 'CA',
    zipCode: '90212',
    phone: '(555) 345-6789',
    isActive: true,
  },
  {
    id: '4',
    name: 'Northside Training Center',
    address: '321 Elm Street',
    city: 'Northside',
    state: 'CA',
    zipCode: '90213',
    phone: '(555) 456-7890',
    isActive: false,
  },
]

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
    name: 'Alex Rodriguez',
    email: 'alex@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/alex.jpg',
    createdAt: new Date('2023-04-05'),
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lisa@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/lisa.jpg',
    createdAt: new Date('2023-05-12'),
  },
  {
    id: '6',
    name: 'Admin User',
    email: 'admin@fitnesspro.com',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Coaches with specialties and location assignments
export const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/sarah.jpg',
    createdAt: new Date('2023-01-15'),
    specialties: ['Burn40', 'HIIT', 'Cardio', 'Weight Loss'],
    isActive: true,
    locationAssignments: [],
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/mike.jpg',
    createdAt: new Date('2023-02-20'),
    specialties: ['CrossFit', 'Functional Fitness', 'Strength Training', 'Sports Performance'],
    isActive: true,
    locationAssignments: [],
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/emma.jpg',
    createdAt: new Date('2023-03-10'),
    specialties: ['BurnDumbells', 'Strength Training', 'Dumbbell Training', 'Muscle Building'],
    isActive: true,
    locationAssignments: [],
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    email: 'alex@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/alex.jpg',
    createdAt: new Date('2023-04-05'),
    specialties: ['CrossFit', 'Burn40', 'Conditioning', 'Athletic Performance'],
    isActive: true,
    locationAssignments: [],
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lisa@fitnesspro.com',
    role: 'coach',
    avatar: '/avatars/lisa.jpg',
    createdAt: new Date('2023-05-12'),
    specialties: ['BurnDumbells', 'Strength Training', 'Personal Training', 'Group Fitness'],
    isActive: true,
    locationAssignments: [],
  },
]

// Add location assignments after locations are defined
mockCoaches[0].locationAssignments = [
  {
    locationId: '1',
    location: mockLocations[0],
    isPrimary: true,
    accessLevel: 'full',
    assignedDate: new Date('2023-01-15'),
  },
  {
    locationId: '2',
    location: mockLocations[1],
    isPrimary: false,
    accessLevel: 'full',
    assignedDate: new Date('2023-06-01'),
  },
]

mockCoaches[1].locationAssignments = [
  {
    locationId: '2',
    location: mockLocations[1],
    isPrimary: true,
    accessLevel: 'full',
    assignedDate: new Date('2023-02-20'),
  },
]

mockCoaches[2].locationAssignments = [
  {
    locationId: '1',
    location: mockLocations[0],
    isPrimary: true,
    accessLevel: 'full',
    assignedDate: new Date('2023-03-10'),
  },
  {
    locationId: '3',
    location: mockLocations[2],
    isPrimary: false,
    accessLevel: 'limited',
    assignedDate: new Date('2023-08-01'),
  },
]

mockCoaches[3].locationAssignments = [
  {
    locationId: '3',
    location: mockLocations[2],
    isPrimary: true,
    accessLevel: 'full',
    assignedDate: new Date('2023-04-05'),
  },
]

mockCoaches[4].locationAssignments = [
  {
    locationId: '1',
    location: mockLocations[0],
    isPrimary: true,
    accessLevel: 'full',
    assignedDate: new Date('2023-05-12'),
  },
  {
    locationId: '2',
    location: mockLocations[1],
    isPrimary: false,
    accessLevel: 'full',
    assignedDate: new Date('2023-07-01'),
  },
  {
    locationId: '3',
    location: mockLocations[2],
    isPrimary: false,
    accessLevel: 'limited',
    assignedDate: new Date('2023-09-01'),
  },
]

// Mock Programs - Only the three specific programs
export const mockPrograms: Program[] = [
  {
    id: '1',
    name: 'Burn40',
    description: 'High-intensity interval training for maximum calorie burn',
    color: '#ef4444', // Red
    category: 'cardio',
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'CrossFit',
    description: 'Functional fitness with varied, high-intensity movements',
    color: '#06b6d4', // Cyan
    category: 'strength',
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '3',
    name: 'BurnDumbells',
    description: 'Strength training with dumbbells for muscle building',
    color: '#10b981', // Green
    category: 'strength',
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
]

// Mock Clients with location access
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
    memberType: 'home',
    membershipStartDate: new Date('2023-01-15'),
    locationAccess: [],
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
    memberType: 'multi-location',
    membershipStartDate: new Date('2023-02-10'),
    locationAccess: [],
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
    memberType: 'visiting',
    membershipStartDate: new Date('2023-03-05'),
    locationAccess: [],
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
    memberType: 'home',
    membershipStartDate: new Date('2023-01-20'),
    membershipEndDate: new Date('2024-02-20'),
    locationAccess: [],
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
    memberType: 'multi-location',
    membershipStartDate: new Date('2023-04-12'),
    locationAccess: [],
    notes: 'New member, interested in functional fitness',
    createdAt: new Date('2023-04-12'),
    updatedAt: new Date('2024-01-15'),
  },
]

// Add location access after locations are defined
mockClients[0].locationAccess = [
  {
    locationId: '1',
    location: mockLocations[0],
    accessType: 'home',
    isHomeLocation: true,
    accessStartDate: new Date('2023-01-15'),
  },
]

mockClients[1].locationAccess = [
  {
    locationId: '1',
    location: mockLocations[0],
    accessType: 'home',
    isHomeLocation: true,
    accessStartDate: new Date('2023-02-10'),
  },
  {
    locationId: '2',
    location: mockLocations[1],
    accessType: 'full',
    isHomeLocation: false,
    accessStartDate: new Date('2023-02-10'),
  },
  {
    locationId: '3',
    location: mockLocations[2],
    accessType: 'full',
    isHomeLocation: false,
    accessStartDate: new Date('2023-06-01'),
  },
]

mockClients[2].locationAccess = [
  {
    locationId: '2',
    location: mockLocations[1],
    accessType: 'limited',
    isHomeLocation: false,
    accessStartDate: new Date('2023-03-05'),
    accessEndDate: new Date('2025-03-05'),
  },
]

mockClients[3].locationAccess = [
  {
    locationId: '1',
    location: mockLocations[0],
    accessType: 'home',
    isHomeLocation: true,
    accessStartDate: new Date('2023-01-20'),
  },
]

mockClients[4].locationAccess = [
  {
    locationId: '2',
    location: mockLocations[1],
    accessType: 'home',
    isHomeLocation: true,
    accessStartDate: new Date('2023-04-12'),
  },
  {
    locationId: '1',
    location: mockLocations[0],
    accessType: 'full',
    isHomeLocation: false,
    accessStartDate: new Date('2023-04-12'),
  },
]

// Mock Classes - Comprehensive scheduling data
export const mockClasses: Class[] = [
  // Monday Classes
  {
    id: '1',
    name: 'Morning HIIT Blast',
    programId: '1',
    coachId: '1',
    date: new Date('2024-07-22'), // Monday
    startTime: '06:00',
    endTime: '06:45',
    capacity: 20,
    enrolled: 18,
    location: 'Studio A',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1], // Monday
    },
    status: 'scheduled',
    notes: 'High-energy start to the week',
  },
  {
    id: '2',
    name: 'Strength Foundations',
    programId: '2',
    coachId: '2',
    date: new Date('2024-07-22'), // Monday
    startTime: '07:00',
    endTime: '08:00',
    capacity: 15,
    enrolled: 12,
    location: 'Weight Room',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
    status: 'scheduled',
  },
  {
    id: '3',
    name: 'Evening Yoga Flow',
    programId: '3',
    coachId: '3',
    date: new Date('2024-07-22'), // Monday
    startTime: '18:00',
    endTime: '19:00',
    capacity: 25,
    enrolled: 22,
    location: 'Studio B',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 4], // Mon, Thu
    },
    status: 'scheduled',
  },

  // Tuesday Classes
  {
    id: '4',
    name: 'Boxing Fundamentals',
    programId: '4',
    coachId: '4',
    date: new Date('2024-07-23'), // Tuesday
    startTime: '06:30',
    endTime: '07:20',
    capacity: 12,
    enrolled: 10,
    location: 'Boxing Studio',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4], // Tue, Thu
    },
    status: 'scheduled',
  },
  {
    id: '5',
    name: 'Functional Movement',
    programId: '5',
    coachId: '2',
    date: new Date('2024-07-23'), // Tuesday
    startTime: '07:30',
    endTime: '08:15',
    capacity: 18,
    enrolled: 15,
    location: 'Functional Area',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
  },
  {
    id: '6',
    name: 'Pilates Core Power',
    programId: '6',
    coachId: '3',
    date: new Date('2024-07-23'), // Tuesday
    startTime: '12:00',
    endTime: '12:45',
    capacity: 16,
    enrolled: 14,
    location: 'Studio B',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 5], // Tue, Fri
    },
    status: 'scheduled',
  },
  {
    id: '7',
    name: 'Spin & Burn',
    programId: '7',
    coachId: '5',
    date: new Date('2024-07-23'), // Tuesday
    startTime: '18:30',
    endTime: '19:15',
    capacity: 20,
    enrolled: 20,
    location: 'Spin Studio',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'confirmed',
    notes: 'Class is full - waitlist available',
  },

  // Wednesday Classes
  {
    id: '8',
    name: 'Midweek Strength',
    programId: '2',
    coachId: '2',
    date: new Date('2024-07-24'), // Wednesday
    startTime: '07:00',
    endTime: '08:00',
    capacity: 15,
    enrolled: 13,
    location: 'Weight Room',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
    status: 'scheduled',
  },
  {
    id: '9',
    name: 'Power Yoga Flow',
    programId: '8',
    coachId: '3',
    date: new Date('2024-07-24'), // Wednesday
    startTime: '12:15',
    endTime: '13:00',
    capacity: 20,
    enrolled: 16,
    location: 'Studio A',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [3, 6], // Wed, Sat
    },
    status: 'scheduled',
  },
  {
    id: '10',
    name: 'HIIT Express',
    programId: '1',
    coachId: '1',
    date: new Date('2024-07-24'), // Wednesday
    startTime: '17:45',
    endTime: '18:30',
    capacity: 20,
    enrolled: 17,
    location: 'Studio A',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [3], // Wed
    },
    status: 'scheduled',
  },

  // Thursday Classes
  {
    id: '11',
    name: 'Boxing Skills',
    programId: '4',
    coachId: '4',
    date: new Date('2024-07-25'), // Thursday
    startTime: '06:30',
    endTime: '07:20',
    capacity: 12,
    enrolled: 11,
    location: 'Boxing Studio',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4], // Tue, Thu
    },
    status: 'scheduled',
  },
  {
    id: '12',
    name: 'Functional Training',
    programId: '5',
    coachId: '2',
    date: new Date('2024-07-25'), // Thursday
    startTime: '07:30',
    endTime: '08:15',
    capacity: 18,
    enrolled: 16,
    location: 'Functional Area',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
  },
  {
    id: '13',
    name: 'Yoga & Mindfulness',
    programId: '3',
    coachId: '3',
    date: new Date('2024-07-25'), // Thursday
    startTime: '18:00',
    endTime: '19:00',
    capacity: 25,
    enrolled: 19,
    location: 'Studio B',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 4], // Mon, Thu
    },
    status: 'scheduled',
  },
  {
    id: '14',
    name: 'Spin Revolution',
    programId: '7',
    coachId: '5',
    date: new Date('2024-07-25'), // Thursday
    startTime: '18:30',
    endTime: '19:15',
    capacity: 20,
    enrolled: 18,
    location: 'Spin Studio',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
  },

  // Friday Classes
  {
    id: '15',
    name: 'Friday Strength',
    programId: '2',
    coachId: '2',
    date: new Date('2024-07-26'), // Friday
    startTime: '07:00',
    endTime: '08:00',
    capacity: 15,
    enrolled: 14,
    location: 'Weight Room',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
    status: 'scheduled',
  },
  {
    id: '16',
    name: 'Pilates Flow',
    programId: '6',
    coachId: '3',
    date: new Date('2024-07-26'), // Friday
    startTime: '12:00',
    endTime: '12:45',
    capacity: 16,
    enrolled: 12,
    location: 'Studio B',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 5], // Tue, Fri
    },
    status: 'scheduled',
  },
  {
    id: '17',
    name: 'TGIF HIIT',
    programId: '1',
    coachId: '1',
    date: new Date('2024-07-26'), // Friday
    startTime: '17:30',
    endTime: '18:15',
    capacity: 20,
    enrolled: 19,
    location: 'Studio A',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [5], // Fri
    },
    status: 'scheduled',
  },

  // Saturday Classes
  {
    id: '18',
    name: 'Weekend Warrior',
    programId: '5',
    coachId: '2',
    date: new Date('2024-07-27'), // Saturday
    startTime: '08:00',
    endTime: '08:45',
    capacity: 18,
    enrolled: 16,
    location: 'Functional Area',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
  },
  {
    id: '19',
    name: 'Power Yoga Weekend',
    programId: '8',
    coachId: '3',
    date: new Date('2024-07-27'), // Saturday
    startTime: '09:00',
    endTime: '09:45',
    capacity: 20,
    enrolled: 17,
    location: 'Studio A',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [3, 6], // Wed, Sat
    },
    status: 'scheduled',
  },
  {
    id: '20',
    name: 'Saturday Spin',
    programId: '7',
    coachId: '5',
    date: new Date('2024-07-27'), // Saturday
    startTime: '10:00',
    endTime: '10:45',
    capacity: 20,
    enrolled: 15,
    location: 'Spin Studio',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    },
    status: 'scheduled',
  },

  // One-time special classes
  {
    id: '21',
    name: 'Boxing Workshop',
    programId: '4',
    coachId: '4',
    date: new Date('2024-07-28'), // Sunday
    startTime: '14:00',
    endTime: '15:30',
    capacity: 15,
    enrolled: 8,
    location: 'Boxing Studio',
    isRecurring: false,
    status: 'scheduled',
    notes: 'Special workshop for beginners',
  },
  {
    id: '22',
    name: 'Yoga Retreat Session',
    programId: '3',
    coachId: '3',
    date: new Date('2024-08-03'), // Next Saturday
    startTime: '10:00',
    endTime: '12:00',
    capacity: 30,
    enrolled: 5,
    location: 'Main Studio',
    isRecurring: false,
    status: 'scheduled',
    notes: 'Extended session with meditation',
  },
  {
    id: '23',
    name: 'Cancelled Class Example',
    programId: '1',
    coachId: '1',
    date: new Date('2024-07-29'), // Monday next week
    startTime: '06:00',
    endTime: '06:45',
    capacity: 20,
    enrolled: 0,
    location: 'Studio A',
    isRecurring: false,
    status: 'cancelled',
    notes: 'Cancelled due to coach illness',
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

// Mock Reservation Settings
export const mockReservationSettings: ReservationSettings = {
  reservationOpenHours: 168, // 7 days (7 * 24 hours)
  reservationCloseHours: 2, // 2 hours before class
  cancellationDeadlineHours: 12, // 12 hours before class
  lateCancellationFee: 15.00, // $15 fee for late cancellation
  noShowFee: 25.00, // $25 fee for no-show
  noShowPenaltyEnabled: true,
  autoWaitlistEnabled: true,
}

// Mock Tours
export const mockTours: Tour[] = [
  {
    id: '1',
    prospectName: 'Jennifer Martinez',
    prospectEmail: 'jennifer.martinez@email.com',
    prospectPhone: '(555) 123-4567',
    scheduledDate: new Date('2025-01-30'),
    scheduledTime: '10:00 AM',
    duration: 45,
    tourType: 'individual',
    assignedEmployeeId: '1',
    assignedEmployee: mockCoaches[0], // Sarah Johnson
    status: 'confirmed',
    notes: 'Interested in weight loss programs and group classes',
    source: 'website',
    interests: ['Burn40', 'Group Fitness'],
    followUpDate: new Date('2025-02-01'),
    createdAt: new Date('2025-01-28'),
    updatedAt: new Date('2025-01-28'),
  },
  {
    id: '2',
    prospectName: 'David Thompson',
    prospectEmail: 'david.t@email.com',
    prospectPhone: '(555) 234-5678',
    scheduledDate: new Date('2025-01-30'),
    scheduledTime: '2:00 PM',
    duration: 30,
    tourType: 'individual',
    assignedEmployeeId: '2',
    assignedEmployee: mockCoaches[1], // Mike Chen
    status: 'scheduled',
    notes: 'Former athlete looking to get back in shape',
    source: 'referral',
    interests: ['CrossFit', 'Strength Training'],
    createdAt: new Date('2025-01-29'),
    updatedAt: new Date('2025-01-29'),
  },
  {
    id: '3',
    prospectName: 'The Johnson Family',
    prospectEmail: 'johnson.family@email.com',
    prospectPhone: '(555) 345-6789',
    scheduledDate: new Date('2025-01-31'),
    scheduledTime: '11:00 AM',
    duration: 60,
    tourType: 'family',
    assignedEmployeeId: '3',
    assignedEmployee: mockCoaches[2], // Emma Davis
    status: 'confirmed',
    notes: 'Family of 4, looking for family-friendly programs',
    source: 'walk-in',
    interests: ['Family Programs', 'Youth Fitness'],
    followUpDate: new Date('2025-02-02'),
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-29'),
  },
  {
    id: '4',
    prospectName: 'Sarah Kim',
    prospectEmail: 'sarah.kim@email.com',
    prospectPhone: '(555) 456-7890',
    scheduledDate: new Date('2025-01-31'),
    scheduledTime: '4:00 PM',
    duration: 45,
    tourType: 'individual',
    assignedEmployeeId: '4',
    assignedEmployee: mockCoaches[3], // Alex Rodriguez
    status: 'scheduled',
    notes: 'New to fitness, looking for beginner-friendly options',
    source: 'social-media',
    interests: ['Beginner Programs', 'Personal Training'],
    createdAt: new Date('2025-01-29'),
    updatedAt: new Date('2025-01-29'),
  },
  {
    id: '5',
    prospectName: 'Corporate Group - TechCorp',
    prospectEmail: 'hr@techcorp.com',
    prospectPhone: '(555) 567-8901',
    scheduledDate: new Date('2025-02-01'),
    scheduledTime: '9:00 AM',
    duration: 90,
    tourType: 'group',
    assignedEmployeeId: '5',
    assignedEmployee: mockCoaches[4], // Lisa Park
    status: 'confirmed',
    notes: 'Corporate wellness program for 15 employees',
    source: 'phone',
    interests: ['Corporate Wellness', 'Group Classes'],
    followUpDate: new Date('2025-02-03'),
    createdAt: new Date('2025-01-26'),
    updatedAt: new Date('2025-01-28'),
  },
  {
    id: '6',
    prospectName: 'Michael Rodriguez',
    prospectEmail: 'michael.r@email.com',
    prospectPhone: '(555) 678-9012',
    scheduledDate: new Date('2025-02-01'),
    scheduledTime: '1:00 PM',
    duration: 30,
    tourType: 'individual',
    assignedEmployeeId: '1',
    assignedEmployee: mockCoaches[0], // Sarah Johnson
    status: 'scheduled',
    notes: 'Recovering from injury, needs low-impact options',
    source: 'referral',
    interests: ['Rehabilitation', 'Low Impact'],
    createdAt: new Date('2025-01-29'),
    updatedAt: new Date('2025-01-29'),
  },
  {
    id: '7',
    prospectName: 'Amanda Foster',
    prospectEmail: 'amanda.foster@email.com',
    prospectPhone: '(555) 789-0123',
    scheduledDate: new Date('2025-02-02'),
    scheduledTime: '10:30 AM',
    duration: 45,
    tourType: 'individual',
    assignedEmployeeId: '2',
    assignedEmployee: mockCoaches[1], // Mike Chen
    status: 'confirmed',
    notes: 'Competitive runner looking for cross-training',
    source: 'website',
    interests: ['CrossFit', 'Endurance Training'],
    followUpDate: new Date('2025-02-04'),
    createdAt: new Date('2025-01-28'),
    updatedAt: new Date('2025-01-29'),
  },
  {
    id: '8',
    prospectName: 'Robert Chen',
    prospectEmail: 'robert.chen@email.com',
    prospectPhone: '(555) 890-1234',
    scheduledDate: new Date('2025-01-29'),
    scheduledTime: '3:00 PM',
    duration: 30,
    tourType: 'individual',
    assignedEmployeeId: '3',
    assignedEmployee: mockCoaches[2], // Emma Davis
    status: 'completed',
    notes: 'Signed up for membership after tour',
    source: 'walk-in',
    interests: ['BurnDumbells', 'Strength Training'],
    createdAt: new Date('2025-01-27'),
    updatedAt: new Date('2025-01-29'),
  }
] 