import { z } from 'zod';

/**
 * Common validation schemas and utilities
 */

export const commonValidationRules = {
  // MongoDB ObjectId validation
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Phone number validation (basic)
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format'),
  
  // Name validation (no special characters except hyphen and apostrophe)
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  
  // Search
  search: z.string().optional(),
  
  // Status validation
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  
  // Date validation
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  // Time validation (24-hour format)
  timeString: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  
  // Organization ID validation (UUID)
  organizationId: z.string().uuid('Invalid organization ID'),
  
  // User ID validation (UUID)
  userId: z.string().uuid('Invalid user ID'),
  
  // Role validation
  role: z.enum(['admin', 'manager', 'staff', 'client']),
  
  // Permission validation
  permission: z.string().min(1, 'Permission is required'),
  
  // Resource validation
  resource: z.string().min(1, 'Resource is required'),
  
  // Action validation
  action: z.string().min(1, 'Action is required'),
  
  // Money validation (amount in cents)
  money: z.number().int().min(0, 'Amount must be non-negative'),
  
  // Percentage validation (0-100)
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
};

/**
 * Validate request body against a schema
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate query parameters against a schema
 */
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string | string[] | undefined>): T {
  return schema.parse(params);
}

/**
 * Safe validation that returns result with success/error
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result;
}