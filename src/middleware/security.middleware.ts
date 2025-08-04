import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

import { getHelmetConfig, getSecurityHeaders, SECURITY_CONSTANTS } from '@/config/security';
import { logger } from '@/utils/logger';

/**
 * Initialize Helmet middleware with security headers
 */
export const helmetMiddleware = helmet(getHelmetConfig());

/**
 * Apply additional security headers not covered by Helmet
 */
export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  try {
    const securityHeaders = getSecurityHeaders();

    // Apply each security header
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Log security header application in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Security headers applied', {
        url: req.url,
        method: req.method,
        headers: Object.keys(securityHeaders),
      });
    }

    next();
  } catch (error) {
    logger.error('Error applying security headers', { error });
    next(error);
  }
}

/**
 * Middleware to set security-related headers for sensitive endpoints
 */
export function sensitiveEndpointHeaders(req: Request, res: Response, next: NextFunction): void {
  // Apply stricter headers for sensitive endpoints
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Add request/response size limits for sensitive endpoints
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // This will be enforced by body parser middleware
    req.headers['x-max-body-size'] = SECURITY_CONSTANTS.MAX_REQUEST_SIZE;
  }

  next();
}

/**
 * Middleware to validate and sanitize request headers
 */
export function validateRequestHeaders(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check for suspicious headers that might indicate attacks
    const suspiciousHeaders = ['x-forwarded-host', 'x-host', 'x-real-ip'];

    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /<.*>/,
    ];

    // Validate each header
    for (const [headerName, headerValue] of Object.entries(req.headers)) {
      if (typeof headerValue === 'string') {
        // Check for suspicious patterns in header values
        const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(headerValue));

        if (hasSuspiciousPattern) {
          logger.warn('Suspicious header detected', {
            headerName,
            headerValue: headerValue.substring(0, 100), // Truncate for logging
            ip: req.ip,
            userAgent: req.get('User-Agent'),
          });

          return res.status(400).json({
            error: 'Invalid request headers',
            code: 'INVALID_HEADERS',
          });
        }
      }

      // Check for suspicious header names
      if (suspiciousHeaders.includes(headerName.toLowerCase())) {
        logger.warn('Potentially dangerous header used', {
          headerName,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
    }

    // Validate Content-Type header for POST/PUT requests with body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('Content-Type');
      const contentLength = req.get('Content-Length');

      // Only require Content-Type if there's actually a body
      if (contentLength && parseInt(contentLength, 10) > 0 && !contentType) {
        return res.status(400).json({
          error: 'Content-Type header required',
          code: 'MISSING_CONTENT_TYPE',
        });
      }
    }

    // Validate User-Agent header (block empty or suspicious user agents)
    const userAgent = req.get('User-Agent');
    if (!userAgent || userAgent.trim().length < 3) {
      logger.warn('Request with suspicious User-Agent', {
        userAgent,
        ip: req.ip,
        url: req.url,
      });

      // Don't block, but log for monitoring
    }

    // Check request size before processing
    const contentLength = req.get('Content-Length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const maxSize = parseInt(SECURITY_CONSTANTS.MAX_REQUEST_SIZE.replace('mb', '')) * 1024 * 1024;

      if (size > maxSize) {
        return res.status(413).json({
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: SECURITY_CONSTANTS.MAX_REQUEST_SIZE,
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error validating request headers', { error });
    next(error);
  }
}

/**
 * Middleware to add request security context
 */
export function addSecurityContext(req: Request, res: Response, next: NextFunction): void {
  // Add security-related information to request context
  const securityContext = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    method: req.method,
    url: req.url,
    secure: req.secure,
    protocol: req.protocol,
  };

  // Attach to request for use in other middleware
  (req as any).securityContext = securityContext;

  // Add response time tracking
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log slow requests for security monitoring
    if (duration > SECURITY_CONSTANTS.SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        ...securityContext,
        duration,
        statusCode: res.statusCode,
      });
    }

    // Log requests to sensitive endpoints
    if (
      req.url.includes('/auth/') ||
      req.url.includes('/admin/') ||
      req.url.includes('/permissions/') ||
      req.url.includes('/roles/')
    ) {
      logger.info('Sensitive endpoint access', {
        ...securityContext,
        duration,
        statusCode: res.statusCode,
      });
    }
  });

  next();
}

/**
 * Middleware to block requests with suspicious characteristics
 */
export function blockSuspiciousRequests(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check for common attack patterns in URL
    const suspiciousUrlPatterns = [
      /\.\./, // Directory traversal
      /\/\//, // Double slashes
      /\0/, // Null bytes
      /%00/, // URL encoded null bytes
      /script/i, // Script injection attempts
      /javascript/i,
      /vbscript/i,
      /eval\(/i,
      /union.*select/i, // SQL injection
      /insert.*into/i,
      /delete.*from/i,
      /drop.*table/i,
    ];

    let url: string;
    try {
      url = decodeURIComponent(req.url);
    } catch (error) {
      // If URL can't be decoded, it's suspicious
      logger.warn('Malformed URL detected', {
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(400).json({
        error: 'Invalid request',
        code: 'MALFORMED_URL',
      });
    }

    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(url) || pattern.test(req.url)) {
        logger.warn('Suspicious URL pattern detected', {
          url: req.url,
          decodedUrl: url,
          pattern: pattern.toString(),
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(400).json({
          error: 'Invalid request',
          code: 'SUSPICIOUS_REQUEST',
        });
      }
    }

    // Check for excessive query parameters (potential DoS)
    const queryParamCount = Object.keys(req.query).length;
    if (queryParamCount > SECURITY_CONSTANTS.MAX_PARAMETER_LIMIT) {
      logger.warn('Excessive query parameters', {
        count: queryParamCount,
        maxAllowed: SECURITY_CONSTANTS.MAX_PARAMETER_LIMIT,
        ip: req.ip,
      });

      return res.status(400).json({
        error: 'Too many query parameters',
        code: 'EXCESSIVE_PARAMETERS',
      });
    }

    next();
  } catch (error) {
    logger.error('Error in suspicious request blocking', { error });
    next(error);
  }
}

/**
 * Combined security middleware stack
 */
export function applySecurityMiddleware() {
  return [
    addSecurityContext,
    helmetMiddleware,
    additionalSecurityHeaders,
    validateRequestHeaders,
    blockSuspiciousRequests,
  ];
}

/**
 * Security middleware for sensitive endpoints (auth, admin, etc.)
 */
export function applySensitiveSecurityMiddleware() {
  return [
    addSecurityContext,
    helmetMiddleware,
    additionalSecurityHeaders,
    sensitiveEndpointHeaders,
    validateRequestHeaders,
    blockSuspiciousRequests,
  ];
}
