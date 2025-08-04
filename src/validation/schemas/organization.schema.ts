import { z } from 'zod';

import { commonSchemas, addressSchema, coordinatesSchema } from './common.schema';

// Organization type schema
export const organizationTypeEnum = z.enum([
  'gym',
  'studio',
  'wellness_center',
  'sports_facility',
  'other',
]);

// Business hours schema
export const businessHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
});

// Organization settings schema
export const organizationSettingsSchema = z.object({
  booking: z.object({
    advance_booking_days: z.number().int().min(1).max(365).default(30),
    cancellation_hours: z.number().int().min(0).max(72).default(24),
    waitlist_enabled: z.boolean().default(true),
    auto_confirm_waitlist: z.boolean().default(true),
    max_bookings_per_member: z.number().int().min(1).max(100).default(10),
  }),
  membership: z.object({
    allow_pausing: z.boolean().default(true),
    max_pause_days: z.number().int().min(1).max(365).default(30),
    auto_renew: z.boolean().default(true),
    grace_period_days: z.number().int().min(0).max(30).default(7),
  }),
  branding: z.object({
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    logo_url: z.string().url().optional(),
    banner_url: z.string().url().optional(),
  }),
});

// Organization creation schema
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  type: organizationTypeEnum,
  description: z.string().max(1000).optional(),
  email: commonSchemas.email,
  phone: commonSchemas.phone,
  website: z.string().url().optional(),
  address: addressSchema,
  coordinates: coordinatesSchema.optional(),
  business_hours: businessHoursSchema,
  settings: organizationSettingsSchema.partial().optional(),
  parent_organization_id: z.string().uuid().optional(),
});

// Organization update schema
export const updateOrganizationSchema = createOrganizationSchema.partial();

// Organization amenities schema
export const amenitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
});

// Organization staff schema
export const staffAssignmentSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['manager', 'trainer', 'receptionist', 'maintenance', 'other']),
  title: z.string().max(100).optional(),
  departments: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  schedule: businessHoursSchema.optional(),
});

// Organization location schema for multi-location support
export const locationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  address: addressSchema,
  coordinates: coordinatesSchema.optional(),
  phone: commonSchemas.phone,
  email: commonSchemas.email.optional(),
  business_hours: businessHoursSchema,
  amenities: z.array(z.string()).optional(),
  capacity: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

// Organization stats request schema
export const organizationStatsSchema = z.object({
  organization_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metrics: z
    .array(
      z.enum([
        'total_members',
        'active_members',
        'new_members',
        'churn_rate',
        'revenue',
        'attendance_rate',
        'popular_classes',
        'peak_hours',
        'member_retention',
      ])
    )
    .optional(),
  group_by: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
});
