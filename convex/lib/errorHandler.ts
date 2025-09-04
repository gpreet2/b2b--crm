/**
 * Centralized error handling for TryZore Convex functions
 * Provides consistent error processing, logging, and response formatting
 */

import { ConvexError, isConvexError } from "./errors";
import { generateTraceId } from "./tracing";

export interface ErrorContext {
  functionName: string;
  userId?: string;
  organizationId?: string;
  traceId: string;
  timestamp: number;
  args?: any;
  userAgent?: string;
  ipAddress?: string;
}

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    traceId: string;
    statusCode?: number;
  };
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  traceId: string;
}

export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Creates error context for tracking and debugging
 */
export function createErrorContext(
  functionName: string,
  args?: any,
  userId?: string,
  organizationId?: string,
  traceId?: string
): ErrorContext {
  return {
    functionName,
    userId,
    organizationId,
    traceId: traceId || generateTraceId(),
    timestamp: Date.now(),
    args,
  };
}

/**
 * Processes any error and converts it to a standardized ConvexError
 */
export function processError(error: unknown, context: ErrorContext): ConvexError {
  // If it's already a ConvexError, enrich it with trace ID if missing
  if (isConvexError(error)) {
    if (!error.traceId) {
      return new ConvexError(
        error.code,
        error.message,
        error.statusCode,
        error.details,
        context.traceId
      );
    }
    return error;
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return new ConvexError(
      "INTERNAL_ERROR",
      error.message || "An unexpected error occurred",
      500,
      {
        originalError: error.name,
        stack: error.stack,
        functionName: context.functionName,
      },
      context.traceId
    );
  }

  // Handle string errors
  if (typeof error === "string") {
    return new ConvexError(
      "INTERNAL_ERROR",
      error,
      500,
      { functionName: context.functionName },
      context.traceId
    );
  }

  // Handle unknown error types
  return new ConvexError(
    "UNKNOWN_ERROR",
    "An unknown error occurred",
    500,
    { 
      originalError: String(error),
      functionName: context.functionName,
    },
    context.traceId
  );
}

/**
 * Logs error to audit logs table for debugging and monitoring
 */
export async function logError(
  error: ConvexError,
  context: ErrorContext,
  ctx: any // Convex context
): Promise<void> {
  try {
    await ctx.db.insert("auditLogs", {
      userId: context.userId,
      organizationId: context.organizationId,
      action: "error_occurred",
      resourceType: "system",
      resourceId: context.functionName,
      details: {
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
          stack: error.stack?.split('\n').slice(0, 5), // Limit stack trace
        },
        context: {
          functionName: context.functionName,
          args: context.args,
          timestamp: context.timestamp,
        },
        traceId: context.traceId,
      },
      severity: getSeverityFromError(error),
      source: "error_handler",
      timestamp: context.timestamp,
    });
  } catch (auditError) {
    // Don't let audit logging failure break the error response
    console.error("Failed to log error to audit:", auditError);
  }
}

/**
 * Determines error severity based on error type and status code
 */
function getSeverityFromError(error: ConvexError): "info" | "warning" | "error" {
  if (error.statusCode >= 500) return "error";
  if (error.statusCode >= 400) return "warning";
  return "info";
}

/**
 * Formats error for client response
 */
export function formatErrorResponse(error: ConvexError): StandardErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      traceId: error.traceId || generateTraceId(),
      statusCode: error.statusCode,
    },
  };
}

/**
 * Formats success response with trace ID
 */
export function formatSuccessResponse<T>(data: T, traceId: string): StandardSuccessResponse<T> {
  return {
    success: true,
    data,
    traceId,
  };
}

/**
 * Main error handler wrapper for Convex queries
 */
export function withErrorHandling<TArgs extends Record<string, any>, TReturn>(
  handler: (ctx: any, args: TArgs) => Promise<TReturn>,
  functionName: string
) {
  return async (ctx: any, args: TArgs): Promise<StandardResponse<TReturn>> => {
    const context = createErrorContext(functionName, args);
    
    try {
      // Execute the handler
      const result = await handler(ctx, args);
      
      // Return success response
      return formatSuccessResponse(result, context.traceId);
      
    } catch (error) {
      // Process and log the error
      const processedError = processError(error, context);
      await logError(processedError, context, ctx);
      
      // Return error response
      return formatErrorResponse(processedError);
    }
  };
}

/**
 * Error handler wrapper for Convex mutations with user context
 */
export function withErrorHandlingMutation<TArgs extends Record<string, any>, TReturn>(
  handler: (ctx: any, args: TArgs) => Promise<TReturn>,
  functionName: string
) {
  return async (ctx: any, args: TArgs): Promise<StandardResponse<TReturn>> => {
    // Try to get user context for better error tracking
    let userId: string | undefined;
    let organizationId: string | undefined;
    
    try {
      // Attempt to get current user (this might fail if not authenticated)
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
          .first();
        
        if (user) {
          userId = user._id;
          organizationId = user.organizationId;
        }
      }
    } catch (authError) {
      // User might not be authenticated - continue without user context
    }
    
    const context = createErrorContext(functionName, args, userId, organizationId);
    
    try {
      // Execute the handler
      const result = await handler(ctx, args);
      
      // Log successful operation to audit trail
      if (userId) {
        await ctx.db.insert("auditLogs", {
          userId,
          organizationId,
          action: "function_executed",
          resourceType: "function",
          resourceId: functionName,
          details: {
            traceId: context.traceId,
            success: true,
          },
          severity: "info",
          source: "function_handler",
          timestamp: context.timestamp,
        });
      }
      
      // Return success response
      return formatSuccessResponse(result, context.traceId);
      
    } catch (error) {
      // Process and log the error
      const processedError = processError(error, context);
      await logError(processedError, context, ctx);
      
      // Return error response
      return formatErrorResponse(processedError);
    }
  };
}

/**
 * Validation helper that throws ValidationError
 */
export function validateRequired<T>(
  value: T | undefined | null,
  fieldName: string,
  traceId?: string
): T {
  if (value === undefined || value === null) {
    throw new (require("./errors").ValidationError)(
      `${fieldName} is required`,
      fieldName,
      undefined,
      traceId
    );
  }
  return value;
}

/**
 * Permission validation helper that throws AuthorizationError
 */
export function requirePermission(
  hasPermission: boolean,
  permission: string,
  traceId?: string
): void {
  if (!hasPermission) {
    throw new (require("./errors").AuthorizationError)(
      `Permission required: ${permission}`,
      permission,
      undefined,
      traceId
    );
  }
}

/**
 * Resource existence helper that throws ResourceNotFoundError
 */
export function requireResource<T>(
  resource: T | null | undefined,
  resourceType: string,
  id?: string,
  traceId?: string
): T {
  if (!resource) {
    throw new (require("./errors").ResourceNotFoundError)(
      resourceType,
      id,
      undefined,
      traceId
    );
  }
  return resource;
}