import { z } from 'zod';
import {
  createUserSchema,
  updateUserSchema,
  userFilterSchema,
  createOrganizationSchema,
  createMembershipSchema,
  pauseMembershipSchema,
  createEventSchema,
  createBookingSchema,
  workoutTemplateSchema,
  sendNotificationSchema
} from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('User Schemas', () => {
    it('should validate user creation data', () => {
      const validUser = {
        email: 'john.doe@example.com',
        phone: '+1234567890',
        role: 'client',
        profile: {
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'JD',
          bio: 'Fitness enthusiast'
        },
        organization_ids: ['550e8400-e29b-41d4-a716-446655440000'],
        send_invite: true
      };

      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.role).toBe('client');
      }
    });

    it('should reject invalid user data', () => {
      const invalidUser = {
        email: 'invalid-email',
        role: 'invalid_role',
        profile: {
          first_name: '',
          last_name: 'Doe'
        },
        organization_ids: []
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.map(i => i.path.join('.'));
        expect(errors).toContain('email');
        expect(errors).toContain('role');
        expect(errors).toContain('profile.first_name');
        expect(errors).toContain('organization_ids');
      }
    });

    it('should validate partial user updates', () => {
      const update = {
        email: 'new.email@example.com',
        status: 'active'
      };

      const result = updateUserSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe('Organization Schemas', () => {
    it('should validate organization creation', () => {
      const validOrg = {
        name: 'FitZone Gym',
        type: 'gym',
        email: 'info@fitzone.com',
        phone: '+1234567890',
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        },
        business_hours: {
          monday: { open: '06:00', close: '22:00', closed: false },
          tuesday: { open: '06:00', close: '22:00', closed: false }
        }
      };

      const result = createOrganizationSchema.safeParse(validOrg);
      expect(result.success).toBe(true);
    });

    it('should validate organization branding colors', () => {
      const org = {
        name: 'Test Gym',
        type: 'gym',
        email: 'test@gym.com',
        phone: '+1234567890',
        address: {
          street1: '123 Main St',
          city: 'City',
          state: 'ST',
          postal_code: '12345',
          country: 'US'
        },
        business_hours: {},
        settings: {
          branding: {
            primary_color: '#FF5733',
            secondary_color: '#33FF57'
          }
        }
      };

      const result = createOrganizationSchema.safeParse(org);
      expect(result.success).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      const org = {
        name: 'Test Gym',
        type: 'gym',
        email: 'test@gym.com',
        phone: '+1234567890',
        address: {
          street1: '123 Main St',
          city: 'City',
          state: 'ST',
          postal_code: '12345',
          country: 'US'
        },
        business_hours: {},
        settings: {
          branding: {
            primary_color: 'invalid-color',
            secondary_color: '#ZZZ'
          }
        }
      };

      const result = createOrganizationSchema.safeParse(org);
      expect(result.success).toBe(false);
    });
  });

  describe('Membership Schemas', () => {
    it('should validate membership creation', () => {
      const validMembership = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        membership_type_id: '550e8400-e29b-41d4-a716-446655440001',
        start_date: '2024-01-01T00:00:00Z',
        auto_renew: true
      };

      const result = createMembershipSchema.safeParse(validMembership);
      expect(result.success).toBe(true);
    });

    it('should validate membership pause with date validation', () => {
      const validPause = {
        pause_start_date: '2024-01-01T00:00:00Z',
        pause_end_date: '2024-01-15T00:00:00Z',
        reason: 'Vacation'
      };

      const result = pauseMembershipSchema.safeParse(validPause);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pause dates', () => {
      const invalidPause = {
        pause_start_date: '2024-01-15T00:00:00Z',
        pause_end_date: '2024-01-01T00:00:00Z',
        reason: 'Invalid dates'
      };

      const result = pauseMembershipSchema.safeParse(invalidPause);
      expect(result.success).toBe(false);
    });
  });

  describe('Event Schemas', () => {
    it('should validate event creation with tour metadata', () => {
      const validEvent = {
        type: 'tour',
        title: 'Gym Tour',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        location_id: '550e8400-e29b-41d4-a716-446655440000',
        capacity: 5,
        tour_metadata: {
          areas_to_cover: ['weights', 'cardio', 'pool'],
          follow_up_required: true
        }
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate event with recurrence', () => {
      const validEvent = {
        type: 'class',
        title: 'Yoga Class',
        start_time: '2024-01-01T09:00:00Z',
        end_time: '2024-01-01T10:00:00Z',
        location_id: '550e8400-e29b-41d4-a716-446655440000',
        capacity: 20,
        skill_level: 'beginner',
        recurrence: {
          frequency: 'weekly',
          days_of_week: [1, 3, 5], // Mon, Wed, Fri
          end_date: '2024-12-31T23:59:59Z'
        }
      };

      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject event with invalid time range', () => {
      const invalidEvent = {
        type: 'class',
        title: 'Invalid Class',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T09:00:00Z', // End before start
        location_id: '550e8400-e29b-41d4-a716-446655440000',
        capacity: 20
      };

      const result = createEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Workout Schemas', () => {
    it('should validate workout template', () => {
      const validTemplate = {
        name: 'Upper Body Workout',
        category: 'strength',
        difficulty: 3,
        estimated_duration_minutes: 60,
        exercises: [
          {
            exercise_id: '550e8400-e29b-41d4-a716-446655440000',
            order: 1,
            sets: [
              {
                set_number: 1,
                target_reps: 12,
                target_weight: 50,
                rest_seconds: 90
              },
              {
                set_number: 2,
                target_reps: 10,
                target_weight: 55,
                rest_seconds: 90
              }
            ]
          }
        ],
        created_by: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002'
      };

      const result = workoutTemplateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it('should reject workout template without exercises', () => {
      const invalidTemplate = {
        name: 'Empty Workout',
        category: 'strength',
        difficulty: 3,
        estimated_duration_minutes: 60,
        exercises: [],
        created_by: '550e8400-e29b-41d4-a716-446655440001',
        organization_id: '550e8400-e29b-41d4-a716-446655440002'
      };

      const result = workoutTemplateSchema.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });
  });

  describe('Notification Schemas', () => {
    it('should validate notification sending', () => {
      const validNotification = {
        type: 'booking_reminder',
        recipients: ['550e8400-e29b-41d4-a716-446655440000'],
        title: 'Class Reminder',
        body: 'Your yoga class starts in 1 hour',
        channels: ['email', 'push'],
        priority: 'high'
      };

      const result = sendNotificationSchema.safeParse(validNotification);
      expect(result.success).toBe(true);
    });

    it('should validate notification with template', () => {
      const validNotification = {
        type: 'custom',
        recipients: ['550e8400-e29b-41d4-a716-446655440000'],
        title: 'Welcome',
        body: 'Welcome to our gym!',
        channels: ['email'],
        template_id: '550e8400-e29b-41d4-a716-446655440001',
        template_variables: {
          user_name: 'John Doe',
          gym_name: 'FitZone'
        }
      };

      const result = sendNotificationSchema.safeParse(validNotification);
      expect(result.success).toBe(true);
    });

    it('should reject notification without channels', () => {
      const invalidNotification = {
        type: 'announcement',
        recipients: ['550e8400-e29b-41d4-a716-446655440000'],
        title: 'Important',
        body: 'This is important',
        channels: []
      };

      const result = sendNotificationSchema.safeParse(invalidNotification);
      expect(result.success).toBe(false);
    });
  });
});