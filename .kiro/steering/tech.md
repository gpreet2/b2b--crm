# Technology Stack & Build System

## Core Technologies

### Frontend Framework
- **Next.js 15.4.1** with App Router
- **React 19.1.0** with TypeScript
- **TypeScript 5** for type safety

### Styling & UI
- **Tailwind CSS 4** for utility-first styling
- **Inter font** as primary typeface via Google Fonts
- **Custom CSS variables** for theme management (red/black color scheme)
- **Headless UI** and **Radix UI** for accessible components
- **Heroicons** and **Lucide React** for iconography

### Key Libraries
- **@fullcalendar/react** for calendar functionality
- **Recharts** for data visualization and analytics
- **date-fns** for date manipulation
- **clsx** for conditional className utilities

### Development Tools
- **ESLint** with Next.js configuration
- **PostCSS** for CSS processing
- **pnpm** as package manager (required version 8.x)

## Build Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## Environment Requirements

- **Node.js**: >= 18.0.0
- **Package Manager**: pnpm 8.x (specified in packageManager field)

## Architecture Patterns

- **App Router**: Using Next.js 13+ app directory structure
- **Server Components**: Default to server components, use "use client" when needed
- **TypeScript-first**: All components and utilities are fully typed
- **Component-driven**: Reusable UI components in `/src/components/ui/`
- **Utility-first CSS**: Tailwind with custom design system variables