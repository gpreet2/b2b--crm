# Design Document

## Overview

The Classes tab implementation provides a comprehensive class management system through four focused sub-tabs. The design emphasizes efficiency and clarity, avoiding unnecessary complexity while delivering essential functionality for gym operations. The system integrates with the existing Next.js application structure and maintains consistency with the established red/black design theme.

## Architecture

### Component Structure
```
src/app/classes/
├── page.tsx (Overview/Dashboard - existing)
├── layout.tsx (Sub-navigation wrapper - existing)
├── calendar/
│   └── page.tsx (Calendar view with event management)
├── events/
│   └── page.tsx (Class list table with filters)
├── programs/
│   └── page.tsx (Program management interface)
└── settings/
    └── page.tsx (Reservation settings configuration)

src/components/classes/
├── calendar/
│   ├── ClassCalendar.tsx (Main calendar component)
│   ├── ClassEventModal.tsx (Event details modal)
│   ├── AddClassModal.tsx (Class creation modal)
│   └── CalendarFilters.tsx (Filter controls)
├── events/
│   ├── ClassTable.tsx (Sortable class table)
│   ├── ClassFilters.tsx (Search and filter tabs)
│   └── BulkActions.tsx (Multi-select operations)
├── programs/
│   ├── ProgramList.tsx (Program display grid)
│   ├── CreateProgramModal.tsx (Program creation)
│   └── EditProgramModal.tsx (Program editing)
└── settings/
    └── ReservationSettings.tsx (Settings form)
```

### Data Flow
- Calendar components consume class data and program configurations
- Event modals trigger CRUD operations on class entities
- Program management updates affect calendar color coding
- Settings changes apply to future reservation logic
- All components use shared mock data structure during development

## Components and Interfaces

### Calendar Sub-tab Components

**ClassCalendar.tsx**
- Renders weekly/monthly/daily calendar views
- Displays class events with program-specific colors
- Handles view switching and navigation
- Integrates with filter system
- Responsive design for mobile/tablet

**ClassEventModal.tsx**
- Shows detailed class information
- Displays capacity with visual progress indicator
- Provides quick action buttons (edit, cancel)
- Shows coach and program information
- Handles modal open/close states

**AddClassModal.tsx**
- Form for creating one-time or recurring classes
- Program selection dropdown
- Coach assignment interface
- Date/time picker components
- Capacity and location settings

**CalendarFilters.tsx**
- Filter by program type with color-coded options
- Coach selection dropdown
- Time range picker
- Clear filters functionality

### Events Sub-tab Components

**ClassTable.tsx**
- Sortable columns for all class attributes
- Pagination for large datasets
- Row selection for bulk operations
- Export functionality integration
- Responsive table design

**ClassFilters.tsx**
- Search input with real-time filtering
- Tab switching (All/Recurring/One-time)
- Advanced filter options
- Results count display

**BulkActions.tsx**
- Multi-select checkbox functionality
- Bulk edit operations
- Bulk delete with confirmation
- Export selected classes

### Programs Sub-tab Components

**ProgramList.tsx**
- Grid layout of program cards
- Category-based organization
- Color preview for each program
- Quick edit/delete actions
- Add new program button

**CreateProgramModal.tsx**
- Program name input
- Category selection
- Color picker component
- Description field
- Save/cancel actions

### Settings Sub-tab Components

**ReservationSettings.tsx**
- Form sections for different setting categories
- Time picker components for reservation windows
- Toggle switches for policy enablement
- Fee input fields with validation
- Save/reset functionality

## Data Models

### Class Entity
```typescript
interface Class {
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
```

### Program Entity
```typescript
interface Program {
  id: string
  name: string
  category: string
  color: string
  description?: string
  isActive: boolean
  createdAt: Date
}
```

### Coach Entity
```typescript
interface Coach {
  id: string
  name: string
  email: string
  specialties: string[]
  isActive: boolean
}
```

### Reservation Settings
```typescript
interface ReservationSettings {
  reservationOpenHours: number
  reservationCloseHours: number
  cancellationDeadlineHours: number
  lateCancellationFee: number
  noShowFee: number
  noShowPenaltyEnabled: boolean
  autoWaitlistEnabled: boolean
}
```

## Error Handling

### Form Validation
- Required field validation with clear error messages
- Date/time validation to prevent scheduling conflicts
- Capacity validation to ensure positive numbers
- Email format validation for coach assignments

### API Error Handling
- Network error display with retry options
- Validation error display inline with form fields
- Success notifications for completed actions
- Loading states during async operations

### User Feedback
- Toast notifications for successful operations
- Confirmation dialogs for destructive actions
- Progress indicators for bulk operations
- Clear error states with actionable solutions

## Testing Strategy

### Unit Testing
- Component rendering with various props
- Form validation logic
- Date/time utility functions
- Filter and search functionality
- Modal open/close behavior

### Integration Testing
- Calendar view switching
- Event creation and editing workflows
- Program management operations
- Settings form submission
- Filter application across components

### User Interaction Testing
- Calendar navigation and event clicking
- Table sorting and pagination
- Bulk selection and operations
- Modal interactions and form submissions
- Responsive behavior across devices

### Mock Data Testing
- Realistic class schedules spanning multiple weeks
- Various program types with different colors
- Multiple coaches with different specialties
- Edge cases like fully booked classes
- Recurring class patterns

## Design Decisions

### Calendar Implementation
- **Decision**: Use a custom calendar component instead of external library
- **Rationale**: Maintains design consistency and reduces bundle size
- **Trade-off**: More development time but better control over styling

### Color Coding System
- **Decision**: Use HSL color space for program colors
- **Rationale**: Ensures sufficient contrast and accessibility
- **Implementation**: Predefined color palette with custom option

### Table vs Card Layout
- **Decision**: Use table layout for Events sub-tab
- **Rationale**: Better for data comparison and bulk operations
- **Mobile**: Convert to card layout on small screens

### Modal vs Inline Editing
- **Decision**: Use modals for class creation and detailed editing
- **Rationale**: Prevents context switching and maintains focus
- **Alternative**: Inline editing for quick updates like status changes

### Filter Persistence
- **Decision**: Reset filters when switching between sub-tabs
- **Rationale**: Each sub-tab serves different purposes and contexts
- **Exception**: Maintain filters within the same sub-tab during session