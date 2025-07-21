# Project Structure & Organization

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles and theme variables
│   ├── layout.tsx               # Root layout with fonts and main Layout component
│   ├── page.tsx                 # Dashboard homepage
│   ├── analytics/               # Analytics section
│   │   ├── layout.tsx          # Analytics layout wrapper
│   │   ├── page.tsx            # Analytics overview
│   │   ├── insights/           # Analytics insights page
│   │   └── reports/            # Analytics reports page
│   ├── classes/                # Classes management section
│   │   ├── layout.tsx          # Classes layout wrapper
│   │   ├── page.tsx            # Classes overview
│   │   ├── calendar/           # Calendar view
│   │   ├── list/               # Classes list view
│   │   ├── programs/           # Program management
│   │   ├── events/             # Class events
│   │   └── settings/           # Class settings
│   ├── financial/              # Financial management
│   │   ├── layout.tsx          # Financial layout wrapper
│   │   ├── page.tsx            # Financial overview
│   │   ├── invoices/           # Invoice management
│   │   ├── payroll/            # Payroll integration
│   │   └── transactions/       # Transaction history
│   ├── people/                 # People management
│   │   ├── layout.tsx          # People layout wrapper
│   │   ├── page.tsx            # People overview
│   │   ├── clients/            # Client management
│   │   ├── leads/              # Lead tracking
│   │   ├── segments/           # Customer segmentation
│   │   └── settings/           # People settings
│   └── perform/                # Performance/workout management
│       ├── layout.tsx          # Perform layout wrapper
│       ├── page.tsx            # Perform overview
│       ├── library/            # Exercise library
│       ├── settings/           # Perform settings
│       └── workouts/           # Workout management
├── components/                  # Reusable React components
│   ├── ui/                     # Base UI components
│   │   ├── Alert.tsx           # Alert/notification component
│   │   ├── Badge.tsx           # Status badges
│   │   ├── Breadcrumb.tsx      # Navigation breadcrumbs
│   │   ├── Button.tsx          # Button component with variants
│   │   ├── Card.tsx            # Card container component
│   │   ├── Dialog.tsx          # Modal dialogs
│   │   ├── Input.tsx           # Form input components
│   │   ├── Pagination.tsx      # Table pagination
│   │   ├── Progress.tsx        # Progress bars
│   │   ├── Spinner.tsx         # Loading spinners
│   │   └── Tabs.tsx            # Tab navigation
│   ├── layout/                 # Layout-specific components
│   ├── dashboard/              # Dashboard-specific components
│   ├── calendar/               # Calendar-related components
│   │   ├── ClassCalendar.tsx   # Main calendar component
│   │   └── ClassEventModal.tsx # Event detail modal
│   └── classes/                # Classes-specific components
│       ├── AddClassModal.tsx   # Add class modal
│       ├── CalendarFilters.tsx # Calendar filter controls
│       ├── ClassCalendar.tsx   # Classes calendar view
│       ├── ClassEventModal.tsx # Class event details
│       ├── ClassTable.tsx      # Classes table view
│       └── calendar/           # Calendar sub-components
└── lib/                        # Utility functions and types
    ├── mock-data.ts            # Mock data for development
    ├── navigation.ts           # Navigation configuration
    ├── types.ts                # TypeScript type definitions
    └── utils.ts                # Utility functions
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `Button.tsx`, `ClassCalendar.tsx`)
- **Pages**: lowercase with hyphens (e.g., `page.tsx`, `layout.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `mock-data.ts`)
- **Directories**: lowercase with hyphens for routes, camelCase for components

### Code Conventions
- **Components**: PascalCase with descriptive names
- **Props interfaces**: ComponentNameProps (e.g., `ButtonProps`)
- **Functions**: camelCase with verb-noun pattern
- **Constants**: UPPER_SNAKE_CASE
- **CSS classes**: Tailwind utilities + custom classes with kebab-case

## Architecture Patterns

### Component Organization
- **UI Components**: Generic, reusable components in `/src/components/ui/`
- **Feature Components**: Domain-specific components grouped by feature
- **Layout Components**: Page layout and navigation in `/src/components/layout/`

### Page Structure
- Each major section has its own directory under `/src/app/`
- Layout components wrap related pages for consistent navigation
- Sub-pages organized in nested directories

### State Management
- React state for local component state
- Props drilling for simple data flow
- Context API for shared state when needed

### Styling Approach
- Tailwind CSS utility classes as primary styling method
- Custom CSS variables for theme consistency
- Component-specific styles in globals.css when needed
- Responsive design with mobile-first approach

### Type Safety
- All components have proper TypeScript interfaces
- Shared types defined in `/src/lib/types.ts`
- Props interfaces co-located with components
- Strict TypeScript configuration enabled