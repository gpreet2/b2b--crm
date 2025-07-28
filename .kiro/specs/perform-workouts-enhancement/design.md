# Design Document

## Overview

This design document outlines the enhancements to the perform workouts page, focusing on improving user experience through direct calendar interaction, enhanced modal functionality with workout segments, improved drag-and-drop capabilities, and a modernized weekly calendar view. The design maintains consistency with the existing red/black theme and Inter font system while introducing new interactive patterns.

## Architecture

### Component Structure

```
WorkoutsPage (Enhanced)
├── WorkoutCalendar (Enhanced)
│   ├── WeekView (Redesigned)
│   │   ├── DayCell (Enhanced with + button)
│   │   └── WorkoutEvent (Improved styling)
│   ├── MonthView (Existing)
│   └── ListView (Existing)
├── AddWorkoutModal (Enhanced)
│   ├── BasicWorkoutForm
│   ├── WorkoutSegmentsList (New)
│   └── DragDropZone (Enhanced)
└── WorkoutLibrarySidebar (Enhanced)
    ├── WorkoutTemplateCard (Enhanced for drag)
    └── FilterControls (Existing)
```

### State Management

```typescript
interface WorkoutSegment {
  id: string
  title: string
  description: string
  duration?: number
  exercises?: string[]
  order: number
}

interface EnhancedWorkoutData {
  id: string
  title: string
  description: string
  startTime: string
  date: Date
  segments: WorkoutSegment[]
  totalDuration: number
}

interface CalendarState {
  selectedDate: Date | null
  isAddModalOpen: boolean
  isSidebarOpen: boolean
  draggedWorkout: PreBuiltWorkout | null
  workoutSegments: WorkoutSegment[]
}
```

## Components and Interfaces

### 1. Enhanced WorkoutCalendar Component

#### Week View Enhancements

**Visual Design:**
- Increased day cell height to 120px minimum for better content display
- Improved typography with Inter font weights (300 for dates, 500 for workout titles)
- Enhanced color contrast using CSS custom properties
- Subtle hover effects with `hover-lift` animation class
- Better spacing with 16px padding in day cells

**Add Workout Button:**
- Positioned absolutely in top-right corner of each day cell
- 32px circular button with primary red background (#f34a22)
- Plus icon (16px) with white color
- Opacity 0 by default, opacity 100 on day cell hover
- Smooth transition (200ms ease-out)
- Z-index 10 to appear above other content

**Day Cell Interaction:**
- Click anywhere in empty space triggers add workout
- Hover state changes background to `--color-surface-light`
- Today indicator with primary color border and background tint

#### Workout Event Display

**Enhanced Event Cards:**
- Rounded corners (8px border-radius)
- Improved shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Better typography hierarchy
- Workout type icons with consistent 16px size
- Duration and intensity badges with proper contrast
- Hover effect with slight elevation increase

### 2. Enhanced AddWorkoutModal Component

#### Modal Layout and Positioning

**Responsive Positioning:**
- When sidebar is open: positioned with `left: 320px` (sidebar width)
- When sidebar is closed: centered normally
- Backdrop only covers area not occupied by sidebar
- Modal width: `max-width: 600px` for optimal form layout
- Z-index: 60 (sidebar at 65)

#### Workout Segments Feature

**Segment Management:**
```typescript
interface WorkoutSegmentForm {
  title: string
  description: string
  duration?: number
  exercises?: string[]
}
```

**UI Components:**
- "Add Segment" button below main description field
- Segment list with drag-to-reorder capability
- Each segment card shows:
  - Title input field
  - Description textarea
  - Duration input (optional)
  - Delete button
  - Drag handle icon

**Segment Card Design:**
- Light gray background (`--color-surface-light`)
- 1px border with `--color-border`
- 12px border-radius
- 16px padding
- Smooth expand/collapse animation

#### Enhanced Drag and Drop

**Drop Zone Design:**
- Dashed border (2px) with primary color when active
- Background color change on drag over
- Clear visual feedback with "Drop workout here" text
- 120px minimum height for adequate target area

**Auto-population Logic:**
- Dropped workout becomes first segment if form is empty
- Dropped workout adds as new segment if form has content
- Form fields auto-populate from first dropped workout
- Subsequent drops create additional segments

### 3. Enhanced WorkoutLibrarySidebar Component

#### Improved Drag Interaction

**Draggable Workout Cards:**
- Cursor changes to `grab` on hover, `grabbing` when dragging
- Opacity reduces to 50% during drag operation
- Card shadow increases on drag start
- Smooth return animation on drag end

**Drag Data Structure:**
```typescript
interface DragWorkoutData {
  id: string
  title: string
  description: string
  type: string
  intensity: string
  duration: number
  exercises: string[]
}
```

#### Visual Enhancements

**Card Design:**
- Gradient background: `from-accent/30 to-accent/10`
- Enhanced hover state: `from-accent/50 to-accent/30`
- Better typography hierarchy with consistent font weights
- Improved exercise tag display with proper truncation
- Favorite indicator with star icon

**Filter Improvements:**
- Pill-style filter buttons with active states
- Smooth transitions between filter states
- Clear visual hierarchy for filter sections

### 4. Enhanced Weekly Calendar View

#### Grid Layout Improvements

**Day Header Design:**
- Increased height to 80px for better proportion
- Day name in small caps with letter-spacing
- Date number with larger font size (24px)
- Today indicator with primary color accent
- Subtle gradient background for headers

**Day Cell Enhancements:**
- Minimum height of 120px for adequate content space
- Better padding (16px) for content breathing room
- Improved workout event stacking with 4px gaps
- Maximum 4 visible events with "+X more" indicator
- Smooth hover transitions

#### Responsive Design

**Mobile Adaptations:**
- Horizontal scroll for week view on mobile
- Reduced day cell height (100px) on screens < 640px
- Adjusted font sizes for better mobile readability
- Touch-friendly button sizes (44px minimum)

## Data Models

### Enhanced Workout Event

```typescript
interface EnhancedWorkoutEvent extends WorkoutEvent {
  segments?: WorkoutSegment[]
  totalDuration: number
  createdFrom?: 'manual' | 'template' | 'drag-drop'
  templateIds?: string[] // Track which templates were used
}
```

### Workout Segment

```typescript
interface WorkoutSegment {
  id: string
  title: string
  description: string
  duration?: number
  exercises?: string[]
  order: number
  templateId?: string // Reference to original template if created from drag
}
```

## Error Handling

### Form Validation

**Required Field Validation:**
- Workout title is required
- Start time is required
- Each segment must have a title
- Clear error messages with red text and border highlights

**Drag and Drop Error Handling:**
- Invalid drop zones show error feedback
- Failed drag operations revert smoothly
- Network errors during save show retry options

### User Feedback

**Success States:**
- Green checkmark animation on successful save
- Toast notifications for completed actions
- Smooth form reset for "Save & Add Another"

**Loading States:**
- Spinner animations during save operations
- Disabled form fields during processing
- Progress indicators for multi-step operations

## Testing Strategy

### Unit Testing

**Component Tests:**
- WorkoutCalendar day cell interactions
- AddWorkoutModal form validation
- WorkoutSegment CRUD operations
- Drag and drop event handling

**Hook Tests:**
- Workout state management
- Form validation logic
- Drag and drop state handling

### Integration Testing

**User Flow Tests:**
- Complete workout creation flow
- Drag and drop from sidebar to modal
- Calendar navigation and event display
- Responsive behavior across screen sizes

**Accessibility Tests:**
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Focus management in modals
- Color contrast validation

### Visual Regression Testing

**Screenshot Tests:**
- Calendar views across different screen sizes
- Modal positioning with and without sidebar
- Drag and drop visual states
- Hover and active states for all interactive elements

## Performance Considerations

### Optimization Strategies

**Rendering Performance:**
- Memoized calendar day components
- Virtualized workout event lists for large datasets
- Debounced search and filter operations
- Lazy loading of workout templates

**Memory Management:**
- Cleanup of drag event listeners
- Proper component unmounting
- Efficient state updates with minimal re-renders

### Bundle Size

**Code Splitting:**
- Lazy load WorkoutLibrarySidebar when needed
- Separate chunks for calendar views
- Dynamic imports for heavy dependencies

## Accessibility

### Keyboard Navigation

**Focus Management:**
- Tab order through calendar days
- Arrow key navigation in calendar grid
- Escape key closes modals and cancels drags
- Enter/Space activates buttons and links

### Screen Reader Support

**ARIA Labels:**
- Descriptive labels for calendar navigation
- Live regions for drag and drop feedback
- Proper heading hierarchy in modals
- Status announcements for form validation

### Visual Accessibility

**Color and Contrast:**
- Minimum 4.5:1 contrast ratio for all text
- Color-blind friendly workout type indicators
- Focus indicators with sufficient contrast
- High contrast mode support

## Browser Compatibility

### Supported Browsers

**Modern Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallbacks:**
- CSS Grid fallbacks for older browsers
- Drag and drop polyfills where needed
- Smooth animation degradation

### Progressive Enhancement

**Core Functionality:**
- Basic calendar view works without JavaScript
- Form submission works with standard HTML
- Graceful degradation of drag and drop features