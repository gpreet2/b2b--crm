import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry error tracking
 */
export function initializeSentry(): void {
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    console.warn('Sentry DSN not provided. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session tracking
    autoSessionTracking: true,
    
    // Filter sensitive data before sending
    beforeSend(event, hint) {
      // Don't send events in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }
      
      // Filter out sensitive data from request
      if (event.request) {
        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }
        
        // Remove sensitive query params
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = filterSensitiveParams(event.request.query_string);
        }
        
        // Remove sensitive body data
        if (event.request.data) {
          event.request.data = filterSensitiveData(event.request.data);
        }
      }
      
      // Filter sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            breadcrumb.data = filterSensitiveData(breadcrumb.data) as Record<string, unknown>;
          }
          return breadcrumb;
        });
      }
      
      // Filter sensitive context
      if (event.extra) {
        event.extra = filterSensitiveData(event.extra) as Record<string, unknown>;
      }
      
      if (event.contexts) {
        Object.keys(event.contexts).forEach(key => {
          event.contexts![key] = filterSensitiveData(event.contexts![key]) as Record<string, unknown>;
        });
      }
      
      return event;
    }
  });
  
  console.log('Sentry initialized successfully');
}

/**
 * Filter sensitive parameters from query strings
 */
function filterSensitiveParams(queryString: string): string {
  const sensitiveParams = [
    'token', 'key', 'secret', 'password', 'pwd', 
    'auth', 'api_key', 'apikey', 'access_token',
    'refresh_token', 'session', 'sessionid'
  ];
  
  const params = new URLSearchParams(queryString);
  
  sensitiveParams.forEach(param => {
    if (params.has(param)) {
      params.set(param, '[FILTERED]');
    }
  });
  
  return params.toString();
}

/**
 * Recursively filter sensitive data from objects
 */
function filterSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sensitiveKeys = [
    'password', 'pwd', 'secret', 'token', 'key',
    'auth', 'authorization', 'api_key', 'apikey',
    'access_token', 'accesstoken', 'refresh_token',
    'refreshtoken', 'session', 'sessionid', 'cookie',
    'credit_card', 'creditcard', 'ssn', 'pin',
    'cvv', 'cvc', 'card_number', 'cardnumber'
  ];
  
  const filtered = Array.isArray(data) ? [...data] : { ...data };
  
  if (Array.isArray(filtered)) {
    return filtered.map(item => filterSensitiveData(item));
  }
  
  Object.keys(filtered).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      (filtered as Record<string, unknown>)[key] = '[FILTERED]';
    } else if (typeof (filtered as Record<string, unknown>)[key] === 'object' && (filtered as Record<string, unknown>)[key] !== null) {
      (filtered as Record<string, unknown>)[key] = filterSensitiveData((filtered as Record<string, unknown>)[key]);
    }
  });
  
  return filtered;
}

/**
 * Express error handler for Sentry
 */
export const sentryErrorHandler = (Sentry as any).Handlers?.errorHandler() || ((err: any, req: any, res: any, next: any) => next(err));

/**
 * Express request handler for Sentry
 */
export const sentryRequestHandler = (Sentry as any).Handlers?.requestHandler() || ((req: any, res: any, next: any) => next());

/**
 * Capture exception manually
 */
export function captureException(error: Error | string, context?: Record<string, unknown>): string {
  if (typeof error === 'string') {
    error = new Error(error);
  }
  
  if (context) {
    Sentry.withScope(scope => {
      scope.setContext('additional', context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
  
  return Sentry.lastEventId() || 'unknown';
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string {
  if (context) {
    Sentry.withScope(scope => {
      scope.setContext('additional', context);
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
  
  return Sentry.lastEventId() || 'unknown';
}

/**
 * Add user context to Sentry
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
  segment?: string;
} | null): void {
  Sentry.setUser(user);
}

/**
 * Add custom context
 */
export function setContext(key: string, context: Record<string, unknown> | null): void {
  Sentry.setContext(key, context);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string = 'http.server'
): ReturnType<typeof Sentry.startSpan> {
  return Sentry.startSpan({ name, op }, () => {
    // This is a placeholder - the actual transaction handling is done by the caller
    return null as any;
  });
}

// Re-export types
export type { SeverityLevel, Breadcrumb } from '@sentry/node';