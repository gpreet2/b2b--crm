# Back2Back OS - Gym Management Platform

## Project Overview

Back2Back OS is a comprehensive, multi-tenant gym management platform built with Next.js 15.4.1, TypeScript, Tailwind CSS, and Supabase. The platform provides both an Admin Dashboard for operational excellence and a future Client Mobile App for seamless member experiences.

## 🏗️ Architecture Overview

### Core Technologies
- **Frontend**: Next.js 15.4.1 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Real-time**: Supabase Realtime for instant UI updates
- **Integrations**: NMI (payments), Kisi (access control)

### Multi-Tenant Architecture
- **Data Isolation**: All data partitioned by `gym_id` with RLS enforcement
- **Role-Based Access**: `admin`, `trainer`, `member` roles with granular permissions
- **JWT Claims**: Authentication with role and gym context

## 📁 Project Structure

```
b2b--crm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── classes/           # Class management
│   │   ├── financial/         # Financial tracking
│   │   ├── people/            # Client/lead management
│   │   └── perform/           # Performance tracking
│   ├── components/            # Reusable UI components
│   │   ├── calendar/          # Calendar components
│   │   ├── classes/           # Class-specific components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   ├── perform/           # Performance components
│   │   └── ui/                # Base UI components
│   └── lib/                   # Utilities and types
├── .taskmaster/               # Task Master project management
│   ├── docs/                  # Project documentation
│   ├── tasks/                 # Task files and management
│   └── templates/             # Templates and examples
└── public/                    # Static assets
```

## 🔐 Security Model

### Row-Level Security (RLS)
All tables enforce RLS policies based on:
- **Gym Isolation**: `gym_id` ensures data separation between gyms
- **Role-Based Access**: Different permissions for admin, trainer, member
- **Self-Access**: Users can only access their own profile data

### Authentication Flow
1. **Supabase Auth** handles user authentication
2. **JWT Claims** include `gym_id` and `role` for authorization
3. **RLS Policies** enforce access control at database level
4. **Client-Side** components respect user permissions

## 🗄️ Database Schema

### Core Tables
- **gyms**: Gym information and settings
- **profiles**: User profiles with role and gym association
- **clients**: Client information and membership details
- **classes**: Class definitions and schedules
- **class_events**: Individual class instances
- **class_bookings**: Booking records with status tracking
- **programs**: Class program templates
- **invoices**: Financial transaction records
- **performance_logs**: Workout tracking data
- **notifications**: System notifications and alerts

### Key Relationships
- All tables include `gym_id` for multi-tenancy
- **profiles** → **gyms** (many-to-one)
- **clients** → **gyms** (many-to-one)
- **classes** → **programs** (many-to-one)
- **class_events** → **classes** (many-to-one)
- **class_bookings** → **class_events** (many-to-one)

## 🔄 Real-Time Architecture

### Supabase Realtime
- **Instant Updates**: UI updates immediately when data changes
- **Cross-Client Sync**: Admin Dashboard and future Client App stay synchronized
- **Event-Driven**: Database changes trigger real-time notifications
- **Optimistic Updates**: UI responds immediately, then syncs with server

### Real-Time Events
- **Class Bookings**: Instant booking confirmation and waitlist updates
- **Client Status**: Real-time client status changes
- **Financial Transactions**: Immediate payment confirmations
- **System Notifications**: Instant alerts and notifications

## 💳 Payment Integration (NMI)

### Payment Flow
1. **Client Booking**: Client books class through UI
2. **Payment Processing**: NMI handles payment securely
3. **Webhook Confirmation**: NMI sends confirmation via webhook
4. **Database Update**: Booking confirmed and access granted
5. **Real-Time Update**: UI updates immediately across all clients

### Error Handling
- **Retry Logic**: Failed payments automatically retry
- **Graceful Degradation**: System continues working during payment issues
- **Manual Intervention**: Admin dashboard for payment troubleshooting

## 🔑 Access Control Integration (Kisi)

### Access Management
- **Digital Access**: Mobile wallet integration (Apple Wallet/Google Pay)
- **Time-Based Access**: Role-specific access windows
- **Multi-Tenant Groups**: Gym-specific access group management
- **Automatic Provisioning**: Access granted/revoked based on membership status

### Integration Features
- **Job Queue**: Asynchronous access operations with retry logic
- **Audit Trail**: Comprehensive access logging for compliance
- **Health Monitoring**: Real-time integration status monitoring
- **Manual Override**: Admin capabilities for emergency access management

## 🧪 Testing Strategy

### Battle-Hardened CI/CD Pipeline
- **Phase 1**: Local development with mandatory git hooks
- **Phase 2**: Automated CI pipeline with 90% code coverage
- **Phase 3**: Multi-environment deployment with staging safety net
- **Phase 4**: Chaos engineering and stress testing

### Testing Levels
- **Unit Tests**: Individual function testing with mocks
- **Integration Tests**: Database and API testing with temporary Supabase
- **E2E Tests**: Full user flow testing with Playwright
- **Load Tests**: 1000+ concurrent users with k6
- **Security Tests**: Penetration testing with OWASP ZAP

## 🚀 Development Workflow

### Local Development
1. **Docker Environment**: Containerized development matching production
2. **Supabase CLI**: Local database with realistic test data
3. **Git Hooks**: Pre-commit linting and pre-push testing
4. **Hot Reloading**: Instant feedback during development

### Code Quality
- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Code quality and consistency
- **Prettier**: Consistent formatting
- **90% Test Coverage**: Mandatory coverage threshold

### Deployment Process
1. **Feature Branch**: Development on feature branches
2. **CI Pipeline**: Automated testing and quality checks
3. **Staging**: Deployment to staging environment
4. **Manual QA**: Thorough testing in staging
5. **Production**: Manual deployment after staging validation

## 📊 Key Features

### Admin Dashboard
- **Real-Time KPIs**: Active members, classes today, revenue, attendance
- **Class Management**: Calendar view, list view, roster management
- **Client Management**: Lead tracking, client profiles, segmentation
- **Financial Tracking**: Transactions, invoices, payroll
- **Analytics**: Comprehensive reporting and insights

### Future Client App
- **Mobile Wallet**: Digital access via Apple Wallet/Google Pay
- **Class Booking**: Real-time class booking and management
- **Performance Tracking**: Workout logging and progress tracking
- **Notifications**: Real-time updates and alerts

## 🔧 Configuration

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NMI Payment Processing
NMI_API_KEY=your_nmi_api_key
NMI_WEBHOOK_SECRET=your_webhook_secret

# Kisi Access Control
KISI_API_KEY=your_kisi_api_key
KISI_WEBHOOK_SECRET=your_kisi_webhook_secret
```

### Supabase Configuration
- **RLS Policies**: All tables have comprehensive security policies
- **Real-time**: Enabled for all tables requiring live updates
- **Edge Functions**: Server-to-server API calls for integrations
- **Database Functions**: Atomic operations for complex business logic

## 🎯 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode with comprehensive typing
- **Component Structure**: Reusable, composable components
- **Error Handling**: Graceful error handling with user feedback
- **Performance**: Optimized queries and efficient rendering
- **Accessibility**: WCAG 2.1 AA compliance

### Database Best Practices
- **Atomic Operations**: Use PostgreSQL functions for complex operations
- **Indexing**: Proper indexes for performance
- **Constraints**: Database-level data integrity
- **Migrations**: Version-controlled schema changes

### Security Best Practices
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: Proper content sanitization
- **CSRF Protection**: Token-based request validation

## 📈 Performance Requirements

### Response Times
- **API Endpoints**: < 200ms for 95% of requests
- **Real-Time Updates**: < 100ms for UI updates
- **Page Load**: < 2s for initial page load
- **Database Queries**: < 50ms for simple queries

### Scalability
- **Concurrent Users**: Support 1000+ concurrent users
- **Database Connections**: Efficient connection pooling
- **Caching**: Strategic caching for frequently accessed data
- **CDN**: Static asset delivery optimization

## 🔍 Monitoring and Observability

### System Health
- **Application Monitoring**: Performance and error tracking
- **Database Monitoring**: Query performance and connection health
- **Integration Health**: Third-party service status monitoring
- **Business Metrics**: KPI tracking and alerting

### Alerting
- **Error Rates**: Alert on increased error rates
- **Performance Degradation**: Alert on slow response times
- **Integration Failures**: Alert on third-party service issues
- **Business Metrics**: Alert on KPI threshold breaches

## 🚨 Incident Response

### Failure Scenarios
- **Database Outage**: Graceful degradation with cached data
- **Payment System Failure**: Manual payment processing fallback
- **Access Control Failure**: Manual access management
- **Real-Time System Failure**: Fallback to polling updates

### Recovery Procedures
- **Automated Recovery**: Self-healing systems where possible
- **Manual Intervention**: Admin dashboard for manual recovery
- **Rollback Procedures**: Quick rollback to previous stable version
- **Communication**: Automated status updates to stakeholders

## 📚 Additional Resources

### Documentation
- **API Documentation**: Comprehensive API reference
- **Database Schema**: Detailed schema documentation
- **Integration Guides**: Third-party integration documentation
- **Deployment Guide**: Production deployment procedures

### Development Tools
- **Task Master**: Project management and task tracking
- **Supabase Dashboard**: Database management and monitoring
- **GitHub Actions**: CI/CD pipeline management
- **Monitoring Dashboards**: System health and performance monitoring

---

*This document serves as the comprehensive guide for understanding and developing the Back2Back OS platform. It should be updated as the system evolves and new features are added.* 