import { Response, NextFunction } from 'express';

import { getSupabaseClient } from '@/config/supabase';
import { AuthError, PermissionError } from '@/errors';

import { AuthenticatedRequest } from './permissions.middleware';

export interface OrganizationContext {
  id: string;
  name: string;
  domain?: string;
  settings?: Record<string, unknown>;
  userRole: string;
  isActive: boolean;
}

/**
 * Load organization context for the authenticated user
 */
export async function loadOrganizationContext(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new AuthError('User not authenticated');
    }

    const organizationId = req.authOrganizationId || (req.headers['x-organization-id'] as string);

    if (!organizationId) {
      throw new AuthError('No organization context provided');
    }

    // Get user's organization membership
    const { data: userOrg, error: userOrgError } = await getSupabaseClient()
      .from('user_organizations')
      .select('is_active, role_id')
      .eq('user_id', req.authUser.id)
      .eq('organization_id', organizationId)
      .single();

    if (userOrgError || !userOrg) {
      throw new PermissionError('User not authorized for this organization');
    }

    if (!userOrg.is_active) {
      throw new PermissionError('User access is disabled for this organization');
    }

    // Get organization details
    const { data: org, error: orgError } = await getSupabaseClient()
      .from('organizations')
      .select('id, name, domain, settings')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      throw new PermissionError('Organization not found');
    }

    // Get role details
    const { data: role, error: roleError } = await getSupabaseClient()
      .from('roles')
      .select('slug')
      .eq('id', userOrg.role_id)
      .single();

    if (roleError || !role) {
      throw new PermissionError('Role not found');
    }

    // Set organization context on request
    req.organizationContext = {
      id: org.id,
      name: org.name,
      domain: org.domain,
      settings: org.settings,
      userRole: role.slug,
      isActive: userOrg.is_active,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verify user has access to the specified organization
 */
export async function verifyOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('user_organizations')
      .select('is_active')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    return !error && data?.is_active === true;
  } catch {
    return false;
  }
}

/**
 * Get all organizations a user has access to
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationContext[]> {
  try {
    // Get user's active organization memberships
    const { data: memberships, error: membershipError } = await getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role_id, is_active')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (membershipError || !memberships || memberships.length === 0) {
      return [];
    }

    // Get organization details
    const orgIds = memberships.map(m => m.organization_id);
    const { data: orgs, error: orgError } = await getSupabaseClient()
      .from('organizations')
      .select('id, name, domain, settings')
      .in('id', orgIds);

    if (orgError || !orgs) {
      return [];
    }

    // Get role details
    const roleIds = [...new Set(memberships.map(m => m.role_id))];
    const { data: roles, error: roleError } = await getSupabaseClient()
      .from('roles')
      .select('id, slug')
      .in('id', roleIds);

    if (roleError || !roles) {
      return [];
    }

    // Combine the data
    const contexts: OrganizationContext[] = [];

    for (const membership of memberships) {
      const org = orgs.find(o => o.id === membership.organization_id);
      const role = roles.find(r => r.id === membership.role_id);

      if (org && role) {
        contexts.push({
          id: org.id,
          name: org.name,
          domain: org.domain || undefined,
          settings: org.settings || undefined,
          userRole: role.slug,
          isActive: membership.is_active,
        });
      }
    }

    return contexts;
  } catch {
    return [];
  }
}

/**
 * Middleware to require organization context
 */
export function requireOrganization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.authOrganizationId && !req.headers['x-organization-id']) {
    next(new AuthError('Organization context required'));
    return;
  }

  next();
}

/**
 * Middleware to validate cross-organization data access
 * Note: This is a placeholder for future cross-org functionality
 */
export function validateCrossOrgAccess(resourceType: string) {
  // Keep the parameter for future use when implementing cross-org permissions
  void resourceType;
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authUser || !req.authOrganizationId) {
        throw new AuthError('Authentication required');
      }

      // For now, cross-org access is determined by having access to multiple organizations
      // In the future, this will check a cross_org_permissions table
      const userOrgs = await getUserOrganizations(req.authUser.id);

      if (userOrgs.length <= 1) {
        throw new PermissionError('Cross-organization access not permitted');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Get organization settings
 */
export async function getOrganizationSettings(
  organizationId: string
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single();

    return error ? null : data.settings;
  } catch {
    return null;
  }
}

/**
 * Check if a feature is enabled for an organization
 */
export async function isFeatureEnabled(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  const settings = await getOrganizationSettings(organizationId);
  if (!settings || typeof settings !== 'object') {
    return false;
  }
  const features = settings.features as Record<string, unknown> | undefined;
  return features?.[featureKey] === true;
}

/**
 * Middleware to check if a feature is enabled
 */
export function requireFeature(featureKey: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authOrganizationId) {
        throw new AuthError('Organization context required');
      }

      const enabled = await isFeatureEnabled(req.authOrganizationId, featureKey);

      if (!enabled) {
        throw new PermissionError(`Feature '${featureKey}' is not enabled for this organization`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Extend the AuthenticatedRequest interface
declare module 'express-serve-static-core' {
  interface Request {
    organizationContext?: OrganizationContext;
  }
}
