import { Request, Response, NextFunction } from 'express';

import { captureException, addBreadcrumb } from '../config/sentry';
import { BaseError, NotFoundError } from '../errors';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    method?: string;
    requestId?: string;
    details?: any;
    stack?: string;
  };
}

/**
 * Global error handler middleware
 * Catches all errors and formats consistent responses
 */
export function errorHandler(
  error: Error | BaseError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // Add breadcrumb for Sentry
  addBreadcrumb({
    message: 'Error handled',
    category: 'error',
    level: 'error',
    data: {
      errorName: error.name,
      errorMessage: error.message,
      path: req.path,
      method: req.method,
      requestId: req.id,
    },
  });

  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any;

  // Handle known operational errors
  if (error instanceof BaseError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  }
  // Handle validation errors from libraries
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }
  // Handle Supabase errors
  else if (error.message?.includes('JWT')) {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Authentication failed';
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.id,
    },
  };

  // Add details if available (not in production for security)
  if (details && process.env.NODE_ENV !== 'production') {
    errorResponse.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Send to Sentry if it's a server error or unhandled error
  if (statusCode >= 500 || !(error instanceof BaseError)) {
    const eventId = captureException(error, {
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        body: req.body,
        user: (req as any).user,
      },
      statusCode,
      code,
    });

    // Add Sentry event ID to response in non-production
    if (process.env.NODE_ENV !== 'production') {
      (errorResponse.error as any).sentryId = eventId;
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError('Route', `${req.method} ${req.path}`);
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error logger middleware
 * Logs errors before passing to error handler
 */
export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction): void {
  // Add error context breadcrumb
  addBreadcrumb({
    message: `Error in ${req.method} ${req.path}`,
    category: 'request',
    level: 'error',
    data: {
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  next(error);
}
