import { z } from 'zod';

// Re-export common schemas from validation middleware
export { schemas as commonSchemas } from '../../middleware/validation';

// Additional common schemas
export const idSchema = z.object({
  id: z.string().uuid()
});

export const timestampsSchema = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const softDeleteSchema = z.object({
  deleted_at: z.string().datetime().nullable(),
  is_deleted: z.boolean().default(false)
});

export const addressSchema = z.object({
  street1: z.string().min(1).max(255),
  street2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  postal_code: z.string().min(3).max(20),
  country: z.string().length(2), // ISO country code
});

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string().min(1).max(100),
  size: z.number().int().positive().max(52428800), // 50MB max
  url: z.string().url()
});

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  type: z.enum(['user', 'event', 'workout', 'membership', 'generic']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  organization_id: z.string().uuid()
});

export const noteSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  author_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Status enums
export const userStatusEnum = z.enum(['active', 'inactive', 'suspended', 'pending']);
export const membershipStatusEnum = z.enum(['active', 'paused', 'cancelled', 'expired']);
export const eventStatusEnum = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
export const bookingStatusEnum = z.enum(['confirmed', 'waitlisted', 'cancelled', 'no_show']);

// Role enums
export const roleEnum = z.enum(['super_admin', 'owner', 'admin', 'employee', 'client']);

// Sorting schemas
export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc');

export const baseSortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema
});

// Search schemas
export const searchSchema = z.object({
  q: z.string().min(1).max(255).optional(),
  filters: z.object({}).passthrough().optional()
});

// Batch operation schemas
export const batchIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100)
});

export const batchOperationSchema = z.object({
  operation: z.enum(['delete', 'archive', 'restore', 'update']),
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.object({}).passthrough().optional()
});