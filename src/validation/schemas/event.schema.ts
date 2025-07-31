import { z } from 'zod';
import { commonSchemas, eventStatusEnum, bookingStatusEnum } from './common.schema';

// Event type enum
export const eventTypeEnum = z.enum(['class', 'tour', 'workshop', 'personal_training', 'assessment', 'other']);

// Recurrence schema
export const recurrenceSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  interval: z.number().int().positive().default(1),
  days_of_week: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday
  day_of_month: z.number().int().min(1).max(31).optional(),
  end_date: z.string().datetime().optional(),
  end_after_occurrences: z.number().int().positive().optional()
}).refine(data => {
  if (data.frequency === 'weekly' && (!data.days_of_week || data.days_of_week.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Weekly recurrence requires days_of_week"
});

// Event creation schema
export const createEventSchema = z.object({
  type: eventTypeEnum,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location_id: z.string().uuid(),
  instructor_id: z.string().uuid().optional(),
  capacity: z.number().int().positive(),
  waitlist_capacity: z.number().int().min(0).default(0),
  price: commonSchemas.money.optional(),
  booking_opens_at: z.string().datetime().optional(),
  booking_closes_at: z.string().datetime().optional(),
  cancellation_deadline_hours: z.number().int().min(0).default(24),
  equipment_needed: z.array(z.string()).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']).default('all_levels'),
  tags: z.array(z.string().uuid()).optional(),
  recurrence: recurrenceSchema.optional(),
  // Tour-specific fields
  tour_metadata: z.object({
    tour_guide_id: z.string().uuid().optional(),
    areas_to_cover: z.array(z.string()).optional(),
    special_instructions: z.string().max(1000).optional(),
    follow_up_required: z.boolean().default(true)
  }).optional()
}).refine(data => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return end > start;
}, {
  message: "End time must be after start time"
});

// Event update schema
export const updateEventSchema = createEventSchema.partial().extend({
  status: eventStatusEnum.optional(),
  notify_attendees: z.boolean().default(true)
});

// Event cancellation schema
export const cancelEventSchema = z.object({
  reason: z.string().max(500),
  notify_attendees: z.boolean().default(true),
  offer_alternative: z.boolean().default(false),
  alternative_event_ids: z.array(z.string().uuid()).optional()
});

// Booking creation schema
export const createBookingSchema = z.object({
  event_id: z.string().uuid(),
  user_id: z.string().uuid(),
  booking_type: z.enum(['self', 'staff', 'guest']).default('self'),
  guest_info: z.object({
    name: z.string().min(1).max(200),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional()
  }).optional(),
  notes: z.string().max(500).optional(),
  source: z.enum(['web', 'mobile', 'kiosk', 'staff']).default('web')
});

// Booking update schema
export const updateBookingSchema = z.object({
  status: bookingStatusEnum.optional(),
  checked_in_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

// Attendance tracking schema
export const attendanceSchema = z.object({
  booking_id: z.string().uuid(),
  checked_in_at: z.string().datetime(),
  checked_out_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().positive().optional(),
  performance_notes: z.string().max(1000).optional(),
  instructor_feedback: z.string().max(1000).optional()
});

// Event search/filter schema
export const eventFilterSchema = z.object({
  type: eventTypeEnum.optional(),
  instructor_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: eventStatusEnum.optional(),
  has_availability: z.boolean().optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']).optional(),
  tags: z.array(z.string().uuid()).optional(),
  price_min: commonSchemas.money.optional(),
  price_max: commonSchemas.money.optional()
});

// Waitlist management schema
export const waitlistSchema = z.object({
  event_id: z.string().uuid(),
  user_id: z.string().uuid(),
  position: z.number().int().positive(),
  added_at: z.string().datetime(),
  notification_preference: z.enum(['email', 'sms', 'push', 'all']).default('email')
});