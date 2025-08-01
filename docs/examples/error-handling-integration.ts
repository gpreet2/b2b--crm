import express from 'express';
import { json } from 'express';
import { 
  initializeSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  setUser,
  addBreadcrumb
} from '../config';
import { 
  errorHandler, 
  notFoundHandler, 
  errorLogger,
  asyncHandler,
  requestIdMiddleware
} from '../middleware';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError
} from '../errors';
import {
  sendSuccess,
  sendCreated,
  sendPaginatedSuccess,
  ResponseBuilder
} from '../utils';

/**
 * Complete example of setting up an Express app with error handling
 */
export function createApp(): express.Application {
  const app = express();

  // 1. Initialize Sentry (requires SENTRY_DSN env var)
  initializeSentry();

  // 2. Add Sentry request handler (must be first)
  app.use(sentryRequestHandler);

  // 3. Add request ID tracking
  app.use(requestIdMiddleware());

  // 4. Body parser
  app.use(json());

  // 5. Example routes demonstrating error handling
  
  // Success response example
  app.get('/api/health', (req, res) => {
    sendSuccess(res, { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  });

  // Async handler with automatic error catching
  app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id;
    
    // Set user context for Sentry
    setUser({ id: userId });
    
    // Add breadcrumb for debugging
    addBreadcrumb({
      message: 'Fetching user',
      category: 'user',
      data: { userId },
      level: 'info'
    });
    
    // Simulate fetching user
    if (userId === '404') {
      throw new NotFoundError('User', userId);
    }
    
    const user = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    sendSuccess(res, user);
  }));

  // Validation error example
  app.post('/api/users', asyncHandler(async (req, res) => {
    const { email, password, age } = req.body;
    
    // Validate input
    const errors: Record<string, string[]> = {};
    
    if (!email || !email.includes('@')) {
      errors.email = ['Invalid email format'];
    }
    
    if (!password || password.length < 8) {
      errors.password = ['Password must be at least 8 characters'];
    }
    
    if (age && age < 18) {
      errors.age = ['Must be 18 or older'];
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
    
    // Create user
    const newUser = {
      id: '123',
      email,
      age
    };
    
    sendCreated(res, newUser, `/api/users/${newUser.id}`);
  }));

  // Pagination example
  app.get('/api/users', asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Mock data
    const users = Array.from({ length: limit }, (_, i) => ({
      id: `${(page - 1) * limit + i + 1}`,
      name: `User ${(page - 1) * limit + i + 1}`,
      email: `user${(page - 1) * limit + i + 1}@example.com`
    }));
    
    sendPaginatedSuccess(res, users, {
      page,
      limit,
      total: 100
    });
  }));

  // Authorization error example
  app.get('/api/admin', asyncHandler(async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (token !== 'Bearer valid-token') {
      throw new UnauthorizedError('Invalid token');
    }
    
    sendSuccess(res, { message: 'Welcome admin!' });
  }));

  // Custom error example
  app.post('/api/payment', asyncHandler(async (req, res) => {
    const { amount } = req.body;
    
    if (amount > 1000) {
      throw new AppError(
        'Payment amount exceeds limit',
        400,
        'PAYMENT_LIMIT_EXCEEDED',
        { maxAmount: 1000, requestedAmount: amount }
      );
    }
    
    sendSuccess(res, { 
      paymentId: 'pay_123',
      status: 'processed' 
    });
  }));

  // Response builder example
  app.get('/api/complex', asyncHandler(async (req, res) => {
    const data = {
      items: ['item1', 'item2'],
      count: 2
    };
    
    ResponseBuilder.success(data)
      .status(200)
      .withHeader('X-Total-Count', '2')
      .withMeta({ version: '1.0' })
      .send(res);
  }));

  // 6. Error handling middleware (must be last!)
  
  // 404 handler
  app.use(notFoundHandler);
  
  // Error logger
  app.use(errorLogger);
  
  // Sentry error handler
  app.use(sentryErrorHandler);
  
  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Request ID header: X-Request-ID`);
    console.log('\nExample endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/users/:id');
    console.log('  POST /api/users');
    console.log('  GET  /api/users?page=1&limit=20');
    console.log('  GET  /api/admin (requires auth)');
    console.log('  POST /api/payment');
    console.log('  GET  /api/complex');
    console.log('\nTry:');
    console.log('  curl http://localhost:3000/api/health');
    console.log('  curl http://localhost:3000/api/users/404');
    console.log('  curl http://localhost:3000/api/invalid-route');
  });
}