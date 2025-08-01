# Error Handling Framework

This error handling framework provides a comprehensive solution for managing errors in the TryZore B2B CRM application.

## Quick Start

```typescript
import express from 'express';
import { 
  initializeSentry,
  sentryRequestHandler,
  sentryErrorHandler
} from './config';
import { 
  errorHandler, 
  notFoundHandler, 
  errorLogger,
  asyncHandler,
  requestIdMiddleware
} from './middleware';

const app = express();

// 1. Initialize Sentry (optional, for production error tracking)
initializeSentry();

// 2. Add middleware
app.use(sentryRequestHandler);        // Sentry request tracking
app.use(requestIdMiddleware());       // Request ID tracking
app.use(express.json());              // Body parser

// 3. Your routes (use asyncHandler for async routes)
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  // Your async code here
  // Errors are automatically caught and handled
}));

// 4. Error handling (must be last!)
app.use(notFoundHandler);    // 404 handler
app.use(errorLogger);        // Log errors
app.use(sentryErrorHandler); // Send to Sentry
app.use(errorHandler);       // Format error responses
```

## Features

### 1. Custom Error Classes

```typescript
import { 
  AppError, 
  ValidationError, 
  UnauthorizedError, 
  NotFoundError 
} from './errors';

// General application error
throw new AppError('Something went wrong', 500, 'SERVER_ERROR');

// Validation error with field details
throw new ValidationError('Validation failed', {
  email: ['Invalid email format'],
  password: ['Too short']
});

// Authentication error
throw new UnauthorizedError('Invalid credentials');

// Resource not found
throw new NotFoundError('User', userId);
```

### 2. Request ID Tracking

Every request gets a unique ID that appears in:
- Response header: `X-Request-ID`
- Error responses: `error.requestId`
- Logs and Sentry events

### 3. Consistent Error Responses

All errors return in this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users",
    "method": "POST",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "details": {
      "fields": {
        "email": ["Invalid email format"]
      }
    }
  }
}
```

### 4. Success Response Utilities

```typescript
import { 
  sendSuccess, 
  sendCreated, 
  sendPaginatedSuccess,
  ResponseBuilder 
} from './utils';

// Simple success
sendSuccess(res, { id: 1, name: 'John' });

// Created (201) with Location header
sendCreated(res, newUser, `/api/users/${newUser.id}`);

// Paginated response
sendPaginatedSuccess(res, users, {
  page: 1,
  limit: 20,
  total: 100
});

// Response builder for complex responses
ResponseBuilder.success(data)
  .status(201)
  .withHeader('X-Custom', 'value')
  .withMeta({ version: '1.0' })
  .send(res);
```

### 5. Sentry Integration

- Automatic error tracking in production
- Sensitive data filtering
- User context tracking
- Performance monitoring

## Environment Variables

```bash
# Optional - for Sentry error tracking
SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=development|production
```

## Error Types Reference

| Error Class | Status | Code | Use Case |
|------------|--------|------|----------|
| `AppError` | Custom | Custom | General application errors |
| `ValidationError` | 400 | VALIDATION_ERROR | Input validation failures |
| `BadRequestError` | 400 | BAD_REQUEST | Malformed requests |
| `UnauthorizedError` | 401 | UNAUTHORIZED | Missing authentication |
| `InvalidCredentialsError` | 401 | INVALID_CREDENTIALS | Wrong credentials |
| `TokenExpiredError` | 401 | TOKEN_EXPIRED | Expired auth token |
| `ForbiddenError` | 403 | FORBIDDEN | Insufficient permissions |
| `NotFoundError` | 404 | NOT_FOUND | Resource not found |
| `ConflictError` | 409 | CONFLICT | Resource conflicts |
| `InternalServerError` | 500 | INTERNAL_ERROR | Server errors |

## Testing

```typescript
// Mock in tests
jest.mock('./config/sentry', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn()
}));

// Test error responses
it('should return validation error', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({ email: 'invalid' });
  
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
    error: {
      code: 'VALIDATION_ERROR',
      statusCode: 400
    }
  });
});
```

## Best Practices

1. **Always use error classes** - Don't throw generic Errors
2. **Use asyncHandler** - Wrap async route handlers
3. **Include context** - Add request IDs and user context
4. **Log appropriately** - Use error levels correctly
5. **Handle edge cases** - Validate input early
6. **Test error scenarios** - Include error cases in tests

## Full Example

See `/src/examples/error-handling-integration.ts` for a complete working example.