import express from 'express';
import morgan from 'morgan';
import winston from 'winston';
import { requestIdMiddleware, requestIdToken, getRequestId } from './request-id.middleware';

/**
 * Example: Setting up request ID tracking with Morgan HTTP logger
 */
export function setupMorganWithRequestId(app: express.Application): void {
  // Register custom token for request ID
  morgan.token('request-id', requestIdToken);
  
  // Custom format including request ID
  const logFormat = ':request-id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
  
  // Add request ID middleware before logging
  app.use(requestIdMiddleware());
  
  // Add morgan logging
  app.use(morgan(logFormat));
}

/**
 * Example: Custom Winston logger that includes request ID
 */
export function createRequestAwareLogger() {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

  // Helper to log with request context
  return {
    log: (level: string, message: string, req?: express.Request | express.Response, meta?: any) => {
      const requestId = req ? getRequestId(req) : undefined;
      
      logger.log(level, message, {
        requestId,
        ...meta
      });
    },
    
    info: (message: string, req?: express.Request | express.Response, meta?: any) => {
      const requestId = req ? getRequestId(req) : undefined;
      logger.info(message, { requestId, ...meta });
    },
    
    error: (message: string, error: Error, req?: express.Request | express.Response, meta?: any) => {
      const requestId = req ? getRequestId(req) : undefined;
      logger.error(message, {
        requestId,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        ...meta
      });
    },
    
    warn: (message: string, req?: express.Request | express.Response, meta?: any) => {
      const requestId = req ? getRequestId(req) : undefined;
      logger.warn(message, { requestId, ...meta });
    }
  };
}

/**
 * Example: Middleware that logs all requests with ID
 */
export function requestLoggingMiddleware(logger: ReturnType<typeof createRequestAwareLogger>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Log request start
    logger.info(`${req.method} ${req.path} - Request started`, req, {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Capture response finish
    const originalSend = res.send;
    res.send = function(data: any) {
      res.locals.responseTime = Date.now() - res.locals.startTime;
      
      logger.info(`${req.method} ${req.path} - Request completed`, res, {
        statusCode: res.statusCode,
        responseTime: res.locals.responseTime
      });
      
      return originalSend.call(this, data);
    };
    
    res.locals.startTime = Date.now();
    next();
  };
}

/**
 * Example: Complete logging setup
 */
export function setupLogging(app: express.Application): void {
  const logger = createRequestAwareLogger();
  
  // Add request ID tracking
  app.use(requestIdMiddleware({
    headerName: 'X-Request-ID',
    trustProxy: true,
    setResponseHeader: true
  }));
  
  // Add request logging
  app.use(requestLoggingMiddleware(logger));
  
  // Example route with logging
  app.get('/example', (req, res) => {
    logger.info('Processing example request', req, {
      customData: 'example'
    });
    
    res.json({ 
      message: 'Example response',
      requestId: req.id 
    });
  });
  
  // Error handling with request ID
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error', err, req);
    
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.id
    });
  });
}