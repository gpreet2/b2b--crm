import { z } from 'zod';
import { commonSchemas, userStatusEnum, roleEnum, addressSchema } from './common.schema';

// User profile schema
export const userProfileSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  display_name: z.string().min(1).max(200).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  date_of_birth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  emergency_contact: z.object({
    name: z.string().min(1).max(200),
    phone: commonSchemas.phone,
    relationship: z.string().min(1).max(50)
  }).optional()
});

// User creation schema
export const createUserSchema = z.object({
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  role: roleEnum,
  profile: userProfileSchema,
  organization_ids: z.array(z.string().uuid()).min(1),
  send_invite: z.boolean().default(true)
});

// User update schema
export const updateUserSchema = z.object({
  email: commonSchemas.email.optional(),
  phone: commonSchemas.phone.optional(),
  role: roleEnum.optional(),
  status: userStatusEnum.optional(),
  profile: userProfileSchema.partial().optional()
});

// User preferences schema
export const userPreferencesSchema = z.object({
  notifications: z.object({
    email: z.object({
      marketing: z.boolean().default(true),
      bookings: z.boolean().default(true),
      reminders: z.boolean().default(true),
      updates: z.boolean().default(true)
    }),
    push: z.object({
      bookings: z.boolean().default(true),
      reminders: z.boolean().default(true),
      updates: z.boolean().default(true)
    }),
    sms: z.object({
      bookings: z.boolean().default(false),
      reminders: z.boolean().default(false)
    })
  }),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h')
});

// User search/filter schema
export const userFilterSchema = z.object({
  role: roleEnum.optional(),
  status: userStatusEnum.optional(),
  organization_id: z.string().uuid().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  has_active_membership: z.boolean().optional(),
  tags: z.array(z.string().uuid()).optional()
});

// User stats request schema
export const userStatsSchema = z.object({
  user_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metrics: z.array(z.enum([
    'total_visits',
    'total_bookings',
    'attendance_rate',
    'favorite_classes',
    'workout_duration',
    'achievement_count'
  ])).optional()
});

// Bulk user import schema
export const bulkUserImportSchema = z.object({
  users: z.array(z.object({
    email: commonSchemas.email,
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    phone: commonSchemas.phone.optional(),
    role: roleEnum.default('client'),
    tags: z.array(z.string()).optional()
  })).min(1).max(1000),
  send_invites: z.boolean().default(false),
  organization_id: z.string().uuid()
});