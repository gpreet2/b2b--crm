import { NextRequest } from 'next/server';

export interface LogContext {
  userId?: string;
  userRole?: string;
  method: string;
  path: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  error?: any;
  metadata?: Record<string, any>;
}

// Simple console logger - replace with proper logging service in production
export class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  private formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., Datadog, LogRocket, Sentry)
      return JSON.stringify(logData);
    }
    
    // In development, format for console
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
      context ? JSON.stringify(context, null, 2) : ''
    }`;
  }
  
  info(message: string, context?: LogContext) {
    console.log(this.formatLog('info', message, context));
  }
  
  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog('warn', message, context));
  }
  
  error(message: string, context?: LogContext) {
    console.error(this.formatLog('error', message, context));
  }
  
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
  
  // Log API request
  logRequest(req: NextRequest, userId?: string, userRole?: string) {
    const context: LogContext = {
      method: req.method,
      path: req.nextUrl.pathname,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      userId,
      userRole,
    };
    
    this.info(`API Request: ${req.method} ${req.nextUrl.pathname}`, context);
  }
  
  // Log API response
  logResponse(
    req: NextRequest,
    statusCode: number,
    duration: number,
    userId?: string,
    userRole?: string,
    error?: any
  ) {
    const context: LogContext = {
      method: req.method,
      path: req.nextUrl.pathname,
      statusCode,
      duration,
      userId,
      userRole,
      error: error ? { message: error.message, stack: error.stack } : undefined,
    };
    
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `API Response: ${req.method} ${req.nextUrl.pathname} - ${statusCode} (${duration}ms)`;
    
    this[level](message, context);
  }
  
  // Log authentication attempts
  logAuth(
    action: 'signin' | 'signout' | 'callback' | 'invite',
    success: boolean,
    email?: string,
    error?: any
  ) {
    const context: LogContext = {
      method: 'AUTH',
      path: `/auth/${action}`,
      metadata: {
        success,
        email: email ? this.maskEmail(email) : undefined,
      },
      error: error ? { message: error.message } : undefined,
    };
    
    const level = success ? 'info' : 'warn';
    this[level](`Auth ${action}: ${success ? 'Success' : 'Failed'}`, context);
  }
  
  // Log permission checks
  logPermission(
    userId: string,
    userRole: string,
    permission: string,
    allowed: boolean,
    path: string
  ) {
    const context: LogContext = {
      userId,
      userRole,
      method: 'PERMISSION',
      path,
      metadata: {
        permission,
        allowed,
      },
    };
    
    const level = allowed ? 'debug' : 'warn';
    this[level](
      `Permission check: ${permission} for ${userRole} - ${allowed ? 'Allowed' : 'Denied'}`,
      context
    );
  }
  
  // Log rate limit hits
  logRateLimit(ip: string, path: string, limit: number, window: string) {
    const context: LogContext = {
      method: 'RATE_LIMIT',
      path,
      ip,
      metadata: {
        limit,
        window,
      },
    };
    
    this.warn(`Rate limit hit: ${ip} on ${path}`, context);
  }
  
  // Helper to mask sensitive data
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    
    const maskedLocal = local.length > 2 
      ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
      : '***';
    
    return `${maskedLocal}@${domain}`;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Middleware helper to log API requests
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  getUserInfo?: (req: NextRequest) => Promise<{ userId?: string; userRole?: string }>
) {
  return async (...args: T): Promise<R> => {
    const req = args[0] as NextRequest;
    const startTime = Date.now();
    
    let userId: string | undefined;
    let userRole: string | undefined;
    
    // Get user info if available
    if (getUserInfo) {
      try {
        const userInfo = await getUserInfo(req);
        userId = userInfo.userId;
        userRole = userInfo.userRole;
      } catch (error) {
        // Ignore errors getting user info
      }
    }
    
    // Log request
    logger.logRequest(req, userId, userRole);
    
    try {
      // Execute handler
      const result = await handler(...args);
      
      // Log successful response
      const duration = Date.now() - startTime;
      const statusCode = (result as any).status || 200;
      logger.logResponse(req, statusCode, duration, userId, userRole);
      
      return result;
    } catch (error) {
      // Log error response
      const duration = Date.now() - startTime;
      logger.logResponse(req, 500, duration, userId, userRole, error);
      throw error;
    }
  };
}