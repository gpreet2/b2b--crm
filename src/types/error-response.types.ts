/**
 * Standard error response format for all API errors
 */
export interface ErrorResponse {
  error: {
    /**
     * Unique error code for this type of error
     * @example "VALIDATION_ERROR", "AUTH_FAILED", "RESOURCE_NOT_FOUND"
     */
    code: string;
    
    /**
     * Human-readable error message
     * @example "The requested resource was not found"
     */
    message: string;
    
    /**
     * HTTP status code
     * @example 404
     */
    statusCode: number;
    
    /**
     * ISO 8601 timestamp when error occurred
     * @example "2023-12-01T12:00:00.000Z"
     */
    timestamp: string;
    
    /**
     * Request path where error occurred
     * @example "/api/users/123"
     */
    path?: string;
    
    /**
     * HTTP method used
     * @example "GET", "POST", "PUT", "DELETE"
     */
    method?: string;
    
    /**
     * Unique request ID for tracing
     * @example "550e8400-e29b-41d4-a716-446655440000"
     */
    requestId?: string;
    
    /**
     * Additional error details (only in development)
     * Can include validation errors, field-specific errors, etc.
     */
    details?: any;
    
    /**
     * Stack trace (only in development)
     */
    stack?: string;
    
    /**
     * Sentry event ID (only in non-production for debugging)
     */
    sentryId?: string;
  };
}

/**
 * Validation error details structure
 */
export interface ValidationErrorDetails {
  /**
   * Field-specific validation errors
   * @example { "email": ["Invalid email format"], "age": ["Must be 18 or older"] }
   */
  fields?: Record<string, string[]>;
  
  /**
   * General validation messages not tied to specific fields
   */
  general?: string[];
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  /**
   * Response data
   */
  data: T;
  
  /**
   * Optional metadata
   */
  meta?: ResponseMetadata;
}

/**
 * Response metadata for pagination, etc.
 */
export interface ResponseMetadata {
  /**
   * Request ID for tracing
   */
  requestId?: string;
  
  /**
   * Pagination info
   */
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  /**
   * Response timestamp
   */
  timestamp?: string;
  
  /**
   * Allow additional metadata fields
   */
  [key: string]: unknown;
}

/**
 * Error code constants
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  GONE: 'GONE',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Authentication/Authorization
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  MFA_REQUIRED: 'MFA_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * HTTP status code mapping
 */
export const StatusCodes = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

export type StatusCode = typeof StatusCodes[keyof typeof StatusCodes];