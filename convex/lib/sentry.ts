/**
 * Sentry integration for Convex functions in TryZore
 * Provides error tracking and performance monitoring for server-side functions
 * Note: Uses HTTP API instead of Node.js SDK due to Convex Deno runtime
 */

import { ConvexError, isConvexError } from "./errors";
import { generateTraceId } from "./tracing";

// Initialize Sentry for Convex runtime using HTTP API
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_PROJECT_ID = process.env.SENTRY_PROJECT_ID;
const SENTRY_KEY = process.env.SENTRY_KEY;

export interface ConvexSentryContext {
  userId?: string;
  organizationId?: string;
  functionName: string;
  traceId: string;
  args?: any;
}

interface SentryEvent {
  event_id: string;
  timestamp: number;
  level: "info" | "warning" | "error" | "debug";
  logger?: string;
  platform: string;
  tags?: Record<string, string>;
  user?: {
    id?: string;
    username?: string;
  };
  contexts?: {
    convex?: {
      functionName: string;
      args?: any;
      traceId: string;
      timestamp: string;
    };
  };
  fingerprint?: string[];
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename?: string;
          function?: string;
          lineno?: number;
          colno?: number;
        }>;
      };
    }>;
  };
  message?: {
    formatted: string;
  };
}

/**
 * Sends event to Sentry using HTTP API (compatible with Convex Deno runtime)
 */
async function sendToSentry(event: SentryEvent): Promise<string | null> {
  if (!SENTRY_DSN) return null;

  try {
    const response = await fetch(`${SENTRY_DSN.replace(/\/\d+$/, '')}/api/${SENTRY_PROJECT_ID || '0'}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=convex-client/1.0.0, sentry_key=${SENTRY_KEY}`,
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      return event.event_id;
    } else {
      console.error('Failed to send event to Sentry:', response.status, await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error sending event to Sentry:', error);
    return null;
  }
}

/**
 * Generates a Sentry event ID
 */
function generateEventId(): string {
  return generateTraceId().replace(/-/g, '');
}

/**
 * Parses error stack trace
 */
function parseStackTrace(error: Error): Array<{ filename?: string; function?: string; lineno?: number; colno?: number }> {
  if (!error.stack) return [];
  
  return error.stack
    .split('\n')
    .slice(1) // Remove error message line
    .map(line => {
      const match = line.match(/\s+at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3]),
          colno: parseInt(match[4]),
        };
      }
      return {};
    })
    .filter(frame => Object.keys(frame).length > 0);
}

/**
 * Captures error to Sentry with Convex-specific context
 */
export async function captureConvexError(
  error: Error,
  context: ConvexSentryContext
): Promise<string | null> {
  if (!SENTRY_DSN) return null;

  // Don't send expected business logic errors
  if (isConvexError(error)) {
    // Only send server errors and circuit breaker errors to Sentry
    if (error.statusCode < 500 && !error.code.includes("CIRCUIT_BREAKER")) {
      return null;
    }
  }

  const event: SentryEvent = {
    event_id: generateEventId(),
    timestamp: Date.now() / 1000,
    level: isConvexError(error) && error.statusCode >= 500 ? "error" : 
           isConvexError(error) && error.statusCode >= 400 ? "warning" : "error",
    platform: "javascript",
    logger: "convex-error-handler",
    tags: {
      functionName: context.functionName,
      traceId: context.traceId,
      organizationId: context.organizationId || "unknown",
      component: "convex",
      runtime: "deno",
    },
    user: context.userId ? {
      id: context.userId,
      username: context.userId,
    } : undefined,
    contexts: {
      convex: {
        functionName: context.functionName,
        args: context.args,
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
      },
    },
    fingerprint: isConvexError(error) ? [
      context.functionName,
      error.code,
      error.message.split(" ").slice(0, 5).join(" "), // First 5 words
    ] : [context.functionName, error.name, error.message],
    exception: {
      values: [{
        type: error.name,
        value: error.message,
        stacktrace: {
          frames: parseStackTrace(error),
        },
      }],
    },
  };

  return await sendToSentry(event);
}

/**
 * Captures message to Sentry with context
 */
export async function captureConvexMessage(
  message: string,
  level: "info" | "warning" | "error",
  context: ConvexSentryContext
): Promise<string | null> {
  if (!SENTRY_DSN) return null;

  const event: SentryEvent = {
    event_id: generateEventId(),
    timestamp: Date.now() / 1000,
    level,
    platform: "javascript",
    logger: "convex-message-handler",
    tags: {
      functionName: context.functionName,
      traceId: context.traceId,
      organizationId: context.organizationId || "unknown",
      component: "convex",
      runtime: "deno",
    },
    user: context.userId ? {
      id: context.userId,
      username: context.userId,
    } : undefined,
    contexts: {
      convex: {
        functionName: context.functionName,
        args: context.args,
        traceId: context.traceId,
        timestamp: new Date().toISOString(),
      },
    },
    message: {
      formatted: message,
    },
  };

  return await sendToSentry(event);
}

/**
 * Simple transaction tracking for performance monitoring
 */
export function startConvexTransaction(
  functionName: string,
  operation: string = "convex.function"
): { finish: (status?: string) => void; setTag: (key: string, value: string) => void; setStatus: (status: string) => void } | null {
  if (!SENTRY_DSN) return null;

  const startTime = Date.now();
  
  return {
    finish: (status = "ok") => {
      // Could send transaction data to Sentry here
      const duration = Date.now() - startTime;
      console.log(`Transaction ${functionName} completed in ${duration}ms with status ${status}`);
    },
    setTag: (key: string, value: string) => {
      // Store tag for transaction
    },
    setStatus: (status: string) => {
      // Store status for transaction
    },
  };
}

/**
 * Simple breadcrumb logging
 */
export function addConvexBreadcrumb(
  message: string,
  category: string = "convex",
  level: "info" | "warning" | "error" | "debug" = "info",
  data?: any
): void {
  if (!SENTRY_DSN) return;
  
  // For now, just log breadcrumbs to console in development
  if (process.env.CONVEX_ENVIRONMENT !== "production") {
    console.log(`[${category}] ${level}: ${message}`, data ? JSON.stringify(data) : '');
  }
}

/**
 * Wrapper for Convex functions with Sentry performance monitoring
 */
export function withSentryTracing<TArgs, TReturn>(
  functionName: string,
  handler: (ctx: any, args: TArgs) => Promise<TReturn>
) {
  return async (ctx: any, args: TArgs): Promise<TReturn> => {
    const traceId = generateTraceId();
    const transaction = startConvexTransaction(functionName);
    
    // Add breadcrumb for function start
    addConvexBreadcrumb(`Starting function: ${functionName}`, "function", "info", {
      traceId,
      args: typeof args === "object" ? Object.keys(args || {}).length : "primitive",
    });

    try {
      // Execute the handler
      const result = await handler(ctx, args);
      
      // Mark transaction as successful
      if (transaction) {
        transaction.setStatus("ok");
        transaction.finish();
      }
      
      // Add success breadcrumb
      addConvexBreadcrumb(`Function completed: ${functionName}`, "function", "info", {
        traceId,
        success: true,
      });
      
      return result;
      
    } catch (error) {
      // Capture error to Sentry
      const sentryEventId = await captureConvexError(error instanceof Error ? error : new Error(String(error)), {
        functionName,
        traceId,
        args,
      });

      // Mark transaction as failed
      if (transaction) {
        transaction.setStatus("internal_error");
        if (sentryEventId) {
          transaction.setTag("sentryEventId", sentryEventId);
        }
        transaction.finish();
      }

      // Add error breadcrumb
      addConvexBreadcrumb(`Function failed: ${functionName}`, "function", "error", {
        traceId,
        error: error instanceof Error ? error.message : String(error),
        sentryEventId,
      });

      throw error;
    }
  };
}

/**
 * Enhanced error handler with Sentry integration
 */
export function withSentryErrorHandling<TArgs, TReturn>(
  functionName: string,
  handler: (ctx: any, args: TArgs) => Promise<TReturn>
) {
  return async (ctx: any, args: TArgs): Promise<TReturn> => {
    const traceId = generateTraceId();
    let userId: string | undefined;
    let organizationId: string | undefined;
    
    try {
      // Try to get user context
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
    } catch {
      // Continue without user context if auth fails
    }

    const sentryContext: ConvexSentryContext = {
      functionName,
      traceId,
      userId,
      organizationId,
      args,
    };

    try {
      // Execute handler
      const result = await handler(ctx, args);
      
      return result;
      
    } catch (error) {
      // Capture to Sentry
      await captureConvexError(
        error instanceof Error ? error : new Error(String(error)),
        sentryContext
      );
      
      throw error;
    }
  };
}

/**
 * Flushes any pending Sentry events (useful for testing)
 */
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
  if (!SENTRY_DSN) return true;
  
  // For HTTP API, events are sent immediately, so just return true
  return true;
}