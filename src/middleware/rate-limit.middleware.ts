import { Request, Response, NextFunction } from 'express';

import { rateLimiters, RateLimiterType, RATE_LIMIT_CONFIG } from '@/config/redis';
import { logger } from '@/utils/logger';

/**
 * Interface for rate limit result
 */
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(req: Request): string {
  // Priority order: authenticated user ID > IP address > fallback
  const userId = (req as any).user?.id;
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0]
    : req.ip || req.connection.remoteAddress || 'unknown';

  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${ip}`;
}

/**
 * Check if request should skip rate limiting
 */
function shouldSkipRateLimit(req: Request): boolean {
  const userAgent = req.get('User-Agent') || '';
  const clientIp = req.ip || '';

  // Skip for health check user agents
  if (RATE_LIMIT_CONFIG.SKIP_USER_AGENTS.some(ua => userAgent.includes(ua))) {
    return true;
  }

  // Skip for internal IPs
  if (RATE_LIMIT_CONFIG.SKIP_IPS.includes(clientIp)) {
    return true;
  }

  // Skip if explicitly marked (for testing or special cases)
  if (req.headers['x-skip-rate-limit'] === 'true') {
    return true;
  }

  return false;
}

/**
 * Apply rate limiting headers to response
 */
function applyRateLimitHeaders(res: Response, result: RateLimitResult): void {
  res.set({
    [RATE_LIMIT_CONFIG.HEADERS.LIMIT]: result.limit.toString(),
    [RATE_LIMIT_CONFIG.HEADERS.REMAINING]: result.remaining.toString(),
    [RATE_LIMIT_CONFIG.HEADERS.RESET]: Math.ceil(result.reset.getTime() / 1000).toString(),
  });
}

/**
 * Create rate limiting middleware for a specific limiter type
 */
export function createRateLimitMiddleware(
  limiterType: RateLimiterType = 'general',
  options: {
    skip?: (req: Request) => boolean;
    keyGenerator?: (req: Request) => string;
    onLimitReached?: (req: Request, res: Response) => void;
    message?: string;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if we should skip rate limiting
      if (shouldSkipRateLimit(req) || options.skip?.(req)) {
        return next();
      }

      // Get the appropriate rate limiter
      const limiter = rateLimiters[limiterType];
      if (!limiter) {
        logger.error(`Invalid rate limiter type: ${limiterType}`);
        return next();
      }

      // Generate client identifier
      const clientId = options.keyGenerator?.(req) || getClientId(req);

      // Apply rate limiting
      const result = await limiter.limit(clientId);

      // Apply rate limit headers
      applyRateLimitHeaders(res, {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset),
      });

      // Check if rate limit exceeded
      if (!result.success) {
        // Log rate limit violation
        logger.warn('Rate limit exceeded', {
          clientId,
          limiterType,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          url: req.url,
          method: req.method,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        });

        // Apply retry-after header
        const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
        res.set(RATE_LIMIT_CONFIG.HEADERS.RETRY_AFTER, retryAfter.toString());

        // Call custom handler if provided
        if (options.onLimitReached) {
          return options.onLimitReached(req, res);
        }

        // Default rate limit response
        return res.status(RATE_LIMIT_CONFIG.STATUS_CODE).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || `Too many requests. Try again in ${retryAfter} seconds.`,
          retryAfter,
          limit: result.limit,
          remaining: result.remaining,
          reset: new Date(result.reset).toISOString(),
        });
      }

      // Log successful rate limit check in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Rate limit check passed', {
          clientId,
          limiterType,
          remaining: result.remaining,
          limit: result.limit,
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiting error', {
        error,
        limiterType,
        url: req.url,
        method: req.method,
      });

      // Don't block requests if rate limiting fails
      next();
    }
  };
}

/**
 * General rate limiting middleware
 */
export const generalRateLimit = createRateLimitMiddleware('general', {
  message: 'Too many requests from this client.',
});

/**
 * Authentication rate limiting middleware
 */
export const authRateLimit = createRateLimitMiddleware('auth', {
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req: Request) => {
    // For auth, use IP + email combination if available
    const email = req.body?.email || req.query?.email;
    const clientId = getClientId(req);
    return email ? `${clientId}:email:${email}` : clientId;
  },
});

/**
 * Sensitive operations rate limiting middleware
 */
export const sensitiveRateLimit = createRateLimitMiddleware('sensitive', {
  message: 'Too many requests to sensitive endpoints.',
});

/**
 * Upload rate limiting middleware
 */
export const uploadRateLimit = createRateLimitMiddleware('upload', {
  message: 'Too many file uploads. Please wait before uploading again.',
});

/**
 * Hourly rate limiting middleware
 */
export const hourlyRateLimit = createRateLimitMiddleware('hourly', {
  message: 'Hourly request limit exceeded.',
});

/**
 * Daily rate limiting middleware
 */
export const dailyRateLimit = createRateLimitMiddleware('daily', {
  message: 'Daily request limit exceeded.',
});

/**
 * Combined rate limiting middleware for multiple limits
 */
export function multiRateLimit(limiterTypes: RateLimiterType[]) {
  const middlewares = limiterTypes.map(type => createRateLimitMiddleware(type));

  return async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const runNext = async () => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];

      try {
        await new Promise<void>((resolve, reject) => {
          middleware(req, res, (err?: any) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // If response was already sent (rate limit exceeded), stop here
        if (res.headersSent) {
          return;
        }

        // Continue to next middleware
        await runNext();
      } catch (error) {
        next(error);
      }
    };

    await runNext();
  };
}

/**
 * Rate limiting for specific user groups (premium users get higher limits)
 */
export function createUserTierRateLimit(
  baseType: RateLimiterType,
  tierMultipliers: Record<string, number> = { premium: 2, enterprise: 5 }
) {
  return createRateLimitMiddleware(baseType, {
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      const baseId = getClientId(req);

      if (user?.tier && tierMultipliers[user.tier]) {
        return `${baseId}:tier:${user.tier}`;
      }

      return baseId;
    },
  });
}

/**
 * Export pre-configured middleware combinations
 */
export const rateLimitMiddleware = {
  general: generalRateLimit,
  auth: authRateLimit,
  sensitive: sensitiveRateLimit,
  upload: uploadRateLimit,
  hourly: hourlyRateLimit,
  daily: dailyRateLimit,

  // Common combinations
  strictAuth: multiRateLimit(['auth', 'hourly']),
  apiWithUploads: multiRateLimit(['general', 'upload', 'daily']),
  adminEndpoints: multiRateLimit(['sensitive', 'hourly']),
};
