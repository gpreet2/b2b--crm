/**
 * Request tracing utilities for TryZore Convex functions
 * Provides unique trace IDs and function execution tracking
 */

/**
 * Generates a unique trace ID for request tracking
 * Uses timestamp + random for uniqueness without requiring crypto
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Performance tracking for function execution
 */
export interface FunctionTrace {
  traceId: string;
  functionName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  userId?: string;
  organizationId?: string;
  success: boolean;
  error?: string;
}

/**
 * Creates a function trace for performance monitoring
 */
export function startTrace(
  functionName: string,
  traceId?: string,
  userId?: string,
  organizationId?: string
): FunctionTrace {
  return {
    traceId: traceId || generateTraceId(),
    functionName,
    startTime: Date.now(),
    userId,
    organizationId,
    success: false,
  };
}

/**
 * Completes a function trace with success/error status
 */
export function endTrace(trace: FunctionTrace, success: boolean, error?: string): FunctionTrace {
  const endTime = Date.now();
  return {
    ...trace,
    endTime,
    duration: endTime - trace.startTime,
    success,
    error,
  };
}

/**
 * Logs trace data to systemHealth table for monitoring
 */
export async function logTrace(trace: FunctionTrace, ctx: any): Promise<void> {
  try {
    await ctx.db.insert("systemHealth", {
      component: "convex_function",
      status: trace.success ? "healthy" : "unhealthy",
      responseTime: trace.duration || 0,
      errorRate: trace.success ? 0 : 1,
      details: {
        functionName: trace.functionName,
        traceId: trace.traceId,
        userId: trace.userId,
        organizationId: trace.organizationId,
        error: trace.error,
      },
      timestamp: trace.endTime || Date.now(),
    });
  } catch (logError) {
    // Don't let trace logging failure break the function
    console.error("Failed to log trace:", logError);
  }
}

/**
 * Creates trace context for correlation across function calls
 */
export interface TraceContext {
  traceId: string;
  parentTraceId?: string;
  depth: number;
  correlationData: {
    userId?: string;
    organizationId?: string;
    sessionId?: string;
    requestOrigin?: string;
  };
}

/**
 * Creates a new trace context
 */
export function createTraceContext(
  traceId?: string,
  parentTraceId?: string,
  userId?: string,
  organizationId?: string
): TraceContext {
  return {
    traceId: traceId || generateTraceId(),
    parentTraceId,
    depth: parentTraceId ? 1 : 0,
    correlationData: {
      userId,
      organizationId,
    },
  };
}

/**
 * Creates a child trace context for nested function calls
 */
export function createChildContext(parentContext: TraceContext): TraceContext {
  return {
    traceId: generateTraceId(),
    parentTraceId: parentContext.traceId,
    depth: parentContext.depth + 1,
    correlationData: parentContext.correlationData,
  };
}

/**
 * Extracts trace ID from various sources (headers, context, etc.)
 */
export function extractTraceId(request?: any): string | undefined {
  // Try to extract from request headers (for HTTP actions)
  if (request?.headers) {
    return request.headers["x-trace-id"] || 
           request.headers["trace-id"] ||
           request.headers["request-id"];
  }
  
  return undefined;
}

/**
 * Formats trace data for structured logging
 */
export function formatTraceLog(trace: FunctionTrace): Record<string, any> {
  return {
    traceId: trace.traceId,
    functionName: trace.functionName,
    duration: trace.duration,
    success: trace.success,
    timestamp: trace.endTime,
    userId: trace.userId,
    organizationId: trace.organizationId,
    error: trace.error,
  };
}

/**
 * Wrapper for timing function execution with automatic tracing
 */
export async function withTracing<T>(
  functionName: string,
  handler: (traceId: string) => Promise<T>,
  userId?: string,
  organizationId?: string,
  ctx?: any
): Promise<T> {
  const trace = startTrace(functionName, undefined, userId, organizationId);
  
  try {
    const result = await handler(trace.traceId);
    const completedTrace = endTrace(trace, true);
    
    if (ctx) {
      await logTrace(completedTrace, ctx);
    }
    
    return result;
  } catch (error) {
    const completedTrace = endTrace(trace, false, error instanceof Error ? error.message : String(error));
    
    if (ctx) {
      await logTrace(completedTrace, ctx);
    }
    
    throw error;
  }
}