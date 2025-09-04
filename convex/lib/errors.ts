/**
 * Custom error classes for TryZore Convex functions
 * Provides consistent error handling patterns across the platform
 */

export interface ConvexErrorDetails {
  [key: string]: any;
}

export class ConvexError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ConvexErrorDetails;
  public readonly traceId?: string;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super(message);
    this.name = "ConvexError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.traceId = traceId;

    // Maintain proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, ConvexError);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      traceId: this.traceId,
      stack: this.stack,
    };
  }
}

export class ValidationError extends ConvexError {
  constructor(
    message: string,
    field?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("VALIDATION_ERROR", message, 400, { field, ...details }, traceId);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends ConvexError {
  constructor(
    message: string = "Access denied",
    requiredPermission?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("AUTHORIZATION_ERROR", message, 403, { requiredPermission, ...details }, traceId);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends ConvexError {
  constructor(
    message: string = "Authentication required",
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("AUTHENTICATION_ERROR", message, 401, details, traceId);
    this.name = "AuthenticationError";
  }
}

export class ResourceNotFoundError extends ConvexError {
  constructor(
    resource: string,
    id?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    
    super("RESOURCE_NOT_FOUND", message, 404, { resource, id, ...details }, traceId);
    this.name = "ResourceNotFoundError";
  }
}

export class BusinessLogicError extends ConvexError {
  constructor(
    message: string,
    businessRule?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("BUSINESS_LOGIC_ERROR", message, 422, { businessRule, ...details }, traceId);
    this.name = "BusinessLogicError";
  }
}

export class ExternalServiceError extends ConvexError {
  public readonly serviceName: string;
  public readonly originalError?: Error;

  constructor(
    serviceName: string,
    message: string,
    originalError?: Error,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super(
      "EXTERNAL_SERVICE_ERROR", 
      `${serviceName}: ${message}`, 
      503, 
      { serviceName, originalError: originalError?.message, ...details }, 
      traceId
    );
    this.name = "ExternalServiceError";
    this.serviceName = serviceName;
    this.originalError = originalError;
  }
}

export class RateLimitError extends ConvexError {
  public readonly retryAfter: number;

  constructor(
    message: string = "Rate limit exceeded",
    retryAfter: number = 60,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("RATE_LIMIT_ERROR", message, 429, { retryAfter, ...details }, traceId);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ConfigurationError extends ConvexError {
  constructor(
    message: string,
    configKey?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("CONFIGURATION_ERROR", message, 500, { configKey, ...details }, traceId);
    this.name = "ConfigurationError";
  }
}

export class CircuitBreakerError extends ConvexError {
  public readonly serviceName: string;
  public readonly state: "open" | "half_open";

  constructor(
    serviceName: string,
    state: "open" | "half_open",
    message?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    const defaultMessage = `Circuit breaker for ${serviceName} is ${state}`;
    super(
      "CIRCUIT_BREAKER_ERROR", 
      message || defaultMessage, 
      503, 
      { serviceName, state, ...details }, 
      traceId
    );
    this.name = "CircuitBreakerError";
    this.serviceName = serviceName;
    this.state = state;
  }
}

export class DataIntegrityError extends ConvexError {
  constructor(
    message: string,
    constraint?: string,
    details?: ConvexErrorDetails,
    traceId?: string
  ) {
    super("DATA_INTEGRITY_ERROR", message, 409, { constraint, ...details }, traceId);
    this.name = "DataIntegrityError";
  }
}

// Type guard to check if error is a ConvexError
export function isConvexError(error: unknown): error is ConvexError {
  return error instanceof ConvexError;
}

// Error factory functions for common patterns
export const ErrorFactory = {
  validation: (message: string, field?: string, traceId?: string) =>
    new ValidationError(message, field, undefined, traceId),

  unauthorized: (requiredPermission?: string, traceId?: string) =>
    new AuthorizationError("Unauthorized access", requiredPermission, undefined, traceId),

  unauthenticated: (traceId?: string) =>
    new AuthenticationError("Authentication required", undefined, traceId),

  notFound: (resource: string, id?: string, traceId?: string) =>
    new ResourceNotFoundError(resource, id, undefined, traceId),

  businessRule: (message: string, rule?: string, traceId?: string) =>
    new BusinessLogicError(message, rule, undefined, traceId),

  externalService: (service: string, message: string, originalError?: Error, traceId?: string) =>
    new ExternalServiceError(service, message, originalError, undefined, traceId),

  rateLimit: (retryAfter?: number, traceId?: string) =>
    new RateLimitError("Rate limit exceeded", retryAfter, undefined, traceId),

  circuitBreaker: (service: string, state: "open" | "half_open", traceId?: string) =>
    new CircuitBreakerError(service, state, undefined, undefined, traceId),

  dataIntegrity: (message: string, constraint?: string, traceId?: string) =>
    new DataIntegrityError(message, constraint, undefined, traceId),
};

// Error code constants for consistency
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR", 
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  CIRCUIT_BREAKER_ERROR: "CIRCUIT_BREAKER_ERROR",
  DATA_INTEGRITY_ERROR: "DATA_INTEGRITY_ERROR",
} as const;