import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { logger } from '@/utils/logger';

/**
 * Redis client configuration using Upstash
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter configurations for different endpoint types
 */
export const rateLimiters = {
  // General API rate limiting
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
    prefix: 'tryzore:ratelimit:general',
  }),

  // Strict rate limiting for authentication endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
    prefix: 'tryzore:ratelimit:auth',
  }),

  // Rate limiting for sensitive operations (admin, permissions)
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
    analytics: true,
    prefix: 'tryzore:ratelimit:sensitive',
  }),

  // Hourly rate limiting for heavy operations
  hourly: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'), // 1000 requests per hour
    analytics: true,
    prefix: 'tryzore:ratelimit:hourly',
  }),

  // Daily rate limiting for extreme operations
  daily: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, '1 d'), // 10000 requests per day
    analytics: true,
    prefix: 'tryzore:ratelimit:daily',
  }),

  // File upload rate limiting
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 uploads per minute
    analytics: true,
    prefix: 'tryzore:ratelimit:upload',
  }),
};

/**
 * Rate limiter types for easy reference
 */
export type RateLimiterType = keyof typeof rateLimiters;

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const testKey = `tryzore:connection:test:${Date.now()}`;
    await redis.set(testKey, 'connected', { ex: 10 }); // Expire in 10 seconds
    const result = await redis.get(testKey);
    await redis.del(testKey); // Clean up
    
    const isConnected = result === 'connected';
    
    if (isConnected) {
      logger.info('Redis connection successful');
    } else {
      logger.error('Redis connection test failed: Unexpected response');
    }
    
    return isConnected;
  } catch (error) {
    logger.error('Redis connection failed', { error });
    return false;
  }
}

/**
 * Get Redis client info for monitoring
 */
export async function getRedisInfo(): Promise<Record<string, any>> {
  try {
    const info = await redis.ping();
    return {
      status: 'connected',
      ping: info,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to get Redis info', { error });
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Rate limiting configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  // Standard rate limits (requests per minute)
  GENERAL_LIMIT: 60,
  AUTH_LIMIT: 10,
  SENSITIVE_LIMIT: 20,
  UPLOAD_LIMIT: 5,
  
  // Extended rate limits
  HOURLY_LIMIT: 1000,
  DAILY_LIMIT: 10000,
  
  // Rate limit headers
  HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset',
    RETRY_AFTER: 'Retry-After',
  },
  
  // Rate limit response codes
  STATUS_CODE: 429,
  
  // Skip rate limiting for these user agents (health checks, monitoring)
  SKIP_USER_AGENTS: [
    'UptimeRobot',
    'Pingdom',
    'HealthChecker',
    'StatusCake',
    'curl', // For internal health checks
  ],
  
  // Skip rate limiting for these IPs (internal services)
  SKIP_IPS: [
    '127.0.0.1',
    '::1',
    'localhost',
  ],
} as const;