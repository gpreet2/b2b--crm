# TryZore CRM Database Schema Documentation

## Overview
The TryZore CRM database is built on PostgreSQL (via Supabase) with a security-first approach. Row Level Security (RLS) is enabled on all tables from day one to ensure data isolation and proper access control.

## Core Design Principles

### 1. Multi-Tenancy
- Organizations represent gym chains/franchises
- Users can belong to multiple organizations with different roles
- Clients can access multiple gym locations

### 2. Security-First
- RLS enabled on ALL tables
- Audit logging for sensitive operations
- Partitioned audit logs for performance
- Immutable audit trail

### 3. Flexibility
- Generic tagging system for extensibility
- JSONB fields for metadata and preferences
- Polymorphic relationships where appropriate

## Table Structure

### Core Tables

#### organizations
- Central tenant table
- Contains gym chain/franchise information
- Settings stored in JSONB for flexibility

#### users
- All system users (owners, employees, clients)
- User type determines base permissions
- WorkOS integration for enterprise SSO

#### user_organizations
- Many-to-many relationship
- Role-based permissions (owner, admin, staff, trainer, member)
- Primary organization flag for defaults

### Client Management

#### clients
- Extended profile for gym members
- Medical information and preferences
- One-to-one with users table

#### client_organizations
- Tracks which locations a client can access
- Membership status per location
- Visit tracking and statistics

### Tagging System

#### tags
- Generic tags for any entity
- Types: specialty, interest, category, skill, certification, custom
- Organization-scoped
- UI customization (color, icon)

#### taggables
- Polymorphic association table
- Can tag: users, clients, events, classes, tours, workouts, documents
- Tracks who created the tag relationship

### Events & Scheduling

#### events
- Classes, tours, personal training sessions
- Tour-specific metadata (type, lead_source)
- Recurring event support
- Virtual/physical location support

#### event_participants
- Registration and attendance tracking
- Waitlist management
- Payment status tracking
- Check-in functionality

### Memberships

#### membership_plans
- Template for membership offerings
- Flexible pricing and billing periods
- Feature flags in JSONB
- Location access control

#### memberships
- Active client subscriptions
- Usage tracking and limits
- Contract management
- Pause/resume functionality

#### membership_usage
- Tracks actual usage of membership benefits
- Links to specific events
- Different usage types (class, guest pass, etc.)

### Notifications

#### notifications
- In-app notification system
- Multiple notification types
- Read/unread tracking
- Action URLs for navigation
- Multi-channel delivery flags

#### notification_preferences
- Per-user, per-organization preferences
- Channel preferences by notification type
- Quiet hours support
- Global toggles

### Audit & Compliance

#### audit_logs
- Immutable audit trail
- Partitioned by month for performance
- Tracks all changes to sensitive data
- Automatic triggers on key tables

## RLS Policy Design

### General Patterns

1. **Self-Access**: Users can always view/update their own records
2. **Organization Scope**: Staff can access data within their organizations
3. **Role-Based**: Different permissions for owner, admin, staff, trainer
4. **Client Access**: Active clients can view relevant organization data

### Key Policies

#### Organizations
- SELECT: Users in the organization
- UPDATE: Only owners

#### Users
- SELECT: Self + users in same organizations
- UPDATE: Self only

#### Events
- SELECT: Organization members + active clients
- ALL: Staff and above

#### Memberships
- SELECT: Own memberships (clients) + organization staff
- ALL: Organization staff

#### Audit Logs
- SELECT: Organization owners only
- UPDATE/DELETE: Nobody (immutable)

## Security Features

### 1. Audit Logging
- Automatic triggers on sensitive tables
- Captures old/new values for changes
- Partitioned for performance
- Immutable design

### 2. Data Isolation
- RLS ensures complete data isolation
- No cross-organization data leakage
- Clients limited to active organization access

### 3. Permission Hierarchy
- Owner > Admin > Staff > Trainer > Member/Client
- Permissions cascade appropriately
- Fine-grained control via JSONB permissions field

## Performance Optimizations

### Indexes
- Foreign key indexes for joins
- Status and type columns for filtering
- Timestamp columns for sorting
- Composite indexes for common queries

### Partitioning
- Audit logs partitioned by month
- Automatic partition management
- Improved query performance for historical data

### Functions
- SECURITY DEFINER functions for privileged operations
- Optimized helper functions for common queries
- Automatic update triggers for timestamps

## Migration Strategy

All schema changes are applied through numbered migrations:
1. Core tables with RLS
2. Client management
3. Tagging system
4. Events and scheduling
5. Memberships
6. Notifications
7. Audit logging

Each migration is atomic and includes:
- Table creation
- RLS policy setup
- Index creation
- Trigger setup
- Test data (where appropriate)

## Best Practices

1. **Always use RLS**: Never disable RLS on any table
2. **Audit sensitive operations**: Use audit triggers for compliance
3. **Use JSONB wisely**: For truly dynamic data only
4. **Index foreign keys**: Always index foreign key columns
5. **Test policies**: Verify RLS policies with different user roles