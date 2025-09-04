/**
 * Resilient action wrapper for external service calls in TryZore
 * Combines circuit breaker, retry logic, fallback strategies, and dead letter queue
 */

import { withCircuitBreaker } from "./circuitBreaker";
import { ExternalServiceError, ConfigurationError } from "./errors";
import { generateTraceId } from "./tracing";

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors?: string[]; // HTTP status codes or error types
}

export interface FallbackConfig<T> {
  enabled: boolean;
  fallbackValue?: T;
  fallbackFunction?: () => Promise<T>;
  gracefulDegradation?: boolean;
}

export interface ResilientActionConfig<T> {
  serviceName: string;
  timeout?: number;
  retry?: RetryConfig;
  fallback?: FallbackConfig<T>;
  enableDeadLetterQueue?: boolean;
  organizationId?: string;
}

/**
 * Default retry configurations for different service types
 */
export const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  workos: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ["500", "502", "503", "504", "timeout"],
  },
  stripe: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ["500", "502", "503", "504", "timeout"],
  },
  kisi: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    retryableErrors: ["500", "502", "503", "504", "timeout"],
  },
  email: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    retryableErrors: ["500", "502", "503", "504", "timeout", "rate_limit"],
  },
  default: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ["500", "502", "503", "504", "timeout"],
  },
};

/**
 * Determines if an error is retryable based on configuration
 */
function isRetryableError(error: Error, retryableErrors?: string[]): boolean {
  if (!retryableErrors) return false;
  
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  
  return retryableErrors.some((retryableError) => {
    const checkError = retryableError.toLowerCase();
    return (
      errorMessage.includes(checkError) ||
      errorName.includes(checkError) ||
      (error as any).status?.toString() === retryableError ||
      (error as any).statusCode?.toString() === retryableError
    );
  });
}

/**
 * Calculates delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * 0.1 * Math.random();
  return Math.floor(cappedDelay + jitter);
}

/**
 * Adds failed operation to dead letter queue for later processing
 */
async function addToDeadLetterQueue(
  ctx: any,
  config: ResilientActionConfig<any>,
  operation: string,
  payload: any,
  error: Error,
  attemptCount: number,
  traceId: string
): Promise<void> {
  if (!config.enableDeadLetterQueue) return;
  
  try {
    await ctx.db.insert("deadLetterQueue", {
      jobType: `${config.serviceName}_${operation}`,
      payload: {
        operation,
        payload,
        traceId,
        config: {
          serviceName: config.serviceName,
          organizationId: config.organizationId,
        },
      },
      originalError: error.message,
      attemptCount,
      organizationId: config.organizationId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log to audit trail
    await ctx.db.insert("auditLogs", {
      organizationId: config.organizationId,
      action: "dead_letter_queue_add",
      resourceType: "external_service",
      resourceId: config.serviceName,
      details: {
        operation,
        traceId,
        error: error.message,
        attemptCount,
        timestamp: Date.now(),
      },
      severity: "warning",
      source: "resilient_action",
      timestamp: Date.now(),
    });
  } catch (dlqError) {
    // Don't let DLQ failure break the error flow
    console.error("Failed to add to dead letter queue:", dlqError);
  }
}

/**
 * Executes fallback strategy when primary operation fails
 */
async function executeFallback<T>(
  config: ResilientActionConfig<T>,
  error: Error,
  traceId: string
): Promise<T> {
  if (!config.fallback?.enabled) {
    throw error;
  }

  try {
    if (config.fallback.fallbackFunction) {
      return await config.fallback.fallbackFunction();
    }
    
    if (config.fallback.fallbackValue !== undefined) {
      return config.fallback.fallbackValue;
    }
    
    // If graceful degradation is enabled, return a safe default
    if (config.fallback.gracefulDegradation) {
      return null as T;
    }
    
    throw error;
  } catch (fallbackError) {
    // If fallback also fails, throw the original error
    throw new ExternalServiceError(
      config.serviceName,
      `Primary operation failed and fallback failed: ${error.message}`,
      error,
      {
        fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      },
      traceId
    );
  }
}

/**
 * Main resilient action wrapper with circuit breaker, retry, and fallback
 */
export async function withResilientAction<T>(
  ctx: any,
  config: ResilientActionConfig<T>,
  operation: () => Promise<T>,
  operationName: string = "external_call"
): Promise<T> {
  const traceId = generateTraceId();
  const retryConfig = DEFAULT_RETRY_CONFIGS[config.serviceName] || DEFAULT_RETRY_CONFIGS.default;
  
  // Merge with custom retry config if provided
  const finalRetryConfig = { ...retryConfig, ...config.retry };
  
  let lastError: Error | null = null;
  let attempt = 0;

  // Retry loop
  while (attempt <= finalRetryConfig.maxRetries) {
    attempt++;
    
    try {
      // Execute operation with circuit breaker protection
      const result = await withCircuitBreaker(
        ctx,
        config.serviceName,
        operation,
        config.organizationId,
        traceId,
        config.timeout
      );
      
      // Log successful operation
      await ctx.db.insert("auditLogs", {
        organizationId: config.organizationId,
        action: "resilient_action_success",
        resourceType: "external_service",
        resourceId: config.serviceName,
        details: {
          operation: operationName,
          traceId,
          attempt,
          timestamp: Date.now(),
        },
        severity: "info",
        source: "resilient_action",
        timestamp: Date.now(),
      });
      
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const shouldRetry = attempt < finalRetryConfig.maxRetries && 
                         isRetryableError(lastError, finalRetryConfig.retryableErrors);
      
      if (!shouldRetry) {
        break;
      }
      
      // Calculate delay and wait before retry
      const delay = calculateDelay(
        attempt,
        finalRetryConfig.baseDelay,
        finalRetryConfig.maxDelay,
        finalRetryConfig.backoffMultiplier
      );
      
      // Log retry attempt
      await ctx.db.insert("auditLogs", {
        organizationId: config.organizationId,
        action: "resilient_action_retry",
        resourceType: "external_service",
        resourceId: config.serviceName,
        details: {
          operation: operationName,
          traceId,
          attempt,
          error: lastError.message,
          nextRetryIn: delay,
          timestamp: Date.now(),
        },
        severity: "warning",
        source: "resilient_action",
        timestamp: Date.now(),
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted, add to dead letter queue if enabled
  if (lastError) {
    await addToDeadLetterQueue(
      ctx,
      config,
      operationName,
      {}, // Could include serialized operation arguments
      lastError,
      attempt,
      traceId
    );
  }

  // Execute fallback or throw error
  if (config.fallback?.enabled) {
    return await executeFallback(config, lastError!, traceId);
  }
  
  throw new ExternalServiceError(
    config.serviceName,
    `Operation failed after ${finalRetryConfig.maxRetries} retries: ${lastError?.message}`,
    lastError!,
    {
      operation: operationName,
      totalAttempts: attempt,
      finalError: lastError?.message,
    },
    traceId
  );
}

/**
 * Convenience wrapper for WorkOS operations
 */
export async function withWorkOSAction<T>(
  ctx: any,
  operation: () => Promise<T>,
  organizationId?: string,
  operationName: string = "workos_call",
  fallback?: FallbackConfig<T>
): Promise<T> {
  return withResilientAction(
    ctx,
    {
      serviceName: "workos",
      timeout: 30000,
      enableDeadLetterQueue: true,
      organizationId,
      fallback,
    },
    operation,
    operationName
  );
}

/**
 * Convenience wrapper for Stripe operations
 */
export async function withStripeAction<T>(
  ctx: any,
  operation: () => Promise<T>,
  organizationId?: string,
  operationName: string = "stripe_call",
  fallback?: FallbackConfig<T>
): Promise<T> {
  return withResilientAction(
    ctx,
    {
      serviceName: "stripe",
      timeout: 15000,
      enableDeadLetterQueue: true,
      organizationId,
      fallback,
    },
    operation,
    operationName
  );
}

/**
 * Convenience wrapper for Kisi operations
 */
export async function withKisiAction<T>(
  ctx: any,
  operation: () => Promise<T>,
  organizationId?: string,
  operationName: string = "kisi_call",
  fallback?: FallbackConfig<T>
): Promise<T> {
  return withResilientAction(
    ctx,
    {
      serviceName: "kisi",
      timeout: 10000,
      enableDeadLetterQueue: true,
      organizationId,
      fallback,
    },
    operation,
    operationName
  );
}

/**
 * Convenience wrapper for email service operations
 */
export async function withEmailAction<T>(
  ctx: any,
  operation: () => Promise<T>,
  organizationId?: string,
  operationName: string = "email_call",
  fallback?: FallbackConfig<T>
): Promise<T> {
  return withResilientAction(
    ctx,
    {
      serviceName: "email",
      timeout: 20000,
      enableDeadLetterQueue: true,
      organizationId,
      fallback: {
        enabled: true,
        gracefulDegradation: true,
        ...fallback,
      },
    },
    operation,
    operationName
  );
}