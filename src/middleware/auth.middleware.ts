import { Request, Response, NextFunction } from 'express';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { logger } from '@/utils/logger';
import { AuthError, PermissionError } from '@/errors';

interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
  };
  authOrganizationId?: string;
  authAccessToken?: string;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No authorization token provided');
    }

    // For API routes, we need to validate the JWT token
    // WorkOS AuthKit handles this automatically for page routes
    // For API routes called from client, the access token should be passed
    
    // This is a simplified version - in production you'd validate the JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Add user context to request
    // In a real implementation, decode and verify the JWT token
    req.authUser = {
      id: 'placeholder',
      email: 'placeholder@example.com',
    };
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    next(new AuthError('Authentication required'));
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(role: 'owner' | 'admin' | 'member') {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.authUser) {
        throw new AuthError('Authentication required');
      }

      if (!req.authOrganizationId) {
        throw new PermissionError('Organization context required');
      }

      // Check role using WorkOS API
      const hasRequiredRole = await hasRole(
        req.authUser.id,
        req.authOrganizationId,
        role
      );

      if (!hasRequiredRole) {
        throw new PermissionError(`Requires ${role} role`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to require organization membership
 */
export function requireOrganization() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.authUser) {
        throw new AuthError('Authentication required');
      }

      const organizationId = req.params.organizationId || 
                           req.body?.organizationId ||
                           req.query.organizationId as string;

      if (!organizationId) {
        throw new PermissionError('Organization ID required');
      }

      // Verify membership
      const isMember = await hasRole(
        req.authUser.id,
        organizationId,
        'member'
      );

      if (!isMember) {
        throw new PermissionError('Not a member of this organization');
      }

      req.authOrganizationId = organizationId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Helper function (should import from auth/workos.ts in real implementation)
async function hasRole(
  userId: string,
  organizationId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  // Placeholder - import from auth/workos.ts
  return true;
}