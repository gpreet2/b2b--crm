import { Request, Response, NextFunction } from 'express';

import { AuthError, PermissionError } from '@/errors';

import { requirePermission, requireRole, AuthenticatedRequest } from '../permissions.middleware';

// Integration tests that verify the middleware behavior without mocking internals
describe('Permission Middleware Integration', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      authUser: {
        id: 'test-user',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
      },
      authOrganizationId: 'test-org',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('requirePermission middleware', () => {
    it('should call next with AuthError when user is not authenticated', async () => {
      mockReq.authUser = undefined;
      const middleware = requirePermission('users', 'read');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
        })
      );
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(AuthError);
    });

    it('should call next with PermissionError when organization context is missing', async () => {
      mockReq.authOrganizationId = undefined;
      const middleware = requirePermission('users', 'read');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Organization context required',
        })
      );
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(PermissionError);
    });
  });

  describe('requireRole middleware', () => {
    it('should call next with AuthError when user is not authenticated', async () => {
      mockReq.authUser = undefined;
      const middleware = requireRole('admin');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required',
        })
      );
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(AuthError);
    });

    it('should call next with PermissionError when organization context is missing', async () => {
      mockReq.authOrganizationId = undefined;
      const middleware = requireRole('admin');

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Organization context required',
        })
      );
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(PermissionError);
    });

    it('should accept array of roles', async () => {
      mockReq.authOrganizationId = undefined;
      const middleware = requireRole(['admin', 'owner']);

      await middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Organization context required',
        })
      );
    });
  });
});
