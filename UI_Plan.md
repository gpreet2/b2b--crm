# Gym Management Software UI Mockup Plan

## Project Overview
Building a comprehensive UI mockup for a gym management software with a red and black theme, using Next.js, TypeScript, and Tailwind CSS.

---

## Phase 1: Initial Setup & Configuration ✅

### 1.1 Project Initialization
- [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app`
- [x] Verify project structure and dependencies

### 1.2 Install Additional Dependencies
```bash
npm install @headlessui/react @heroicons/react lucide-react
npm install @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-dialog
npm install recharts date-fns clsx
npm install @tailwindcss/forms @tailwindcss/typography
```

**Dependencies Breakdown:**
- [x] **@headlessui/react**: Unstyled, accessible UI components
- [x] **@heroicons/react**: Icon library
- [x] **lucide-react**: Additional modern icons
- [x] **@radix-ui/react-tabs**: Tab navigation components
- [x] **@radix-ui/react-dropdown-menu**: Dropdown menus
- [x] **@radix-ui/react-dialog**: Modal dialogs
- [x] **recharts**: Charts for analytics
- [x] **date-fns**: Date manipulation utilities
- [x] **clsx**: Conditional className utility
- [x] **@tailwindcss/forms**: Better form styling
- [x] **@tailwindcss/typography**: Typography plugin

### 1.3 Tailwind Configuration
- [x] Update `globals.css` with custom colors and theme
- [x] Add custom color palette (reds, blacks, grays)
- [x] Configure custom spacing and typography
- [x] Add custom component classes

### 1.4 Project Structure Setup
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── (dashboard)/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   └── charts/
├── lib/
│   ├── utils.ts
│   ├── mock-data.ts
│   └── types.ts
├── hooks/
└── styles/
```

**Tasks:**
- [x] Create folder structure
- [x] Set up basic file organization
- [x] Create initial utility files

---

## Phase 2: Design System & Core Components

### 2.1 Design System Foundation
- [x] Create color palette constants
- [x] Define typography scales (Inter font family with professional hierarchy)
- [x] Set up spacing system
- [x] Create shadow and border radius standards
- [x] Implement consistent font weights and line heights

### 2.2 Core UI Components
- [x] **Button Component**
  - [x] Primary variant (red)
  - [x] Secondary variant (gray)
  - [x] Danger variant (dark red)
  - [x] Ghost variant (transparent)
  - [x] Size variations (sm, md, lg)
  - [x] Loading states
  - [x] Icon support

- [x] **Input Components**
  - [x] Text input
  - [x] Email input
  - [x] Password input
  - [x] Number input
  - [x] Textarea
  - [x] Select dropdown
  - [x] Date picker
  - [x] Time picker
  - [x] Search input with icon

- [x] **Layout Components**
  - [x] Card component
  - [x] Container component
  - [x] Section component
  - [x] Divider component

- [x] **Feedback Components**
  - [x] Badge component (status indicators)
  - [x] Alert component
  - [ ] Toast notification
  - [x] Loading spinner
  - [x] Progress bar

- [x] **Navigation Components**
  - [x] Tab component
  - [x] Breadcrumb component
  - [x] Pagination component

### 2.3 Testing Core Components
- [x] Create component showcase page
- [x] Test all variants and states
- [x] Verify accessibility
- [x] Check responsive behavior

---

## Phase 3: Layout & Navigation Structure ✅

### 3.1 Main Layout Components
- [x] **Sidebar Navigation**
  - [x] Logo area
  - [x] Main tab navigation
  - [x] Collapse/expand functionality
  - [x] Active state styling
  - [x] Icons for each tab
  - [x] Responsive mobile drawer

- [x] **Header Component**
  - [x] User profile dropdown
  - [x] Notifications bell
  - [x] Search functionality
  - [x] Settings menu
  - [x] Breadcrumb navigation

- [x] **Main Content Area**
  - [x] Content container
  - [x] Sub-tab navigation
  - [x] Page title section
  - [x] Action buttons area

### 3.2 Navigation Logic
- [x] Set up routing structure
- [x] Create navigation context
- [x] Implement tab switching logic
- [x] Handle sub-tab navigation
- [x] Add route guards (if needed)

### 3.3 Responsive Design
- [x] Mobile sidebar drawer
- [x] Tablet layout adjustments
- [x] Desktop optimization
- [x] Touch-friendly interactions

---

## Phase 4: Main Dashboard Tab ✅

### 4.1 Dashboard Layout
- [x] **Stats Cards Section**
  - [x] Total members card
  - [x] Active classes today
  - [x] Revenue this month
  - [x] Pending reservations
  - [x] Quick stats grid

- [x] **Quick Actions Section**
  - [x] Add new class button
  - [x] Create workout button
  - [x] Add client button
  - [x] Quick reservation button

- [x] **Recent Activity Feed**
  - [x] Recent reservations
  - [x] New member signups
  - [x] Class cancellations
  - [x] Payment notifications

- [x] **Today's Schedule**
  - [x] Upcoming classes
  - [x] Coach assignments
  - [x] Capacity indicators
  - [x] Quick class management

### 4.2 Dashboard Functionality
- [x] Real-time data updates (mock)
- [x] Interactive elements
- [x] Quick navigation to detailed views
- [x] Responsive grid layout

---

## Phase 5: Classes Tab Implementation

### 5.1 Calendar Sub-tab
- [ ] **Calendar Component**
  - [ ] Weekly view layout
  - [ ] Monthly view option
  - [ ] Day view option
  - [ ] Class event display
  - [ ] Different colors for programs
  - [ ] Clickable events
  - [ ] Navigation controls

- [ ] **Class Event Details**
  - [ ] Expanded view modal
  - [ ] Date/time display
  - [ ] Coach information
  - [ ] Capacity (filled/total spots)
  - [ ] Program type badge
  - [ ] Quick actions (edit, cancel)

- [ ] **Filter System**
  - [ ] Filter by program type
  - [ ] Filter by coach
  - [ ] Filter by time range
  - [ ] Clear filters option

- [ ] **Add Class Modal**
  - [ ] One-time class form
  - [ ] Recurring class form
  - [ ] Program selection
  - [ ] Coach assignment
  - [ ] Time/date pickers
  - [ ] Capacity settings

### 5.2 List Sub-tab
- [ ] **Class List Table**
  - [ ] Sortable columns
  - [ ] Search functionality
  - [ ] Pagination
  - [ ] Bulk actions
  - [ ] Export options

- [ ] **Filter Tabs**
  - [ ] All classes tab
  - [ ] Recurring classes tab
  - [ ] One-time classes tab
  - [ ] Tab switching logic

### 5.3 Programs Sub-tab
- [ ] **Program Management**
  - [ ] Program list display
  - [ ] Create program modal
  - [ ] Edit program functionality
  - [ ] Program categories
  - [ ] Color coding system

### 5.4 Settings Sub-tab
- [ ] **Reservation Settings**
  - [ ] Reservation open timing
  - [ ] Reservation close timing
  - [ ] Cancellation timing
  - [ ] Late cancellation settings
  - [ ] No-show settings
  - [ ] Fee configuration

---

## Phase 6: Perform Tab Implementation

### 6.1 Daily Workouts Sub-tab
- [ ] **Workout Calendar**
  - [ ] Weekly view
  - [ ] Monthly view
  - [ ] List view toggle
  - [ ] Editable workout cells
  - [ ] Drag and drop functionality

- [ ] **Workout Editor**
  - [ ] Create workout modal
  - [ ] Exercise selection
  - [ ] Sets/reps configuration
  - [ ] Time-based workouts
  - [ ] Notes section
  - [ ] Save/preview options

- [ ] **Bulk Operations**
  - [ ] Bulk copy button
  - [ ] Copy week functionality
  - [ ] Template application
  - [ ] Batch editing

### 6.2 Library Sub-tab
- [ ] **Exercise Library**
  - [ ] Exercise list display
  - [ ] Video thumbnails
  - [ ] Exercise categories
  - [ ] Search functionality
  - [ ] Filter by muscle group

- [ ] **Component Creation**
  - [ ] Create exercise modal
  - [ ] Video upload area
  - [ ] Exercise details form
  - [ ] Category assignment
  - [ ] Difficulty rating

### 6.3 Settings Sub-tab
- [ ] **Global Libraries**
  - [ ] Functional fitness toggle
  - [ ] CrossFit toggle
  - [ ] Weightlifting toggle
  - [ ] Jiu jitsu toggle
  - [ ] Import/sync options

---

## Phase 7: People Tab Implementation

### 7.1 Leads Sub-tab
- [ ] **Lead Management**
  - [ ] Lead list table
  - [ ] Drop-in tracking
  - [ ] Class attendance logs
  - [ ] Conversion tracking
  - [ ] Follow-up reminders

### 7.2 Clients Sub-tab
- [ ] **Client List**
  - [ ] Searchable table
  - [ ] Client status filters
  - [ ] Last attended column
  - [ ] Membership duration
  - [ ] Notes preview

- [ ] **Client Detail View**
  - [ ] Profile information
  - [ ] Membership details
  - [ ] Class history
  - [ ] Payment history
  - [ ] Notes section

- [ ] **Create Client Modal**
  - [ ] Personal information form
  - [ ] Contact details
  - [ ] Emergency contact
  - [ ] Photo upload
  - [ ] Membership selection

- [ ] **Client Status Tabs**
  - [ ] Active clients
  - [ ] Suspended clients
  - [ ] Inactive clients
  - [ ] Employee clients

### 7.3 Segments Sub-tab
- [ ] **Client Segmentation**
  - [ ] Segment creation
  - [ ] Criteria configuration
  - [ ] Segment preview
  - [ ] Member assignment

### 7.4 Settings Sub-tab
- [ ] **Default Settings**
  - [ ] Default location
  - [ ] Default program
  - [ ] Status configurations
  - [ ] Notification preferences

---

## Phase 8: Additional Tabs (Classes, Appointments, Communications)

### 8.1 Classes Tab - Reservations
- [ ] **Reservation Log**
  - [ ] Reservation table
  - [ ] Export functionality
  - [ ] Print options
  - [ ] Search and filters

- [ ] **Cancellation Tracking**
  - [ ] Canceled reservations tab
  - [ ] Cancellation timing
  - [ ] Reason tracking
  - [ ] Refund processing

- [ ] **No-Show Management**
  - [ ] No-show tab
  - [ ] Penalty tracking
  - [ ] Notification system
  - [ ] Follow-up actions

### 8.2 Appointments Tab
- [ ] **Tour Scheduling**
  - [ ] Calendar view
  - [ ] Appointment booking
  - [ ] Staff assignment
  - [ ] Confirmation system

- [ ] **Service Management**
  - [ ] Service list
  - [ ] Pricing configuration
  - [ ] Booking windows
  - [ ] Availability settings

### 8.3 Communications Tab
- [ ] **Announcements**
  - [ ] Class announcements
  - [ ] App-wide announcements
  - [ ] Scheduling system
  - [ ] Audience targeting

- [ ] **Email Marketing**
  - [ ] Email templates
  - [ ] Recipient tracking
  - [ ] Send history
  - [ ] Performance metrics

---

## Phase 9: Financial & Analytics Tabs

### 9.1 Financial Tab
- [ ] **Invoice Management**
  - [ ] Invoice list table
  - [ ] Status filtering
  - [ ] Payment tracking
  - [ ] Overdue alerts

- [ ] **Transaction History**
  - [ ] Transaction table
  - [ ] Payment method filters
  - [ ] Export functionality
  - [ ] Fee breakdown

- [ ] **Payroll Integration**
  - [ ] Staff payment tracking
  - [ ] Third-party integration UI
  - [ ] Processing interface

### 9.2 Analytics Tab
- [ ] **Dashboard Insights**
  - [ ] Revenue charts
  - [ ] Membership trends
  - [ ] Class popularity
  - [ ] Attendance patterns

- [ ] **Performance Metrics**
  - [ ] KPI cards
  - [ ] Comparison charts
  - [ ] Date range filters
  - [ ] Export to PDF

### 9.3 Retail Tab
- [ ] **Product Management**
  - [ ] Product list
  - [ ] Inventory tracking
  - [ ] Vendor management
  - [ ] Price configuration

---

## Phase 10: Polish & Finalization

### 10.1 Mock Data Implementation
- [ ] **Realistic Sample Data**
  - [ ] 50+ diverse clients
  - [ ] 2 weeks of classes
  - [ ] Workout library
  - [ ] Financial transactions
  - [ ] Analytics data points

### 10.2 Interactive Elements
- [ ] **Hover Effects**
  - [ ] Button hover states
  - [ ] Card hover effects
  - [ ] Table row highlights
  - [ ] Navigation highlights

- [ ] **Loading States**
  - [ ] Skeleton loaders
  - [ ] Spinner animations
  - [ ] Progressive loading
  - [ ] Error states

- [ ] **Animations**
  - [ ] Page transitions
  - [ ] Modal animations
  - [ ] Tab switching
  - [ ] Micro-interactions

### 10.3 Responsive Design
- [ ] **Mobile Optimization**
  - [ ] Touch-friendly buttons
  - [ ] Swipe gestures
  - [ ] Mobile navigation
  - [ ] Readable text sizes

- [ ] **Tablet Adjustments**
  - [ ] Medium screen layouts
  - [ ] Touch interactions
  - [ ] Sidebar behavior
  - [ ] Table responsiveness

### 10.4 Final Quality Check
- [ ] **Accessibility Audit**
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Color contrast
  - [ ] ARIA labels

- [ ] **Performance Review**
  - [ ] Image optimization
  - [ ] Bundle size check
  - [ ] Render performance
  - [ ] Memory usage

- [ ] **Cross-browser Testing**
  - [ ] Chrome compatibility
  - [ ] Firefox compatibility
  - [ ] Safari compatibility
  - [ ] Edge compatibility

---

## Deliverables Checklist

### Technical Deliverables
- [ ] Fully functional Next.js application
- [ ] Complete component library
- [ ] Responsive design implementation
- [ ] Mock data integration
- [ ] Interactive prototypes

### Documentation
- [ ] Component documentation
- [ ] Setup instructions
- [ ] Feature overview
- [ ] Design system guide
- [ ] Deployment guide

### Visual Assets
- [ ] Screenshots of all tabs
- [ ] Component showcase
- [ ] Mobile mockups
- [ ] User flow diagrams
- [ ] Design system exports

---

## Timeline Estimate

- **Phase 1-2**: 2-3 days (Setup & Core Components)
- **Phase 3-4**: 2-3 days (Layout & Dashboard)
- **Phase 5-6**: 3-4 days (Classes & Perform tabs)
- **Phase 7-8**: 3-4 days (People & Additional tabs)
- **Phase 9**: 2-3 days (Financial & Analytics)
- **Phase 10**: 2-3 days (Polish & Finalization)

**Total Estimated Time**: 14-20 days

---

## Notes & Considerations

### Design Consistency
- Maintain red/black theme throughout
- Use consistent spacing and typography
- Ensure all components follow design system
- Test color contrast for accessibility

### Performance
- Implement lazy loading for large lists
- Optimize images and icons
- Use efficient state management
- Consider virtualization for large datasets

### Scalability
- Write reusable components
- Maintain clean code structure
- Document component APIs
- Plan for future feature additions

### User Experience
- Prioritize intuitive navigation
- Implement helpful feedback
- Consider user workflows
- Test with realistic data volumes