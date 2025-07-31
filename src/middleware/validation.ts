import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../errors/validation.error';

export interface ValidationOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

// Extend Express Request type to include validated data
declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: any;
        params?: any;
        query?: any;
        headers?: any;
      };
    }
  }
}

export function validate(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Initialize validated data container
      req.validated = {};

      // Validate request body
      if (options.body) {
        const result = options.body.safeParse(req.body);
        if (!result.success) {
          const errors = formatZodError(result.error);
          throw new ValidationError('Invalid request body', errors);
        }
        req.validated.body = result.data;
        req.body = result.data;
      }

      // Validate route params
      if (options.params) {
        const result = options.params.safeParse(req.params);
        if (!result.success) {
          const errors = formatZodError(result.error);
          throw new ValidationError('Invalid route parameters', errors);
        }
        req.validated.params = result.data;
        req.params = result.data as any; // Express params are ParamsDictionary
      }

      // Validate query params
      if (options.query) {
        const result = options.query.safeParse(req.query);
        if (!result.success) {
          const errors = formatZodError(result.error);
          throw new ValidationError('Invalid query parameters', errors);
        }
        req.validated.query = result.data;
        // In test environments, req.query might be read-only
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      // Validate headers
      if (options.headers) {
        const result = options.headers.safeParse(req.headers);
        if (!result.success) {
          const errors = formatZodError(result.error);
          throw new ValidationError('Invalid request headers', errors);
        }
        req.validated.headers = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

function formatZodError(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });
  
  return errors;
}

// Common validation schemas
export const schemas = {
  // UUID validation
  uuid: z.string().uuid({ message: 'Invalid UUID format' }),
  
  // Email validation
  email: z.string().email({ message: 'Invalid email address' }).transform(val => val.toLowerCase()),
  
  // Phone validation (E.164 format)
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, { 
    message: 'Phone number must be in E.164 format (e.g., +1234567890)' 
  }),
  
  // Organization ID from headers
  organizationId: z.string().uuid({ message: 'Invalid organization ID' }),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: 'Start date must be before or equal to end date',
  }),
  
  // Money amount (in cents)
  money: z.number().int().min(0).max(999999999), // Max $9,999,999.99
  
  // Percentage (0-100)
  percentage: z.number().min(0).max(100),
  
  // URL validation
  url: z.string().url({ message: 'Invalid URL format' }),
  
  // Strong password
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
};

// Helper to create optional version of schema
export function optional<T extends ZodSchema>(schema: T) {
  return schema.optional();
}

// Helper to create nullable version of schema
export function nullable<T extends ZodSchema>(schema: T) {
  return schema.nullable();
}

// Helper to create array version of schema
export function array<T extends ZodSchema>(schema: T, options?: { min?: number; max?: number }) {
  let arraySchema = z.array(schema);
  if (options?.min !== undefined) {
    arraySchema = arraySchema.min(options.min);
  }
  if (options?.max !== undefined) {
    arraySchema = arraySchema.max(options.max);
  }
  return arraySchema;
}

// Middleware to require organization context
export function requireOrganizationContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const organizationId = req.headers['x-organization-id'] as string;
  
  if (!organizationId) {
    const errors = { 'x-organization-id': ['Header is required'] };
    return next(new ValidationError('Organization context required', errors));
  }
  
  try {
    schemas.organizationId.parse(organizationId);
    (req as any).organizationId = organizationId;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodError(error);
      next(new ValidationError('Invalid organization context', errors));
    } else {
      next(error);
    }
  }
}