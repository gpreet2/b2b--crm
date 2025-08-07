import { z } from 'zod';

// Location validation schema
export const LocationSchema = z.object({
  id: z.string().min(1, 'Location ID is required'),
  name: z.string().max(100, 'Location name too long'),
  address: z.string().max(200, 'Address too long'),
});

// Strict location schema for completed locations
export const StrictLocationSchema = z.object({
  id: z.string().min(1, 'Location ID is required'),
  name: z.string().min(1, 'Location name is required').max(100, 'Location name too long'),
  address: z.string().min(1, 'Location address is required').max(200, 'Address too long'),
});

// Onboarding state validation schema
export const OnboardingStateSchema = z.object({
  organizationName: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name too long')
    .optional(),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .optional(),
  locations: z.array(LocationSchema)
    .min(1, 'At least one location is required')
    .max(10, 'Too many locations'),
  metadata: z.object({
    startedAt: z.string().datetime(),
    completedSteps: z.array(z.number().int().min(1).max(4)),
    lastActiveStep: z.number().int().min(1).max(4),
  }),
});

// Session update validation schema
export const SessionUpdateSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  sessionToken: z.string().length(64, 'Invalid session token'),
  currentStep: z.number().int().min(1).max(4).optional(),
  state: OnboardingStateSchema.partial().optional(),
  isCompleted: z.boolean().optional(),
});

// Session creation validation schema
export const SessionCreateSchema = z.object({
  userAgent: z.string().max(500, 'User agent too long').optional(),
  ipAddress: z.string().max(45, 'IP address too long').optional().or(z.literal('unknown')),
});

// Session retrieval validation schema
export const SessionRetrieveSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  sessionToken: z.string().length(64, 'Invalid session token'),
});

// CSRF token validation
export const CSRFTokenSchema = z.object({
  token: z.string().length(32, 'Invalid CSRF token'),
  timestamp: z.number().int().min(0),
});

export type OnboardingStateType = z.infer<typeof OnboardingStateSchema>;
export type LocationType = z.infer<typeof LocationSchema>;
export type SessionUpdateType = z.infer<typeof SessionUpdateSchema>;
export type SessionCreateType = z.infer<typeof SessionCreateSchema>;
export type SessionRetrieveType = z.infer<typeof SessionRetrieveSchema>;
export type CSRFTokenType = z.infer<typeof CSRFTokenSchema>;