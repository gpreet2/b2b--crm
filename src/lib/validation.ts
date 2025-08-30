import { z } from 'zod';

// Basic validation schemas
export const ClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  membershipType: z.string().min(1, 'Membership type is required'),
  membershipStartDate: z.date()
});

export const EmployeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  is_active: z.boolean().optional()
});

export const WorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  exercises: z.array(z.any()).optional()
});

export const OrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

// Helper function to validate data
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Common validation patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

// Additional validation functions expected by UI components
export function validateField(field: string, value: any, schema?: any): string | null {
  if (!value && schema?.required) {
    return `${field} is required`;
  }
  return null;
}

export function validateWorkoutForm(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.name) errors.name = 'Workout name is required';
  if (!data.duration || data.duration < 1) errors.duration = 'Duration must be at least 1 minute';
  
  return errors;
}

export function hasValidationErrors(errors: Record<string, any>): boolean {
  return Object.keys(errors).length > 0;
}

export function clearAllValidationErrors(): Record<string, any> {
  return {};
}

export function validateDragDropData(data: any): boolean {
  return data && typeof data === 'object';
}