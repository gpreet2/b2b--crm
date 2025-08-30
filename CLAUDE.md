# B2B CRM - Convex Migration Project

## Current Status: Post-Cleanup, Ready for Convex Implementation

This project is a **B2B fitness management system** that has undergone comprehensive cleanup to remove all backend dependencies (Express, Supabase, WorkOS integration code) while preserving the complete UI. The codebase is now ready for **Convex migration** following the comprehensive PRD blueprint.

## Project Overview

**TryZore** - A unified fitness management platform built on Convex.dev architecture with production-ready resilience patterns. The system eliminates friction at every touchpoint for fitness businesses while providing powerful growth tools.

### Core Principles
- **Client First**: Every decision prioritizes the client experience
- **Frictionless Access**: Your phone is your membership card  
- **Transparent Business**: Real-time analytics and insights for owners
- **Scalable Architecture**: Built for 1 gym or 1,000
- **Resilient by Default**: Graceful handling of all failure modes

## Technology Stack

### Target Architecture (From PRD)
- **Backend**: Convex (TypeScript/Deno runtime)
- **Database**: Convex Managed Database
- **Real-time**: Convex (Built-in)
- **Queue Processing**: Convex Scheduled Functions
- **Mobile**: React Native with Convex React hooks
- **Web**: Next.js 15.5.2 with Convex client
- **Payments**: Stripe via resilient actions
- **Access**: Kisi via resilient actions
- **Auth**: WorkOS AuthKit with Convex integration
- **Monitoring**: Convex dashboard + Sentry + Custom metrics

### Current Frontend State
- **Framework**: Next.js 15.5.2 with App Router
- **Components**: Clean React components with mock data
- **Auth**: Mock authentication system (ready for WorkOS replacement)
- **UI**: Complete admin dashboard and mobile-ready interfaces
- **APIs**: 31 mock API routes ready to replace with Convex functions

## Current Architecture

```
src/
├── app/
│   ├── api/                     # 31 Mock API routes (→ Convex functions)
│   │   ├── auth/               # Authentication endpoints
│   │   ├── clients/            # Client management
│   │   ├── employees/          # Employee management  
│   │   ├── onboarding/         # Multi-step onboarding
│   │   ├── organizations/      # Organization management
│   │   ├── permissions/        # Permission system
│   │   ├── roles/              # Role management
│   │   └── users/              # User management
│   ├── auth/                   # Auth pages
│   ├── invite/                 # Invitation flows
│   ├── onboarding/             # Multi-step onboarding UI
│   └── settings/               # Settings pages
├── components/
│   └── layout/                 # Layout components
├── hooks/                      # React hooks (organization context)
├── lib/                        # Utilities and validation
├── types/                      # TypeScript types
│   └── generated/              # Generated types (ready for Convex types)
└── utils/                      # Utility functions
```

## Implementation Status

### ✅ Completed Cleanup
- Removed all Express server code
- Removed all Supabase dependencies  
- Removed all WorkOS integration code
- Removed all test files and complex middleware
- Removed all backend logic while preserving UI
- Simplified 32 API routes to simple mocks (~30 lines each)
- Fixed all navigation errors
- Created working mock authentication system

### 📋 Next Phase: Convex Implementation

Based on the PRD, the implementation follows this sequence:

#### Phase 0: Secure Bedrock (Tasks 1-12)
1. **Initialize Convex Schema** - Complete business entities with resilience patterns
2. **Secret Management System** - Secure KMS for all application secrets  
3. **Database Backup Strategy** - Comprehensive backup with 4hr RTO/15min RPO
4. **Error Handling Framework** - Circuit breakers and resilience patterns
5. **Data Validation Framework** - Convex validators for all inputs
6. **WorkOS AuthKit Integration** - Enterprise auth with Convex connector
7. **Permission System** - Role-based access with audit logging
8. **Security & Compliance** - Rate limiting, audit trails, GDPR compliance
9. **Circuit Breaker System** - Production-grade external API protection
10. **Queue Processing Engine** - Async job processing with retry logic
11. **GDPR/CCPA Privacy Compliance** - Foundational privacy infrastructure  
12. **CI/CD Pipeline & Testing** - Automated testing and deployment

#### Phase 1: Core Features (Tasks 13-20)
- Multi-step onboarding system
- Organization management  
- User/client management
- Stripe integration (teammate task)
- Kisi access control (teammate task)
- Production observability
- Security hardening
- API contracts & incident response

## Key Files to Understand

### Frontend Structure
- **App Router**: `src/app/` - Complete page structure with async params
- **Mock APIs**: `src/app/api/` - 31 endpoints ready for Convex replacement
- **Components**: Clean React components using mock data
- **Types**: `src/types/generated/` - TypeScript types ready for Convex

### Configuration Files  
- **Next.js**: `next.config.ts` - Standard Next.js 15 config
- **Package**: `package.json` - Clean dependencies (React, Next.js, minimal utils)
- **TypeScript**: `tsconfig.json` - Strict TypeScript configuration

### Task Management
- **PRD**: `.taskmaster/docs/prd.txt` - 100-page comprehensive blueprint
- **Tasks**: `.taskmaster/tasks/tasks.json` - 38 tasks, 221 subtasks
- **Current Phase**: Phase 0 (Tasks 1-12) - Foundation implementation

## Common Development Patterns

### Mock API Structure (Current)
```typescript
// Example: src/app/api/clients/route.ts
export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockClients.filter(c => c.organizationId === 'dev_org_1')
  });
}
```

### Target Convex Pattern (From PRD)
```typescript
// Example: convex/clients.ts  
export const getClients = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "clients.view");
    
    return await ctx.db
      .query("clients")
      .withIndex("by_org", q => q.eq("orgId", args.orgId))
      .collect();
  },
});
```

## Implementation Guidelines

### Convex Architecture Principles (From PRD)
1. **Defensive Programming**: Every external API call assumes failure
2. **Graceful Degradation**: System remains functional when services fail
3. **Audit Everything**: All state changes logged for debugging/compliance
4. **Recovery Over Prevention**: Quick recovery from failures
5. **User Experience First**: Technical failures never leave users confused

### Key Implementation Patterns
- **Permission Checks**: Every Convex function validates permissions
- **Audit Logging**: All mutations create audit trail entries
- **Circuit Breakers**: External APIs (WorkOS, Kisi, Stripe) wrapped in circuit breakers
- **Queue Processing**: Failed operations automatically queued for retry
- **Resilient Actions**: All external service calls use resilient action pattern

### Multi-Tenancy Approach
- **Organization Context**: All data filtered by organization ID
- **Permission Isolation**: Cross-org access requires explicit permissions  
- **Resource Separation**: Each organization's data completely isolated

## Development Commands

### Task Management
```bash
# Get next task to work on
task-master next

# View specific task details  
task-master show <id>

# Mark task complete
task-master set-status --id=<id> --status=done

# Expand task into subtasks
task-master expand --id=<id> --research
```

### Development Server
```bash
# Start development server
npm run dev

# Install dependencies
npm install

# Type checking
npm run type-check    # if available
```

### Convex (When Ready)
```bash
# Initialize Convex project
npx convex dev

# Deploy functions  
npx convex deploy

# Run migrations
npx convex import --table <table> data.jsonl
```

## Important Notes

### UI Preservation
- **Complete UI**: All pages, components, and user flows preserved
- **Mock Data**: Frontend uses mock data that matches expected API contracts
- **Type Safety**: TypeScript types ready for Convex integration
- **Responsive**: Mobile and desktop interfaces fully functional

### Migration Strategy
- **Gradual Replacement**: Replace mock APIs one-by-one with Convex functions
- **Type Compatibility**: Existing types align with planned Convex schema
- **Zero UI Changes**: Frontend code requires minimal changes
- **Progressive Enhancement**: Add real-time features as Convex functions deployed

### Ready for Implementation
The codebase is in an ideal state for Convex implementation:
- ✅ Clean frontend with no backend dependencies
- ✅ Mock APIs ready for 1:1 Convex function replacement  
- ✅ Complete UI flows and user journeys
- ✅ TypeScript types aligned with planned schema
- ✅ Comprehensive PRD with detailed implementation plan
- ✅ Task breakdown into manageable pieces (38 tasks, 221 subtasks)

The next developer can immediately start with **Task 1: Initialize Convex Schema** and follow the PRD blueprint to build a production-ready fitness management platform.