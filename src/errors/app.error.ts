import { BaseError } from './base.error';

export class AppError extends BaseError {
  constructor(
    message: string,
    statusCode = 500,
    code = 'APP_ERROR',
    details?: any
  ) {
    super(message, statusCode, code, true, details);
    this.name = 'AppError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', details?: any) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
    this.name = 'ServiceUnavailableError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', retryAfter?: number) {
    super(message, 429, 'TOO_MANY_REQUESTS', { retryAfter });
    this.name = 'TooManyRequestsError';
  }
}