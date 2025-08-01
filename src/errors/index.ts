// Base Error
export { BaseError } from './base.error';

// App Errors
export {
  AppError,
  InternalServerError,
  BadRequestError,
  ConflictError,
  ServiceUnavailableError,
  TooManyRequestsError
} from './app.error';

// Validation Errors
export {
  ValidationError,
  InvalidInputError,
  MissingFieldError,
  InvalidFormatError
} from './validation.error';

// Auth Errors
export {
  AuthError,
  UnauthorizedError,
  InvalidCredentialsError,
  TokenExpiredError,
  InvalidTokenError,
  SessionExpiredError,
  MFARequiredError
} from './auth.error';

// Permission Errors
export {
  PermissionError,
  ForbiddenError,
  InsufficientPermissionsError,
  OrganizationAccessError,
  ResourceOwnershipError
} from './permission.error';

// Not Found Errors
export {
  NotFoundError,
  UserNotFoundError,
  OrganizationNotFoundError,
  ClientNotFoundError,
  EventNotFoundError,
  MembershipNotFoundError,
  RouteNotFoundError
} from './not-found.error';

// Export type guards
export {
  isOperationalError,
  isAuthError,
  isValidationError,
  isPermissionError,
  isNotFoundError
} from './utils';