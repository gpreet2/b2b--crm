import { Response } from 'express';

import {
  sendSuccess,
  sendPaginatedSuccess,
  sendCreated,
  sendNoContent,
  ResponseBuilder,
  isErrorResponse,
  isSuccessResponse,
  transformResponse,
} from '../response.utils';

// Mock request ID middleware
jest.mock('../../middleware/request-id.middleware', () => ({
  getRequestId: jest.fn().mockReturnValue('test-request-id'),
}));

describe('Response Utils', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with default status', () => {
      const data = { message: 'Success' };

      sendSuccess(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: {
          requestId: 'test-request-id',
          timestamp: expect.any(String),
        },
      });
    });

    it('should send success response with custom status', () => {
      const data = { id: 1 };

      sendSuccess(mockResponse as Response, data, 201);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should include custom metadata', () => {
      const data = { items: [] };
      const meta = { version: '1.0' };

      sendSuccess(mockResponse as Response, data, 200, meta);

      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: {
          requestId: 'test-request-id',
          timestamp: expect.any(String),
          version: '1.0',
        },
      });
    });
  });

  describe('sendPaginatedSuccess', () => {
    it('should send paginated response with calculated total pages', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 25 };

      sendPaginatedSuccess(mockResponse as Response, data, pagination);

      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: {
          requestId: 'test-request-id',
          timestamp: expect.any(String),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        },
      });
    });
  });

  describe('sendCreated', () => {
    it('should send 201 response', () => {
      const data = { id: 123, name: 'New Item' };

      sendCreated(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: expect.any(Object),
      });
    });

    it('should set Location header when provided', () => {
      const data = { id: 123 };
      const location = '/api/items/123';

      sendCreated(mockResponse as Response, data, location);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Location', location);
    });
  });

  describe('sendNoContent', () => {
    it('should send 204 with no body', () => {
      sendNoContent(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('ResponseBuilder', () => {
    it('should build basic success response', () => {
      const data = { result: 'test' };

      ResponseBuilder.success(data).send(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: expect.objectContaining({
          requestId: 'test-request-id',
        }),
      });
    });

    it('should chain methods fluently', () => {
      const data = { items: [] };

      ResponseBuilder.success(data)
        .status(201)
        .withMeta({ version: '2.0' })
        .withHeader('X-Custom', 'value')
        .send(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Custom', 'value');
      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: expect.objectContaining({
          version: '2.0',
        }),
      });
    });

    it('should add pagination metadata', () => {
      const data = [1, 2, 3];

      ResponseBuilder.success(data)
        .withPagination({ page: 2, limit: 3, total: 10 })
        .send(mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        data,
        meta: expect.objectContaining({
          pagination: {
            page: 2,
            limit: 3,
            total: 10,
            totalPages: 4,
          },
        }),
      });
    });
  });

  describe('Type guards', () => {
    describe('isErrorResponse', () => {
      it('should identify error responses', () => {
        expect(isErrorResponse({ error: { code: 'ERROR' } })).toBe(true);
        expect(isErrorResponse({ data: {} })).toBe(false);
        expect(isErrorResponse(null)).toBe(false);
        expect(isErrorResponse('string')).toBe(false);
      });
    });

    describe('isSuccessResponse', () => {
      it('should identify success responses', () => {
        expect(isSuccessResponse({ data: {} })).toBe(true);
        expect(isSuccessResponse({ error: {} })).toBe(false);
        expect(isSuccessResponse(null)).toBe(false);
        expect(isSuccessResponse('string')).toBe(false);
      });
    });
  });

  describe('transformResponse', () => {
    it('should return primitive values as-is', () => {
      expect(transformResponse('string')).toBe('string');
      expect(transformResponse(123)).toBe(123);
      expect(transformResponse(null)).toBe(null);
    });

    it('should include only specified fields', () => {
      const data = { id: 1, name: 'Test', secret: 'hidden' };

      const result = transformResponse(data, { fields: ['id', 'name'] });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should exclude specified fields', () => {
      const data = { id: 1, name: 'Test', password: 'secret' };

      const result = transformResponse(data, { exclude: ['password'] });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should apply custom transform function', () => {
      const data = { firstName: 'John', lastName: 'Doe' };

      const result = transformResponse(data, {
        transform: item => ({
          ...item,
          fullName: `${item.firstName} ${item.lastName}`,
        }),
      });

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      });
    });

    it('should handle arrays', () => {
      const data = [
        { id: 1, secret: 'a' },
        { id: 2, secret: 'b' },
      ];

      const result = transformResponse(data, { exclude: ['secret'] });

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should apply multiple transformations', () => {
      const data = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'secret',
        email: 'jane@example.com',
      };

      const result = transformResponse(data, {
        fields: ['id', 'firstName', 'lastName', 'fullName'],
        transform: item => ({
          ...item,
          fullName: `${item.firstName} ${item.lastName}`,
        }),
      });

      expect(result).toEqual({
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
      });
    });
  });
});
