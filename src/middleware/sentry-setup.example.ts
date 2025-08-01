import express from 'express';
import { 
  initializeSentry,
  sentryRequestHandler,
  sentryErrorHandler
} from '../config/sentry';
import { 
  errorHandler, 
  notFoundHandler, 
  errorLogger,
  asyncHandler 
} from './error.middleware';

/**
 * Example of how to set up Sentry with Express error handling
 */
export function setupSentryAndErrorHandling(app: express.Application): void {
  // Initialize Sentry first
  initializeSentry();
  
  // Sentry request handler must be the first middleware
  app.use(sentryRequestHandler);
  
  // ... Your other middleware (body parser, cors, etc.)
  
  // ... Your routes
  
  // Error handling middleware should be added LAST
  
  // 404 handler - must come before error handlers
  app.use(notFoundHandler);
  
  // Error logger - logs errors and adds breadcrumbs
  app.use(errorLogger);
  
  // Sentry error handler - must come before other error handlers
  app.use(sentryErrorHandler);
  
  // Global error handler - must be last
  app.use(errorHandler);
}

/**
 * Example usage in your main app file
 */
export function exampleAppSetup() {
  const app = express();
  
  // Set up Sentry and error handling
  setupSentryAndErrorHandling(app);
  
  // Example route with Sentry context
  app.get('/user/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id;
    
    // Set user context for Sentry
    const { setUser, addBreadcrumb } = await import('../config/sentry');
    
    setUser({
      id: userId,
      segment: 'b2b'
    });
    
    // Add breadcrumb for debugging
    addBreadcrumb({
      message: 'Fetching user',
      category: 'user',
      data: { userId }
    });
    
    // Your route logic here
    res.json({ userId });
  }));
  
  return app;
}