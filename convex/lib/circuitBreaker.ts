/**
 * Circuit breaker implementation for TryZore external service calls
 * Provides resilience patterns for WorkOS, Stripe, Kisi, and other external APIs
 */

import { CircuitBreakerError, ExternalServiceError } from "./errors";
import { generateTraceId } from "./tracing";

export type CircuitBreakerState = "closed" | "open" | "half_open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number; // milliseconds
  monitoringWindow: number; // milliseconds
}

export interface CircuitBreakerMetrics {
  successCount: number;
  failureCount: number;
  timeoutCount: number;
  consecutiveFailures: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
}

/**
 * Default circuit breaker configurations for different services
 */
export const DEFAULT_CONFIGS: Record<string, CircuitBreakerConfig> = {
  workos: {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringWindow: 300000, // 5 minutes
  },
  stripe: {
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringWindow: 180000, // 3 minutes
  },
  kisi: {
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringWindow: 180000, // 3 minutes
  },
  email: {
    failureThreshold: 10,
    recoveryTimeout: 120000, // 2 minutes
    monitoringWindow: 600000, // 10 minutes
  },
  default: {
    failureThreshold: 5,
    recoveryTimeout: 60000,
    monitoringWindow: 300000,
  },
};

/**
 * Gets circuit breaker state from database
 */
async function getCircuitBreakerState(
  ctx: any,
  serviceName: string,
  organizationId?: string
): Promise<{
  state: CircuitBreakerState;
  failureCount: number;
  lastFailure?: number;
  lastSuccess?: number;
  nextRetryAt?: number;
  config: CircuitBreakerConfig;
}> {
  let breaker = await ctx.db
    .query("circuitBreakers")
    .withIndex("by_org_and_service", (q) =>
      q.eq("organizationId", organizationId).eq("serviceName", serviceName)
    )
    .first();

  // If no breaker exists, create one with default config
  if (!breaker) {
    const config = DEFAULT_CONFIGS[serviceName] || DEFAULT_CONFIGS.default;
    const newBreakerId = await ctx.db.insert("circuitBreakers", {
      serviceName,
      organizationId,
      state: "closed",
      failureCount: 0,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    breaker = await ctx.db.get(newBreakerId);
  }

  return breaker!;
}

/**
 * Updates circuit breaker state in database
 */
async function updateCircuitBreakerState(
  ctx: any,
  serviceName: string,
  updates: {
    state?: CircuitBreakerState;
    failureCount?: number;
    lastFailure?: number;
    lastSuccess?: number;
    nextRetryAt?: number;
  },
  organizationId?: string
): Promise<void> {
  const breaker = await ctx.db
    .query("circuitBreakers")
    .withIndex("by_org_and_service", (q) =>
      q.eq("organizationId", organizationId).eq("serviceName", serviceName)
    )
    .first();

  if (breaker) {
    await ctx.db.patch(breaker._id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Records success in circuit breaker
 */
async function recordSuccess(
  ctx: any,
  serviceName: string,
  organizationId?: string,
  traceId?: string
): Promise<void> {
  const now = Date.now();
  
  await updateCircuitBreakerState(ctx, serviceName, {
    state: "closed",
    failureCount: 0,
    lastSuccess: now,
    nextRetryAt: undefined,
  }, organizationId);

  // Log success to audit trail
  await ctx.db.insert("auditLogs", {
    organizationId,
    action: "circuit_breaker_success",
    resourceType: "external_service",
    resourceId: serviceName,
    details: {
      traceId,
      timestamp: now,
    },
    severity: "info",
    source: "circuit_breaker",
    timestamp: now,
  });
}

/**
 * Records failure in circuit breaker
 */
async function recordFailure(
  ctx: any,
  serviceName: string,
  error: Error,
  organizationId?: string,
  traceId?: string
): Promise<void> {
  const now = Date.now();
  const breakerState = await getCircuitBreakerState(ctx, serviceName, organizationId);
  const newFailureCount = breakerState.failureCount + 1;
  
  // Determine new state based on failure count
  let newState: CircuitBreakerState = breakerState.state;
  let nextRetryAt: number | undefined = undefined;
  
  if (newFailureCount >= breakerState.config.failureThreshold) {
    newState = "open";
    nextRetryAt = now + breakerState.config.recoveryTimeout;
  }

  await updateCircuitBreakerState(ctx, serviceName, {
    state: newState,
    failureCount: newFailureCount,
    lastFailure: now,
    nextRetryAt,
  }, organizationId);

  // Log failure to audit trail
  await ctx.db.insert("auditLogs", {
    organizationId,
    action: "circuit_breaker_failure",
    resourceType: "external_service",
    resourceId: serviceName,
    details: {
      traceId,
      error: error.message,
      failureCount: newFailureCount,
      newState,
      nextRetryAt,
      timestamp: now,
    },
    severity: newState === "open" ? "error" : "warning",
    source: "circuit_breaker",
    timestamp: now,
  });
}

/**
 * Checks if circuit breaker allows request
 */
async function shouldAllowRequest(
  ctx: any,
  serviceName: string,
  organizationId?: string
): Promise<boolean> {
  const breakerState = await getCircuitBreakerState(ctx, serviceName, organizationId);
  const now = Date.now();

  switch (breakerState.state) {
    case "closed":
      return true;

    case "open":
      // Check if recovery timeout has elapsed
      if (breakerState.nextRetryAt && now >= breakerState.nextRetryAt) {
        // Transition to half-open for testing
        await updateCircuitBreakerState(ctx, serviceName, {
          state: "half_open",
          nextRetryAt: undefined,
        }, organizationId);
        return true;
      }
      return false;

    case "half_open":
      // Allow one request to test the service
      return true;

    default:
      return true;
  }
}

/**
 * Main circuit breaker wrapper for external service calls
 */
export async function withCircuitBreaker<T>(
  ctx: any,
  serviceName: string,
  operation: () => Promise<T>,
  organizationId?: string,
  traceId?: string,
  timeout?: number
): Promise<T> {
  const currentTraceId = traceId || generateTraceId();
  
  // Check if request is allowed
  const allowed = await shouldAllowRequest(ctx, serviceName, organizationId);
  
  if (!allowed) {
    const breakerState = await getCircuitBreakerState(ctx, serviceName, organizationId);
    throw new CircuitBreakerError(
      serviceName,
      breakerState.state as "open" | "half_open",
      undefined,
      {
        nextRetryAt: breakerState.nextRetryAt,
        failureCount: breakerState.failureCount,
      },
      currentTraceId
    );
  }

  try {
    // Execute operation with optional timeout
    let result: T;
    
    if (timeout && timeout > 0) {
      result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Operation timeout")), timeout)
        ),
      ]);
    } else {
      result = await operation();
    }

    // Record success
    await recordSuccess(ctx, serviceName, organizationId, currentTraceId);
    
    return result;
    
  } catch (error) {
    // Record failure
    const errorObj = error instanceof Error ? error : new Error(String(error));
    await recordFailure(ctx, serviceName, errorObj, organizationId, currentTraceId);
    
    // Re-throw as ExternalServiceError
    throw new ExternalServiceError(
      serviceName,
      errorObj.message,
      errorObj,
      undefined,
      currentTraceId
    );
  }
}

/**
 * Gets circuit breaker status for monitoring
 */
export async function getCircuitBreakerStatus(
  ctx: any,
  serviceName?: string,
  organizationId?: string
): Promise<{
  serviceName: string;
  state: CircuitBreakerState;
  failureCount: number;
  config: CircuitBreakerConfig;
  lastFailure?: number;
  lastSuccess?: number;
  nextRetryAt?: number;
  healthStatus: "healthy" | "degraded" | "unhealthy";
}[]> {
  let query = ctx.db.query("circuitBreakers");
  
  if (serviceName) {
    if (organizationId) {
      query = query.withIndex("by_org_and_service", (q) =>
        q.eq("organizationId", organizationId).eq("serviceName", serviceName)
      );
    } else {
      query = query.withIndex("by_service", (q) => q.eq("serviceName", serviceName));
    }
  }
  
  const breakers = await query.collect();
  
  return breakers.map((breaker) => {
    let healthStatus: "healthy" | "degraded" | "unhealthy";
    
    if (breaker.state === "open") {
      healthStatus = "unhealthy";
    } else if (breaker.state === "half_open" || breaker.failureCount > 0) {
      healthStatus = "degraded";
    } else {
      healthStatus = "healthy";
    }
    
    return {
      serviceName: breaker.serviceName,
      state: breaker.state,
      failureCount: breaker.failureCount,
      config: breaker.config,
      lastFailure: breaker.lastFailure,
      lastSuccess: breaker.lastSuccess,
      nextRetryAt: breaker.nextRetryAt,
      healthStatus,
    };
  });
}

/**
 * Resets circuit breaker for a service (admin function)
 */
export async function resetCircuitBreaker(
  ctx: any,
  serviceName: string,
  organizationId?: string,
  traceId?: string
): Promise<void> {
  await updateCircuitBreakerState(ctx, serviceName, {
    state: "closed",
    failureCount: 0,
    lastFailure: undefined,
    nextRetryAt: undefined,
  }, organizationId);

  // Log reset action
  await ctx.db.insert("auditLogs", {
    organizationId,
    action: "circuit_breaker_reset",
    resourceType: "external_service",
    resourceId: serviceName,
    details: {
      traceId: traceId || generateTraceId(),
      timestamp: Date.now(),
    },
    severity: "info",
    source: "admin_action",
    timestamp: Date.now(),
  });
}