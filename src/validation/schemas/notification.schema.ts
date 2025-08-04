import { z } from 'zod';

// Notification types
export const notificationTypeEnum = z.enum([
  'booking_confirmation',
  'booking_reminder',
  'booking_cancellation',
  'waitlist_promotion',
  'membership_expiring',
  'membership_renewed',
  'payment_success',
  'payment_failed',
  'achievement_earned',
  'message_received',
  'announcement',
  'system_update',
  'custom',
]);

// Notification channels
export const notificationChannelEnum = z.enum(['email', 'sms', 'push', 'in_app']);

// Notification priority
export const notificationPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

// Base notification schema
export const notificationSchema = z.object({
  id: z.string().uuid().optional(),
  type: notificationTypeEnum,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  priority: notificationPriorityEnum.default('medium'),
  channels: z.array(notificationChannelEnum).min(1),
  recipient_id: z.string().uuid(),
  sender_id: z.string().uuid().optional(),
  data: z.object({}).passthrough().optional(),
  scheduled_for: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  organization_id: z.string().uuid(),
});

// Send notification request schema
export const sendNotificationSchema = z.object({
  type: notificationTypeEnum,
  recipients: z.array(z.string().uuid()).min(1).max(1000),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  channels: z.array(notificationChannelEnum).min(1),
  priority: notificationPriorityEnum.default('medium'),
  data: z.object({}).passthrough().optional(),
  scheduled_for: z.string().datetime().optional(),
  template_id: z.string().uuid().optional(),
  template_variables: z.object({}).passthrough().optional(),
});

// Notification template schema
export const notificationTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  type: notificationTypeEnum,
  channels: z.array(notificationChannelEnum).min(1),
  subject_template: z.string().max(200).optional(), // For email
  body_template: z.string().min(1).max(5000),
  variables: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'date', 'boolean']),
        required: z.boolean().default(true),
        default_value: z.any().optional(),
      })
    )
    .optional(),
  is_active: z.boolean().default(true),
  organization_id: z.string().uuid(),
});

// Notification preferences update schema
export const updateNotificationPreferencesSchema = z.object({
  email: z
    .object({
      enabled: z.boolean().optional(),
      types: z
        .object({
          booking_confirmation: z.boolean().optional(),
          booking_reminder: z.boolean().optional(),
          booking_cancellation: z.boolean().optional(),
          waitlist_promotion: z.boolean().optional(),
          membership_expiring: z.boolean().optional(),
          membership_renewed: z.boolean().optional(),
          payment_success: z.boolean().optional(),
          payment_failed: z.boolean().optional(),
          achievement_earned: z.boolean().optional(),
          message_received: z.boolean().optional(),
          announcement: z.boolean().optional(),
          system_update: z.boolean().optional(),
          custom: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  sms: z
    .object({
      enabled: z.boolean().optional(),
      types: z
        .object({
          booking_confirmation: z.boolean().optional(),
          booking_reminder: z.boolean().optional(),
          booking_cancellation: z.boolean().optional(),
          waitlist_promotion: z.boolean().optional(),
          membership_expiring: z.boolean().optional(),
          membership_renewed: z.boolean().optional(),
          payment_success: z.boolean().optional(),
          payment_failed: z.boolean().optional(),
          achievement_earned: z.boolean().optional(),
          message_received: z.boolean().optional(),
          announcement: z.boolean().optional(),
          system_update: z.boolean().optional(),
          custom: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  push: z
    .object({
      enabled: z.boolean().optional(),
      types: z
        .object({
          booking_confirmation: z.boolean().optional(),
          booking_reminder: z.boolean().optional(),
          booking_cancellation: z.boolean().optional(),
          waitlist_promotion: z.boolean().optional(),
          membership_expiring: z.boolean().optional(),
          membership_renewed: z.boolean().optional(),
          payment_success: z.boolean().optional(),
          payment_failed: z.boolean().optional(),
          achievement_earned: z.boolean().optional(),
          message_received: z.boolean().optional(),
          announcement: z.boolean().optional(),
          system_update: z.boolean().optional(),
          custom: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  in_app: z
    .object({
      enabled: z.boolean().optional(),
      types: z
        .object({
          booking_confirmation: z.boolean().optional(),
          booking_reminder: z.boolean().optional(),
          booking_cancellation: z.boolean().optional(),
          waitlist_promotion: z.boolean().optional(),
          membership_expiring: z.boolean().optional(),
          membership_renewed: z.boolean().optional(),
          payment_success: z.boolean().optional(),
          payment_failed: z.boolean().optional(),
          achievement_earned: z.boolean().optional(),
          message_received: z.boolean().optional(),
          announcement: z.boolean().optional(),
          system_update: z.boolean().optional(),
          custom: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  quiet_hours: z
    .object({
      enabled: z.boolean().default(false),
      start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: z.string(),
    })
    .optional(),
});

// Notification status schema
export const notificationStatusSchema = z.object({
  notification_id: z.string().uuid(),
  channel: notificationChannelEnum,
  status: z.enum(['pending', 'sent', 'delivered', 'read', 'failed', 'bounced']),
  sent_at: z.string().datetime().optional(),
  delivered_at: z.string().datetime().optional(),
  read_at: z.string().datetime().optional(),
  failed_at: z.string().datetime().optional(),
  error_message: z.string().optional(),
});

// In-app notification schema
export const inAppNotificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  type: notificationTypeEnum,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  action_url: z.string().optional(),
  icon: z.string().optional(),
  is_read: z.boolean().default(false),
  read_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
});

// Mark notifications as read schema
export const markNotificationsReadSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1).max(100),
  read_at: z.string().datetime().optional(),
});

// Notification analytics schema
export const notificationAnalyticsSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  type: notificationTypeEnum.optional(),
  channel: notificationChannelEnum.optional(),
  group_by: z.enum(['day', 'week', 'month', 'type', 'channel']).optional(),
});
