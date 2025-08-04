import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

import { AuthError, PermissionError } from '@/errors';
import { logger } from '@/utils/logger';

// Extend Express Request to include auth data
export interface AuthenticatedRequest extends Request {
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

// Get Supabase client (lazy initialization for better testability)
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return supabase;
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient().rpc('has_permission', {
      p_user_id: userId,
      p_organization_id: organizationId,
      p_resource: resource,
      p_action: action,
    });

    if (error) {
      logger.error('Permission check failed', {
        error,
        userId,
        organizationId,
        resource,
        action,
      });
      return false;
    }

    logger.info('Permission check', {
      userId,
      organizationId,
      resource,
      action,
      granted: data || false,
    });

    return Boolean(data);
  } catch (error) {
    logger.error('Permission check error', { error, resource, action });
    return false;
  }
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(resource: string, action: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.authUser) {
        throw new AuthError('Authentication required');
      }

      // Check if organization context is available
      if (!req.authOrganizationId) {
        throw new PermissionError('Organization context required');
      }

      // Check permission
      const hasPermission = await checkPermission(
        req.authUser.id,
        req.authOrganizationId,
        resource,
        action
      );

      if (!hasPermission) {
        throw new PermissionError(`Permission denied: requires ${resource}.${action}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Get user's permissions for caching/display
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<Array<{ resource: string; action: string; granted: boolean }>> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('user_effective_permissions')
      .select('resource, action, granted')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('granted', true);

    if (error) {
      logger.error('Failed to fetch user permissions', {
        error,
        userId,
        organizationId,
      });
      return [];
    }

    return (data || []) as Array<{ resource: string; action: string; granted: boolean }>;
  } catch (error) {
    logger.error('Error fetching user permissions', { error });
    return [];
  }
}

/**
 * Get user's role in organization
 */
export async function getUserRole(userId: string, organizationId: string): Promise<string | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('user_organizations')
      .select(
        `
        role:roles(
          slug,
          name
        )
      `
      )
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error || !data?.role) {
      return null;
    }

    interface RoleData {
      slug: string;
      name: string;
    }
    return (data.role as RoleData).slug;
  } catch (error) {
    logger.error('Error fetching user role', { error });
    return null;
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(
  userId: string,
  organizationId: string,
  roles: string[]
): Promise<boolean> {
  const userRole = await getUserRole(userId, organizationId);
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Middleware to require specific role
 */
export function requireRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.authUser) {
        throw new AuthError('Authentication required');
      }

      if (!req.authOrganizationId) {
        throw new PermissionError('Organization context required');
      }

      const hasRequiredRole = await hasRole(req.authUser.id, req.authOrganizationId, roles);

      if (!hasRequiredRole) {
        throw new PermissionError(`Requires one of these roles: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to load user permissions into request
 */
export async function loadUserPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.authUser && req.authOrganizationId) {
      const permissions = await getUserPermissions(req.authUser.id, req.authOrganizationId);

      // Add permissions to request object for easy access
      interface ExtendedRequest extends AuthenticatedRequest {
        userPermissions?: Array<{ resource: string; action: string; granted: boolean }>;
      }
      (req as ExtendedRequest).userPermissions = permissions;
    }

    next();
  } catch (error) {
    // Don't fail the request if permissions can't be loaded
    logger.error('Failed to load user permissions', { error });
    next();
  }
}
