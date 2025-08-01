import express from 'express';
import { 
  errorHandler, 
  notFoundHandler, 
  errorLogger,
  asyncHandler 
} from './error.middleware';

/**
 * Example of how to set up error handling in an Express app
 */
export function setupErrorHandling(app: express.Application): void {
  // Example route using asyncHandler
  app.get('/example', asyncHandler(async (req, res) => {
    // This will automatically catch any errors and pass to error handler
    const data = await someAsyncOperation();
    res.json(data);
  }));

  // Error handling middleware should be added LAST
  
  // 404 handler - must come before error handler
  app.use(notFoundHandler);
  
  // Error logger - logs errors before handling
  app.use(errorLogger);
  
  // Global error handler - must be last
  app.use(errorHandler);
}

// Example async function
async function someAsyncOperation() {
  // Simulate async operation
  return { data: 'example' };
}