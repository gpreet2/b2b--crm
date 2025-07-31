import { z } from 'zod';
import { commonSchemas, membershipStatusEnum } from './common.schema';

// Membership type schema
export const membershipTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: commonSchemas.money,
  billing_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  features: z.array(z.string()).default([]),
  limitations: z.object({
    max_bookings_per_period: z.number().int().positive().optional(),
    allowed_locations: z.array(z.string().uuid()).optional(),
    allowed_services: z.array(z.string().uuid()).optional(),
    guest_passes_per_period: z.number().int().min(0).default(0)
  }).optional(),
  is_active: z.boolean().default(true),
  organization_id: z.string().uuid()
});

// Membership creation schema
export const createMembershipSchema = z.object({
  user_id: z.string().uuid(),
  membership_type_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  price_override: commonSchemas.money.optional(),
  discount_percentage: commonSchemas.percentage.optional(),
  payment_method_id: z.string().uuid().optional(),
  auto_renew: z.boolean().default(true),
  notes: z.string().max(1000).optional()
});

// Membership update schema
export const updateMembershipSchema = z.object({
  status: membershipStatusEnum.optional(),
  end_date: z.string().datetime().optional(),
  auto_renew: z.boolean().optional(),
  price_override: commonSchemas.money.optional(),
  notes: z.string().max(1000).optional()
});

// Membership pause schema
export const pauseMembershipSchema = z.object({
  pause_start_date: z.string().datetime(),
  pause_end_date: z.string().datetime(),
  reason: z.string().max(500).optional()
}).refine(data => {
  const start = new Date(data.pause_start_date);
  const end = new Date(data.pause_end_date);
  return end > start;
}, {
  message: "Pause end date must be after start date"
});

// Membership cancellation schema
export const cancelMembershipSchema = z.object({
  cancellation_date: z.string().datetime(),
  reason: z.enum(['price', 'service', 'relocation', 'health', 'other']),
  reason_details: z.string().max(1000).optional(),
  process_refund: z.boolean().default(false),
  refund_amount: commonSchemas.money.optional()
});

// Membership transfer schema
export const transferMembershipSchema = z.object({
  from_user_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
  transfer_date: z.string().datetime(),
  transfer_fee: commonSchemas.money.optional(),
  reason: z.string().max(500).optional()
});

// Membership addon schema
export const membershipAddonSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: commonSchemas.money,
  billing_period: z.enum(['one_time', 'monthly', 'yearly']),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
});

// Membership usage tracking schema
export const membershipUsageSchema = z.object({
  membership_id: z.string().uuid(),
  date: z.string().datetime(),
  service_type: z.enum(['class', 'gym_access', 'personal_training', 'guest_pass', 'other']),
  service_id: z.string().uuid().optional(),
  duration_minutes: z.number().int().positive().optional(),
  location_id: z.string().uuid().optional()
});

// Membership filter schema
export const membershipFilterSchema = z.object({
  user_id: z.string().uuid().optional(),
  status: membershipStatusEnum.optional(),
  membership_type_id: z.string().uuid().optional(),
  expiring_within_days: z.number().int().positive().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  organization_id: z.string().uuid().optional()
});