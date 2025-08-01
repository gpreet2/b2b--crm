import { BaseError } from './base.error';
import { AuthError } from './auth.error';
import { ValidationError } from './validation.error';
import { PermissionError } from './permission.error';
import { NotFoundError } from './not-found.error';

// Error type guards
export function isOperationalError(error: Error): boolean {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}

export function isAuthError(error: Error): error is AuthError {
  return error instanceof AuthError;
}

export function isValidationError(error: Error): error is ValidationError {
  return error instanceof ValidationError;
}

export function isPermissionError(error: Error): error is PermissionError {
  return error instanceof PermissionError;
}

export function isNotFoundError(error: Error): error is NotFoundError {
  return error instanceof NotFoundError;
}