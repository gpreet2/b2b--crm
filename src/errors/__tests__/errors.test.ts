// Import directly from files for testing
import { BaseError } from '../base.error';
import { AppError } from '../app.error';
import { ValidationError } from '../validation.error';
import { AuthError, UnauthorizedError, InvalidCredentialsError, TokenExpiredError } from '../auth.error';
import { PermissionError, ForbiddenError, InsufficientPermissionsError } from '../permission.error';
import { NotFoundError, UserNotFoundError } from '../not-found.error';
import {
  isOperationalError,
  isAuthError,
  isValidationError,
  isPermissionError,
  isNotFoundError
} from '../utils';

describe('Error Classes', () => {
  describe('BaseError', () => {
    class TestError extends BaseError {
      constructor() {
        super('Test error', 500, 'TEST_ERROR', true, { test: true });
      }
    }

    it('should create error with correct properties', () => {
      const error = new TestError();
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ test: true });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new TestError();
      const json = error.toJSON();
      
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('code');
      expect(json).toHaveProperty('statusCode');
      expect(json).toHaveProperty('details');
      expect(json).toHaveProperty('timestamp');
      
      // Stack should only be included in development
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      const devJson = error.toJSON();
      expect(devJson).toHaveProperty('stack');
      
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      const prodJson = error.toJSON();
      expect(prodJson).not.toHaveProperty('stack');
      
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    });
  });

  describe('AppError', () => {
    it('should create app error with defaults', () => {
      const error = new AppError('Something went wrong');
      
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('APP_ERROR');
      expect(error.name).toBe('AppError');
    });

    it('should create app error with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_CODE', { custom: true });
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ custom: true });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Invalid email format'],
        password: ['Too short', 'Must contain number']
      });
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details.fields).toEqual({
        email: ['Invalid email format'],
        password: ['Too short', 'Must contain number']
      });
    });

    it('should create from field errors', () => {
      const error = ValidationError.fromFieldErrors({
        name: ['Required'],
        age: ['Must be positive']
      });
      
      expect(error.message).toBe('Validation failed for 2 fields');
      expect(error.details.fields).toHaveProperty('name');
      expect(error.details.fields).toHaveProperty('age');
    });
  });

  describe('AuthError', () => {
    it('should create unauthorized error', () => {
      const error = new UnauthorizedError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized access');
    });

    it('should create invalid credentials error', () => {
      const error = new InvalidCredentialsError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should create token expired error', () => {
      const error = new TokenExpiredError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('PermissionError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError();
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('PERMISSION_ERROR');
      expect(error.message).toBe('Access forbidden');
    });

    it('should create insufficient permissions error', () => {
      const error = new InsufficientPermissionsError('admin.write', ['user.read']);
      
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('admin.write');
      expect(error.details.requiredPermission).toBe('admin.write');
      expect(error.details.userPermissions).toEqual(['user.read']);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with identifier', () => {
      const error = new NotFoundError('User', '123');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe("User with identifier '123' not found");
    });

    it('should create user not found error', () => {
      const error = new UserNotFoundError('user-123');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('user-123');
      expect(error.details.resource).toBe('User');
      expect(error.details.identifier).toBe('user-123');
    });
  });

  describe('Type Guards', () => {
    it('should identify operational errors', () => {
      const operationalError = new AppError('Test');
      const nonOperationalError = new Error('Test');
      
      expect(isOperationalError(operationalError)).toBe(true);
      expect(isOperationalError(nonOperationalError)).toBe(false);
    });

    it('should identify auth errors', () => {
      const authError = new UnauthorizedError();
      const otherError = new AppError('Test');
      
      
      expect(isAuthError(authError)).toBe(true);
      expect(isAuthError(otherError)).toBe(false);
    });

    it('should identify validation errors', () => {
      const validationError = new ValidationError('Test');
      const otherError = new AppError('Test');
      
      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(otherError)).toBe(false);
    });

    it('should identify permission errors', () => {
      const permissionError = new ForbiddenError();
      const otherError = new AppError('Test');
      
      expect(isPermissionError(permissionError)).toBe(true);
      expect(isPermissionError(otherError)).toBe(false);
    });

    it('should identify not found errors', () => {
      const notFoundError = new UserNotFoundError('123');
      const otherError = new AppError('Test');
      
      expect(isNotFoundError(notFoundError)).toBe(true);
      expect(isNotFoundError(otherError)).toBe(false);
    });
  });
});