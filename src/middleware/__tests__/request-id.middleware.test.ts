import { Request, Response, NextFunction } from 'express';

import { setContext } from '../../config/sentry';
import { requestIdMiddleware, requestIdToken, getRequestId } from '../request-id.middleware';

// Mock Sentry
jest.mock('../../config/sentry', () => ({
  setContext: jest.fn(),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid-123'),
}));

describe('Request ID Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      get: jest.fn(),
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };

    mockResponse = {
      setHeader: jest.fn(),
      locals: {},
    };

    mockNext = jest.fn();
  });

  describe('requestIdMiddleware', () => {
    it('should generate new request ID when none provided', () => {
      const middleware = requestIdMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.id).toBe('mock-uuid-123');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'mock-uuid-123');
      expect(mockResponse.locals?.requestId).toBe('mock-uuid-123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing request ID from header when trustProxy is true', () => {
      const existingId = 'existing-request-id';
      (mockRequest.get as jest.Mock).mockReturnValue(existingId);

      const middleware = requestIdMiddleware({ trustProxy: true });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.id).toBe(existingId);
      expect(mockRequest.get).toHaveBeenCalledWith('X-Request-ID');
    });

    it('should ignore existing header when trustProxy is false', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('existing-id');

      const middleware = requestIdMiddleware({ trustProxy: false });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.id).toBe('mock-uuid-123');
      expect(mockRequest.get).not.toHaveBeenCalled();
    });

    it('should use custom header name', () => {
      const customHeader = 'X-Trace-ID';
      const middleware = requestIdMiddleware({ headerName: customHeader });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.get).toHaveBeenCalledWith(customHeader);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(customHeader, 'mock-uuid-123');
    });

    it('should use custom generator function', () => {
      const customId = 'custom-generated-id';
      const generator = jest.fn().mockReturnValue(customId);

      const middleware = requestIdMiddleware({ generator });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(generator).toHaveBeenCalled();
      expect(mockRequest.id).toBe(customId);
    });

    it('should not set response header when setResponseHeader is false', () => {
      const middleware = requestIdMiddleware({ setResponseHeader: false });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should set Sentry context with request info', () => {
      const middleware = requestIdMiddleware();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setContext).toHaveBeenCalledWith('request', {
        id: 'mock-uuid-123',
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
      });
    });

    it('should handle all options together', () => {
      const customId = 'custom-123';
      const generator = jest.fn().mockReturnValue(customId);

      const middleware = requestIdMiddleware({
        headerName: 'X-Correlation-ID',
        generator,
        trustProxy: false,
        setResponseHeader: false,
      });

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.id).toBe(customId);
      expect(mockRequest.get).not.toHaveBeenCalled();
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.locals?.requestId).toBe(customId);
    });
  });

  describe('requestIdToken', () => {
    it('should return request ID when present', () => {
      const req = { id: 'test-id-123' } as Request;

      const result = requestIdToken(req);

      expect(result).toBe('test-id-123');
    });

    it('should return dash when request ID is missing', () => {
      const req = {} as Request;

      const result = requestIdToken(req);

      expect(result).toBe('-');
    });
  });

  describe('getRequestId', () => {
    it('should get ID from request object', () => {
      const req = { id: 'req-123' } as Request;

      const result = getRequestId(req);

      expect(result).toBe('req-123');
    });

    it('should get ID from response locals', () => {
      const res = { locals: { requestId: 'res-123' } } as unknown as Response;

      const result = getRequestId(res);

      expect(result).toBe('res-123');
    });

    it('should return undefined when no ID found', () => {
      const req = {} as Request;

      const result = getRequestId(req);

      expect(result).toBeUndefined();
    });

    it('should return request.id when available', () => {
      const req = {
        id: 'req-id',
      } as Request;

      const result = getRequestId(req);

      expect(result).toBe('req-id');
    });
  });
});
