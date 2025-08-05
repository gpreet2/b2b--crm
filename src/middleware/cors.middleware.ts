import { Request, Response, NextFunction } from 'express';

import { getCorsOrigins, isOriginAllowed } from '@/config/security';
import { logger } from '@/utils/logger';

/**
 * CORS configuration options
 */
interface CorsOptions {
  origin?:
    | string
    | string[]
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Get CORS configuration based on environment and security settings
 */
function getCorsConfig(): CorsOptions {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigins = getCorsOrigins();

  return {
    // Origin validation function
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      // In development, be more permissive for local development
      if (isDevelopment) {
        // Allow localhost with any port
        if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
          return callback(null, true);
        }

        // Allow 127.0.0.1 with any port
        if (origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
          return callback(null, true);
        }

        // Allow local network IPs for mobile development
        if (origin.match(/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/)) {
          return callback(null, true);
        }
      }

      // Log blocked origin for security monitoring
      logger.warn('CORS: Blocked origin', {
        origin,
        allowedOrigins,
        isDevelopment,
        nodeEnv: process.env.NODE_ENV,
      });

      // Block the request
      const error = new Error(`CORS: Origin ${origin} not allowed`);
      return callback(error, false);
    },

    // HTTP methods allowed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],

    // Headers that clients are allowed to send
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-API-Key',
      'X-Client-Version',
      'X-Request-ID',
      'X-Organization-ID',
      'X-User-Agent',
      'X-CSRF-Token',
      'baggage',
      'sentry-trace',
    ],

    // Headers that are exposed to the client
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-ID',
      'X-API-Version',
      'X-Response-Time',
      'Content-Range',
      'X-Content-Range',
      'X-Total-Count',
    ],

    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,

    // Preflight cache time (in seconds)
    maxAge: isDevelopment ? 300 : 86400, // 5 minutes in dev, 24 hours in prod

    // Pass control to the next handler after preflight
    preflightContinue: false,

    // Success status for preflight requests
    optionsSuccessStatus: 204, // No Content
  };
}

/**
 * Manual CORS middleware implementation with enhanced security
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const config = getCorsConfig();
    const origin = req.get('Origin');
    const method = req.method;

    // Handle preflight requests (OPTIONS)
    if (method === 'OPTIONS') {
      handlePreflightRequest(req, res, config, origin);
      return;
    }

    // Handle actual requests
    handleActualRequest(req, res, config, origin);
    next();
  } catch (error) {
    logger.error('CORS middleware error', { error });

    // Don't block requests if CORS processing fails
    next();
  }
}

/**
 * Handle preflight OPTIONS requests
 */
function handlePreflightRequest(
  req: Request,
  res: Response,
  config: CorsOptions,
  origin: string | undefined
): void {
  // Validate origin synchronously
  const isAllowed = checkOriginSync(origin);

  if (!isAllowed) {
    logger.warn('CORS: Preflight request blocked', {
      origin,
      method: req.method,
      requestedMethod: req.get('Access-Control-Request-Method'),
      requestedHeaders: req.get('Access-Control-Request-Headers'),
    });

    res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_NOT_ALLOWED',
      message: 'Origin not allowed by CORS policy',
    });
    return;
  }

  // Set preflight response headers
  setPreflightHeaders(res, config, origin);

  // Log successful preflight in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('CORS: Preflight request allowed', {
      origin,
      requestedMethod: req.get('Access-Control-Request-Method'),
      requestedHeaders: req.get('Access-Control-Request-Headers'),
    });
  }

  res.status(config.optionsSuccessStatus || 204).end();
}

/**
 * Handle actual requests (non-OPTIONS)
 */
function handleActualRequest(
  req: Request,
  res: Response,
  config: CorsOptions,
  origin: string | undefined
): void {
  // For actual requests, we need to be synchronous since the response needs to continue
  // Let's implement a synchronous origin check
  const isAllowed = checkOriginSync(origin);

  if (isAllowed) {
    setActualRequestHeaders(res, config, origin);
  } else {
    logger.warn('CORS: Actual request blocked', {
      origin,
      method: req.method,
      url: req.url,
    });
    // Don't set CORS headers for disallowed origins
  }
}

/**
 * Synchronous origin validation for actual requests
 */
export function checkOriginSync(origin: string | undefined): boolean {
  // Allow requests with no origin (mobile apps, Postman, curl, etc.)
  if (!origin) {
    return true;
  }

  // Check if origin is in allowed list
  if (isOriginAllowed(origin)) {
    return true;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, be more permissive for local development
  if (isDevelopment) {
    // Allow localhost with any port
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return true;
    }

    // Allow 127.0.0.1 with any port
    if (origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
      return true;
    }

    // Allow local network IPs for mobile development
    if (origin.match(/^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/)) {
      return true;
    }
  }

  return false;
}

/**
 * Set headers for preflight requests
 */
function setPreflightHeaders(res: Response, config: CorsOptions, origin: string | undefined): void {
  // Set allowed origin
  if (origin && config.credentials) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!config.credentials) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Set allowed methods
  if (config.methods) {
    const methods = Array.isArray(config.methods) ? config.methods.join(',') : config.methods;
    res.setHeader('Access-Control-Allow-Methods', methods);
  }

  // Set allowed headers
  if (config.allowedHeaders) {
    const headers = Array.isArray(config.allowedHeaders)
      ? config.allowedHeaders.join(',')
      : config.allowedHeaders;
    res.setHeader('Access-Control-Allow-Headers', headers);
  }

  // Set credentials
  if (config.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Set max age for preflight cache
  if (config.maxAge) {
    res.setHeader('Access-Control-Max-Age', config.maxAge.toString());
  }
}

/**
 * Set headers for actual requests
 */
function setActualRequestHeaders(
  res: Response,
  config: CorsOptions,
  origin: string | undefined
): void {
  // Set allowed origin
  if (origin && config.credentials) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!config.credentials) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Set exposed headers
  if (config.exposedHeaders) {
    const headers = Array.isArray(config.exposedHeaders)
      ? config.exposedHeaders.join(',')
      : config.exposedHeaders;
    res.setHeader('Access-Control-Expose-Headers', headers);
  }

  // Set credentials
  if (config.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * CORS middleware for specific endpoint types
 */
export const corsMiddlewareVariants = {
  // Standard CORS for general API endpoints
  standard: corsMiddleware,

  // Strict CORS for sensitive endpoints (no wildcard origins)
  strict: (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get('Origin');

    // Use the same sync origin check as the main middleware
    if (!origin || !checkOriginSync(origin)) {
      logger.warn('CORS: Strict mode blocked request', {
        origin,
        url: req.url,
        method: req.method,
      });

      res.status(403).json({
        error: 'CORS policy violation',
        code: 'CORS_STRICT_MODE',
        message: 'Origin not allowed in strict mode',
      });
      return;
    }

    corsMiddleware(req, res, next);
  },

  // Public CORS for health checks and public endpoints
  public: (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  },
};

/**
 * Validate CORS configuration
 */
export function validateCorsConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allowedOrigins = getCorsOrigins();

  // Check if we have allowed origins configured
  if (!allowedOrigins || allowedOrigins.length === 0) {
    errors.push('No CORS origins configured');
  }

  // Validate origin formats
  allowedOrigins.forEach(origin => {
    try {
      new URL(origin);
    } catch (_error) {
      errors.push(`Invalid origin format: ${origin}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get CORS configuration summary for debugging
 */
export function getCorsConfigSummary(): Record<string, any> {
  const config = getCorsConfig();
  const allowedOrigins = getCorsOrigins();

  return {
    environment: process.env.NODE_ENV || 'development',
    allowedOrigins,
    methods: config.methods,
    allowedHeaders: config.allowedHeaders,
    exposedHeaders: config.exposedHeaders,
    credentials: config.credentials,
    maxAge: config.maxAge,
    validation: validateCorsConfig(),
  };
}
