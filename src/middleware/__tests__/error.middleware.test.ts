import { Request, Response, NextFunction } from 'express';
import { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler,
  errorLogger 
} from '../error.middleware';
import {
  AppError,
  ValidationError,
  NotFoundError
} from '../../errors';
import * as sentryModule from '../../config/sentry';

// Mock Sentry
jest.mock('../../config/sentry', () => ({
  captureException: jest.fn().mockReturnValue('mock-sentry-id'),
  addBreadcrumb: jest.fn()
}));

// Mock Express request/response
const mockRequest = (overrides = {}): Partial<Request> => ({
  path: '/test',
  method: 'GET',
  id: 'test-request-id',
  get: jest.fn().mockReturnValue(undefined),
  ...overrides
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Error Middleware', () => {
  let captureException: jest.Mock;
  let addBreadcrumb: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Get mocked functions
    captureException = sentryModule.captureException as jest.Mock;
    addBreadcrumb = sentryModule.addBreadcrumb as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle BaseError correctly', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new AppError('Test error', 400, 'TEST_ERROR', { test: true });

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'TEST_ERROR',
          message: 'Test error',
          statusCode: 400,
          path: '/test',
          method: 'GET',
          requestId: 'test-request-id',
          timestamp: expect.any(String)
        })
      });
      
      // Should add breadcrumb
      expect(addBreadcrumb).toHaveBeenCalled();
      
      // Should not send to Sentry for 4xx errors
      expect(captureException).not.toHaveBeenCalled();
    });

    it('should handle ValidationError correctly', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new ValidationError('Validation failed', {
        email: ['Invalid format']
      });

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          statusCode: 400
        })
      });
    });

    it('should handle generic errors', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Generic error');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          statusCode: 500
        })
      });
      
      // Should send to Sentry for 5xx errors
      expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
    });

    it('should include stack trace and Sentry ID in development', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          stack: expect.any(String),
          sentryId: 'mock-sentry-id'
        })
      });

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    });

    it('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.error.stack).toBeUndefined();

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    });

    it('should handle JWT errors', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
          statusCode: 401
        })
      });
    });

    it('should send 5xx BaseErrors to Sentry', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const error = new AppError('Server error', 500, 'SERVER_ERROR');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(captureException).toHaveBeenCalledWith(error, expect.objectContaining({
        statusCode: 500,
        code: 'SERVER_ERROR'
      }));
    });
  });

  describe('notFoundHandler', () => {
    it('should create NotFoundError and pass to next', () => {
      const req = mockRequest({ method: 'POST', path: '/unknown' }) as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();

      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0][0];
      expect(error.message).toContain('POST /unknown');
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async functions', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();

      const asyncFn = async (req: Request, res: Response) => {
        res.json({ success: true });
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch async errors and pass to next', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();

      const asyncFn = async () => {
        throw new Error('Async error');
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Async error');
    });
  });

  describe('errorLogger', () => {
    it('should pass error to next middleware and add breadcrumb', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = jest.fn();
      const error = new Error('Test error');

      errorLogger(error, req, res, next);

      expect(addBreadcrumb).toHaveBeenCalledWith({
        message: 'Error in GET /test',
        category: 'request',
        level: 'error',
        data: expect.objectContaining({
          url: undefined,
          method: 'GET',
          statusCode: undefined,
          ip: undefined,
          userAgent: undefined
        })
      });
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});