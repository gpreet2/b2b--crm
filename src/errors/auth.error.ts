import { BaseError } from './base.error';

export class AuthError extends BaseError {
  constructor(
    message: string,
    statusCode = 401,
    code = 'AUTH_ERROR',
    details?: any
  ) {
    super(message, statusCode, code, true, details);
    this.name = 'AuthError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid credentials provided') {
    super(message, 401, 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message = 'Token has expired') {
    super(message, 401, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid token provided') {
    super(message, 401, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message = 'Session has expired') {
    super(message, 401, 'SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

export class MFARequiredError extends AuthError {
  constructor(message = 'Multi-factor authentication required', challengeId?: string) {
    super(message, 401, 'MFA_REQUIRED', { challengeId });
    this.name = 'MFARequiredError';
  }
}