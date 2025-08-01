# Error Response Standards

## Overview

This document outlines the standardized error response format for the TryZore B2B CRM API. All API errors follow a consistent structure to ensure predictable error handling for clients.

## Error Response Format

All errors are returned with an appropriate HTTP status code and a JSON response body in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields failed validation",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users",
    "method": "POST",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "details": {
      "fields": {
        "email": ["Invalid email format"],
        "age": ["Must be 18 or older"]
      }
    }
  }
}
```

### Error Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Machine-readable error code (e.g., `VALIDATION_ERROR`) |
| `message` | string | Yes | Human-readable error message |
| `statusCode` | number | Yes | HTTP status code |
| `timestamp` | string | Yes | ISO 8601 timestamp when error occurred |
| `path` | string | No | Request path where error occurred |
| `method` | string | No | HTTP method used |
| `requestId` | string | No | Unique request ID for tracing |
| `details` | object | No | Additional error details (only in development) |
| `stack` | string | No | Stack trace (only in development) |
| `sentryId` | string | No | Sentry event ID (only in non-production) |

## Standard Error Codes

### Client Errors (4xx)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | General bad request |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not allowed |
| `CONFLICT` | 409 | Resource conflict |
| `GONE` | 410 | Resource permanently deleted |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |

### Authentication/Authorization Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_FAILED` | 401 | Authentication failed |
| `TOKEN_EXPIRED` | 401 | Authentication token expired |
| `TOKEN_INVALID` | 401 | Invalid authentication token |
| `MFA_REQUIRED` | 401 | Multi-factor authentication required |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |

### Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Specific resource not found |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource already exists |
| `RESOURCE_LOCKED` | 423 | Resource is locked |
| `RESOURCE_EXPIRED` | 410 | Resource has expired |

### Business Logic Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BUSINESS_RULE_VIOLATION` | 422 | Business rule violated |
| `QUOTA_EXCEEDED` | 402 | Usage quota exceeded |
| `PAYMENT_REQUIRED` | 402 | Payment required to proceed |

### Server Errors (5xx)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `GATEWAY_TIMEOUT` | 504 | Gateway timeout |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service error |

## Success Response Format

Successful responses follow this format:

```json
{
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Paginated Responses

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Implementation Examples

### Using Error Classes

```typescript
import { ValidationError, NotFoundError } from '../errors';

// Validation error with field details
throw new ValidationError('Validation failed', {
  email: ['Invalid email format'],
  password: ['Must be at least 8 characters']
});

// Resource not found
throw new NotFoundError('User', userId);
```

### Using Response Utilities

```typescript
import { sendSuccess, sendPaginatedSuccess, ResponseBuilder } from '../utils/response.utils';

// Simple success response
sendSuccess(res, { id: 1, name: 'Test' });

// Created response (201)
sendCreated(res, newUser, `/api/users/${newUser.id}`);

// Paginated response
sendPaginatedSuccess(res, users, {
  page: 1,
  limit: 20,
  total: 100
});

// Using ResponseBuilder
ResponseBuilder.success(data)
  .status(201)
  .withHeader('X-Total-Count', '100')
  .withMeta({ version: '1.0' })
  .send(res);
```

## Error Handling Middleware

The error handling middleware automatically formats all errors according to these standards:

```typescript
app.use(errorHandler); // Converts all errors to standard format
```

## Client-Side Error Handling

Clients should check for the presence of an `error` object to determine if a request failed:

```typescript
const response = await fetch('/api/users');
const data = await response.json();

if (data.error) {
  // Handle error
  console.error(`Error ${data.error.code}: ${data.error.message}`);
  
  // Check specific error codes
  if (data.error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    Object.entries(data.error.details.fields).forEach(([field, errors]) => {
      console.error(`${field}: ${errors.join(', ')}`);
    });
  }
} else {
  // Handle success
  console.log('Success:', data.data);
}
```

## Request ID Tracking

Every request is assigned a unique ID that appears in:
- Response headers: `X-Request-ID`
- Error response body: `error.requestId`
- Success response metadata: `meta.requestId`
- Server logs for debugging

This ID can be used to trace requests across the system and correlate with error tracking services like Sentry.

## Environment-Specific Behavior

### Development
- Includes `details` object with additional debugging information
- Includes `stack` property with full stack trace
- Includes `sentryId` for error tracking

### Production
- Omits sensitive debugging information
- Generic error messages for unexpected errors
- No stack traces or internal details

## Best Practices

1. **Always use error classes**: Don't throw generic Error objects
2. **Provide meaningful error codes**: Use consistent, descriptive error codes
3. **Include helpful messages**: Error messages should guide users on how to fix the issue
4. **Use appropriate status codes**: Match HTTP semantics
5. **Include request IDs**: Always include request IDs for traceability
6. **Validate early**: Validate input at the beginning of request handlers
7. **Log appropriately**: Log errors with context but avoid logging sensitive data
8. **Handle async errors**: Use the `asyncHandler` wrapper for async route handlers

## Testing Error Responses

```typescript
// Test example
it('should return validation error', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({ email: 'invalid' });
  
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
    error: {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: {
        fields: {
          email: expect.arrayContaining(['Invalid email format'])
        }
      }
    }
  });
});
```