import { randomUUID } from 'crypto';

import { Request, Response, NextFunction } from 'express';

import { setContext } from '../config/sentry';

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
  }
}

export interface RequestIdOptions {
  /**
   * Header name to read/write request ID
   * @default 'X-Request-ID'
   */
  headerName?: string;

  /**
   * Function to generate request ID
   * @default crypto.randomUUID
   */
  generator?: () => string;

  /**
   * Whether to use existing request ID from header
   * @default true
   */
  trustProxy?: boolean;

  /**
   * Whether to set request ID in response header
   * @default true
   */
  setResponseHeader?: boolean;
}

/**
 * Middleware to add unique request ID to each request
 * Helps with request tracing and debugging
 */
export function requestIdMiddleware(
  options: RequestIdOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const {
    headerName = 'X-Request-ID',
    generator = randomUUID,
    trustProxy = true,
    setResponseHeader = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request already has ID from proxy/load balancer
    let requestId = trustProxy ? req.get(headerName) : undefined;

    // Generate new ID if not provided
    if (!requestId) {
      requestId = generator();
    }

    // Attach to request object
    req.id = requestId;

    // Set in response header
    if (setResponseHeader) {
      res.setHeader(headerName, requestId);
    }

    // Add to Sentry context
    setContext('request', {
      id: requestId,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    // Add to response locals for logging
    res.locals.requestId = requestId;

    next();
  };
}

/**
 * Express format token for morgan logger
 * Usage: morgan(':request-id :method :url')
 */
export function requestIdToken(req: Request): string {
  return req.id || '-';
}

/**
 * Helper to get request ID from various sources
 */
export function getRequestId(req: Request | Response): string | undefined {
  if ('id' in req) {
    return (req as Request).id;
  }
  if ('locals' in req && (req as Response).locals.requestId) {
    return (req as Response).locals.requestId;
  }
  return undefined;
}
