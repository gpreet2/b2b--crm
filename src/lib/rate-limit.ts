import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => {
      // Default: Use IP address as key
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
      return ip;
    }
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit data
    let data = rateLimitStore.get(key);
    
    if (!data || data.resetTime < now) {
      // Create new window
      data = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, data);
    }
    
    // Check if limit exceeded
    if (data.count >= max) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: message,
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(data.resetTime).toISOString(),
          }
        }
      );
    }
    
    // Increment counter before processing request
    if (!skipSuccessfulRequests) {
      data.count++;
    }
    
    try {
      // Process the request
      const response = await handler(req);
      
      // If skipSuccessfulRequests is true and request was successful, don't count it
      if (skipSuccessfulRequests && response.status < 400 && data.count > 0) {
        data.count--;
      }
      
      // Add rate limit headers to response
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', max.toString());
      headers.set('X-RateLimit-Remaining', Math.max(0, max - data.count).toString());
      headers.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString());
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      // If skipSuccessfulRequests is true, decrement on error
      if (skipSuccessfulRequests && data.count > 0) {
        data.count--;
      }
      throw error;
    }
  };
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // Only count failed attempts
});

export const signInRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 sign-in attempts per 15 minutes
  message: 'Too many sign-in attempts, please try again later',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'API rate limit exceeded',
});

export const strictApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute for sensitive operations
  message: 'Rate limit exceeded for this operation',
});

// Helper function to apply rate limiting to API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter = apiRateLimiter
) {
  return async (req: NextRequest) => {
    return rateLimiter(req, handler);
  };
}