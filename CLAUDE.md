# TryZore B2B CRM Backend - Project Context

## Project Overview
Building the backend CRM system for TryZore - a fitness membership platform with multi-tenancy support for gym chains and franchises.

## Your Responsibilities
- **Authentication**: Implement WorkOS integration for enterprise SSO
- **CRM Features**: Build all backend features for the CRM including:
  - User/Client management
  - Event booking system (classes & tours)
  - Membership management
  - Workout builder
  - Achievement system
  - Analytics
  - Notification engine
  - Document management
- **Integration-Ready**: Make features easily consumable by the mobile app

## Tech Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: WorkOS (enterprise SSO)
- **Backend**: Node.js/TypeScript, Express
- **Testing**: Jest, Supertest
- **Real-time**: Supabase subscriptions

## Key Architecture Decisions
1. **Multi-Tenancy**: Owner accounts can manage multiple organizations
2. **Cross-Organization Access**: Clients can access multiple gym locations
3. **Permission System**: Role-based with organization context
4. **Stateful Onboarding**: Session management for incomplete signups

## Development Priorities
1. **Database & Auth** (Tasks 1-2)
2. **CI/CD & Testing** (Tasks 3-4)
3. **Security & Compliance** (Tasks 5, 19, 23-24)
4. **Core Systems** (Tasks 6-7)
5. **Feature Modules** (Tasks 8-17)

## Important Notes
- Teammate handles Stripe and Kisi integrations
- Focus on making APIs that are easy to integrate with mobile app
- Implement comprehensive testing for reliability
- Follow security best practices throughout

## Commands to Run
```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck

# Start development server
npm run dev
```

## Environment Variables Required
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
DATABASE_URL=
REDIS_URL=
NODE_ENV=development
```